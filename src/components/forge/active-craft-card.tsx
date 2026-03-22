/**
 * ActiveCraftCard - компонент активного крафта
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Anvil, CheckCircle, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useGameStore } from '@/store'
import { 
  weaponRecipes, 
  weaponTypeStats, 
  qualityGrades,
  getQualityGrade,
} from '@/data/weapon-recipes'
import { cn } from '@/lib/utils'
import { useSound } from '@/lib/sounds'
import { WeaponIcon, qualityColors } from './forge-utils'
import type { CraftedWeapon } from '@/data/weapon-recipes'

export function ActiveCraftCard() {
  const activeCraft = useGameStore((state) => state.activeCraft)
  const updateCraftProgress = useGameStore((state) => state.updateCraftProgress)
  const completeCraft = useGameStore((state) => state.completeCraft)
  const [justCompleted, setJustCompleted] = useState<CraftedWeapon | null>(null)
  const { play } = useSound()
  
  // Обновление прогресса
  useEffect(() => {
    if (!activeCraft.recipeId || !activeCraft.endTime) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      const total = activeCraft.endTime! - activeCraft.startTime!
      const elapsed = now - activeCraft.startTime!
      const progress = Math.min(100, (elapsed / total) * 100)
      
      updateCraftProgress(progress)
      
      if (progress >= 100) {
        const weapon = completeCraft()
        if (weapon) {
          setJustCompleted(weapon)
          play('craft_complete')
          setTimeout(() => setJustCompleted(null), 3000)
        }
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [activeCraft.recipeId, activeCraft.endTime])
  
  if (!activeCraft.recipeId) {
    return (
      <Card className="card-medieval">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-stone-800/50 flex items-center justify-center mb-4">
            <Anvil className="w-10 h-10 text-stone-600" />
          </div>
          <p className="text-stone-500">Выберите оружие из списка ниже</p>
          <p className="text-stone-600 text-sm">чтобы начать крафт</p>
        </CardContent>
      </Card>
    )
  }
  
  const recipe = weaponRecipes.find(r => r.id === activeCraft.recipeId)
  const qualityGrade = activeCraft.quality > 0 ? getQualityGrade(activeCraft.quality) : null
  const qualityInfo = qualityGrade ? qualityGrades[qualityGrade] : null
  const typeStats = recipe ? weaponTypeStats[recipe.type] : null
  
  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <Card className="card-medieval glow-gold">
        <CardContent className="p-6">
          {/* Уведомление о завершении */}
          <AnimatePresence>
            {justCompleted && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-lg bg-green-900/30 border border-green-600/50"
              >
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Оружие создано!</span>
                </div>
                <p className="text-sm text-green-300 mt-1">
                  {justCompleted.name} — {qualityGrades[justCompleted.qualityGrade].name}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-16 h-16 rounded-xl flex items-center justify-center text-3xl',
                recipe ? qualityColors[recipe.tier].bg : 'bg-stone-800'
              )}>
                {recipe && <WeaponIcon type={recipe.type} />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-200">{activeCraft.weaponName}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {recipe && (
                    <>
                      <Badge variant="outline" className={qualityColors[recipe.tier].text}>
                        {typeStats?.name}
                      </Badge>
                      <span className="text-stone-500 text-sm">
                        {recipe.material}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-amber-400">{Math.round(activeCraft.progress)}%</p>
              <p className="text-xs text-stone-500">прогресс</p>
            </div>
          </div>
          
          {/* Прогресс бар */}
          <div className="mb-4">
            <Progress 
              value={activeCraft.progress} 
              className="h-4 bg-stone-800"
            />
          </div>
          
          {/* Время */}
          {activeCraft.endTime && (
            <div className="flex items-center gap-2 text-stone-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">
                {activeCraft.progress < 100 
                  ? `Осталось ~${Math.max(0, Math.ceil((activeCraft.endTime - Date.now()) / 1000))} сек.`
                  : 'Завершено!'
                }
              </span>
            </div>
          )}
          
          {/* Превью качества (показывается при прогрессе > 50%) */}
          {activeCraft.quality > 0 && qualityInfo && (
            <div className="mt-4 pt-4 border-t border-stone-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Предварительное качество:</span>
                <Badge className={cn('font-semibold', qualityInfo.color)}>
                  {qualityInfo.name} ({activeCraft.quality})
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

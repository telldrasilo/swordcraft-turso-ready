/**
 * Sacrifice Weapon Card
 * Карточка оружия для жертвоприношения
 */

'use client'

import { motion } from 'framer-motion'
import { Flame, Droplet, Coins, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { calculateSacrificeValue } from '@/data/enchantments'
import { qualityGrades, weaponTypeStats } from '@/data/weapon-recipes'

interface SacrificeWeaponCardProps {
  weapon: any
  onSacrifice: () => void
  sacrificing: boolean
}

export function SacrificeWeaponCard({ 
  weapon, 
  onSacrifice,
  sacrificing
}: SacrificeWeaponCardProps) {
  const qualityInfo = qualityGrades[weapon.qualityGrade]
  const typeStats = weaponTypeStats[weapon.type]
  const sacrificeValue = calculateSacrificeValue(weapon.quality, weapon.tier, weapon.warSoul || 0, weapon.epicMultiplier || 1)
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card className={cn(
        'card-medieval transition-all group relative overflow-hidden',
        'hover:border-purple-600/50'
      )}>
        {/* Фоновое свечение */}
        <div className={cn(
          'absolute inset-0 opacity-10',
          qualityInfo.color.replace('text-', 'bg-')
        )} />
        
        <CardContent className="p-4 relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {typeStats?.icon || '⚔️'}
              </span>
              <div>
                <h4 className="font-semibold text-stone-200">{weapon.name}</h4>
                <Badge className={cn('text-xs', qualityInfo.color)}>
                  {qualityInfo.name}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center gap-2">
              <span className="text-stone-500">Атака: {weapon.attack}</span>
              <span className="text-stone-600">•</span>
              <span className="text-stone-500">Качество: {weapon.quality}%</span>
            </div>
          </div>
          
          {/* Награда за жертвоприношение */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-purple-900/20 border border-purple-600/30 mb-3">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-semibold">
                ~{sacrificeValue.soulEssence} эссенции
              </span>
            </div>
            <div className="flex items-center gap-1 text-amber-400 text-sm">
              <Coins className="w-3 h-3" />
              <span>+{sacrificeValue.bonusGold}</span>
            </div>
          </div>
          
          <Button 
            size="sm"
            className="w-full bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 text-purple-100"
            onClick={onSacrifice}
            disabled={sacrificing}
          >
            {sacrificing ? (
              <Zap className="w-4 h-4 animate-pulse" />
            ) : (
              <>
                <Flame className="w-4 h-4 mr-2" />
                Принести в жертву
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

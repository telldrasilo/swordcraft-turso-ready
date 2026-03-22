/**
 * Weapons History Section
 * Секция оружия с историей приключений
 */

'use client'

import { Sword, Sparkles, Star, Heart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { qualityGrades, weaponTypeStats } from '@/data/weapon-recipes'

export function WeaponsHistorySection() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  
  const weaponsWithHistory = weaponInventory.weapons.filter(
    w => (w.warSoul || 0) > 0 || (w.adventureCount || 0) > 0
  )
  
  if (weaponsWithHistory.length === 0) return null
  
  return (
    <Card className="card-medieval">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-200 flex items-center gap-2 text-base">
          <Sword className="w-4 h-4" />
          Оружие с историей
        </CardTitle>
        <CardDescription>
          Чем больше очков души и множитель эпичности — тем больше эссенции при распылении
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {weaponsWithHistory
            .sort((a, b) => ((b.warSoul || 0) * (b.epicMultiplier || 1)) - ((a.warSoul || 0) * (a.epicMultiplier || 1)))
            .slice(0, 6)
            .map((weapon) => {
              const qualityInfo = qualityGrades[weapon.qualityGrade]
              const typeStats = weaponTypeStats[weapon.type]
              const potentialEssence = Math.floor((weapon.warSoul || 0) * (weapon.epicMultiplier || 1) * 0.5)
              
              return (
                <div
                  key={weapon.id}
                  className="p-3 rounded-lg bg-stone-800/50 border border-stone-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{typeStats?.icon || '⚔️'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-200 truncate">{weapon.name}</p>
                      <Badge className={cn('text-xs', qualityInfo.color)}>
                        {qualityInfo.name}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 text-purple-400">
                      <Sparkles className="w-3 h-3" />
                      <span>{weapon.warSoul || 0} Души Войны</span>
                    </div>
                    
                    {(weapon.epicMultiplier || 1) > 1 && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3 h-3" />
                        <span>×{(weapon.epicMultiplier || 1).toFixed(2)}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-green-400">
                      <Heart className="w-3 h-3" />
                      <span>{weapon.durability || 100}%</span>
                    </div>
                  </div>
                  
                  {potentialEssence > 0 && (
                    <div className="mt-2 p-1.5 rounded bg-purple-900/20 text-center">
                      <span className="text-xs text-purple-400">
                        ~{potentialEssence} эссенции при распылении
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </CardContent>
    </Card>
  )
}

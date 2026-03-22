/**
 * Enchantment Shop Section
 * Секция магазина зачарований
 */

'use client'

import { Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { useSound } from '@/lib/sounds'
import { useState, useMemo } from 'react'
import { 
  enchantments, 
  enchantmentSchools, 
  canAffordEnchantment 
} from '@/data/enchantments'
import { EnchantmentCard } from './enchantment-card'

export function EnchantmentShopSection() {
  // Используем индивидуальные селекторы
  const resources = useGameStore((state) => state.resources)
  const player = useGameStore((state) => state.player)
  const unlockedEnchantments = useGameStore((state) => state.unlockedEnchantments)
  const unlockEnchantment = useGameStore((state) => state.unlockEnchantment)
  
  const [unlockingId, setUnlockingId] = useState<string | null>(null)
  const { play } = useSound()
  
  // Мемоизированная группировка зачарований по школам
  const enchantmentsBySchool = useMemo(() => {
    const map = new Map<string, typeof enchantments>()
    enchantments.forEach(e => {
      const existing = map.get(e.school) || []
      map.set(e.school, [...existing, e])
    })
    return map
  }, [])
  
  const handleUnlock = (enchantmentId: string) => {
    setUnlockingId(enchantmentId)
    setTimeout(() => {
      if (unlockEnchantment(enchantmentId)) {
        play('craft_complete')
      }
      setUnlockingId(null)
    }, 300)
  }
  
  return (
    <Card className="card-medieval">
      <CardHeader>
        <CardTitle className="text-amber-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Магазин зачарований
        </CardTitle>
        <CardDescription>
          Разблокируйте зачарования за эссенцию души и золото
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Группировка по школам */}
        <div className="space-y-6">
          {enchantmentSchools.map(school => {
            const schoolEnchantments = enchantmentsBySchool.get(school.id) || []
            if (schoolEnchantments.length === 0) return null
            
            return (
              <div key={school.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
                    school.bgColor
                  )}>
                    {school.icon}
                  </div>
                  <div>
                    <h4 className={cn('font-semibold', school.color)}>{school.name}</h4>
                    <p className="text-xs text-stone-500">{school.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {schoolEnchantments.map(ench => {
                    const isUnlocked = unlockedEnchantments.includes(ench.id) || ench.unlocked
                    const canAfford = canAffordEnchantment(ench, resources.soulEssence, resources.gold, player.level, player.fame)
                    
                    return (
                      <EnchantmentCard
                        key={ench.id}
                        enchantment={ench}
                        isUnlocked={isUnlocked}
                        canAfford={canAfford && !isUnlocked}
                        onUnlock={() => handleUnlock(ench.id)}
                        unlocking={unlockingId === ench.id}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Weapon Select Modal
 * Модальное окно выбора оружия для вылазки
 */

'use client'

import { motion } from 'framer-motion'
import { X, Sword, Heart, Sparkles, Star, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { qualityGrades, weaponTypeStats } from '@/data/weapon-recipes'
import type { Adventure } from '@/data/adventures'

interface WeaponSelectModalProps {
  adventure: Adventure
  onSelect: (weaponId: string) => void
  onClose: () => void
}

export function WeaponSelectModal({
  adventure,
  onSelect,
  onClose
}: WeaponSelectModalProps) {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  
  // Фильтруем подходящее оружие
  const suitableWeapons = weaponInventory.weapons
    .filter(w => w.attack >= adventure.minWeaponLevel * 5)
    .sort((a, b) => {
      // Сначала оружие с меньшим износом (более пригодное)
      const durabilityA = a.durability ?? 100
      const durabilityB = b.durability ?? 100
      if (durabilityA <= 10 && durabilityB > 10) return 1
      if (durabilityB <= 10 && durabilityA > 10) return -1
      // Потом по количеству приключений (новое - в приоритете)
      return (a.adventureCount ?? 0) - (b.adventureCount ?? 0)
    })
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-stone-900 border border-stone-700 rounded-xl max-w-lg w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div className="p-4 border-b border-stone-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-amber-200">Выберите оружие</h3>
            <p className="text-sm text-stone-500">
              Для: {adventure.name} (нужна атака {adventure.minWeaponLevel * 5}+)
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Список оружия */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {suitableWeapons.length === 0 ? (
            <div className="text-center py-8">
              <Sword className="w-12 h-12 mx-auto text-stone-600 mb-3" />
              <p className="text-stone-500">Нет подходящего оружия</p>
              <p className="text-stone-600 text-sm mt-1">
                Создайте оружие с атакой {adventure.minWeaponLevel * 5}+ в кузнице
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {suitableWeapons.map((weapon) => {
                const qualityInfo = qualityGrades[weapon.qualityGrade]
                const typeStats = weaponTypeStats[weapon.type]
                const isDamaged = (weapon.durability ?? 100) <= 30
                const isBroken = (weapon.durability ?? 100) <= 10
                
                return (
                  <motion.button
                    key={weapon.id}
                    type="button"
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-all',
                      isBroken 
                        ? 'opacity-50 cursor-not-allowed border-red-600/30 bg-red-900/10'
                        : isDamaged
                          ? 'border-orange-600/30 bg-orange-900/10 hover:border-amber-500/50'
                          : 'border-stone-600 bg-stone-800/50 hover:border-amber-500/50 cursor-pointer'
                    )}
                    onClick={() => !isBroken && onSelect(weapon.id)}
                    disabled={isBroken}
                    whileHover={!isBroken ? { scale: 1.01 } : {}}
                    whileTap={!isBroken ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      {/* Иконка */}
                      <div className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center text-2xl',
                        qualityInfo.color.replace('text-', 'bg-').replace('-400', '-900/30')
                      )}>
                        {typeStats?.icon || '⚔️'}
                      </div>
                      
                      {/* Информация */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-stone-200">{weapon.name}</h4>
                          <Badge className={cn('text-xs', qualityInfo.color)}>
                            {qualityInfo.name}
                          </Badge>
                          {weapon.adventureCount && weapon.adventureCount > 0 && (
                            <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">
                              ⚔️ {weapon.adventureCount}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-1 text-xs">
                          <div className="flex items-center gap-1 text-red-400">
                            <Sword className="w-3 h-3" />
                            <span>{weapon.attack} атк</span>
                          </div>
                          
                          {/* Прочность */}
                          <div className={cn(
                            'flex items-center gap-1',
                            isBroken ? 'text-red-400' : isDamaged ? 'text-orange-400' : 'text-green-400'
                          )}>
                            <Heart className="w-3 h-3" />
                            <span>{weapon.durability ?? 100}/{weapon.maxDurability ?? 100}</span>
                            {isBroken && <span className="text-red-400">(сломано)</span>}
                            {isDamaged && !isBroken && <span className="text-orange-400">(нужен ремонт)</span>}
                          </div>
                          
                          {/* Очки души */}
                          {(weapon.warSoul ?? 0) > 0 && (
                            <div className="flex items-center gap-1 text-purple-400">
                              <Sparkles className="w-3 h-3" />
                              <span>{weapon.warSoul} Души Войны</span>
                            </div>
                          )}
                          
                          {/* Множитель эпичности */}
                          {(weapon.epicMultiplier ?? 1) > 1 && (
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-3 h-3" />
                              <span>×{(weapon.epicMultiplier ?? 1).toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {isDamaged && !isBroken && (
                      <div className="mt-2 p-2 rounded bg-orange-900/20 border border-orange-600/20">
                        <div className="flex items-center gap-2 text-xs text-orange-400">
                          <Wrench className="w-3 h-3" />
                          <span>Рекомендуется отремонтировать перед вылазкой</span>
                        </div>
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Подсказка */}
        <div className="p-3 border-t border-stone-700 bg-stone-800/30">
          <p className="text-xs text-stone-500">
            💡 Выбирайте оружие с умом — сломанное оружие нельзя отправить в вылазку
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

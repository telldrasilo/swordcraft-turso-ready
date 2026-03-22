/**
 * Enchant Weapon Modal
 * Модальное окно зачарования оружия
 */

'use client'

import { motion } from 'framer-motion'
import { X, Lock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { 
  enchantments, 
  enchantmentSchools, 
  enchantmentSchoolInfo, 
  getEnchantment,
  type EnchantmentSchool 
} from '@/data/enchantments'

interface EnchantWeaponModalProps {
  weapon: any
  onClose: () => void
  onEnchant: (enchantmentId: string) => void
}

export function EnchantWeaponModal({
  weapon,
  onClose,
  onEnchant
}: EnchantWeaponModalProps) {
  const unlockedEnchantments = useGameStore((state) => state.unlockedEnchantments)
  
  // Фильтруем доступные зачарования
  const availableEnchantments = enchantments.filter(e => 
    unlockedEnchantments.includes(e.id) || e.unlocked
  )
  
  // Проверяем какие зачарования уже есть на оружии
  const existingEnchantmentIds = (weapon.enchantments || []).map((e: any) => e.enchantmentId)
  
  // Группируем по школам
  const groupedBySchool = availableEnchantments.reduce((acc, e) => {
    if (!acc[e.school]) acc[e.school] = []
    acc[e.school].push(e)
    return acc
  }, {} as Record<EnchantmentSchool, typeof enchantments>)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-stone-900 border border-stone-700 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-amber-200">Зачаровать оружие</h3>
            <p className="text-sm text-stone-500">{weapon.name}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Текущие зачарования */}
          {weapon.enchantments && weapon.enchantments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-stone-400 mb-2">Текущие зачарования</h4>
              <div className="flex flex-wrap gap-2">
                {weapon.enchantments.map((e: any, idx: number) => {
                  const ench = getEnchantment(e.enchantmentId)
                  const school = ench ? enchantmentSchoolInfo[ench.school] : null
                  return (
                    <Badge key={e.enchantmentId || `ench-current-${idx}`} className={school?.color || 'text-stone-400'}>
                      {school?.icon} {ench?.name}
                    </Badge>
                  )
                })}
              </div>
            </div>
          )}
          
          {/* Доступные зачарования по школам */}
          {enchantmentSchools.map(school => {
            const schoolEnchantments = groupedBySchool[school.id]
            if (!schoolEnchantments || schoolEnchantments.length === 0) return null
            
            return (
              <div key={school.id}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{school.icon}</span>
                  <h4 className={cn('font-semibold', school.color)}>{school.name}</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {schoolEnchantments.map(ench => {
                    const isAlreadyApplied = existingEnchantmentIds.includes(ench.id)
                    const schoolAlreadyApplied = existingEnchantmentIds.some(id => {
                      const existing = getEnchantment(id)
                      return existing?.school === ench.school
                    })
                    
                    // Проверяем, можно ли применить
                    const canApply = !isAlreadyApplied && !schoolAlreadyApplied
                    
                    return (
                      <div
                        key={ench.id}
                        className={cn(
                          'p-3 rounded-lg border transition-all',
                          isAlreadyApplied && 'border-green-600/30 bg-green-900/20',
                          canApply && 'border-stone-700 hover:border-amber-600/50 cursor-pointer',
                          !canApply && !isAlreadyApplied && 'border-stone-700/50 opacity-50'
                        )}
                        onClick={() => canApply && onEnchant(ench.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={cn('font-medium', school.color)}>{ench.name}</span>
                          {isAlreadyApplied && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <p className="text-xs text-stone-500">{ench.description}</p>
                        {schoolAlreadyApplied && !isAlreadyApplied && (
                          <p className="text-xs text-red-400 mt-1">
                            Уже есть зачарование этой школы
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
          
          {availableEnchantments.length === 0 && (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 mx-auto text-stone-600 mb-3" />
              <p className="text-stone-500">Нет разблокированных зачарований</p>
              <p className="text-stone-600 text-sm mt-1">
                Купите зачарования в магазине выше
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

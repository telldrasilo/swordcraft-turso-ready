/**
 * Enchanted Weapons Section
 * Секция зачарованного оружия
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Sword, Plus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { useSound } from '@/lib/sounds'
import { useState } from 'react'
import { getEnchantment, enchantmentSchoolInfo } from '@/data/enchantments'
import { qualityGrades } from '@/data/weapon-recipes'
import { EnchantWeaponModal } from './enchant-weapon-modal'

export function EnchantedWeaponsSection() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const enchantWeapon = useGameStore((state) => state.enchantWeapon)
  const unlockedEnchantments = useGameStore((state) => state.unlockedEnchantments)
  const [selectedWeapon, setSelectedWeapon] = useState<any>(null)
  const { play } = useSound()
  
  // Оружие с зачарованиями или разблокированными чарами
  const enchantableWeapons = weaponInventory.weapons.filter(w => {
    const hasEnchantments = w.enchantments && w.enchantments.length > 0
    const hasUnlockedEnchantments = unlockedEnchantments.length > 0
    return hasEnchantments || hasUnlockedEnchantments
  })
  
  const handleEnchant = (enchantmentId: string) => {
    if (selectedWeapon) {
      if (enchantWeapon(selectedWeapon.id, enchantmentId)) {
        play('craft_complete')
      }
      setSelectedWeapon(null)
    }
  }
  
  return (
    <Card className="card-medieval">
      <CardHeader>
        <CardTitle className="text-amber-200 flex items-center gap-2">
          <Sword className="w-5 h-5" />
          Зачарованное оружие
        </CardTitle>
        <CardDescription>
          Наложите зачарования на своё оружие
        </CardDescription>
      </CardHeader>
      <CardContent>
        {enchantableWeapons.length === 0 ? (
          <div className="text-center py-8">
            <Sword className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-500">Нет оружия для зачарования</p>
            <p className="text-stone-600 text-sm mt-1">
              Создайте оружие и разблокируйте зачарования
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {enchantableWeapons.map(weapon => {
              const qualityInfo = qualityGrades[weapon.qualityGrade]
              const enchantmentsCount = (weapon.enchantments || []).length
              
              return (
                <Card key={weapon.id} className="bg-stone-800/50 border-stone-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-stone-200">{weapon.name}</h4>
                        <Badge className={qualityInfo.color}>{qualityInfo.name}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-stone-500">Атака: {weapon.attack}</p>
                      </div>
                    </div>
                    
                    {/* Зачарования */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {weapon.enchantments && weapon.enchantments.map((e: any, idx: number) => {
                        const ench = getEnchantment(e.enchantmentId)
                        const school = ench ? enchantmentSchoolInfo[ench.school] : null
                        return (
                          <Badge key={e.enchantmentId || `ench-${idx}`} className={cn('text-xs', school?.color)}>
                            {school?.icon} {ench?.name}
                          </Badge>
                        )
                      })}
                      {(!weapon.enchantments || weapon.enchantments.length < 2) && (
                        <Badge variant="outline" className="text-xs text-stone-500">
                          {enchantmentsCount}/2 зачарований
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 text-purple-100"
                      onClick={() => setSelectedWeapon(weapon)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Зачаровать
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </CardContent>
      
      {/* Модальное окно зачарования */}
      <AnimatePresence>
        {selectedWeapon && (
          <EnchantWeaponModal
            weapon={selectedWeapon}
            onClose={() => setSelectedWeapon(null)}
            onEnchant={handleEnchant}
          />
        )}
      </AnimatePresence>
    </Card>
  )
}

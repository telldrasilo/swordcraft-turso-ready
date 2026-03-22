/**
 * RepairSection - секция ремонта оружия
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, CheckCircle, Zap } from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/store'
import { cn } from '@/lib/utils'
import { useSound } from '@/lib/sounds'
import { getSmithMastery, type RepairType } from '@/data/repair-system'
import { RepairCard } from '@/components/ui/repair-card'
import type { CraftedWeapon } from '@/data/weapon-recipes'
import type { ExecuteRepairResult } from '@/data/repair-system'

export function RepairSection() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const getBestBlacksmith = useGameStore((state) => state.getBestBlacksmith)
  const executeWeaponRepair = useGameStore((state) => state.executeWeaponRepair)
  const [repairingId, setRepairingId] = useState<string | null>(null)
  const [lastRepair, setLastRepair] = useState<{ weaponName: string; result: ExecuteRepairResult } | null>(null)
  const { play } = useSound()
  
  // Фильтруем оружие, которое нуждается в ремонте
  const damagedWeapons = weaponInventory.weapons
    .filter(w => (w.durability ?? 100) < (w.maxDurability ?? 100))
    .sort((a, b) => (a.durability ?? 100) - (b.durability ?? 100))
  
  const handleRepair = (weapon: CraftedWeapon, option: RepairType) => {
    setRepairingId(weapon.id)
    
    setTimeout(() => {
      const result = executeWeaponRepair(weapon.id, option)
      if (result.success) {
        play('craft_complete')
        setLastRepair({ weaponName: weapon.name, result: result.result! })
        setTimeout(() => {
          setLastRepair(null)
        }, 3000)
      }
      setRepairingId(null)
    }, 500)
  }
  
  const blacksmith = getBestBlacksmith()
  const mastery = blacksmith ? getSmithMastery(blacksmith.level) : null
  
  return (
    <div className="space-y-4">
      {/* Информация о кузнеце */}
      {!blacksmith ? (
        <Card className="card-medieval bg-stone-800/30">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-stone-500">
              <Wrench className="w-4 h-4" />
              <span className="text-sm">Нет кузнеца — ремонт с базовыми параметрами</span>
            </div>
          </CardContent>
        </Card>
      ) : mastery && (
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm font-medium text-stone-300">{blacksmith.name}</p>
                  <p className="text-xs text-amber-400">{mastery.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>{mastery.successBonus >= 0 ? '+' : ''}{mastery.successBonus}% к успеху</span>
                </div>
                <div className="flex items-center gap-1 text-purple-400">
                  <span>{mastery.discountPercent}% скидка</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Уведомление о ремонте */}
      <AnimatePresence>
        {lastRepair && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-lg bg-green-900/30 border border-green-600/50"
          >
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-semibold">
                {lastRepair.weaponName} отремонтирован!
              </span>
            </div>
            {lastRepair.result && (
              <div className="text-xs text-green-300 mt-1 flex gap-3">
                <span>Прочность: +{lastRepair.result.durabilityRestored}%</span>
                {lastRepair.result.experienceGained > 0 && (
                  <span>Опыт кузнеца: +{lastRepair.result.experienceGained}</span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Список повреждённого оружия */}
      {damagedWeapons.length === 0 ? (
        <Card className="card-medieval">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-stone-800/50 flex items-center justify-center mb-4">
              <Wrench className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-stone-500">Всё оружие в отличном состоянии</p>
            <p className="text-stone-600 text-sm mt-1">Отправляйте оружие в вылазки для заработка</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {damagedWeapons.map((weapon) => (
            <RepairCard
              key={weapon.id}
              weapon={weapon}
              repairing={repairingId === weapon.id}
              onRepair={(option) => handleRepair(weapon, option)}
            />
          ))}
        </div>
      )}
      
      {/* Подсказка */}
      <Card className="card-medieval bg-stone-800/30">
        <CardContent className="p-4">
          <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Система ремонта
          </h4>
          <ul className="text-xs text-stone-500 space-y-1">
            <li>• <strong className="text-amber-400">Материалы</strong> — нужны те же, что и для крафта</li>
            <li>• <strong className="text-green-400">Мастерство</strong> — уровень кузнеца влияет на успех и риски</li>
            <li>• <strong className="text-red-400">Риски</strong> — возможность потерять душу, эпичность или maxDurability</li>
            <li>• <strong className="text-purple-400">Развитие</strong> — кузнец получает опыт за ремонт</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

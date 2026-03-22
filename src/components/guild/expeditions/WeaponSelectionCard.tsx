/**
 * Weapon Selection Card
 * Карточка выбора оружия для экспедиции
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CraftedWeapon } from '@/store/slices/craft-slice'

// ================================
// ТИПЫ
// ================================

interface WeaponSelectionCardProps {
  weapon: CraftedWeapon
  isSelected: boolean
  canSelect: boolean
  onSelect: () => void
  reason?: string
}

// ================================
// КОМПОНЕНТ
// ================================

export const WeaponSelectionCard: React.FC<WeaponSelectionCardProps> = ({
  weapon,
  isSelected,
  canSelect,
  onSelect,
  reason
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        className={cn(
          "card-medieval cursor-pointer transition-all",
          isSelected && "border-amber-500 bg-amber-900/20",
          !canSelect && "opacity-50"
        )}
        onClick={canSelect ? onSelect : undefined}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-xl">
              ⚔️
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-200 text-sm truncate">{weapon.name}</h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-amber-400">⚔️ {weapon.attack}</span>
                <span className="text-stone-500">|</span>
                <span className="text-green-400">🛡️ {weapon.durability}%</span>
              </div>
            </div>
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>
          {!canSelect && reason && (
            <p className="text-xs text-red-400 mt-2">{reason}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default WeaponSelectionCard

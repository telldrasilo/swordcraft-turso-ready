/**
 * Expedition Selection Card
 * Карточка выбора экспедиции
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Timer, Coins, Sword, Skull, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ExpeditionTemplate, difficultyInfo, typeInfo } from '@/data/expedition-templates'

// ================================
// ТИПЫ
// ================================

interface ExpeditionSelectionCardProps {
  expedition: ExpeditionTemplate
  isSelected: boolean
  canSelect: boolean
  onSelect: () => void
  reason?: string
}

// ================================
// КОМПОНЕНТ
// ================================

export const ExpeditionSelectionCard: React.FC<ExpeditionSelectionCardProps> = ({
  expedition,
  isSelected,
  canSelect,
  onSelect,
  reason
}) => {
  const difficulty = difficultyInfo[expedition.difficulty]
  const type = typeInfo[expedition.type]
  const totalCost = expedition.cost.supplies + expedition.cost.deposit

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full"
    >
      <Card
        className={cn(
          "card-medieval cursor-pointer transition-all h-full flex flex-col",
          isSelected && "ring-2 ring-amber-500 border-amber-500 bg-gradient-to-b from-amber-900/30 to-stone-900/50 shadow-lg shadow-amber-900/30",
          !canSelect && "opacity-50"
        )}
        onClick={canSelect ? onSelect : undefined}
      >
        <CardContent className="p-4 flex flex-col flex-1">
          {/* Заголовок */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl flex-shrink-0">{expedition.icon}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-200 truncate">{expedition.name}</h4>
              <p className="text-xs text-stone-500">{type.name}</p>
            </div>
            <Badge
              className={cn(
                "text-xs flex-shrink-0 px-2 py-0.5",
                "bg-stone-800/80 border border-stone-600",
                difficulty.color
              )}
            >
              {difficulty.name}
            </Badge>
          </div>

          {/* Описание */}
          <p className="text-xs text-stone-400 mb-3 line-clamp-2 flex-shrink-0">{expedition.description}</p>

          {/* Параметры */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-stone-400">
              <Timer className="w-3 h-3 flex-shrink-0" />
              <span>{Math.floor(expedition.duration / 60)} мин</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <Coins className="w-3 h-3 flex-shrink-0" />
              <span>{totalCost} 💰</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-400">
              <Sword className="w-3 h-3 flex-shrink-0" />
              <span>⚔️ {expedition.minWeaponAttack}+</span>
            </div>
            <div className="flex items-center gap-1.5 text-orange-400">
              <Skull className="w-3 h-3 flex-shrink-0" />
              <span>{expedition.failureChance}% риск</span>
            </div>
          </div>

          {/* Награды */}
          <div className="bg-stone-800/50 rounded-lg p-2 mb-3 mt-auto flex-shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 flex items-center gap-1">
                💰 {expedition.reward.baseGold}+
              </span>
              <span className="text-purple-400 flex items-center gap-1">
                ✨ {expedition.reward.baseWarSoul} душ
              </span>
            </div>
          </div>

          {/* Причина недоступности */}
          {!canSelect && reason && (
            <p className="text-xs text-red-400 flex-shrink-0">⚠️ {reason}</p>
          )}

          {/* Индикатор выбора */}
          {isSelected && (
            <div className="flex items-center gap-1 text-xs text-amber-400 flex-shrink-0 mt-1">
              <CheckCircle className="w-3 h-3" />
              <span>Выбрано</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ExpeditionSelectionCard

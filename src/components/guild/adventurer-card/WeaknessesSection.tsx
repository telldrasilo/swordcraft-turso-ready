/**
 * Weaknesses Section Component
 * Секция слабостей искателя
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { AlertTriangle } from 'lucide-react'

// ================================
// ТИПЫ
// ================================

interface WeaknessEffect {
  id: string
  name: string
  icon: string
  description: string
  effects: {
    successPenalty?: number
    goldPenalty?: number
    refuseChanceBonus?: number
    weaponLossIncrease?: number
  }
  conditions?: {
    difficulty?: string[]
    missionType?: string[]
  }
}

interface WeaknessesSectionProps {
  weaknesses: (WeaknessEffect | null)[]
}

// ================================
// КОМПОНЕНТ
// ================================

export const WeaknessesSection: React.FC<WeaknessesSectionProps> = ({ weaknesses }) => {
  const validWeaknesses = weaknesses.filter(Boolean) as WeaknessEffect[]

  if (validWeaknesses.length === 0) return null

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <h4 className="text-xs font-medium text-red-400 uppercase tracking-wider cursor-help flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              ⚠️ Слабости
            </h4>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Слабости</p>
            <p className="text-xs text-stone-300">
              Отрицательные характеристики, дающие штрафы в подходящих миссиях
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex flex-wrap gap-2">
        {validWeaknesses.map((w) => (
          <TooltipProvider key={w.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-red-300 border-red-600/50 text-sm px-2.5 py-1 cursor-help"
                >
                  {w.icon} {w.name}
                  {w.effects.successPenalty !== 0 && (
                    <span className="ml-1 text-red-400">{w.effects.successPenalty}%</span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-red-300">{w.name}</p>
                  <p className="text-stone-300">{w.description}</p>
                  <div className="text-xs text-stone-200 space-y-0.5 pt-1 border-t border-stone-600 mt-1">
                    {w.effects.successPenalty !== 0 && (
                      <p className="text-red-300">✗ Успех: {w.effects.successPenalty}%</p>
                    )}
                    {w.effects.goldPenalty !== 0 && w.effects.goldPenalty && (
                      <p className="text-red-300">✗ Золото: -{w.effects.goldPenalty}%</p>
                    )}
                    {w.effects.refuseChanceBonus && w.effects.refuseChanceBonus > 0 && (
                      <p className="text-orange-300">✗ Отказ: +{w.effects.refuseChanceBonus}%</p>
                    )}
                    {w.effects.weaponLossIncrease && w.effects.weaponLossIncrease > 0 && (
                      <p className="text-red-300">✗ Потеря оружия: +{w.effects.weaponLossIncrease}%</p>
                    )}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}

export default WeaknessesSection

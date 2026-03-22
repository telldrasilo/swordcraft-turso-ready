/**
 * Strengths Section Component
 * Секция сильных сторон искателя
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
import { CheckCircle } from 'lucide-react'

// ================================
// ТИПЫ
// ================================

interface StrengthEffect {
  id: string
  name: string
  icon: string
  description: string
  effects: {
    successBonus?: number
    goldBonus?: number
    warSoulBonus?: number
    weaponLossReduction?: number
    weaponWearReduction?: number
  }
  conditions?: {
    difficulty?: string[]
    missionType?: string[]
  }
}

interface StrengthsSectionProps {
  strengths: (StrengthEffect | null)[]
}

// ================================
// КОМПОНЕНТ
// ================================

export const StrengthsSection: React.FC<StrengthsSectionProps> = ({ strengths }) => {
  const validStrengths = strengths.filter(Boolean) as StrengthEffect[]

  if (validStrengths.length === 0) return null

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <h4 className="text-xs font-medium text-green-400 uppercase tracking-wider cursor-help flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              💪 Сильные стороны
            </h4>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Сильные стороны</p>
            <p className="text-xs text-stone-300">
              Положительные характеристики, дающие бонусы в подходящих миссиях
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex flex-wrap gap-2">
        {validStrengths.map((s) => (
          <TooltipProvider key={s.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="text-green-300 border-green-600/50 text-sm px-2.5 py-1 cursor-help"
                >
                  {s.icon} {s.name}
                  {s.effects.successBonus && s.effects.successBonus > 0 && (
                    <span className="ml-1 text-green-400">+{s.effects.successBonus}%</span>
                  )}
                  {s.effects.goldBonus && s.effects.goldBonus > 0 && (
                    <span className="ml-1 text-yellow-400">+{s.effects.goldBonus}💰</span>
                  )}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-green-300">{s.name}</p>
                  <p className="text-stone-300">{s.description}</p>
                  <div className="text-xs text-stone-200 space-y-0.5 pt-1 border-t border-stone-600 mt-1">
                    {s.effects.successBonus && s.effects.successBonus > 0 && (
                      <p className="text-green-300">✓ Успех: +{s.effects.successBonus}%</p>
                    )}
                    {s.effects.goldBonus && s.effects.goldBonus > 0 && (
                      <p className="text-yellow-300">✓ Золото: +{s.effects.goldBonus}%</p>
                    )}
                    {s.effects.warSoulBonus && s.effects.warSoulBonus > 0 && (
                      <p className="text-purple-300">✓ Души: +{s.effects.warSoulBonus}%</p>
                    )}
                    {s.effects.weaponLossReduction && s.effects.weaponLossReduction > 0 && (
                      <p className="text-blue-300">✓ Потеря оружия: -{s.effects.weaponLossReduction}%</p>
                    )}
                    {s.effects.weaponWearReduction && s.effects.weaponWearReduction > 0 && (
                      <p className="text-cyan-300">✓ Износ: -{s.effects.weaponWearReduction}%</p>
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

export default StrengthsSection

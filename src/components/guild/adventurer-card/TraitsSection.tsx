/**
 * Traits Section Component
 * Секция черт искателя для карточки
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
import { Star } from 'lucide-react'

// ================================
// ТИПЫ
// ================================

interface Trait {
  id: string
  name: string
  icon: string
  description: string
  effects?: Record<string, number>
}

interface TraitsSectionProps {
  traits: Trait[]
}

// ================================
// КОМПОНЕНТ
// ================================

export const TraitsSection: React.FC<TraitsSectionProps> = ({ traits }) => {
  if (traits.length === 0) return null

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider cursor-help flex items-center gap-1">
              <Star className="w-3 h-3" />
              ✨ Черты
            </h4>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-semibold">Черты искателя</p>
            <p className="text-xs text-stone-300">
              Уникальные характеристики, влияющие на gameplay
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex flex-wrap gap-2">
        {traits.map((trait) => (
          <TooltipProvider key={trait.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-purple-900/40 text-purple-200 border-purple-500/50 text-sm px-3 py-1.5 cursor-help font-medium"
                >
                  {trait.icon} {trait.name}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold text-purple-300">{trait.name}</p>
                <p className="text-sm text-stone-300">{trait.description}</p>
                {trait.effects && Object.keys(trait.effects).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-stone-600 text-xs space-y-1">
                    {Object.entries(trait.effects).map(([key, value]) => (
                      <p key={key} className="text-purple-200">
                        • {key}: {value > 0 ? '+' : ''}{value}%
                      </p>
                    ))}
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    </div>
  )
}

export default TraitsSection

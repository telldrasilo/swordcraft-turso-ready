/**
 * Modifier Badge Component
 * Бейдж модификатора для отображения бонусов/штрафов
 */

'use client'

import React from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ================================
// ТИПЫ
// ================================

interface ModifierBadgeProps {
  source: string
  sourceIcon: string
  value: number
  description?: string
  type: 'positive' | 'negative' | 'neutral'
}

// ================================
// КОМПОНЕНТ
// ================================

export const ModifierBadge = React.memo<ModifierBadgeProps>(({
  source,
  sourceIcon,
  value,
  description,
  type
}) => {
  const colorClass = {
    positive: 'bg-green-900/40 text-green-300 border-green-600/30',
    negative: 'bg-red-900/40 text-red-300 border-red-600/30',
    neutral: 'bg-stone-800/40 text-stone-300 border-stone-600/30'
  }[type]

  const valuePrefix = value > 0 ? '+' : ''

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border cursor-help ${colorClass}`}>
            <span>{sourceIcon}</span>
            <span className="font-medium">{source}</span>
            <span className={value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : ''}>
              {valuePrefix}{value}%
            </span>
          </div>
        </TooltipTrigger>
        {description && (
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-sm">{description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
})

ModifierBadge.displayName = 'ModifierBadge'

export default ModifierBadge

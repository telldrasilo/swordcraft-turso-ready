/**
 * ScreenHeader
 * Переиспользуемый заголовок экрана
 */

'use client'

import { Badge } from '@/components/ui/badge'
import { InfoTooltip } from '@/components/ui/game-tooltip'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface ScreenHeaderProps {
  title: string
  icon: LucideIcon
  iconColor?: string
  description?: string
  tooltipTitle?: string
  tooltipContent?: string
  badge?: {
    content: React.ReactNode
    variant?: 'default' | 'outline'
    className?: string
  }
  rightContent?: React.ReactNode
  className?: string
}

export function ScreenHeader({
  title,
  icon: Icon,
  iconColor = 'text-amber-500',
  description,
  tooltipTitle,
  tooltipContent,
  badge,
  rightContent,
  className,
}: ScreenHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
          <Icon className={cn('w-6 h-6', iconColor)} />
          {title}
        </h2>
        {tooltipContent && (
          <InfoTooltip
            title={tooltipTitle || title}
            content={tooltipContent}
            icon="help"
          />
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {badge && (
          <Badge 
            variant={badge.variant || 'outline'} 
            className={badge.className}
          >
            {badge.content}
          </Badge>
        )}
        {rightContent}
      </div>
    </div>
  )
}

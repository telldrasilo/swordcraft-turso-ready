/**
 * TipsCard
 * Переиспользуемая карточка подсказок внизу экранов
 */

'use client'

import { Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TipsCardProps {
  title: string
  tips: Array<{
    text: string
    highlight?: string
    color?: string
  }>
  icon?: React.ReactNode
  className?: string
}

export function TipsCard({ title, tips, icon, className }: TipsCardProps) {
  return (
    <Card className={cn('card-medieval bg-stone-800/30', className)}>
      <CardContent className="p-4">
        <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
          {icon || <Zap className="w-4 h-4 text-amber-500" />}
          {title}
        </h4>
        <ul className="text-xs text-stone-500 space-y-1">
          {tips.map((tip, idx) => (
            <li key={idx}>
              • {tip.highlight && (
                <strong className={cn(
                  tip.color || 'text-amber-400'
                )}>{tip.highlight}</strong>
              )} {tip.text}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

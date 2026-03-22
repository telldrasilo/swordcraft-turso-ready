/**
 * StatCard
 * Переиспользуемая карточка статистики
 */

'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  value: number | string
  label: string
  color?: string
  bgColor?: string
  iconColor?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeConfig = {
  sm: {
    card: 'p-2',
    icon: 'w-4 h-4',
    value: 'text-base',
    label: 'text-xs',
  },
  md: {
    card: 'p-3',
    icon: 'w-5 h-5',
    value: 'text-xl',
    label: 'text-xs',
  },
  lg: {
    card: 'p-4',
    icon: 'w-6 h-6',
    value: 'text-2xl',
    label: 'text-sm',
  },
}

export function StatCard({
  icon: Icon,
  value,
  label,
  color = 'text-stone-200',
  bgColor = 'bg-stone-800/50',
  iconColor = 'text-amber-500',
  size = 'md',
  className,
}: StatCardProps) {
  const config = sizeConfig[size]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={cn('card-medieval', bgColor, className)}>
        <CardContent className={cn(config.card, 'text-center')}>
          <Icon className={cn(config.icon, 'mx-auto mb-1', iconColor)} />
          <p className={cn('font-bold', config.value, color)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className={cn('text-stone-500', config.label)}>{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

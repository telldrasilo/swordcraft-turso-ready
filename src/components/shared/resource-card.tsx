/**
 * ResourceCard
 * Переиспользуемая карточка ресурса
 */

'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ResourceIcon } from '@/components/ui/resource-icon'

interface ResourceCardProps {
  id: string
  amount: number
  formatted?: string
  rate?: number
  name?: string
  size?: 'sm' | 'md' | 'lg'
  showRate?: boolean
  className?: string
}

const sizeConfig = {
  sm: { icon: 'md', text: 'text-sm', badge: 'text-xs' },
  md: { icon: 'lg', text: 'text-base', badge: 'text-xs' },
  lg: { icon: 'xl', text: 'text-lg', badge: 'text-sm' },
}

export function ResourceCard({
  id,
  amount,
  formatted,
  rate = 0,
  name,
  size = 'md',
  showRate = true,
  className,
}: ResourceCardProps) {
  const config = sizeConfig[size]
  const hasRate = showRate && rate > 0
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        'p-2 rounded-lg border-2 text-center transition-all',
        amount > 0 ? 'shadow-md' : 'opacity-50',
        className
      )}
    >
      <div className="flex justify-center">
        <ResourceIcon id={id} size={config.icon as 'sm' | 'md' | 'lg' | 'xl'} />
      </div>
      <p className={cn('font-bold mt-0.5', config.text)}>
        {formatted || amount.toLocaleString()}
      </p>
      {name && (
        <p className="text-xs text-stone-500 truncate">{name}</p>
      )}
      {hasRate && (
        <p className={cn('text-green-400 font-medium', config.badge)}>
          +{rate.toFixed(1)}/с
        </p>
      )}
    </motion.div>
  )
}

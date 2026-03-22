'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { HelpCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-lg border border-stone-700 bg-stone-900 px-3 py-2.5 text-sm text-stone-200 shadow-xl',
      'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      'max-w-xs',
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// ================================
// ИГРОВЫЕ КОМПОНЕНТЫ ПОДСКАЗОК
// ================================

interface InfoTooltipProps {
  content: React.ReactNode
  title?: string
  icon?: 'info' | 'help' | 'none'
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  children?: React.ReactNode
}

/**
 * Базовая подсказка с иконкой или children
 */
export function InfoTooltip({ 
  content, 
  title, 
  icon = 'info', 
  className,
  side = 'top',
  children
}: InfoTooltipProps) {
  // Если есть children - рендерим их как триггер
  if (children) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <div className={cn('cursor-help', className)}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm z-50">
          {title && (
            <p className="font-semibold text-amber-400 mb-1">{title}</p>
          )}
          <div className="text-stone-300 text-xs leading-relaxed">
            {content}
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }
  
  // Иначе рендерим иконку
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button 
          className={cn(
            'inline-flex items-center justify-center text-stone-500 hover:text-stone-300 transition-colors',
            icon === 'none' && 'w-full h-full',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {icon === 'info' && <Info className="w-4 h-4" />}
          {icon === 'help' && <HelpCircle className="w-4 h-4" />}
          {icon === 'none' && <span className="sr-only">Подсказка</span>}
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm z-50">
        {title && (
          <p className="font-semibold text-amber-400 mb-1">{title}</p>
        )}
        <div className="text-stone-300 text-xs leading-relaxed">
          {content}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

interface RichTooltipProps {
  title: string
  description: string
  details?: string[]
  icon?: string
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  side?: 'top' | 'right' | 'bottom' | 'left'
  children: React.ReactNode
}

/**
 * Расширенная подсказка с заголовком, описанием и деталями
 */
export function RichTooltip({
  title,
  description,
  details,
  icon,
  rarity = 'common',
  side = 'top',
  children
}: RichTooltipProps) {
  const rarityColors = {
    common: 'text-stone-300',
    uncommon: 'text-green-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-amber-400'
  }
  
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        <div className="space-y-2">
          {/* Заголовок с иконкой */}
          <div className="flex items-center gap-2">
            {icon && <span className="text-lg">{icon}</span>}
            <p className={cn('font-semibold', rarityColors[rarity])}>{title}</p>
          </div>
          
          {/* Описание */}
          <p className="text-stone-300 text-xs leading-relaxed">{description}</p>
          
          {/* Детали списком */}
          {details && details.length > 0 && (
            <ul className="text-xs text-stone-400 space-y-0.5 pt-1 border-t border-stone-700">
              {details.map((detail, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-amber-500">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

interface StatTooltipProps {
  statName: string
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

/**
 * Подсказка для характеристики рабочего
 */
export function StatTooltip({ statName, children, side = 'top' }: StatTooltipProps) {
  const stats: Record<string, { name: string; description: string; icon: string }> = {
    speed: {
      name: 'Скорость',
      description: 'Определяет, как быстро рабочий выполняет задачи. Влияет на скорость производства.',
      icon: '⚡'
    },
    quality: {
      name: 'Качество',
      description: 'Влияет на качество изделий. Высокое качество = лучшее оружие и цена.',
      icon: '⭐'
    },
    stamina_max: {
      name: 'Выносливость',
      description: 'Максимальный запас сил. Чем выше, тем дольше рабочий может трудиться.',
      icon: '❤️'
    },
    intelligence: {
      name: 'Интеллект',
      description: 'Способность к обучению. Влияет на скорость прокачки и сложные задачи.',
      icon: '🧠'
    },
    loyalty: {
      name: 'Лояльность',
      description: 'Преданность кузнице. Снижает шанс ухода и повышает эффективность.',
      icon: '💖'
    }
  }
  
  const stat = stats[statName]
  // Защита от пустого имени характеристики
  if (!statName || !stat) return <>{children}</>
  
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>
        <div className="flex items-center gap-2 mb-1">
          <span>{stat.icon}</span>
          <p className="font-semibold text-amber-400">{stat.name}</p>
        </div>
        <p className="text-xs text-stone-300">{stat.description}</p>
      </TooltipContent>
    </Tooltip>
  )
}

// ================================
// ЭКСПОРТ
// ================================

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

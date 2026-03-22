/**
 * Craft Progress V2
 * Сегментированный прогресс-бар для крафта
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 5.6
 */

'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  CheckCircle2, Circle, Loader2, Clock, ChevronDown, ChevronUp,
  Flame, Hammer, Wrench, Package, Star, Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

import type { ActiveCraftV2, CraftStageInstance, StageCategory } from '@/types/craft-v2'

// ================================
// КОНСТАНТЫ
// ================================

const CATEGORY_COLORS: Record<StageCategory, string> = {
  preparation: 'bg-yellow-500',
  processing: 'bg-orange-500',
  forming: 'bg-red-500',
  assembly: 'bg-blue-500',
  finishing: 'bg-purple-500',
}

const CATEGORY_NAMES: Record<StageCategory, string> = {
  preparation: 'Подготовка',
  processing: 'Обработка',
  forming: 'Формовка',
  assembly: 'Сборка',
  finishing: 'Отделка',
}

const CATEGORY_ICONS: Record<StageCategory, React.ReactNode> = {
  preparation: <Flame className="w-4 h-4" />,
  processing: <Wrench className="w-4 h-4" />,
  forming: <Hammer className="w-4 h-4" />,
  assembly: <Package className="w-4 h-4" />,
  finishing: <Sparkles className="w-4 h-4" />,
}

// ================================
// ПОДКОМПОНЕНТЫ
// ================================

/** Одиночный сегмент прогресс-бара */
function ProgressSegment({
  stage,
  index,
  totalDuration,
  isCompleted,
  isInProgress,
}: {
  stage: CraftStageInstance
  index: number
  totalDuration: number
  isCompleted: boolean
  isInProgress: boolean
}) {
  // Ширина сегмента относительно общей длительности
  const widthPercent = useMemo(() => {
    return (stage.calculatedDuration / totalDuration) * 100
  }, [stage.calculatedDuration, totalDuration])
  
  const category = stage.category as StageCategory
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            "h-8 relative group cursor-pointer transition-all",
            "border-r border-stone-900 last:border-r-0",
            isInProgress && "ring-2 ring-amber-400 ring-offset-1 ring-offset-stone-900"
          )}
          style={{ 
            width: `${widthPercent}%`,
            transformOrigin: 'left',
          }}
        >
          {/* Фон сегмента */}
          <div
            className={cn(
              "absolute inset-0 transition-colors",
              isCompleted 
                ? CATEGORY_COLORS[category]
                : isInProgress
                  ? `${CATEGORY_COLORS[category]} opacity-70`
                  : "bg-stone-700"
            )}
          />
          
          {/* Прогресс внутри сегмента (для текущего этапа) */}
          {isInProgress && (
            <motion.div
              className={cn("absolute inset-y-0 left-0", CATEGORY_COLORS[category])}
              initial={{ width: 0 }}
              animate={{ width: `${stage.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          )}
          
          {/* Иконка статуса */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : isInProgress ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Circle className="w-3 h-3 text-stone-500" />
            )}
          </div>
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold">{stage.name}</p>
          <p className="text-xs text-stone-400">{CATEGORY_NAMES[category]}</p>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="w-3 h-3" />
            <span>{stage.calculatedDuration} сек</span>
          </div>
          {isInProgress && (
            <p className="text-amber-400 font-medium">
              {stage.progress.toFixed(0)}% выполнено
            </p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

/** Карточка текущего этапа */
function CurrentStageCard({ stage }: { stage: CraftStageInstance }) {
  const category = stage.category as StageCategory
  
  return (
    <Card className="bg-stone-800/50 border-stone-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "p-2 rounded-lg",
            CATEGORY_COLORS[category].replace('bg-', 'bg-').replace('500', '600/30')
          )}>
            {CATEGORY_ICONS[category]}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-stone-200">{stage.name}</p>
            <p className="text-xs text-stone-500">{CATEGORY_NAMES[category]}</p>
          </div>
          <Badge variant="outline" className="bg-stone-700">
            {stage.progress.toFixed(0)}%
          </Badge>
        </div>
        
        {/* Прогресс бар */}
        <div className="relative">
          <Progress 
            value={stage.progress} 
            className="h-3 bg-stone-700"
          />
          <motion.div
            className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stage.progress}%` }}
            transition={{ duration: 0.5 }}
          >
            <div className={cn("h-full", CATEGORY_COLORS[category])} />
          </motion.div>
        </div>
        
        {/* Сообщение */}
        {stage.startMessage && (
          <p className="mt-2 text-sm text-stone-400 italic">
            "{stage.startMessage}"
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/** Лог завершённых этапов */
function CompletedStagesLog({ 
  stages, 
  isExpanded,
  onToggle 
}: { 
  stages: CraftStageInstance[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const completedCount = stages.filter(s => s.status === 'completed').length
  
  return (
    <Card className="bg-stone-900/50 border-stone-700">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-stone-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="font-medium text-stone-200">
            Завершено: {completedCount}/{stages.length}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ScrollArea className="h-48">
              <div className="p-3 pt-0 space-y-1">
                {stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded",
                      stage.status === 'completed'
                        ? "bg-stone-800/50"
                        : "bg-stone-900/30"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      stage.status === 'completed'
                        ? CATEGORY_COLORS[stage.category as StageCategory]
                        : "bg-stone-700 text-stone-500"
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        stage.status === 'completed' ? "text-stone-300" : "text-stone-500"
                      )}>
                        {stage.name}
                      </p>
                    </div>
                    {stage.status === 'completed' && (
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

interface CraftProgressProps {
  activeCraft: ActiveCraftV2
  onCancel?: () => void
}

export function CraftProgress({ activeCraft, onCancel }: CraftProgressProps) {
  const [showLog, setShowLog] = useState(false)
  
  const currentStage = useMemo(() => {
    return activeCraft.stages[activeCraft.currentStageIndex]
  }, [activeCraft.stages, activeCraft.currentStageIndex])
  
  const overallProgress = useMemo(() => {
    return (activeCraft.elapsedTime / (activeCraft.totalDuration * 1000)) * 100
  }, [activeCraft.elapsedTime, activeCraft.totalDuration])
  
  const timeRemaining = useMemo(() => {
    const remaining = (activeCraft.totalDuration * 1000 - activeCraft.elapsedTime) / 1000
    return Math.max(0, Math.ceil(remaining))
  }, [activeCraft.elapsedTime, activeCraft.totalDuration])
  
  // Группируем этапы по категориям
  const categoryGroups = useMemo(() => {
    const groups: Record<StageCategory, CraftStageInstance[]> = {
      preparation: [],
      processing: [],
      forming: [],
      assembly: [],
      finishing: [],
    }
    
    activeCraft.stages.forEach(stage => {
      const category = stage.category as StageCategory
      if (groups[category]) {
        groups[category].push(stage)
      }
    })
    
    return groups
  }, [activeCraft.stages])
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hammer className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <h3 className="text-lg font-bold text-stone-200">
                Крафт в процессе
              </h3>
              <p className="text-sm text-stone-500">
                {activeCraft.stages.filter(s => s.status === 'completed').length} из {activeCraft.stages.length} этапов
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="bg-amber-900/30 border-amber-600/50">
              <Clock className="w-3 h-3 mr-1" />
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </Badge>
          </div>
        </div>
        
        {/* Сегментированный прогресс-бар */}
        <div className="rounded-lg overflow-hidden border border-stone-700">
          <div className="flex">
            {activeCraft.stages.map((stage, index) => (
              <ProgressSegment
                key={stage.id}
                stage={stage}
                index={index}
                totalDuration={activeCraft.totalDuration}
                isCompleted={stage.status === 'completed'}
                isInProgress={stage.status === 'in_progress'}
              />
            ))}
          </div>
        </div>
        
        {/* Легенда категорий */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryGroups).map(([category, stages]) => {
            if (stages.length === 0) return null
            const completedInCategory = stages.filter(s => s.status === 'completed').length
            const isCurrentCategory = stages.some(s => s.status === 'in_progress')
            
            return (
              <Badge
                key={category}
                variant="outline"
                className={cn(
                  "transition-colors",
                  isCurrentCategory && "ring-2 ring-amber-400",
                  completedInCategory === stages.length
                    ? "bg-green-900/30 border-green-600/50"
                    : "bg-stone-800 border-stone-700"
                )}
              >
                <span className={cn(
                  "w-2 h-2 rounded-full mr-1.5",
                  CATEGORY_COLORS[category as StageCategory]
                )} />
                {CATEGORY_NAMES[category as StageCategory]}
                <span className="ml-1.5 text-stone-500">
                  {completedInCategory}/{stages.length}
                </span>
              </Badge>
            )
          })}
        </div>
        
        {/* Текущий этап */}
        {currentStage && (
          <CurrentStageCard stage={currentStage} />
        )}
        
        {/* Лог этапов */}
        <CompletedStagesLog
          stages={activeCraft.stages}
          isExpanded={showLog}
          onToggle={() => setShowLog(!showLog)}
        />
        
        {/* Общий прогресс */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-400">Общий прогресс</span>
            <span className="font-bold text-amber-400">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2 bg-stone-700" />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default CraftProgress

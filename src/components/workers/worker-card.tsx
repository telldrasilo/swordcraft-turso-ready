/**
 * WorkerCard - карточка рабочего
 */

'use client'

import { motion } from 'framer-motion'
import { X, ArrowRight, Timer, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RichTooltip } from '@/components/ui/game-tooltip'
import { useGameStore, workerClassData, type Worker } from '@/store'
import { useWorkerStaminaTime, BALANCE } from '@/hooks/use-game-loop'
import { getWorkerClassInfo } from '@/data/game-tooltips'
import { cn } from '@/lib/utils'
import { classIcons, StaminaIcon, formatTime } from './workers-utils'

interface WorkerCardProps {
  worker: Worker
  onAssign: () => void
  onFire: () => void
}

export function WorkerCard({ 
  worker, 
  onAssign,
  onFire 
}: WorkerCardProps) {
  const classData = workerClassData[worker.class]
  const Icon = classIcons[worker.class]
  const buildings = useGameStore((state) => state.buildings)
  const maxStamina = worker.stats.stamina_max
  const staminaPercent = (worker.stamina / maxStamina) * 100
  
  const { workTime, restTime } = useWorkerStaminaTime(worker.id)
  
  const assignmentName = worker.assignment === 'rest' 
    ? 'Отдых' 
    : buildings.find(b => b.id === worker.assignment)?.name || 'Не назначен'
  
  const isWorking = worker.assignment !== 'rest' && worker.stamina > BALANCE.AUTO_REST_THRESHOLD
  const isResting = worker.assignment === 'rest'
  const isExhausted = worker.stamina <= BALANCE.AUTO_REST_THRESHOLD
  
  const classInfo = getWorkerClassInfo(worker.class)
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border transition-all',
        isExhausted 
          ? 'bg-red-900/20 border-red-600/50' 
          : isResting 
          ? 'bg-green-900/20 border-green-600/30'
          : 'bg-stone-800/30 border-stone-700/50 hover:border-amber-600/30'
      )}
    >
      <RichTooltip
        title={classData.name}
        description={classInfo?.description || classData.description}
        details={classInfo?.tips}
        icon="👤"
        side="right"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-800 to-amber-900 flex items-center justify-center relative cursor-help">
          <Icon className="w-6 h-6 text-amber-200" />
          {isExhausted && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
      </RichTooltip>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-stone-200 truncate">{worker.name}</h4>
          <Badge variant="outline" className="text-xs bg-amber-900/40 border-amber-600/50 text-amber-300 shrink-0 font-bold">
            Lv.{worker.level}
          </Badge>
          <span className="text-xs text-stone-500">{classData.name}</span>
        </div>
        
        {/* Опыт */}
        <div className="flex items-center gap-2 mb-1">
          <Progress 
            value={(worker.experience / (100 + worker.level * 50)) * 100}
            className="h-1.5 w-24 bg-stone-800 [&>div]:bg-amber-500"
          />
          <span className="text-xs text-amber-400">
            {Math.floor(worker.experience)}/{100 + worker.level * 50} XP
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            'truncate',
            isResting ? 'text-green-400' : isExhausted ? 'text-red-400' : 'text-amber-400'
          )}>
            {assignmentName}
          </span>
          
          {/* Время до истощения/восстановления */}
          {isWorking && workTime > 0 && (
            <RichTooltip
              title="Время работы"
              description="Примерное время до истощения стамины"
              side="top"
            >
              <span className="text-xs text-stone-500 flex items-center gap-1 cursor-help">
                <Timer className="w-3 h-3" />
                ~{formatTime(workTime)}
              </span>
            </RichTooltip>
          )}
          {isResting && restTime > 0 && worker.stamina < maxStamina && (
            <RichTooltip
              title="Время восстановления"
              description="Время до полного восстановления стамины"
              side="top"
            >
              <span className="text-xs text-green-500 flex items-center gap-1 cursor-help">
                <Timer className="w-3 h-3" />
                ~{formatTime(restTime)}
              </span>
            </RichTooltip>
          )}
        </div>
      </div>
      
      {/* Выносливость */}
      <RichTooltip
        title="Выносливость"
        description="Запас сил рабочего. При истощении рабочий автоматически уходит на отдых."
        details={[
          `Текущая: ${Math.round(worker.stamina)}/${maxStamina}`,
          isWorking ? `Работает ещё ~${formatTime(workTime)}` : '',
          isResting ? `Восстановится через ~${formatTime(restTime)}` : ''
        ].filter(Boolean)}
        side="top"
      >
        <div className="flex flex-col items-end gap-1 min-w-[100px] cursor-help">
          <div className="flex items-center gap-2">
            <StaminaIcon percent={staminaPercent} />
            <span className={cn(
              'text-sm font-medium',
              staminaPercent > 50 ? 'text-green-400' : 
              staminaPercent > 25 ? 'text-amber-400' : 'text-red-400'
            )}>
              {Math.round(worker.stamina)}/{maxStamina}
            </span>
          </div>
          <Progress 
            value={staminaPercent} 
            className={cn(
              'h-1.5 w-full',
              staminaPercent > 50 ? 'bg-stone-700 [&>div]:bg-green-500' : 
              staminaPercent > 25 ? 'bg-stone-700 [&>div]:bg-amber-500' : 
              'bg-stone-700 [&>div]:bg-red-500'
            )} 
          />
        </div>
      </RichTooltip>
      
      {/* Действия */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline"
          className="border-amber-600/50 text-amber-400 hover:bg-amber-900/30"
          onClick={onAssign}
        >
          <ArrowRight className="w-4 h-4 mr-1" />
          Назначить
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          className="text-red-400 hover:bg-red-900/30 hover:text-red-300"
          onClick={onFire}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  )
}

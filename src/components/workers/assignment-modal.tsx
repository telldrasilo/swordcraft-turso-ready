/**
 * AssignmentModal - модальное окно назначения рабочего
 */

'use client'

import { motion } from 'framer-motion'
import { X, BedDouble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameStore, type ProductionBuilding, type Worker } from '@/store'
import { getWorkerClassInfo, getBuildingInfo } from '@/data/game-tooltips'
import { BALANCE } from '@/hooks/use-game-loop'
import { cn } from '@/lib/utils'
import { StaminaIcon, buildingIcons } from './workers-utils'

// Карта иконок для зданий (локальная)
const buildingIconMap: Record<string, typeof BedDouble> = {
  sawmill: BedDouble,
  quarry: BedDouble,
  iron_mine: BedDouble,
  coal_mine: BedDouble,
  copper_mine: BedDouble,
  tin_mine: BedDouble,
  silver_mine: BedDouble,
  gold_mine: BedDouble,
  smelter: BedDouble,
  workshop: BedDouble,
}

interface AssignmentModalProps {
  worker: Worker
  buildings: ProductionBuilding[]
  onClose: () => void
  onAssign: (assignment: string) => void
}

export function AssignmentModal({ 
  worker, 
  buildings, 
  onClose, 
  onAssign 
}: AssignmentModalProps) {
  const allWorkers = useGameStore((state) => state.workers)
  const classInfo = getWorkerClassInfo(worker.class)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-stone-900 border border-stone-700 rounded-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-200">
            Назначить {worker.name}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Информация о рабочем */}
        <div className="mb-4 p-3 rounded-lg bg-stone-800/50 border border-stone-700/50">
          <div className="flex items-center gap-3 mb-2">
            <StaminaIcon percent={(worker.stamina / worker.stats.stamina_max) * 100} />
            <span className="text-stone-300">
              {Math.round(worker.stamina)}/{worker.stats.stamina_max} стамины
            </span>
          </div>
          {classInfo && (
            <div className="text-xs text-amber-400 mb-2">
              🎯 Специальность: {classInfo.role}
            </div>
          )}
          <p className="text-xs text-stone-500">
            💡 Наведите на работу, чтобы увидеть эффективность рабочего
          </p>
        </div>
        
        <div className="space-y-2">
          {/* Опция отдыха */}
          <button
            type="button"
            className={cn(
              'w-full p-3 rounded-lg border flex items-center gap-3 transition-all',
              worker.assignment === 'rest'
                ? 'bg-green-900/30 border-green-600/50'
                : 'bg-stone-800/50 border-stone-700/50 hover:border-green-600/50'
            )}
            onClick={(e) => {
              e.stopPropagation()
              onAssign('rest')
              onClose()
            }}
          >
            <BedDouble className="w-5 h-5 text-green-400" />
            <div className="text-left flex-1">
              <p className="font-medium text-stone-200">Отдых</p>
              <p className="text-xs text-stone-500">
                Восстановление +{BALANCE.BASE_STAMINA_RECOVERY.toFixed(1)}/с
              </p>
            </div>
            {worker.assignment === 'rest' && (
              <Badge variant="outline" className="text-green-400 border-green-600">
                Назначен
              </Badge>
            )}
          </button>
          
          {/* Здания */}
          {buildings.filter(b => b.unlocked).map((building) => {
            const Icon = buildingIconMap[building.type] || BedDouble
            const workersOnBuilding = allWorkers.filter(w => w.assignment === building.id)
            const isAssigned = worker.assignment === building.id
            const isFull = workersOnBuilding.length >= building.requiredWorkers * 2
            
            const buildingInfo = getBuildingInfo(building.id)
            
            // Проверяем, является ли это здание специальностью рабочего
            const isSpecialty = classInfo?.bestAt.some(b => 
              building.id === b.toLowerCase().replace(' ', '_') || 
              buildingInfo?.name === b ||
              b === 'Все шахты' && building.id.includes('mine') ||
              b === 'Любая работа'
            )
            
            return (
              <button
                type="button"
                key={building.id}
                className={cn(
                  'w-full p-3 rounded-lg border flex items-center gap-3 transition-all',
                  isAssigned
                    ? 'bg-amber-900/30 border-amber-600/50'
                    : isFull
                    ? 'bg-stone-800/30 border-stone-700/30 opacity-50 cursor-not-allowed'
                    : 'bg-stone-800/50 border-stone-700/50 hover:border-amber-600/50 cursor-pointer',
                  isSpecialty && !isAssigned && !isFull && 'ring-1 ring-amber-500/30'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!isFull) {
                    onAssign(building.id)
                    onClose()
                  }
                }}
                disabled={isFull && !isAssigned}
              >
                <Icon className="w-5 h-5 text-amber-400" />
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-stone-200">{building.name}</p>
                    {isSpecialty && (
                      <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">
                        Специальность
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span>
                      {workersOnBuilding.length}/{building.requiredWorkers} раб.
                    </span>
                    <span>•</span>
                    <span className="text-amber-400">
                      +{building.baseProduction.toFixed(1)}/с
                    </span>
                  </div>
                </div>
                {isAssigned && (
                  <Badge variant="outline" className="text-amber-400 border-amber-600">
                    Назначен
                  </Badge>
                )}
                {isFull && !isAssigned && (
                  <Badge variant="outline" className="text-stone-500 border-stone-600">
                    Полностью укомплектован
                  </Badge>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

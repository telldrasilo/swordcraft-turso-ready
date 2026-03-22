/**
 * BuildingCard - карточка производственного здания
 */

'use client'

import { motion } from 'framer-motion'
import { Lock, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useGameStore, type ProductionBuilding } from '@/store'
import { useProductionRates } from '@/hooks/use-game-loop'
import { getBuildingInfo, getResourceInfo } from '@/data/game-tooltips'
import { cn } from '@/lib/utils'
import { rarityColors } from './workers-utils'

// Карта иконок для зданий
const buildingIconMap: Record<string, string> = {
  sawmill: '🪵',
  quarry: '⛰️',
  iron_mine: '⚙️',
  coal_mine: '🔥',
  copper_mine: '🟤',
  tin_mine: '⚪',
  silver_mine: '🥈',
  gold_mine: '🥇',
  smelter: '🔥',
  workshop: '🔨',
}

interface BuildingCardProps {
  building: ProductionBuilding
}

export function BuildingCard({ building }: BuildingCardProps) {
  const workers = useGameStore((state) => state.workers)
  const resources = useGameStore((state) => state.resources)
  const upgradeBuilding = useGameStore((state) => state.upgradeBuilding)
  const productionRates = useProductionRates()
  
  const buildingInfo = getBuildingInfo(building.id)
  const icon = buildingIconMap[building.type] || '🏗️'
  const assignedWorkers = workers.filter(w => w.assignment === building.id)
  const efficiency = building.requiredWorkers > 0 
    ? Math.min(100, Math.round((assignedWorkers.length / building.requiredWorkers) * 100))
    : 0
  const upgradeCost = Math.floor(100 * Math.pow(1.8, building.level))
  const canUpgrade = resources.gold >= upgradeCost
  const rate = productionRates[building.produces] || 0
  
  const resourceInfo = getResourceInfo(building.produces)
  const colorClass = resourceInfo ? rarityColors[resourceInfo.rarity].text : 'text-stone-400'
  const bgColor = resourceInfo ? rarityColors[resourceInfo.rarity].bg : 'bg-stone-800/50'
  
  if (!building.unlocked) {
    return (
      <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-700/30 opacity-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-800/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-stone-500" />
          </div>
          <div>
            <p className="font-medium text-stone-400 text-sm">{building.name}</p>
            <p className="text-xs text-stone-600">
              {buildingInfo?.unlockedAt || 'Заблокировано'}
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-lg bg-stone-800/30 border border-stone-700/30 hover:border-amber-600/30 transition-all"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center text-lg',
            bgColor
          )}>
            {icon}
          </div>
          <div>
            <p className="font-medium text-stone-200 text-sm">{building.name}</p>
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <span>Ур.{building.level}</span>
              <span>•</span>
              <span className={cn(
                efficiency >= 100 ? 'text-green-400' : 
                efficiency > 0 ? 'text-amber-400' : 'text-red-400'
              )}>
                {assignedWorkers.length}/{building.requiredWorkers} раб.
              </span>
            </div>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            'text-xs',
            efficiency >= 100 ? 'text-green-400 border-green-600' : 
            efficiency > 0 ? 'text-amber-400 border-amber-600' : 'text-red-400 border-red-600'
          )}
        >
          {efficiency}%
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-stone-500">Производство:</span>
        <span className={cn('font-semibold', rate > 0 ? colorClass : 'text-stone-500')}>
          {rate > 0 ? `+${rate.toFixed(2)}/с` : 'Нет рабочих'}
        </span>
      </div>
      
      <Button
        size="sm"
        className="w-full h-7 text-xs bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100 disabled:opacity-50"
        disabled={!canUpgrade}
        onClick={() => upgradeBuilding(building.id)}
      >
        <ArrowUpRight className="w-3 h-3 mr-1" />
        Улучшить ({upgradeCost}💰)
      </Button>
    </motion.div>
  )
}

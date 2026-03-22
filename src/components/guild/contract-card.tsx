/**
 * Карточка контрактного искателя
 * Отображает информацию о контракте, лояльности и статистике
 */

'use client'

import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { motion } from 'framer-motion'
import { 
  Heart, 
  Sword, 
  Coins, 
  Sparkles, 
  Star, 
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Shield,
  Crown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send
} from 'lucide-react'
import type { ContractedAdventurer } from '@/types/contract'
import { getRarityConfig, getRarityStars } from '@/data/adventurer-rarity'
import { 
  getLoyaltyLevel, 
  getLoyaltyStatus, 
  getContractorSuccessRate,
  getContractTierName,
  getContractTierColor,
  getContractTierIcon,
  canDirectAssign,
  hasExclusiveAccess
} from '@/lib/contract-manager'

// ================================
// ПРОПСЫ
// ================================

interface ContractCardProps {
  contractedAdventurer: ContractedAdventurer
  onAssign?: () => void
  onTerminate?: () => void
  onViewDetails?: () => void
  isAssignable?: boolean
  compact?: boolean
}

// ================================
// КОМПОНЕНТ
// ================================

export const ContractCard: React.FC<ContractCardProps> = ({
  contractedAdventurer,
  onAssign,
  onTerminate,
  onViewDetails,
  isAssignable = false,
  compact = false,
}) => {
  const adventurer = contractedAdventurer.adventurer
  
  // Редкость
  const rarityConfig = useMemo(() => 
    getRarityConfig(adventurer.combat.rarity), 
    [adventurer.combat.rarity]
  )
  
  // Лояльность
  const loyaltyStatus = useMemo(() => 
    getLoyaltyStatus(contractedAdventurer.loyalty),
    [contractedAdventurer.loyalty]
  )
  
  // Статистика
  const successRate = useMemo(() => 
    getContractorSuccessRate(contractedAdventurer),
    [contractedAdventurer]
  )
  
  // Контракт
  const contractTier = contractedAdventurer.contract.tier
  const tierName = getContractTierName(contractTier)
  const tierColor = getContractTierColor(contractTier)
  const tierIcon = getContractTierIcon(contractTier)
  
  // Возможности
  const canDirect = canDirectAssign(contractedAdventurer)
  const hasExclusive = hasExclusiveAccess(contractedAdventurer)
  
  // Цвет лояльности
  const loyaltyColor = useMemo(() => {
    switch (loyaltyStatus.level) {
      case 'disgruntled': return 'text-red-400'
      case 'neutral': return 'text-stone-400'
      case 'satisfied': return 'text-blue-400'
      case 'loyal': return 'text-green-400'
      default: return 'text-stone-400'
    }
  }, [loyaltyStatus.level])
  
  // Имя
  const displayName = useMemo(() => {
    const name = adventurer.identity.firstName
    const nickname = adventurer.identity.nickname
    return nickname ? `${name} "${nickname}"` : name
  }, [adventurer.identity])

  // Компактная версия
  if (compact) {
    return (
      <Card className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border`}>
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className={tierColor}>{tierIcon}</span>
                <span className="font-medium text-sm truncate">{displayName}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <Heart className={`w-3 h-3 ${loyaltyColor}`} />
                <span className="text-xs text-stone-400">{contractedAdventurer.loyalty}%</span>
                {canDirect && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">
                    Прямой вызов
                  </Badge>
                )}
              </div>
            </div>
            {isAssignable && onAssign && (
              <Button size="sm" variant="outline" onClick={onAssign}>
                <Send className="w-3 h-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="h-full"
    >
      <Card className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 h-full flex flex-col`}>
        <CardContent className="p-4 flex-1 flex flex-col">
          {/* Заголовок */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={`font-bold text-lg truncate ${rarityConfig.textColor}`}>
                  {displayName}
                </h3>
                <span className="text-amber-400 text-sm">
                  {'★'.repeat(getRarityStars(adventurer.combat.rarity))}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={`${tierColor} border-current`}>
                  {tierIcon} {tierName}
                </Badge>
                <span className="text-xs text-stone-400">
                  Ур. {adventurer.combat.level}
                </span>
              </div>
            </div>
          </div>

          {/* Лояльность */}
          <div className="mb-3 p-2 rounded-lg bg-stone-900/50 border border-stone-700">
            <div className="flex items-center justify-between mb-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 cursor-help">
                      <Heart className={`w-4 h-4 ${loyaltyColor}`} />
                      <span className="text-sm font-medium">Лояльность</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="font-semibold">{loyaltyStatus.description}</p>
                    <p className="text-xs text-stone-300 mt-1">
                      {loyaltyStatus.bonuses.refusalModifier !== 0 && 
                        `Отказ: ${loyaltyStatus.bonuses.refusalModifier > 0 ? '+' : ''}${loyaltyStatus.bonuses.refusalModifier}%`}
                      {loyaltyStatus.bonuses.commissionModifier !== 0 && 
                        ` • Комиссия: ${loyaltyStatus.bonuses.commissionModifier > 0 ? '+' : ''}${loyaltyStatus.bonuses.commissionModifier}%`}
                      {loyaltyStatus.bonuses.critChance && 
                        ` • Крит: +${loyaltyStatus.bonuses.critChance}%`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className={`text-sm font-bold ${loyaltyColor}`}>
                {contractedAdventurer.loyalty}%
              </span>
            </div>
            <Progress 
              value={contractedAdventurer.loyalty} 
              className="h-2"
            />
          </div>

          {/* Статистика миссий */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded bg-stone-800/50 text-center">
              <div className="text-xs text-stone-400 mb-0.5">Миссий</div>
              <div className="text-lg font-bold text-stone-200">
                {contractedAdventurer.missionsCompleted}
              </div>
            </div>
            <div className="p-2 rounded bg-stone-800/50 text-center">
              <div className="text-xs text-stone-400 mb-0.5">Успех</div>
              <div className={`text-lg font-bold ${successRate >= 75 ? 'text-green-400' : successRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {successRate}%
              </div>
            </div>
          </div>

          {/* Заработок */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded bg-amber-900/20 border border-amber-700/30 cursor-help">
                    <div className="flex items-center gap-1 text-xs text-amber-400">
                      <Coins className="w-3 h-3" />
                      Золота заработано
                    </div>
                    <div className="text-base font-bold text-amber-300">
                      {contractedAdventurer.totalGoldEarned.toLocaleString()}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Общий заработок искателя по контракту</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2 rounded bg-purple-900/20 border border-purple-700/30 cursor-help">
                    <div className="flex items-center gap-1 text-xs text-purple-400">
                      <Sparkles className="w-3 h-3" />
                      Душ войны
                    </div>
                    <div className="text-base font-bold text-purple-300">
                      {contractedAdventurer.totalWarSoulEarned}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Души войны, полученные от миссий</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Бонусы контракта */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {contractedAdventurer.contract.commissionReduction > 0 && (
              <Badge variant="outline" className="text-green-300 border-green-600/30 bg-green-900/20">
                <Coins className="w-3 h-3 mr-1" />
                -{contractedAdventurer.contract.commissionReduction}% комиссия
              </Badge>
            )}
            {canDirect && (
              <Badge variant="outline" className="text-blue-300 border-blue-600/30 bg-blue-900/20">
                <Send className="w-3 h-3 mr-1" />
                Прямой вызов
              </Badge>
            )}
            {hasExclusive && (
              <Badge variant="outline" className="text-cyan-300 border-cyan-600/30 bg-cyan-900/20">
                <Crown className="w-3 h-3 mr-1" />
                Эксклюзив
              </Badge>
            )}
            {contractedAdventurer.contract.priorityAccess && (
              <Badge variant="outline" className="text-amber-300 border-amber-600/30 bg-amber-900/20">
                <Star className="w-3 h-3 mr-1" />
                Приоритет
              </Badge>
            )}
          </div>

          {/* Последняя активность */}
          {contractedAdventurer.lastMissionAt && (
            <div className="text-xs text-stone-500 mb-3">
              <Clock className="w-3 h-3 inline mr-1" />
              Последняя миссия: {new Date(contractedAdventurer.lastMissionAt).toLocaleDateString('ru-RU')}
            </div>
          )}

          {/* Действия */}
          <div className="flex gap-2 mt-auto">
            {isAssignable && onAssign && (
              <Button 
                onClick={onAssign}
                className="flex-1 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Назначить
              </Button>
            )}
            {onViewDetails && (
              <Button variant="outline" onClick={onViewDetails} className="flex-1">
                Подробнее
              </Button>
            )}
            {onTerminate && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={onTerminate}
                      className="text-red-400 border-red-600/30 hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Расторгнуть контракт</p>
                    <p className="text-xs text-red-300">Штраф: 50% от стоимости</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ContractCard

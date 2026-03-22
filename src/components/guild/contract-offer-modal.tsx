/**
 * Модальное окно предложения контракта
 * Позволяет выбрать уровень контракта и увидеть условия
 */

'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  Coins, 
  Crown, 
  Star, 
  Check, 
  X, 
  Lock,
  Sparkles,
  Send,
  Shield,
  Zap,
  Award
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContractTier, ContractTerms, ContractRequirements } from '@/types/contract'
import { CONTRACT_TERMS, CONTRACT_REQUIREMENTS } from '@/types/contract'
import {
  getContractTierName,
  getContractTierColor,
  getContractTierIcon,
  canOfferContract,
} from '@/lib/contract-manager'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { getRarityConfig } from '@/data/adventurer-rarity'

// ================================
// ПРОПСЫ
// ================================

interface ContractOfferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  adventurer: AdventurerExtended | null
  guildLevel: number
  guildGold: number
  guildGlory: number
  currentContractsCount: number
  missionsWithAdventurer: number
  missionsSuccessRate: number
  onConfirm: (tier: ContractTier) => void
}

// ================================
// КОМПОНЕНТ
// ================================

export const ContractOfferModal: React.FC<ContractOfferModalProps> = ({
  open,
  onOpenChange,
  adventurer,
  guildLevel,
  guildGold,
  guildGlory,
  currentContractsCount,
  missionsWithAdventurer,
  missionsSuccessRate,
  onConfirm,
}) => {
  const [selectedTier, setSelectedTier] = useState<ContractTier>('bronze')
  
  // Все тиеры
  const tiers: ContractTier[] = ['bronze', 'silver', 'gold', 'platinum']
  
  // Проверка доступности каждого тиера
  const tierAvailability = useMemo(() => {
    const result: Record<ContractTier, { available: boolean; reason: string }> = {
      bronze: { available: true, reason: '' },
      silver: { available: true, reason: '' },
      gold: { available: true, reason: '' },
      platinum: { available: true, reason: '' },
    }
    
    tiers.forEach(tier => {
      const check = canOfferContract(
        tier,
        guildLevel,
        currentContractsCount,
        missionsWithAdventurer,
        missionsSuccessRate,
        guildGold,
        guildGlory
      )
      result[tier] = check
    })
    
    return result
  }, [guildLevel, currentContractsCount, missionsWithAdventurer, missionsSuccessRate, guildGold, guildGlory])
  
  // Выбранный тиер
  const selectedTerms = CONTRACT_TERMS[selectedTier]
  const selectedReqs = CONTRACT_REQUIREMENTS[selectedTier]
  
  // Редкость искателя
  const rarityConfig = useMemo(() => 
    adventurer ? getRarityConfig(adventurer.combat.rarity) : null,
    [adventurer]
  )
  
  // Имя искателя
  const displayName = useMemo(() => {
    if (!adventurer) return ''
    const name = adventurer.identity.firstName
    const nickname = adventurer.identity.nickname
    return nickname ? `${name} "${nickname}"` : name
  }, [adventurer])
  
  // Подтверждение
  const handleConfirm = () => {
    if (tierAvailability[selectedTier].available) {
      onConfirm(selectedTier)
      onOpenChange(false)
    }
  }
  
  if (!adventurer) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-stone-900 border-stone-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            Предложить контракт
          </DialogTitle>
          <DialogDescription className="text-stone-400">
            {displayName} • {rarityConfig?.nameRu} искатель {adventurer.combat.level} уровня
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {/* Выбор тиера */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-stone-300">Выберите уровень контракта:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {tiers.map(tier => {
                const available = tierAvailability[tier].available
                const reason = tierAvailability[tier].reason
                const isSelected = selectedTier === tier
                const terms = CONTRACT_TERMS[tier]
                const reqs = CONTRACT_REQUIREMENTS[tier]
                
                return (
                  <TooltipProvider key={tier}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Card
                          className={cn(
                            "cursor-pointer transition-all border-2",
                            isSelected && available && "ring-2 ring-amber-500 border-amber-500",
                            !available && "opacity-50 cursor-not-allowed",
                            isSelected && !available && "ring-2 ring-red-500 border-red-500"
                          )}
                          onClick={() => available && setSelectedTier(tier)}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-2xl mb-1">{getContractTierIcon(tier)}</div>
                            <div className={cn("font-medium text-sm", getContractTierColor(tier))}>
                              {getContractTierName(tier)}
                            </div>
                            <div className="text-xs text-stone-400 mt-1">
                              {reqs.requiredResources.gold} 💰
                            </div>
                            {!available && (
                              <Lock className="w-3 h-3 mx-auto mt-1 text-stone-500" />
                            )}
                          </CardContent>
                        </Card>
                      </TooltipTrigger>
                      {!available && (
                        <TooltipContent>
                          <p className="text-red-300">{reason}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )
              })}
            </div>
          </div>
          
          {/* Детали выбранного контракта */}
          <Card className="bg-stone-800/50 border-stone-700">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className={cn("font-bold", getContractTierColor(selectedTier))}>
                  {getContractTierIcon(selectedTier)} {getContractTierName(selectedTier)} контракт
                </h4>
                <Badge variant="outline" className="text-amber-300">
                  {selectedReqs.requiredResources.gold} золота
                  {selectedReqs.requiredResources.glory && ` • ${selectedReqs.requiredResources.glory} славы`}
                </Badge>
              </div>
              
              {/* Бонусы */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Coins className="w-4 h-4 text-green-400" />
                  <span className="text-stone-300">Комиссия:</span>
                  <span className="text-green-400">-{selectedTerms.commissionReduction}%</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-stone-300">Отказ:</span>
                  <span className="text-blue-400">-{selectedTerms.refusalReduction}%</span>
                </div>
                
                {selectedTerms.priorityAccess && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300">Приоритетный доступ</span>
                  </div>
                )}
                {selectedTerms.directAssignment && (
                  <div className="flex items-center gap-2 text-sm">
                    <Send className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-300">Прямое назначение</span>
                  </div>
                )}
                {selectedTerms.exclusiveMissions && (
                  <div className="flex items-center gap-2 text-sm col-span-2">
                    <Crown className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-300">Эксклюзивные миссии</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span className="text-stone-300">Начальная лояльность:</span>
                  <span className="text-pink-400">+{selectedTerms.bonusLoyalty}</span>
                </div>
              </div>
              
              {/* Требования */}
              <div className="pt-2 border-t border-stone-700">
                <h5 className="text-xs text-stone-400 mb-2">Требования:</h5>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className={cn(
                    missionsWithAdventurer >= selectedReqs.minMissionsCompleted 
                      ? "border-green-600/50 text-green-300"
                      : "border-red-600/50 text-red-300"
                  )}>
                    {missionsWithAdventurer >= selectedReqs.minMissionsCompleted ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {selectedReqs.minMissionsCompleted}+ миссий
                  </Badge>
                  
                  <Badge variant="outline" className={cn(
                    missionsSuccessRate >= selectedReqs.minSuccessRate 
                      ? "border-green-600/50 text-green-300"
                      : "border-red-600/50 text-red-300"
                  )}>
                    {missionsSuccessRate >= selectedReqs.minSuccessRate ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {selectedReqs.minSuccessRate}%+ успех
                  </Badge>
                  
                  <Badge variant="outline" className={cn(
                    guildLevel >= selectedReqs.minGuildLevel 
                      ? "border-green-600/50 text-green-300"
                      : "border-red-600/50 text-red-300"
                  )}>
                    {guildLevel >= selectedReqs.minGuildLevel ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    Гильдия ур. {selectedReqs.minGuildLevel}
                  </Badge>
                  
                  <Badge variant="outline" className={cn(
                    guildGold >= selectedReqs.requiredResources.gold 
                      ? "border-green-600/50 text-green-300"
                      : "border-red-600/50 text-red-300"
                  )}>
                    {guildGold >= selectedReqs.requiredResources.gold ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                    {selectedReqs.requiredResources.gold} золота
                  </Badge>
                  
                  {selectedReqs.requiredResources.glory && (
                    <Badge variant="outline" className={cn(
                      guildGlory >= selectedReqs.requiredResources.glory 
                        ? "border-green-600/50 text-green-300"
                        : "border-red-600/50 text-red-300"
                    )}>
                      {guildGlory >= selectedReqs.requiredResources.glory ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
                      {selectedReqs.requiredResources.glory} славы
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!tierAvailability[selectedTier].available}
            className="gap-2"
          >
            <Crown className="w-4 h-4" />
            Заключить контракт
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ContractOfferModal

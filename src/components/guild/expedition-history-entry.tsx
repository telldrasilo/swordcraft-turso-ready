/**
 * Компонент записи истории экспедиций
 * С полной карточкой Extended искателя и возможностью заключения контракта
 */

'use client'

import React, { useState, useMemo } from 'react'
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
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { 
  User, 
  Crown, 
  Scroll, 
  Coins, 
  Sparkles, 
  Star,
  Heart,
  Sword,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  AlertTriangle,
  Zap,
  Target,
  Users,
  Compass
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExpeditionHistoryEntry, Adventurer } from '@/types/guild'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { ContractTier } from '@/types/contract'
import { CONTRACT_TERMS, CONTRACT_REQUIREMENTS } from '@/types/contract'
import { getMaxContracts, getContractTierName, getContractTierIcon, getContractTierColor } from '@/lib/contract-manager'
import { getRarityConfig, getRarityStars } from '@/data/adventurer-rarity'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import { getCombatStyleById } from '@/data/adventurer-tags/combat-styles'
import { getStrengthById } from '@/data/adventurer-tags/strengths'
import { getWeaknessById } from '@/data/adventurer-tags/weaknesses'
import { getSocialTagById } from '@/data/adventurer-tags/social-tags'
import { getMotivationById } from '@/data/adventurer-tags/motivations'

// ================================
// ПРОПСЫ
// ================================

interface ExpeditionHistoryEntryProps {
  entry: ExpeditionHistoryEntry
  guildLevel: number
  guildGold: number
  guildGlory: number
  currentContractsCount: number
  adventurerMissionCount: number
  adventurerSuccessRate: number
  alreadyContracted?: boolean
  onOfferContract?: (adventurer: Adventurer, tier: ContractTier) => void
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

const formatTime = (seconds: number) => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

// ================================
// КОМПОНЕНТ
// ================================

export const ExpeditionHistoryEntryComponent: React.FC<ExpeditionHistoryEntryProps> = ({
  entry,
  guildLevel,
  guildGold,
  guildGlory,
  currentContractsCount,
  adventurerMissionCount,
  adventurerSuccessRate,
  alreadyContracted = false,
  onOfferContract,
}) => {
  const [showAdventurerModal, setShowAdventurerModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState<ContractTier>('bronze')
  
  // Имеем ли Extended данные
  const hasExtendedData = !!entry.adventurerExtended
  
  // Получаем данные
  const extended = entry.adventurerExtended
  const legacy = entry.adventurerData
  
  // Редкость
  const rarityConfig = useMemo(() => {
    if (extended) {
      return getRarityConfig(extended.combat.rarity)
    }
    return null
  }, [extended])
  
  // Звёзды редкости
  const stars = useMemo(() => {
    if (extended) {
      return getRarityStars(extended.combat.rarity)
    }
    return 0
  }, [extended])
  
  // Полное имя
  const fullName = useMemo(() => {
    if (extended) {
      const parts = []
      if (extended.identity.lastName) parts.push(extended.identity.lastName)
      parts.push(extended.identity.firstName)
      if (extended.identity.nickname) parts.push(`"${extended.identity.nickname}"`)
      return parts.join(' ')
    }
    return entry.adventurerName
  }, [extended, entry.adventurerName])
  
  // Характер
  const personalityTraits = useMemo(() => {
    if (!extended) return []
    const traits = [extended.personality.primaryTrait]
    if (extended.personality.secondaryTrait) {
      traits.push(extended.personality.secondaryTrait)
    }
    return traits.map(id => getPersonalityTraitById(id)).filter(Boolean)
  }, [extended])
  
  // Стиль боя
  const combatStyle = useMemo(() => {
    if (!extended) return null
    return getCombatStyleById(extended.combat.combatStyle)
  }, [extended])
  
  // Сильные стороны
  const strengths = useMemo(() => {
    if (!extended) return []
    return extended.strengths
      .map(s => typeof s === 'string' ? getStrengthById(s) : getStrengthById(s.id))
      .filter(Boolean)
  }, [extended])
  
  // Слабости
  const weaknesses = useMemo(() => {
    if (!extended) return []
    return extended.weaknesses
      .map(w => typeof w === 'string' ? getWeaknessById(w) : getWeaknessById(w.id))
      .filter(Boolean)
  }, [extended])
  
  // Социальные теги
  const socialTags = useMemo(() => {
    if (!extended || !extended.personality.socialTags) return []
    return extended.personality.socialTags
      .map(id => getSocialTagById(id))
      .filter(Boolean)
  }, [extended])
  
  // Мотивации
  const motivations = useMemo(() => {
    if (!extended || !extended.personality.motivations) return []
    return extended.personality.motivations
      .map(id => getMotivationById(id))
      .filter(Boolean)
  }, [extended])
  
  // Проверка доступности контракта
  const canOfferContract = useMemo(() => {
    if (!hasExtendedData && !legacy) return { can: false, reason: 'Данные искателя недоступны' }
    if (alreadyContracted) return { can: false, reason: 'Контракт уже заключён' }
    
    const maxContracts = getMaxContracts(guildLevel)
    if (currentContractsCount >= maxContracts) {
      return { can: false, reason: `Лимит контрактов (${maxContracts}) достигнут` }
    }
    
    if (adventurerMissionCount < 3) {
      return { can: false, reason: `Нужно минимум 3 миссии (сейчас ${adventurerMissionCount})` }
    }
    
    return { can: true, reason: '' }
  }, [hasExtendedData, legacy, alreadyContracted, guildLevel, currentContractsCount, adventurerMissionCount])
  
  // Проверка тиера
  const checkTierAvailability = (tier: ContractTier) => {
    const reqs = CONTRACT_REQUIREMENTS[tier]
    const reasons: string[] = []
    
    if (adventurerMissionCount < reqs.minMissionsCompleted) {
      reasons.push(`Нужно ${reqs.minMissionsCompleted}+ миссий`)
    }
    if (adventurerSuccessRate < reqs.minSuccessRate) {
      reasons.push(`Нужно ${reqs.minSuccessRate}%+ успеха`)
    }
    if (guildLevel < reqs.minGuildLevel) {
      reasons.push(`Нужен уровень гильдии ${reqs.minGuildLevel}`)
    }
    if (guildGold < reqs.requiredResources.gold) {
      reasons.push(`Нужно ${reqs.requiredResources.gold} золота`)
    }
    if (reqs.requiredResources.glory && guildGlory < reqs.requiredResources.glory) {
      reasons.push(`Нужно ${reqs.requiredResources.glory} славы`)
    }
    
    return { available: reasons.length === 0, reasons }
  }
  
  // Заключение контракта
  const handleOfferContract = () => {
    if (canOfferContract.can && legacy && onOfferContract) {
      const tierAvailable = checkTierAvailability(selectedTier)
      if (tierAvailable.available) {
        onOfferContract(legacy, selectedTier)
        setShowAdventurerModal(false)
      }
    }
  }
  
  // Форматирование даты
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <>
      {/* Строка истории */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn(
          'p-3 rounded-lg flex items-center justify-between text-sm border transition-all',
          entry.success ? 'bg-green-900/10 border-green-600/20' : 'bg-red-900/10 border-red-600/20'
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{entry.expeditionIcon}</span>
          <div>
            <p className="text-stone-200 font-medium">{entry.expeditionName}</p>
            <p className="text-xs text-stone-500">
              {entry.adventurerName} • {entry.weaponName}
            </p>
            <p className="text-xs text-stone-600">
              {formatDate(entry.completedAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {entry.success ? (
            <>
              <Badge className="bg-green-800 text-green-100">
                {entry.isCrit ? '⭐ Крит!' : 'Успех'}
              </Badge>
              <div className="text-right">
                <p className="text-amber-400 font-semibold">+{entry.commission} 💰</p>
                <p className="text-purple-400 text-xs">+{entry.warSoul} душ</p>
              </div>
            </>
          ) : (
            <Badge className="bg-red-800 text-red-100">
              {entry.weaponLost ? 'Потеря оружия' : 'Провал'}
            </Badge>
          )}
          
          {/* Кнопка просмотра */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdventurerModal(true)}
                  className="ml-2 text-stone-400 hover:text-amber-400 hover:bg-amber-900/20"
                >
                  <User className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Посмотреть искателя</p>
                {hasExtendedData && !alreadyContracted && canOfferContract.can && (
                  <p className="text-xs text-amber-300">Можно предложить контракт</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>
      
      {/* Модальное окно */}
      <Dialog open={showAdventurerModal} onOpenChange={setShowAdventurerModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              Искатель приключений
            </DialogTitle>
            <DialogDescription>
              {fullName} • Миссий: {adventurerMissionCount} • Успех: {adventurerSuccessRate}%
            </DialogDescription>
          </DialogHeader>
          
          {hasExtendedData && extended ? (
            <div className="space-y-4">
              {/* === ЗАГОЛОВОК С ИМЕНЕМ И РЕДКОСТЬЮ === */}
              <Card className={`${rarityConfig?.bgColor || ''} ${rarityConfig?.borderColor || ''} border-2`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-xl font-bold ${rarityConfig?.textColor || 'text-stone-200'}`}>
                        {fullName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {rarityConfig && (
                          <Badge variant="outline" className={rarityConfig.textColor}>
                            {rarityConfig.nameRu}
                          </Badge>
                        )}
                        <span className="text-stone-400 text-sm">
                          Ур. {extended.combat.level}
                        </span>
                        <span className="text-stone-400 text-sm">
                          {extended.identity.gender === 'male' ? '♂ Мужчина' : '♀ Женщина'}
                        </span>
                      </div>
                    </div>
                    <div className="text-amber-400 text-lg">
                      {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* === БОЕВЫЕ ХАРАКТЕРИСТИКИ === */}
              <Card className="bg-stone-800/50 border-stone-700">
                <CardContent className="p-4 space-y-3">
                  <h4 className="text-sm font-medium text-stone-300 flex items-center gap-2">
                    <Sword className="w-4 h-4 text-amber-400" />
                    Боевые характеристики
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between">
                      <span className="text-stone-400 text-sm">Сила:</span>
                      <span className="text-red-400 font-medium">{extended.combat.power}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 text-sm">Меткость:</span>
                      <span className="text-green-400 font-medium">{extended.combat.precision}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 text-sm">Выносливость:</span>
                      <span className="text-blue-400 font-medium">{extended.combat.endurance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 text-sm">Удача:</span>
                      <span className="text-purple-400 font-medium">{extended.combat.luck}</span>
                    </div>
                  </div>
                  
                  {combatStyle && (
                    <div className="pt-2 border-t border-stone-700">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-sm">Стиль боя:</span>
                        <Badge variant="secondary" className="text-sm">
                          {combatStyle.icon} {combatStyle.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-500 mt-1">{combatStyle.description}</p>
                    </div>
                  )}
                  
                  {extended.combat.preferredWeapons && extended.combat.preferredWeapons.length > 0 && (
                    <div className="pt-2 border-t border-stone-700">
                      <span className="text-stone-400 text-sm">Предпочитаемое оружие: </span>
                      <span className="text-amber-300 text-sm">
                        {extended.combat.preferredWeapons.join(', ')}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* === ЧЕРТЫ (TRAITS) === */}
              {extended.traits && extended.traits.length > 0 && (
                <Card className="bg-purple-900/20 border-purple-700/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      ✨ Черты искателя
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {extended.traits.map((trait) => (
                        <TooltipProvider key={trait.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="outline" 
                                className="bg-purple-900/40 text-purple-200 border-purple-500/50 cursor-help px-3 py-1.5"
                              >
                                {trait.icon} {trait.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold text-purple-300">{trait.name}</p>
                              <p className="text-sm text-stone-300">{trait.description}</p>
                              {trait.effects && Object.keys(trait.effects).length > 0 && (
                                <div className="mt-2 pt-2 border-t border-stone-600 text-xs space-y-1">
                                  {Object.entries(trait.effects).map(([key, value]) => (
                                    <p key={key} className="text-purple-200">
                                      • {key}: {value > 0 ? '+' : ''}{value}%
                                    </p>
                                  ))}
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* === ХАРАКТЕР === */}
              {personalityTraits.length > 0 && (
                <Card className="bg-stone-800/50 border-stone-700">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-stone-300 flex items-center gap-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      🎯 Характер
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {personalityTraits.map((trait) => trait && (
                        <TooltipProvider key={trait.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-stone-300 border-stone-600 cursor-help">
                                {trait.icon} {trait.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">{trait.name}</p>
                              <p className="text-xs text-stone-300">{trait.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                    
                    {/* Риск-толерантность */}
                    <div className="pt-2 text-sm">
                      <span className="text-stone-400">Отношение к риску: </span>
                      <span className={
                        extended.personality.riskTolerance === 'cautious' ? 'text-blue-400' :
                        extended.personality.riskTolerance === 'reckless' ? 'text-red-400' : 'text-stone-300'
                      }>
                        {extended.personality.riskTolerance === 'cautious' ? '🛡️ Осторожный' :
                         extended.personality.riskTolerance === 'reckless' ? '⚡ Рисковый' : '⚖️ Сбалансированный'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* === СИЛЬНЫЕ СТОРОНЫ === */}
              {strengths.length > 0 && (
                <Card className="bg-green-900/20 border-green-700/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-green-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      💪 Сильные стороны
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {strengths.map((s) => s && (
                        <TooltipProvider key={s.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-green-300 border-green-600/50 cursor-help">
                                {s.icon} {s.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold text-green-300">{s.name}</p>
                              <p className="text-sm text-stone-300">{s.description}</p>
                              <p className="text-xs text-stone-400 mt-1">{s.effect}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* === СЛАБОСТИ === */}
              {weaknesses.length > 0 && (
                <Card className="bg-red-900/20 border-red-700/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-red-300 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      ⚠️ Слабости
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {weaknesses.map((w) => w && (
                        <TooltipProvider key={w.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-red-300 border-red-600/50 cursor-help">
                                {w.icon} {w.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="font-semibold text-red-300">{w.name}</p>
                              <p className="text-sm text-stone-300">{w.description}</p>
                              <p className="text-xs text-red-400 mt-1">Штраф: {w.penalty}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* === МОТИВАЦИИ === */}
              {motivations.length > 0 && (
                <Card className="bg-amber-900/20 border-amber-700/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-amber-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      🎯 Мотивации
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {motivations.map((m) => m && (
                        <TooltipProvider key={m.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-amber-300 border-amber-600/50 cursor-help">
                                {m.icon} {m.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold text-amber-300">{m.name}</p>
                              <p className="text-xs text-stone-300">{m.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* === СОЦИАЛЬНЫЕ ТЕГИ === */}
              {socialTags.length > 0 && (
                <Card className="bg-blue-900/20 border-blue-700/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-blue-300 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      👥 Социальный статус
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {socialTags.map((tag) => tag && (
                        <TooltipProvider key={tag.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-blue-300 border-blue-600/50 cursor-help">
                                {tag.icon} {tag.name}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold text-blue-300">{tag.name}</p>
                              <p className="text-xs text-stone-300">{tag.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* === УНИКАЛЬНЫЕ БОНУСЫ === */}
              {extended.uniqueBonuses && extended.uniqueBonuses.length > 0 && (
                <Card className="bg-cyan-900/20 border-cyan-700/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      ✨ Уникальные бонусы
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {extended.uniqueBonuses.map((bonus, i) => (
                        <TooltipProvider key={i}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-cyan-300 border-cyan-600/50 cursor-help">
                                {bonus.name} {bonus.value > 0 ? `+${bonus.value}%` : `${bonus.value}%`}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold text-cyan-300">{bonus.name}</p>
                              <p className="text-xs text-stone-300">{bonus.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* === ТРЕБОВАНИЯ К ОРУЖИЮ === */}
              <Card className="bg-stone-800/50 border-stone-700">
                <CardContent className="p-4">
                  <h4 className="text-sm font-medium text-stone-300 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-stone-400" />
                    Требования к оружию
                  </h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-stone-400">Мин. атака:</span> <span className="text-amber-400">{extended.requirements.minAttack}+</span></p>
                    {extended.requirements.weaponType && (
                      <p><span className="text-stone-400">Тип оружия:</span> <span className="text-stone-200">{extended.requirements.weaponType}</span></p>
                    )}
                    {extended.requirements.minQuality && (
                      <p><span className="text-stone-400">Мин. качество:</span> <span className="text-stone-200">{extended.requirements.minQuality}%</span></p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Старый формат (legacy)
            legacy && (
              <Card className="bg-stone-800/50 border-stone-700">
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-stone-200">{legacy.name}</h3>
                  {legacy.title && <p className="text-xs text-stone-400">{legacy.title}</p>}
                  
                  <div className="mt-3">
                    <Badge variant="outline" className="text-amber-300 border-amber-600/50">
                      +{legacy.skill}% душ
                    </Badge>
                  </div>
                  
                  {legacy.traits && legacy.traits.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-stone-400">Черты:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {legacy.traits.map((trait) => (
                          <Badge key={trait.id} variant="outline" className="text-purple-200 border-purple-600/50">
                            {trait.icon} {trait.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-stone-500 mt-3">
                    Требует атаку: {legacy.requirements?.minAttack || 0}+
                  </p>
                </CardContent>
              </Card>
            )
          )}
          
          {/* === СЕКЦИЯ КОНТРАКТА === */}
          {!alreadyContracted && (hasExtendedData || legacy) && (
            <div className="space-y-3 pt-4 border-t border-stone-700">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-stone-300 flex items-center gap-2">
                  <Scroll className="w-4 h-4" />
                  Предложить контракт
                </h4>
                {!canOfferContract.can && (
                  <span className="text-xs text-red-400">{canOfferContract.reason}</span>
                )}
              </div>
              
              {canOfferContract.can && (
                <>
                  {/* Выбор тиера */}
                  <div className="grid grid-cols-4 gap-2">
                    {(['bronze', 'silver', 'gold', 'platinum'] as ContractTier[]).map(tier => {
                      const available = checkTierAvailability(tier)
                      const isSelected = selectedTier === tier
                      const reqs = CONTRACT_REQUIREMENTS[tier]
                      
                      return (
                        <TooltipProvider key={tier}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Card
                                className={cn(
                                  "cursor-pointer transition-all p-2 text-center border-2",
                                  isSelected && available.available && "ring-2 ring-amber-500 border-amber-500",
                                  !available.available && "opacity-50 cursor-not-allowed"
                                )}
                                onClick={() => available.available && setSelectedTier(tier)}
                              >
                                <div className="text-lg">{getContractTierIcon(tier)}</div>
                                <div className={cn("text-xs font-medium", getContractTierColor(tier))}>
                                  {getContractTierName(tier)}
                                </div>
                                <div className="text-[10px] text-stone-500">
                                  {reqs.requiredResources.gold}💰
                                </div>
                              </Card>
                            </TooltipTrigger>
                            <TooltipContent>
                              {available.available ? (
                                <p>Выбрать {getContractTierName(tier).toLowerCase()} контракт</p>
                              ) : (
                                <div className="text-xs text-red-300">
                                  {available.reasons.map((r, i) => (
                                    <p key={i}>• {r}</p>
                                  ))}
                                </div>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                  
                  {/* Преимущества выбранного тиера */}
                  <Card className="bg-stone-800/50 border-stone-700">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-400">Комиссия:</span>
                        <span className="text-green-400">-{CONTRACT_TERMS[selectedTier].commissionReduction}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-400">Шанс отказа:</span>
                        <span className="text-blue-400">-{CONTRACT_TERMS[selectedTier].refusalReduction}%</span>
                      </div>
                      {CONTRACT_TERMS[selectedTier].directAssignment && (
                        <div className="flex items-center gap-2 text-sm text-cyan-400">
                          <CheckCircle className="w-3 h-3" />
                          Прямое назначение на миссии
                        </div>
                      )}
                      {CONTRACT_TERMS[selectedTier].exclusiveMissions && (
                        <div className="flex items-center gap-2 text-sm text-purple-400">
                          <Star className="w-3 h-3" />
                          Эксклюзивные миссии
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
          
          {/* Уже в контракте */}
          {alreadyContracted && (
            <div className="p-3 rounded-lg bg-green-900/20 border border-green-600/30 mt-4">
              <p className="text-sm text-green-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                С этим искателем уже заключён контракт
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdventurerModal(false)}>
              Закрыть
            </Button>
            {canOfferContract.can && !alreadyContracted && onOfferContract && legacy && (
              <Button onClick={handleOfferContract} className="gap-2">
                <Crown className="w-4 h-4" />
                Заключить контракт
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ExpeditionHistoryEntryComponent

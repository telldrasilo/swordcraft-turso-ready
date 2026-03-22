/**
 * Компонент компактной карточки искателя
 */

'use client'

import React, { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AdventurerExtended, Rarity } from '@/types/adventurer-extended'
import { getRarityConfig, getRarityStars } from '@/data/adventurer-rarity'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import { calculateAdventurerBonuses } from '@/lib/adventurer-generator-extended'

// ================================
// ПРОПСЫ
// ================================

interface AdventurerCompactCardProps {
  adventurer: AdventurerExtended
  expedition?: {
    difficulty: string
    baseGold: number
    baseWarSoul: number
    successChance: number
  }
  onSelect?: () => void
  onDetails?: () => void
  selected?: boolean
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

export const AdventurerCompactCard: React.FC<AdventurerCompactCardProps> = ({
  adventurer,
  expedition,
  onSelect,
  onDetails,
  selected = false,
}) => {
  // Редкость
  const rarityConfig = useMemo(() => {
    return getRarityConfig(adventurer.combat.rarity)
  }, [adventurer.combat.rarity])

  // Звёзды
  const stars = useMemo(() => {
    return getRarityStars(adventurer.combat.rarity)
  }, [adventurer.combat.rarity])

  // Основной характер
  const primaryTrait = useMemo(() => {
    return getPersonalityTraitById(adventurer.personality.primaryTrait)
  }, [adventurer.personality.primaryTrait])

  // Бонусы
  const bonuses = useMemo(() => {
    return calculateAdventurerBonuses(adventurer)
  }, [adventurer])

  // Прогноз
  const prediction = useMemo(() => {
    if (!expedition) return null

    const successChance = Math.min(95, Math.max(5, 
      expedition.successChance + bonuses.successRateBonus
    ))
    
    const gold = Math.floor(
      expedition.baseGold * (1 + bonuses.goldBonus / 100)
    )
    
    const warSoul = Math.floor(
      expedition.baseWarSoul * (1 + bonuses.warSoulBonus / 100)
    )

    return { successChance, gold, warSoul }
  }, [expedition, bonuses])

  // Краткое имя
  const shortName = useMemo(() => {
    const name = adventurer.identity.firstName
    const nickname = adventurer.identity.nickname
    return nickname ? `${name} "${nickname}"` : name
  }, [adventurer.identity])

  return (
    <Card 
      className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border transition-all ${
        selected ? 'ring-2 ring-amber-500' : ''
      }`}
    >
      <CardContent className="p-3 space-y-2">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-medium ${rarityConfig.textColor}`}>
              {shortName}
            </span>
            <span className="text-amber-400 text-sm">
              {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
            </span>
          </div>
          <div className="text-xs text-stone-400">
            Ур.{adventurer.combat.level}
          </div>
        </div>

        {/* Информация */}
        <div className="flex items-center gap-2 text-xs text-stone-400">
          <Badge variant="outline" className={`text-[10px] ${rarityConfig.textColor}`}>
            {rarityConfig.nameRu}
          </Badge>
          {primaryTrait && (
            <span>{primaryTrait.icon} {primaryTrait.name}</span>
          )}
        </div>

        {/* Прогноз */}
        {prediction && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className={`font-medium ${
                      prediction.successChance >= 70 ? 'text-green-400' :
                      prediction.successChance >= 40 ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {prediction.successChance}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Шанс успеха</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <span className="text-yellow-400">~{prediction.gold}💰</span>
              <span className="text-purple-400">~{prediction.warSoul}✨</span>
            </div>
          </div>
        )}

        {/* Способности */}
        {adventurer.uniqueBonuses.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {adventurer.uniqueBonuses.slice(0, 2).map((bonus) => (
              <Badge 
                key={bonus.id}
                variant="secondary" 
                className="text-[10px] bg-purple-900/30 text-purple-300"
              >
                {bonus.name}
              </Badge>
            ))}
            {adventurer.uniqueBonuses.length > 2 && (
              <Badge variant="secondary" className="text-[10px]">
                +{adventurer.uniqueBonuses.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Слабости */}
        {adventurer.weaknesses.length > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="text-red-400">⚠️</span>
            {adventurer.weaknesses.slice(0, 1).map((w) => (
              <span key={w.id} className="text-red-300">{w.name}</span>
            ))}
            {adventurer.weaknesses.length > 1 && (
              <span className="text-stone-500">+{adventurer.weaknesses.length - 1}</span>
            )}
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-2 pt-1">
          {onDetails && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDetails}
              className="flex-1 text-xs"
            >
              Подробнее
            </Button>
          )}
          {onSelect && (
            <Button 
              size="sm" 
              onClick={onSelect}
              className="flex-1 text-xs"
              variant={selected ? 'default' : 'secondary'}
            >
              {selected ? '✓ Выбран' : 'Выбрать'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default AdventurerCompactCard

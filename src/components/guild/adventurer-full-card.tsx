/**
 * Компонент карточки искателя (полная версия)
 * Версия 4.0 — Модульная архитектура с вынесенными секциями
 */

'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Heart } from 'lucide-react'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { getRarityConfig, getRarityStars } from '@/data/adventurer-rarity'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import { getCombatStyleById } from '@/data/adventurer-tags/combat-styles'
import { getStrengthById, doesStrengthApply } from '@/data/adventurer-tags/strengths'
import { getWeaknessById, doesWeaknessApply } from '@/data/adventurer-tags/weaknesses'
import { generateAdvice, type Advice } from '@/lib/adventurer-advice'
import { MetBadge } from '@/components/ui/met-badge'

// Подкомпоненты
import {
  TraitsSection,
  StrengthsSection,
  WeaknessesSection,
  ExpeditionForecast,
} from './adventurer-card'

// ================================
// ПРОПСЫ
// ================================

interface ExpeditionData {
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'
  type: 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
  baseGold: number
  baseWarSoul: number
  successChance: number
  goldReward: number
  warSoulReward: number
  weaponWear: number
  weaponLossChance: number
  successModifiers: Array<{ source: string; sourceIcon: string; value: number; description: string; type: string }>
  goldModifiers: Array<{ source: string; sourceIcon: string; value: number; description: string; type: string }>
}

interface AdventurerFullCardProps {
  adventurer: AdventurerExtended
  expedition?: ExpeditionData
  onSelect?: () => void
  selected?: boolean
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

export const AdventurerFullCard: React.FC<AdventurerFullCardProps> = ({
  adventurer,
  expedition,
  onSelect,
  selected = false,
}) => {
  // Редкость
  const rarityConfig = useMemo(() => getRarityConfig(adventurer.combat.rarity), [adventurer.combat.rarity])
  const stars = useMemo(() => getRarityStars(adventurer.combat.rarity), [adventurer.combat.rarity])

  // Характер
  const personalityTraits = useMemo(() => {
    const traits = [adventurer.personality.primaryTrait]
    if (adventurer.personality.secondaryTrait) traits.push(adventurer.personality.secondaryTrait)
    return traits.map(id => getPersonalityTraitById(id)).filter(Boolean)
  }, [adventurer.personality])

  // Стиль боя
  const combatStyle = useMemo(() => getCombatStyleById(adventurer.combat.combatStyle), [adventurer.combat.combatStyle])

  // Черты
  const traits = useMemo(() => adventurer.traits || [], [adventurer.traits])

  // Сильные стороны
  const strengthEffects = useMemo(() => {
    if (!expedition) return []
    return adventurer.strengths
      .map(s => {
        const data = getStrengthById(s.id)
        if (!data || !doesStrengthApply(data, expedition.difficulty, expedition.type)) return null
        return {
          id: s.id,
          name: data.name,
          icon: data.icon,
          description: data.description,
          effects: data.effects,
          conditions: data.conditions
        }
      })
      .filter(Boolean)
  }, [adventurer.strengths, expedition])

  // Слабости
  const weaknessEffects = useMemo(() => {
    if (!expedition) return []
    return adventurer.weaknesses
      .map(w => {
        const data = getWeaknessById(w.id)
        if (!data || !doesWeaknessApply(data, expedition.difficulty, expedition.type)) return null
        return {
          id: w.id,
          name: data.name,
          icon: data.icon,
          description: data.description,
          effects: data.effects,
          conditions: data.conditions
        }
      })
      .filter(Boolean)
  }, [adventurer.weaknesses, expedition])

  // Совет
  const advice = useMemo<Advice | null>(() => {
    if (!expedition) return null
    return generateAdvice(
      adventurer,
      { ...expedition, duration: 0, cost: { supplies: 0, deposit: 0 }, minGuildLevel: 1, failureChance: 0, weaponLossChance: 0, recommendedWeaponTypes: [], minWeaponAttack: 0, id: '', name: '', description: '', icon: '' },
      expedition.successChance,
      expedition.goldReward,
      expedition.warSoulReward
    )
  }, [adventurer, expedition])

  // Полное имя
  const fullName = useMemo(() => {
    const parts = []
    if (adventurer.identity.lastName) parts.push(adventurer.identity.lastName)
    parts.push(adventurer.identity.firstName)
    if (adventurer.identity.nickname) parts.push(`"${adventurer.identity.nickname}"`)
    return parts.join(' ')
  }, [adventurer.identity])

  return (
    <Card
      className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 transition-all h-full flex flex-col ${
        selected ? 'ring-2 ring-amber-500' : ''
      }`}
    >
      {/* HEADER */}
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <CardTitle className={`text-lg truncate cursor-help ${rarityConfig.textColor}`}>
                    {fullName}
                  </CardTitle>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">{rarityConfig.nameRu} искатель</p>
                  <p className="text-xs text-stone-300">
                    Уровень {adventurer.combat.level} • Сила {adventurer.combat.power} • Меткость {adventurer.combat.precision}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={`${rarityConfig.textColor} text-xs cursor-help`}>
                      {rarityConfig.nameRu}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{rarityConfig.nameRu}</p>
                    <p className="text-xs text-stone-300">
                      {rarityConfig.nameRu === 'Легендарный' && '+50% золота, +100% душ войны'}
                      {rarityConfig.nameRu === 'Эпический' && '+35% золота, +50% душ войны'}
                      {rarityConfig.nameRu === 'Редкий' && '+20% золота, +30% душ войны'}
                      {rarityConfig.nameRu === 'Необычный' && '+10% золота, +15% душ войны'}
                      {rarityConfig.nameRu === 'Обычный' && 'Базовые награды'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <span className="text-stone-400 text-xs">Ур. {adventurer.combat.level}</span>

              {combatStyle && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs cursor-help">
                        {combatStyle.icon} {combatStyle.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{combatStyle.name}</p>
                      <p className="text-xs text-stone-300">{combatStyle.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <MetBadge adventurerId={adventurer.id} />
            </div>
          </div>

          {/* Звёзды редкости */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-amber-400 text-base flex-shrink-0 ml-2 cursor-help">
                  {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{rarityConfig.nameRu}</p>
                <p className="text-xs text-stone-300">Редкость определяет бонусы к наградам</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-4 flex-1 overflow-auto text-sm">
        {/* Черты */}
        {traits.length > 0 && <TraitsSection traits={traits} />}

        {/* Характер */}
        {personalityTraits.length > 0 && (
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wider cursor-help flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    🎯 Характер
                  </h4>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">Черты характера</p>
                  <p className="text-xs text-stone-300">Влияют на поведение и выбор миссий</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex flex-wrap gap-2">
              {personalityTraits.map((trait) => trait && (
                <TooltipProvider key={trait.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-stone-300 border-stone-600 text-sm px-2.5 py-1 cursor-help">
                        {trait.icon} {trait.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{trait.name}</p>
                      <p className="text-sm text-stone-300">{trait.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}

        {/* Сильные стороны */}
        {strengthEffects.length > 0 && <StrengthsSection strengths={strengthEffects} />}

        {/* Слабости */}
        {weaknessEffects.length > 0 && <WeaknessesSection weaknesses={weaknessEffects} />}

        {/* Прогноз миссии */}
        {expedition && <ExpeditionForecast expedition={expedition} advice={advice} />}

        {/* Кнопка выбора */}
        {onSelect && (
          <div className="pt-2 mt-auto">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onSelect}
                    className="w-full"
                    variant={selected ? 'default' : 'outline'}
                    size="sm"
                  >
                    {selected ? '✓ Выбран' : 'Выбрать'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="font-semibold">
                    {selected ? 'Искатель выбран' : 'Выбрать этого искателя'}
                  </p>
                  <p className="text-xs text-stone-300">
                    {selected
                      ? 'Нажмите "Отправить в экспедицию" для подтверждения'
                      : 'Нажмите для выбора этого искателя на миссию'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default AdventurerFullCard

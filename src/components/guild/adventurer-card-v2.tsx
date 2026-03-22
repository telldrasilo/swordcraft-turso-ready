/**
 * Компонент карточки искателя — улучшенная версия
 * Версия 3.0 — Большие черты, полные tooltips, аналитика миссии
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
import { motion } from 'framer-motion'
import { Clock, Zap, Shield, TrendingUp, AlertTriangle, CheckCircle, Timer, Swords, Sparkles } from 'lucide-react'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { getRarityConfig, getRarityStars } from '@/data/adventurer-rarity'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import { getStrengthById, doesStrengthApply } from '@/data/adventurer-tags/strengths'
import { getWeaknessById, doesWeaknessApply } from '@/data/adventurer-tags/weaknesses'
import { getCombatStyleById } from '@/data/adventurer-tags/combat-styles'
import { 
  calculateExpeditionResult as calculateExpeditionResultV2,
  formatModifierValue,
  type ExpeditionCalculation
} from '@/lib/expedition-calculator-v2'
import { FullModifierBreakdown } from '@/components/ui/modifier-breakdown'
import { generateAdvice, type Advice } from '@/lib/adventurer-advice'
import { MetBadge } from '@/components/ui/met-badge'

// ================================
// ПРОПСЫ
// ================================

interface AdventurerCardV2Props {
  adventurer: AdventurerExtended
  expedition: {
    id: string
    name: string
    difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'
    type: 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
    baseGold: number
    baseWarSoul: number
    duration: number
    failureChance: number
    weaponLossChance: number
    minWeaponAttack: number
  }
  guildLevel: number
  weaponAttack: number
  weaponQuality?: number
  onSelect?: () => void
  onDetails?: () => void
  selected?: boolean
}

// ================================
// ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ TOOLTIP
// ================================

interface InfoRowProps {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  tooltipTitle: string
  tooltipContent: string
  valueColor?: string
}

const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  icon,
  tooltipTitle,
  tooltipContent,
  valueColor = 'text-stone-200'
}) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex justify-between items-center cursor-help">
          <span className="text-stone-400 text-xs flex items-center gap-1">
            {icon}
            {label}
          </span>
          <span className={`font-medium text-sm ${valueColor}`}>{value}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-semibold text-amber-400">{tooltipTitle}</p>
        <p className="text-xs text-stone-300">{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

export const AdventurerCardV2: React.FC<AdventurerCardV2Props> = ({
  adventurer,
  expedition,
  guildLevel,
  weaponAttack,
  weaponQuality = 50,
  onSelect,
  onDetails,
  selected = false,
}) => {
  // Редкость искателя
  const rarityConfig = useMemo(() => 
    getRarityConfig(adventurer.combat.rarity), 
    [adventurer.combat.rarity]
  )
  
  // Полный расчёт экспедиции через V2 калькулятор (система модификаторов)
  const calc = useMemo(() => {
    const template = {
      id: expedition.id,
      name: expedition.name,
      description: '',
      icon: '⚔️',
      type: expedition.type,
      difficulty: expedition.difficulty,
      duration: expedition.duration,
      cost: { supplies: 0, deposit: 0 },
      reward: { 
        baseGold: expedition.baseGold, 
        baseWarSoul: expedition.baseWarSoul 
      },
      minGuildLevel: 1,
      failureChance: expedition.failureChance,
      weaponLossChance: expedition.weaponLossChance,
      recommendedWeaponTypes: [],
      minWeaponAttack: expedition.minWeaponAttack || 5,
    }
    return calculateExpeditionResultV2(
      adventurer, 
      template, 
      guildLevel, 
      weaponAttack, 
      weaponQuality,
      'sword', // тип оружия по умолчанию
      'weapon_0'
    )
  }, [adventurer, expedition, guildLevel, weaponAttack, weaponQuality])
  
  // Имя
  const displayName = useMemo(() => {
    const name = adventurer.identity.firstName
    const nickname = adventurer.identity.nickname
    return nickname ? `${name} "${nickname}"` : name
  }, [adventurer.identity])
  
  // Характер
  const primaryTrait = useMemo(() => 
    getPersonalityTraitById(adventurer.personality.primaryTrait),
    [adventurer.personality.primaryTrait]
  )
  
  // Стиль боя
  const combatStyle = useMemo(() =>
    getCombatStyleById(adventurer.combat.combatStyle),
    [adventurer.combat.combatStyle]
  )
  
  // Черты (traits) — ВАЖНО!
  const traits = useMemo(() => adventurer.traits || [], [adventurer.traits])
  
  // Умный совет
  const advice = useMemo<Advice | null>(() => {
    return generateAdvice(
      adventurer,
      { 
        ...expedition,
        description: '', icon: '', cost: { supplies: 0, deposit: 0 },
        minGuildLevel: 1, recommendedWeaponTypes: []
      },
      calc.successChance,
      calc.commission,
      calc.warSoul
    )
  }, [adventurer, expedition, calc])
  
  // Цвет успеха
  const successColor = useMemo(() => {
    if (calc.successChance >= 75) return 'text-green-400'
    if (calc.successChance >= 50) return 'text-amber-400'
    return 'text-red-400'
  }, [calc.successChance])

  // Расчёт времени с модификаторами
  const durationMinutes = useMemo(() => {
    const baseMinutes = Math.floor(expedition.duration / 60)
    // Можно добавить модификаторы скорости
    return baseMinutes
  }, [expedition.duration])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card 
        className={`${rarityConfig.bgColor} ${rarityConfig.borderColor} border-2 transition-all cursor-pointer h-full flex flex-col ${
          selected ? 'ring-2 ring-amber-500 shadow-lg shadow-amber-900/30' : 'hover:border-stone-500'
        }`}
        onClick={onSelect}
      >
        <CardContent className="p-3 space-y-2 flex-1 flex flex-col overflow-hidden">
          {/* ===== ЗАГОЛОВОК С ИМЕНЕМ ===== */}
          <div className="flex items-start justify-between gap-2 flex-shrink-0">
            <div className="flex-1 min-w-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className={`font-bold text-base truncate cursor-help ${rarityConfig.textColor}`}>
                      {displayName}
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">{rarityConfig.nameRu} искатель</p>
                    <p className="text-xs text-stone-300">
                      Уровень {adventurer.combat.level} • Сила {adventurer.combat.power}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-amber-400 text-xs cursor-help">
                        {'★'.repeat(getRarityStars(adventurer.combat.rarity))}
                      </span>
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
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 cursor-help">
                        Ур. {adventurer.combat.level}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">Уровень {adventurer.combat.level}</p>
                      <p className="text-xs text-stone-300">
                        {calc.levelMatch.match === 'optimal' && '✓ Идеальное соответствие миссии'}
                        {calc.levelMatch.match === 'underlevel' && '⚠ Немного ниже рекомендованного'}
                        {calc.levelMatch.match === 'overlevel' && '😴 Слишком опытный для этой миссии'}
                        {calc.levelMatch.match === 'dangerous' && '💀 Уровень слишком низкий!'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Бейдж "Уже встречали" */}
                <MetBadge adventurerId={adventurer.id} compact />
                
                {combatStyle && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 cursor-help">
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
              </div>
            </div>
            
            {/* Большой шанс успеха */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className={`text-right flex-shrink-0 cursor-help ${successColor}`}>
                    <div className="text-2xl font-bold leading-none">{calc.successChance}%</div>
                    <div className="text-[10px] text-stone-400">успех</div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold">Шанс успеха миссии</p>
                  <p className="text-xs text-stone-300">
                    Базовый шанс зависит от сложности миссии. На него влияют уровень искателя, оружие, сильные и слабые стороны.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* ===== ЧЕРТЫ (TRAITS) — УВЕЛИЧЕННЫЕ ===== */}
          {traits.length > 0 && (
            <div className="flex flex-wrap gap-1.5 flex-shrink-0">
              {traits.slice(0, 3).map((trait) => (
                <TooltipProvider key={trait.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="text-sm px-2 py-1 bg-purple-900/40 text-purple-200 border-purple-500/50 font-medium"
                      >
                        {trait.icon} {trait.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-semibold text-purple-300">{trait.name}</p>
                      <p className="text-sm text-stone-300">{trait.description}</p>
                      {trait.effects && Object.keys(trait.effects).length > 0 && (
                        <div className="mt-1 pt-1 border-t border-stone-600 text-xs">
                          {Object.entries(trait.effects).map(([key, value]) => (
                            <p key={key} className="text-purple-200">
                              {key}: {value > 0 ? '+' : ''}{value}%
                            </p>
                          ))}
                        </div>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}

          {/* ===== СИЛЬНЫЕ СТОРОНЫ И СЛАБОСТИ ===== */}
          <div className="flex flex-wrap gap-1 flex-shrink-0">
            {/* Сильные стороны */}
            {adventurer.strengths.slice(0, 2).map((s) => {
              const data = getStrengthById(s.id)
              if (!data) return null
              const applies = doesStrengthApply(data, expedition.difficulty, expedition.type)
              return (
                <TooltipProvider key={s.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className={`text-[10px] cursor-help ${applies ? 'bg-green-900/30 text-green-300 border-green-600/40' : 'bg-stone-800/30 text-stone-500 border-stone-600/30'}`}
                      >
                        {data.icon} {data.name}
                        {applies && data.effects.successBonus > 0 && (
                          <span className="ml-1 text-green-400">+{data.effects.successBonus}%</span>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium text-green-300">{data.name}</p>
                      <p className="text-sm text-stone-300">{data.description}</p>
                      {applies ? (
                        <div className="mt-1 pt-1 border-t border-stone-600 text-xs space-y-0.5">
                          {data.effects.successBonus !== 0 && <p className="text-green-300">✓ Успех: +{data.effects.successBonus}%</p>}
                          {data.effects.goldBonus !== 0 && <p className="text-yellow-300">✓ Золото: +{data.effects.goldBonus}%</p>}
                          {data.effects.warSoulBonus !== 0 && <p className="text-purple-300">✓ Души: +{data.effects.warSoulBonus}%</p>}
                          {data.effects.weaponLossReduction !== 0 && <p className="text-blue-300">✓ Потеря оружия: -{data.effects.weaponLossReduction}%</p>}
                        </div>
                      ) : (
                        <p className="text-xs text-stone-500 mt-1">Не применяется на этой миссии</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
            
            {/* Слабости */}
            {adventurer.weaknesses.slice(0, 2).map((w) => {
              const data = getWeaknessById(w.id)
              if (!data) return null
              const applies = doesWeaknessApply(data, expedition.difficulty, expedition.type)
              if (!applies) return null
              return (
                <TooltipProvider key={w.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] cursor-help bg-red-900/30 text-red-300 border-red-600/40"
                      >
                        ⚠️ {data.name}
                        {data.effects.successPenalty < 0 && (
                          <span className="ml-1 text-red-400">{data.effects.successPenalty}%</span>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium text-red-300">{data.name}</p>
                      <p className="text-sm text-stone-300">{data.description}</p>
                      <div className="mt-1 pt-1 border-t border-stone-600 text-xs space-y-0.5">
                        {data.effects.successPenalty !== 0 && <p className="text-red-300">✗ Успех: {data.effects.successPenalty}%</p>}
                        {data.effects.goldPenalty !== 0 && <p className="text-red-300">✗ Золото: -{data.effects.goldPenalty}%</p>}
                        {data.effects.refuseChanceBonus > 0 && <p className="text-orange-300">✗ Отказ: +{data.effects.refuseChanceBonus}%</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            })}
          </div>

          {/* ===== МОДИФИКАТОРЫ ===== */}
          <div className="flex flex-wrap gap-0.5 text-[10px] flex-shrink-0">
            {calc.successModifiers.slice(0, 4).map((mod, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={`px-1 py-0.5 rounded cursor-help ${
                      mod.type === 'positive' ? 'bg-green-900/30 text-green-400' :
                      mod.type === 'negative' ? 'bg-red-900/30 text-red-400' :
                      'bg-stone-800/30 text-stone-400'
                    }`}>
                      {mod.sourceIcon} {mod.value > 0 ? '+' : ''}{mod.value}%
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm font-medium">{mod.source}</p>
                    <p className="text-xs text-stone-300">{mod.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {calc.successModifiers.length > 4 && (
              <span className="text-stone-500 px-1">+{calc.successModifiers.length - 4}</span>
            )}
          </div>

          {/* ===== АНАЛИТИКА ПРЕДСКАЗАНИЯ МИССИИ ===== */}
          <div className="bg-stone-900/60 rounded-lg p-2 border border-stone-700/50 space-y-1.5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs font-medium text-stone-300 flex items-center gap-1 cursor-help">
                      <TrendingUp className="w-3 h-3" />
                      Прогноз миссии
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-semibold">Расчёт результатов миссии</p>
                    <p className="text-xs text-stone-300">
                      Предварительный расчёт на основе параметров искателя, оружия и условий миссии.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {advice && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded cursor-help ${
                        advice.type === 'excellent' ? 'bg-green-900/50 text-green-300' :
                        advice.type === 'good' ? 'bg-blue-900/50 text-blue-300' :
                        advice.type === 'risky' ? 'bg-amber-900/50 text-amber-300' :
                        advice.type === 'dangerous' ? 'bg-red-900/50 text-red-300' :
                        advice.type === 'warning' ? 'bg-orange-900/50 text-orange-300' :
                        'bg-purple-900/50 text-purple-300'
                      }`}>
                        {advice.icon} {advice.text.length > 20 ? advice.text.slice(0, 20) + '...' : advice.text}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{advice.text}</p>
                      {advice.detail && <p className="text-xs text-stone-300">{advice.detail}</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            
            {/* Основные показатели */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <InfoRow
                label="Шанс успеха"
                value={<span className={successColor}>{calc.successChance}%</span>}
                icon={<CheckCircle className="w-3 h-3" />}
                tooltipTitle="Шанс успешного выполнения"
                tooltipContent={`Базовый шанс модифицируется уровнем искателя, оружием, сильными и слабыми сторонами. Итоговый шанс: ${calc.successChance}%`}
                valueColor={successColor}
              />
              
              <InfoRow
                label="Длительность"
                value={`${durationMinutes} мин`}
                icon={<Clock className="w-3 h-3" />}
                tooltipTitle="Время выполнения миссии"
                tooltipContent={`Миссия займёт примерно ${durationMinutes} минут реального времени. После завершения придёт отчёт.`}
              />
              
              <InfoRow
                label="Комиссия"
                value={<span className="text-amber-400">{calc.commission} 💰</span>}
                icon={<Sparkles className="w-3 h-3" />}
                tooltipTitle="Заработок гильдии"
                tooltipContent={`При успехе гильдия получит ${calc.commission} золота. Учитывается уровень гильдии и редкость искателя.`}
                valueColor="text-amber-400"
              />
              
              <InfoRow
                label="Души войны"
                value={<span className="text-purple-400">~{calc.warSoul} ✨</span>}
                icon={<Zap className="w-3 h-3" />}
                tooltipTitle="Души войны за миссию"
                tooltipContent={`Души войны используются для улучшения оружия. При успехе: ~${calc.warSoul} душ. Зависит от редкости искателя.`}
                valueColor="text-purple-400"
              />
              
              <InfoRow
                label="Износ оружия"
                value={`${calc.weaponWear}%`}
                icon={<Swords className="w-3 h-3" />}
                tooltipTitle="Износ оружия при миссии"
                tooltipContent={`Оружие потеряет ~${calc.weaponWear}% прочности. При достижении 0% оружие сломается.`}
              />
              
              <InfoRow
                label="Риск потери"
                value={<span className={calc.weaponLossChance > 10 ? 'text-red-400' : 'text-stone-300'}>{calc.weaponLossChance}%</span>}
                icon={<Shield className="w-3 h-3" />}
                tooltipTitle="Шанс потери оружия"
                tooltipContent={`При провале есть ${calc.weaponLossChance}% шанс потерять оружие навсегда. Можно восстановить за золото.`}
                valueColor={calc.weaponLossChance > 10 ? 'text-red-400' : 'text-stone-300'}
              />
            </div>
            
            {/* ===== ДЕТАЛИЗАЦИЯ МОДИФИКАТОРОВ ===== */}
            <div className="mt-3 pt-2 border-t border-stone-700/50">
              <FullModifierBreakdown calculation={calc} compact />
            </div>
          </div>

          {/* ===== КНОПКА ВЫБОРА ===== */}
          {onSelect && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect()
                    }}
                    className={`w-full mt-1 flex-shrink-0 ${selected ? 'bg-amber-600 hover:bg-amber-500' : ''}`}
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
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AdventurerCardV2

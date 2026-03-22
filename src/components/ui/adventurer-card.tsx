/**
 * Карточка искателя приключений
 * Полная информация для осознанного выбора
 */

'use client'

import { motion } from 'framer-motion'
import {
  Sword, Heart, Star, Sparkles, Coins, Clock, Shield,
  Zap, Package, Target, Droplet, TrendingUp, AlertTriangle,
  CheckCircle, Timer, Gift, Dice5, Info
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AdventurerTrait } from '@/data/adventurer-traits'
import { UniqueBonus, getBonusBgColor, calculateBonusEffects } from '@/data/unique-bonuses'
import { InfoTooltip } from '@/components/ui/game-tooltip'
import {
  getAdventurerFullName,
  getAdventurerSkillText,
  calculateExpeditionPreview,
  getAdventurerRarityText
} from '@/lib/adventurer-generator'

// ================================
// ТИПЫ
// ================================

interface AdventurerCardProps {
  adventurer: {
    id: string
    name: string
    title?: string
    nickname?: string
    skill: number
    traits: AdventurerTrait[]
    uniqueBonuses: UniqueBonus[]
    requirements: {
      minAttack: number
      weaponType?: string
      minQuality?: number
    }
    portrait: number
    expiresAt: number
    createdAt: number
  }
  onSelect?: () => void
  isSelected?: boolean
  selectedExpedition?: {
    baseGold: number
    baseWarSoul: number
    duration: number
    successChance: number
    weaponWear: number
    weaponLossChance: number
  } | null
  compact?: boolean
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ
// ================================

// Иконки для бонусов
const bonusIcons: Record<string, React.ReactNode> = {
  resource_gatherer: <Package className="w-4 h-4" />,
  speedster: <Zap className="w-4 h-4" />,
  careful: <Shield className="w-4 h-4" />,
  merchant: <Coins className="w-4 h-4" />,
  soul_seeker: <Sparkles className="w-4 h-4" />,
  lucky: <Dice5 className="w-4 h-4" />,
  precise: <Target className="w-4 h-4" />,
  mage: <Droplet className="w-4 h-4" />,
}

// Иконки для черт характера
const traitEffectIcons: Record<string, React.ReactNode> = {
  success_rate: <Target className="w-3 h-3" />,
  bonus_chance: <Gift className="w-3 h-3" />,
  wear: <Shield className="w-3 h-3" />,
  soul_points: <Sparkles className="w-3 h-3" />,
  duration: <Clock className="w-3 h-3" />,
  magic: <Sparkles className="w-3 h-3" />,
  weapon_loss: <AlertTriangle className="w-3 h-3" />,
}

// Цвета для типов эффектов
const traitEffectColors: Record<string, string> = {
  success_rate: 'text-green-400',
  bonus_chance: 'text-amber-400',
  wear: 'text-orange-400',
  soul_points: 'text-purple-400',
  duration: 'text-blue-400',
  magic: 'text-pink-400',
  weapon_loss: 'text-red-400',
}

// Названия типов эффектов на русском
const traitEffectNames: Record<string, string> = {
  success_rate: 'Успех',
  bonus_chance: 'Бонусы',
  wear: 'Износ',
  soul_points: 'Души',
  duration: 'Время',
  magic: 'Магия',
  weapon_loss: 'Потеря',
}

// Подробные описания эффектов черт
const traitEffectDescriptions: Record<string, string> = {
  success_rate: 'Влияет на вероятность успешного завершения экспедиции',
  bonus_chance: 'Увеличивает шанс получить дополнительные награды',
  wear: 'Определяет насколько сильно изнашивается оружие',
  soul_points: 'Бонус к получаемой Душе Войны',
  duration: 'Влияет на время выполнения экспедиции',
  magic: 'Усиливает эффекты магических экспедиций',
  weapon_loss: 'Шанс потерять оружие при провале экспедиции',
}

// ================================
// КОМПОНЕНТ ОТОБРАЖЕНИЯ БОНУСА
// ================================

function BonusDisplay({ bonus, isPrimary = false }: { bonus: UniqueBonus; isPrimary?: boolean }) {
  const bgColor = getBonusBgColor(bonus)

  return (
    <InfoTooltip
      title={bonus.name}
      content={
        <div className="space-y-2">
          <p className="text-stone-300">{bonus.description}</p>
          <p className="text-xs font-medium text-amber-400">{bonus.effectText}</p>
          <p className="text-xs text-stone-500">
            Редкость: {bonus.rarity === 'rare' ? 'Редкий' : bonus.rarity === 'uncommon' ? 'Необычный' : 'Обычный'}
          </p>
        </div>
      }
      side="top"
    >
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border cursor-help',
          bgColor,
          isPrimary && 'ring-2 ring-amber-500/50'
        )}
      >
        <span className="text-xl">{bonus.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-200 text-sm">{bonus.name}</span>
            {bonus.rarity === 'rare' && (
              <Badge className="text-xs bg-purple-800 text-purple-200">Редкий</Badge>
            )}
            {bonus.rarity === 'uncommon' && (
              <Badge className="text-xs bg-blue-800 text-blue-200">Необычный</Badge>
            )}
          </div>
          <p className="text-xs text-stone-400 truncate">{bonus.effectText}</p>
        </div>
      </div>
    </InfoTooltip>
  )
}

// ================================
// КОМПОНЕНТ ОТОБРАЖЕНИЯ ЧЕРТЫ
// ================================

function TraitDisplay({ trait }: { trait: AdventurerTrait }) {
  const effectIcon = traitEffectIcons[trait.effect.type]
  const effectColor = traitEffectColors[trait.effect.type]
  const effectName = traitEffectNames[trait.effect.type]
  const effectDesc = traitEffectDescriptions[trait.effect.type]
  const isPositive = trait.effect.value > 0

  // Определяем, позитивный ли эффект для игрока
  const isGoodEffect = () => {
    // Для износа, времени и потери - отрицательное значение это хорошо
    if (['wear', 'duration', 'weapon_loss'].includes(trait.effect.type)) {
      return trait.effect.value < 0
    }
    // Для остальных - положительное это хорошо
    return trait.effect.value > 0
  }

  return (
    <InfoTooltip
      title={trait.name}
      content={
        <div className="space-y-2">
          <p className="text-stone-300">{trait.description}</p>
          <div className="flex items-center gap-2">
            {effectIcon}
            <span className={cn('text-xs font-medium', isGoodEffect() ? 'text-green-400' : 'text-red-400')}>
              {effectName}: {trait.effect.value > 0 ? '+' : ''}{trait.effect.value}%
            </span>
          </div>
          <p className="text-xs text-stone-500">{effectDesc}</p>
        </div>
      }
      side="top"
    >
      <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-stone-800/50 border border-stone-700/50 cursor-help hover:bg-stone-700/50 transition-colors">
        <span className="text-base">{trait.icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-xs text-stone-300">{trait.name}</span>
        </div>
        <div className={cn('flex items-center gap-1 text-xs', effectColor)}>
          {effectIcon}
          <span className={cn(isGoodEffect() ? 'text-green-400' : 'text-red-400')}>
            {isPositive ? '+' : ''}{trait.effect.value}%
          </span>
        </div>
      </div>
    </InfoTooltip>
  )
}

// ================================
// КОМПОНЕНТ ПРЕДПРОСМОТРА ЭКСПЕДИЦИИ
// ================================

function ExpeditionPreview({
  preview
}: {
  preview: ReturnType<typeof calculateExpeditionPreview>
}) {
  return (
    <div className="bg-stone-900/80 rounded-lg p-3 border border-stone-700/50">
      <h5 className="text-xs font-semibold text-stone-400 mb-2 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        Расчёт для экспедиции
      </h5>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Шанс успеха */}
        <InfoTooltip
          title="Шанс успеха"
          content="Вероятность успешного завершения экспедиции. Зависит от сложности, оружия и бонусов искателя."
          side="top"
        >
          <div className="flex items-center justify-between cursor-help">
            <span className="text-stone-500">Успех:</span>
            <span className={cn(
              'font-semibold',
              preview.successChance >= 80 ? 'text-green-400' :
              preview.successChance >= 50 ? 'text-amber-400' : 'text-red-400'
            )}>
              {preview.successChance}%
            </span>
          </div>
        </InfoTooltip>

        {/* Время */}
        <InfoTooltip
          title="Время экспедиции"
          content="Примерное время выполнения экспедиции с учётом бонусов искателя на скорость."
          side="top"
        >
          <div className="flex items-center justify-between cursor-help">
            <span className="text-stone-500">Время:</span>
            <span className="font-semibold text-blue-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(preview.duration / 60)}м
            </span>
          </div>
        </InfoTooltip>

        {/* Золото */}
        <InfoTooltip
          title="Награда золотом"
          content="Ожидаемое количество золота по завершении экспедиции с учётом всех бонусов."
          side="top"
        >
          <div className="flex items-center justify-between cursor-help">
            <span className="text-stone-500">Золото:</span>
            <span className="font-semibold text-amber-400">~{preview.gold}</span>
          </div>
        </InfoTooltip>

        {/* Души */}
        <InfoTooltip
          title="Душа Войны"
          content="Ожидаемое количество Души Войны. Зависит от навыка искателя и качества оружия."
          side="top"
        >
          <div className="flex items-center justify-between cursor-help">
            <span className="text-stone-500">Души:</span>
            <span className="font-semibold text-purple-400">~{preview.warSoul}</span>
          </div>
        </InfoTooltip>

        {/* Износ */}
        <InfoTooltip
          title="Износ оружия"
          content="Насколько сильно пострадает оружие в экспедиции. Бонусы могут снизить износ."
          side="top"
        >
          <div className="flex items-center justify-between cursor-help">
            <span className="text-stone-500">Износ:</span>
            <span className="font-semibold text-orange-400">-{preview.weaponWear}%</span>
          </div>
        </InfoTooltip>

        {/* Потеря */}
        <InfoTooltip
          title="Риск потери оружия"
          content="Шанс безвозвратно потерять оружие при провале экспедиции. Некоторые искатели снижают этот риск."
          side="top"
        >
          <div className="flex items-center justify-between cursor-help">
            <span className="text-stone-500">Потеря:</span>
            <span className={cn(
              'font-semibold',
              preview.weaponLossChance > 20 ? 'text-red-400' : 'text-stone-400'
            )}>
              {preview.weaponLossChance}%
            </span>
          </div>
        </InfoTooltip>
      </div>

      {/* Дополнительные возможности */}
      {(preview.hasResourceChance || preview.hasEssenceBonus || preview.hasCritChance) && (
        <div className="mt-2 pt-2 border-t border-stone-700/50 flex flex-wrap gap-1">
          {preview.hasResourceChance && (
            <InfoTooltip
              title="Добытчик ресурсов"
              content="Искатель может принести дополнительные ресурсы (руда, дерево, камень) после успешной экспедиции."
              side="top"
            >
              <Badge className="text-xs bg-green-900/50 text-green-300 border-green-700/50 cursor-help">
                <Package className="w-3 h-3 mr-1" />
                {preview.resourceChance}% ресурсы
              </Badge>
            </InfoTooltip>
          )}
          {preview.hasEssenceBonus && (
            <InfoTooltip
              title="Магическая эссенция"
              content="Искатель гарантированно принесёт магическую эссенцию — редкий ресурс для зачарований."
              side="top"
            >
              <Badge className="text-xs bg-pink-900/50 text-pink-300 border-pink-700/50 cursor-help">
                <Droplet className="w-3 h-3 mr-1" />
                +{preview.essenceGuaranteed} эссенция
              </Badge>
            </InfoTooltip>
          )}
          {preview.hasCritChance && (
            <InfoTooltip
              title="Критический успех"
              content="Шанс удвоить ВСЕ награды экспедиции! Очень ценный бонус для долгих экспедиций."
              side="top"
            >
              <Badge className="text-xs bg-amber-900/50 text-amber-300 border-amber-700/50 cursor-help">
                <Dice5 className="w-3 h-3 mr-1" />
                {preview.critChance}% крит!
              </Badge>
            </InfoTooltip>
          )}
        </div>
      )}
    </div>
  )
}

// ================================
// ОСНОВНАЯ КАРТОЧКА ИСКАТЕЛЯ
// ================================

export function AdventurerCard({
  adventurer,
  onSelect,
  isSelected = false,
  selectedExpedition = null,
  compact = false
}: AdventurerCardProps) {
  const fullName = getAdventurerFullName(adventurer)
  const skillInfo = getAdventurerSkillText(adventurer.skill)
  const rarityInfo = getAdventurerRarityText(adventurer)

  // Предпросмотр для выбранной экспедиции
  const expeditionPreview = selectedExpedition
    ? calculateExpeditionPreview(adventurer, selectedExpedition)
    : null

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        className={cn('cursor-pointer', isSelected && 'ring-2 ring-amber-500 rounded-xl')}
      >
        <Card className={cn(
          'card-medieval transition-all',
          isSelected && 'border-amber-500 bg-amber-900/20'
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-800 to-amber-900 flex items-center justify-center text-xl border border-amber-600/30">
                👤
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-stone-200 text-sm truncate">{fullName}</h4>
                <div className="flex items-center gap-2 text-xs">
                  <span className={skillInfo.color}>{skillInfo.text}</span>
                  <span className="text-stone-500">•</span>
                  <span className={rarityInfo.color}>{rarityInfo.text}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-purple-400 text-sm">
                <Sparkles className="w-3 h-3" />
                <span>+{adventurer.skill}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={cn('cursor-pointer', isSelected && 'ring-2 ring-amber-500 rounded-xl')}
    >
      <Card className={cn(
        'card-medieval transition-all overflow-visible',
        isSelected && 'border-amber-500 bg-amber-900/10'
      )}>
        <CardContent className="p-4 space-y-4">
          {/* === ЗАГОЛОВОК === */}
          <div className="flex items-start gap-3">
            {/* Аватар */}
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-800 to-amber-900 flex items-center justify-center text-3xl border-2 border-amber-600/30">
                👤
              </div>
              {/* Индикатор редкости */}
              {adventurer.uniqueBonuses.length > 1 && (
                <InfoTooltip
                  title="Несколько преимуществ"
                  content={`У этого искателя ${adventurer.uniqueBonuses.length} уникальных преимущества! Это редкое сочетание делает его особенно ценным.`}
                  side="top"
                >
                  <div className={cn(
                    'absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold cursor-help',
                    adventurer.uniqueBonuses.length === 3
                      ? 'bg-amber-500 text-amber-950'
                      : 'bg-blue-500 text-blue-950'
                  )}>
                    {adventurer.uniqueBonuses.length}
                  </div>
                </InfoTooltip>
              )}
            </div>

            {/* Имя и ранг */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-200 text-lg leading-tight">{fullName}</h4>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <InfoTooltip
                  title="Уровень мастерства"
                  content={`Навык искателя: ${skillInfo.text}. Определяется опытом и влияет на эффективность в экспедициях.`}
                  side="top"
                >
                  <Badge className={cn('font-semibold cursor-help', skillInfo.color, 'bg-stone-800/50')}>
                    {skillInfo.text}
                  </Badge>
                </InfoTooltip>
                <InfoTooltip
                  title="Редкость искателя"
                  content={`${rarityInfo.text} — отражает количество и качество уникальных преимуществ искателя.`}
                  side="top"
                >
                  <Badge className={cn('font-semibold cursor-help', rarityInfo.color, 'bg-stone-800/50')}>
                    {rarityInfo.text}
                  </Badge>
                </InfoTooltip>
              </div>
            </div>
          </div>

          {/* === НАВЫК (прогресс-бар) === */}
          <InfoTooltip
            title="Навык искателя"
            content="Бонус к Душе Войны, получаемой при успешном завершении экспедиции. Навык от 0 до 30. Чем выше навык, тем больше душ принесёт искатель. Опытные искатели появляются на высоких уровнях гильдии."
            side="top"
          >
            <div className="bg-stone-800/50 rounded-lg p-3 border border-stone-700/30 cursor-help hover:bg-stone-800/70 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-stone-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Навык искателя
                </span>
                <span className="text-sm font-semibold text-purple-400">+{adventurer.skill}%</span>
              </div>
              <Progress
                value={(adventurer.skill / 30) * 100}
                className="h-2 bg-stone-700"
              />
              <p className="text-xs text-stone-500 mt-1">
                Бонус к Душе Войны от экспедиций
              </p>
            </div>
          </InfoTooltip>

          {/* === УНИКАЛЬНЫЕ ПРЕИМУЩЕСТВА === */}
          {adventurer.uniqueBonuses.length > 0 && (
            <div className="space-y-2">
              <InfoTooltip
                title="Уникальные преимущества"
                content="Особые способности искателя, которые дают уникальные бонусы в экспедициях. Каждый искатель имеет от 1 до 3 таких преимуществ."
                side="top"
              >
                <h5 className="text-xs font-semibold text-stone-400 uppercase tracking-wide flex items-center gap-1 cursor-help">
                  <Star className="w-3 h-3 text-amber-400" />
                  Уникальные преимущества
                  <Info className="w-3 h-3 text-stone-500" />
                </h5>
              </InfoTooltip>
              <div className="space-y-2">
                {adventurer.uniqueBonuses.map((bonus, idx) => (
                  <BonusDisplay
                    key={bonus.id}
                    bonus={bonus}
                    isPrimary={idx === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* === ЧЕРТЫ ХАРАКТЕРА === */}
          {adventurer.traits.length > 0 && (
            <div className="space-y-2">
              <InfoTooltip
                title="Черты характера"
                content="Личные качества искателя, которые влияют на различные аспекты экспедиций. Могут быть как положительными, так и отрицательными."
                side="top"
              >
                <h5 className="text-xs font-semibold text-stone-400 uppercase tracking-wide flex items-center gap-1 cursor-help">
                  <Heart className="w-3 h-3 text-red-400" />
                  Черты характера
                  <Info className="w-3 h-3 text-stone-500" />
                </h5>
              </InfoTooltip>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {adventurer.traits.map((trait, idx) => (
                  <TraitDisplay key={idx} trait={trait} />
                ))}
              </div>
            </div>
          )}

          {/* === ТРЕБОВАНИЯ К ОРУЖИЮ === */}
          <InfoTooltip
            title="Требования к оружию"
            content="Минимальные требования искателя к оружию для участия в экспедиции. Если оружие не соответствует требованиям, экспедиция невозможна."
            side="top"
          >
            <div className="bg-stone-800/30 rounded-lg p-2 border border-stone-700/20 cursor-help hover:bg-stone-800/50 transition-colors">
              <h5 className="text-xs font-semibold text-stone-400 mb-2 flex items-center gap-1">
                <Sword className="w-3 h-3 text-red-400" />
                Требования к оружию
              </h5>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-red-400">
                  <Sword className="w-3 h-3" />
                  Атака {adventurer.requirements.minAttack}+
                </span>
                {adventurer.requirements.weaponType && (
                  <span className="text-amber-400">
                    {adventurer.requirements.weaponType}
                  </span>
                )}
                {adventurer.requirements.minQuality && (
                  <span className="text-blue-400">
                    Качество {adventurer.requirements.minQuality}+
                  </span>
                )}
              </div>
            </div>
          </InfoTooltip>

          {/* === ПРЕДПРОСМОТР ЭКСПЕДИЦИИ === */}
          {expeditionPreview && (
            <ExpeditionPreview preview={expeditionPreview} />
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AdventurerCard

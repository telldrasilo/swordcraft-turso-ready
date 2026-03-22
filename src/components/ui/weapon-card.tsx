/**
 * Гибкая система карточек оружия для SwordCraft
 * Поддерживает расширение: префиксы, суффиксы, новые свойства
 */

'use client'

import { motion } from 'framer-motion'
import { 
  Sword, Heart, Star, Sparkles, Coins, Map, Shield, 
  Zap, Flame, Wind, Droplet, Sun, Moon, Skull, 
  Leaf, Diamond, Crown, Target, Gauge, Lock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InfoTooltip } from '@/components/ui/game-tooltip'
import { cn } from '@/lib/utils'
import {
  CraftedWeapon,
  qualityGrades,
  weaponTypeStats,
} from '@/data/weapon-recipes'
import { weaponRecipes } from '@/data/weapon-recipes'
import type { WeaponMaterialUsed } from '@/store/slices/craft-slice'

// ================================
// ТИПЫ СВОЙСТВ ОРУЖИЯ
// ================================

export interface WeaponProperty {
  id: string
  name: string
  shortName?: string
  value: number | string
  maxValue?: number
  icon: React.ReactNode
  color: string
  bgColor?: string
  tooltip: string
  displayType: 'value' | 'bar' | 'percent' | 'multiplier'
  category: 'primary' | 'secondary' | 'special' | 'enchantment'
  priority: number // Для сортировки
}

export interface WeaponModifier {
  id: string
  type: 'prefix' | 'suffix'
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  effects: Array<{
    property: string
    type: 'add' | 'multiply'
    value: number
  }>
  description: string
}

// ================================
// КОНФИГУРАЦИЯ СВОЙСТВ
// ================================

export const propertyConfig = {
  attack: {
    icon: <Sword className="w-3.5 h-3.5" />,
    color: 'text-red-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'primary' as const,
    priority: 1,
    tooltipTitle: 'Атака',
    tooltipDesc: 'Определяет урон в бою и эффективность в экспедициях. Зависит от типа оружия, материала и качества изготовления.',
  },
  durability: {
    icon: <Heart className="w-3.5 h-3.5" />,
    color: 'text-green-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'percent' as const,
    category: 'primary' as const,
    priority: 2,
    tooltipTitle: 'Прочность',
    tooltipDesc: 'Состояние оружия. Уменьшается в экспедициях. При 0% оружие становится непригодным.',
  },
  quality: {
    icon: <Star className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'percent' as const,
    category: 'secondary' as const,
    priority: 3,
    tooltipTitle: 'Качество изготовления',
    tooltipDesc: 'Влияет на атаку, цену продажи и эффективность. Зависит от навыков кузнецов.',
  },
  warSoul: {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: 'text-purple-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'special' as const,
    priority: 4,
    tooltipTitle: 'Душа Войны',
    tooltipDesc: 'Сила, накопленная в боях. Используется для зачарований и улучшений в Алтаре.',
  },
  epicMultiplier: {
    icon: <Crown className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'multiplier' as const,
    category: 'special' as const,
    priority: 5,
    tooltipTitle: 'Эпический множитель',
    tooltipDesc: 'Увеличивает награды от экспедиций. Растёт с каждым приключением.',
  },
  adventureCount: {
    icon: <Map className="w-3.5 h-3.5" />,
    color: 'text-stone-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'secondary' as const,
    priority: 6,
    tooltipTitle: 'Экспедиции',
    tooltipDesc: 'Количество экспедиций, в которых участвовало оружие.',
  },
  // Будущие свойства для расширения
  criticalChance: {
    icon: <Target className="w-3.5 h-3.5" />,
    color: 'text-orange-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'percent' as const,
    category: 'enchantment' as const,
    priority: 10,
    tooltipTitle: 'Шанс крит. удара',
    tooltipDesc: 'Вероятность нанести критический урон.',
  },
  criticalDamage: {
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'text-orange-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'multiplier' as const,
    category: 'enchantment' as const,
    priority: 11,
    tooltipTitle: 'Крит. урон',
    tooltipDesc: 'Множитель критического урона.',
  },
  speed: {
    icon: <Wind className="w-3.5 h-3.5" />,
    color: 'text-cyan-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'enchantment' as const,
    priority: 12,
    tooltipTitle: 'Скорость атаки',
    tooltipDesc: 'Скорость атак в бою.',
  },
  fireDamage: {
    icon: <Flame className="w-3.5 h-3.5" />,
    color: 'text-orange-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'enchantment' as const,
    priority: 20,
    tooltipTitle: 'Урон огнём',
    tooltipDesc: 'Дополнительный урон огнём.',
  },
  iceDamage: {
    icon: <Droplet className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'enchantment' as const,
    priority: 21,
    tooltipTitle: 'Урон льдом',
    tooltipDesc: 'Дополнительный урон льдом. Может замедлять врагов.',
  },
  holyDamage: {
    icon: <Sun className="w-3.5 h-3.5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'enchantment' as const,
    priority: 22,
    tooltipTitle: 'Святой урон',
    tooltipDesc: 'Дополнительный урон против нежити и демонов.',
  },
  shadowDamage: {
    icon: <Moon className="w-3.5 h-3.5" />,
    color: 'text-violet-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'enchantment' as const,
    priority: 23,
    tooltipTitle: 'Теневой урон',
    tooltipDesc: 'Дополнительный урон тьмой.',
  },
  defense: {
    icon: <Shield className="w-3.5 h-3.5" />,
    color: 'text-slate-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'value' as const,
    category: 'enchantment' as const,
    priority: 13,
    tooltipTitle: 'Защита',
    tooltipDesc: 'Шанс заблокировать часть урона.',
  },
  lifesteal: {
    icon: <Heart className="w-3.5 h-3.5" />,
    color: 'text-rose-400',
    bgColor: 'bg-stone-800/80',
    displayType: 'percent' as const,
    category: 'enchantment' as const,
    priority: 14,
    tooltipTitle: 'Вампиризм',
    tooltipDesc: 'Восстановление здоровья от нанесённого урона.',
  },
}

// ================================
// ФУНКЦИИ ПРЕОБРАЗОВАНИЯ
// ================================

/**
 * Извлекает свойства оружия для отображения
 */
export function extractWeaponProperties(weapon: CraftedWeapon): WeaponProperty[] {
  const properties: WeaponProperty[] = []
  const config = propertyConfig

  // Атака
  properties.push({
    id: 'attack',
    name: 'Атака',
    value: weapon.attack,
    icon: config.attack.icon,
    color: config.attack.color,
    bgColor: config.attack.bgColor,
    tooltip: `${config.attack.tooltipTitle}: ${config.attack.tooltipDesc}`,
    displayType: 'value',
    category: 'primary',
    priority: 1,
  })

  // Прочность
  const durability = weapon.durability ?? 100
  properties.push({
    id: 'durability',
    name: 'Прочность',
    value: durability,
    maxValue: 100,
    icon: config.durability.icon,
    color: durability > 50 ? 'text-green-400' : durability > 25 ? 'text-yellow-400' : 'text-red-400',
    bgColor: 'bg-stone-800/80',
    tooltip: `${config.durability.tooltipTitle}: ${config.durability.tooltipDesc}`,
    displayType: 'percent',
    category: 'primary',
    priority: 2,
  })

  // Качество
  properties.push({
    id: 'quality',
    name: 'Качество',
    value: weapon.quality,
    maxValue: 100,
    icon: config.quality.icon,
    color: qualityGrades[weapon.qualityGrade].color,
    bgColor: 'bg-stone-800/80',
    tooltip: `${config.quality.tooltipTitle}: ${config.quality.tooltipDesc}`,
    displayType: 'percent',
    category: 'secondary',
    priority: 3,
  })

  // Душа Войны (если есть)
  if (weapon.warSoul > 0) {
    properties.push({
      id: 'warSoul',
      name: 'Душа Войны',
      value: weapon.warSoul,
      icon: config.warSoul.icon,
      color: config.warSoul.color,
      bgColor: config.warSoul.bgColor,
      tooltip: `${config.warSoul.tooltipTitle}: ${config.warSoul.tooltipDesc}`,
      displayType: 'value',
      category: 'special',
      priority: 4,
    })
  }

  // Эпический множитель (если > 1)
  if ((weapon.epicMultiplier ?? 1) > 1) {
    properties.push({
      id: 'epicMultiplier',
      name: 'Эпичность',
      value: weapon.epicMultiplier ?? 1,
      icon: config.epicMultiplier.icon,
      color: config.epicMultiplier.color,
      bgColor: config.epicMultiplier.bgColor,
      tooltip: `${config.epicMultiplier.tooltipTitle}: ${config.epicMultiplier.tooltipDesc}`,
      displayType: 'multiplier',
      category: 'special',
      priority: 5,
    })
  }

  // Количество экспедиций (если > 0)
  if ((weapon.adventureCount ?? 0) > 0) {
    properties.push({
      id: 'adventureCount',
      name: 'Вылазок',
      value: weapon.adventureCount ?? 0,
      icon: config.adventureCount.icon,
      color: config.adventureCount.color,
      bgColor: config.adventureCount.bgColor,
      tooltip: `${config.adventureCount.tooltipTitle}: ${config.adventureCount.tooltipDesc}`,
      displayType: 'value',
      category: 'secondary',
      priority: 6,
    })
  }

  // Зачарования (будущее расширение)
  if (weapon.enchantments && weapon.enchantments.length > 0) {
    // Здесь будет логика извлечения свойств зачарований
    // Пока заглушка для будущего
  }

  return properties.sort((a, b) => a.priority - b.priority)
}

// ================================
// КОМПОНЕНТЫ ОТОБРАЖЕНИЯ
// ================================

interface PropertyDisplayProps {
  property: WeaponProperty
  compact?: boolean
}

/**
 * Отображение отдельного свойства оружия
 */
export function PropertyDisplay({ property, compact = false }: PropertyDisplayProps) {
  const renderValueText = () => {
    switch (property.displayType) {
      case 'value':
        return String(property.value)
      case 'percent':
        return `${property.value}%`
      case 'multiplier':
        return `×${(property.value as number).toFixed(2)}`
      default:
        return String(property.value)
    }
  }

  const renderBar = () => {
    if (property.displayType !== 'percent' || !property.maxValue) return null
    
    const percent = ((property.value as number) / property.maxValue) * 100
    
    return (
      <div className="flex-1 h-2 bg-stone-800 rounded-full overflow-hidden min-w-12">
        <div 
          className={cn(
            'h-full rounded-full transition-all',
            property.color.replace('text-', 'bg-')
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    )
  }

  // Получаем цвет для полоски слева
  const getBorderColor = () => {
    return property.color.replace('text-', 'border-l-2 border-')
  }

  if (compact) {
    return (
      <InfoTooltip content={property.tooltip} side="top">
        <div className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-help',
          'bg-stone-800/80 border border-stone-700/50',
          getBorderColor()
        )}>
          <span className={property.color}>{property.icon}</span>
          <span className="text-stone-400 text-xs">{property.name}:</span>
          <span className={cn('font-semibold', property.color)}>{renderValueText()}</span>
        </div>
      </InfoTooltip>
    )
  }

  return (
    <InfoTooltip content={property.tooltip} side="top">
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md cursor-help',
        'bg-stone-800/60 border border-stone-700/30',
        getBorderColor()
      )}>
        <span className={property.color}>{property.icon}</span>
        {property.displayType === 'percent' && property.maxValue ? (
          <>
            <span className="text-stone-400 text-xs min-w-16">{property.name}:</span>
            {renderBar()}
            <span className={cn('font-semibold min-w-12 text-right', property.color)}>{renderValueText()}</span>
          </>
        ) : (
          <>
            <span className="text-stone-400 text-xs">{property.name}:</span>
            <span className={cn('font-semibold', property.color)}>{renderValueText()}</span>
          </>
        )}
      </div>
    </InfoTooltip>
  )
}

/**
 * Группа свойств оружия по категории
 */
interface PropertyGroupProps {
  properties: WeaponProperty[]
  category: 'primary' | 'secondary' | 'special' | 'enchantment'
  layout?: 'vertical' | 'horizontal'
}

export function PropertyGroup({ properties, category, layout = 'vertical' }: PropertyGroupProps) {
  const filtered = properties.filter(p => p.category === category)
  if (filtered.length === 0) return null

  return (
    <div className={cn(
      'flex gap-2',
      layout === 'vertical' ? 'flex-col' : 'flex-wrap items-center'
    )}>
      {filtered.map(prop => (
        <PropertyDisplay key={prop.id} property={prop} compact={category !== 'primary'} />
      ))}
    </div>
  )
}

// ================================
// ИКОНКА ОРУЖИЯ
// ================================

const weaponIconMap: Record<string, string> = {
  sword: '⚔️',
  dagger: '🗡️',
  axe: '🪓',
  mace: '🔨',
  spear: '🔱',
  hammer: '⚒️'
}

export function WeaponIcon({ type, className }: { type: string; className?: string }) {
  return <span className={className}>{weaponIconMap[type] || '⚔️'}</span>
}

// ================================
// ЦВЕТА КАЧЕСТВА И ТИРА
// ================================

export const qualityColors: Record<string, { text: string; bg: string; border: string }> = {
  common: { text: 'text-stone-400', bg: 'bg-stone-900/80', border: 'border-stone-600' },
  uncommon: { text: 'text-green-400', bg: 'bg-stone-900/80', border: 'border-green-600' },
  rare: { text: 'text-blue-400', bg: 'bg-stone-900/80', border: 'border-blue-600' },
  epic: { text: 'text-purple-400', bg: 'bg-stone-900/80', border: 'border-purple-600' },
  legendary: { text: 'text-amber-400', bg: 'bg-stone-900/80', border: 'border-amber-600' },
  mythic: { text: 'text-rose-400', bg: 'bg-stone-900/80', border: 'border-rose-600' },
}

const tierNames: Record<string, string> = {
  common: 'Обычное',
  uncommon: 'Необычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное',
  mythic: 'Мифическое'
}

// ================================
// ОСНОВНАЯ КАРТОЧКА ОРУЖИЯ
// ================================

interface WeaponCardProps {
  weapon: CraftedWeapon
  onSell?: (weaponId: string) => void
  onSelect?: (weapon: CraftedWeapon) => void
  selected?: boolean
  showSellButton?: boolean
  compact?: boolean
  isExpedition?: boolean
}

export function WeaponCard({ 
  weapon, 
  onSell, 
  onSelect,
  selected = false,
  showSellButton = true,
  compact = false,
  isExpedition = false
}: WeaponCardProps) {
  const qualityInfo = qualityGrades[weapon.qualityGrade]
  const typeStats = weaponTypeStats[weapon.type]
  const recipe = weaponRecipes.find(r => r.id === weapon.recipeId)
  const properties = extractWeaponProperties(weapon)
  
  const tier = recipe?.tier || 'common'
  const tierColor = qualityColors[tier]

  // Разделяем свойства по категориям
  const primaryProps = properties.filter(p => p.category === 'primary')
  const secondaryProps = properties.filter(p => p.category === 'secondary')
  const specialProps = properties.filter(p => p.category === 'special')
  const enchantmentProps = properties.filter(p => p.category === 'enchantment')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
      whileHover={!isExpedition ? { scale: 1.02 } : undefined}
      onClick={() => onSelect?.(weapon)}
      className={cn(
        'cursor-pointer',
        selected && 'ring-2 ring-amber-500'
      )}
    >
      <Card className={cn(
        'card-medieval transition-all group relative overflow-hidden',
        'hover:border-amber-600/50',
        isExpedition && 'hover:border-green-600/50',
        compact && 'p-2'
      )}>
        {/* Фоновое свечение качества */}
        <div className={cn(
          'absolute inset-0 opacity-10 pointer-events-none',
          qualityInfo.color.replace('text-', 'bg-')
        )} />

        <CardContent className={cn('p-4 relative', compact && 'p-2')}>
          {/* Заголовок карточки */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Иконка оружия */}
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                tierColor.bg
              )}>
                <WeaponIcon type={weapon.type} />
              </div>
              
              {/* Название и тип */}
              <div>
                <h4 className="font-semibold text-stone-200">{weapon.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-stone-500">{typeStats?.name}</span>
                  {recipe?.material && (
                    <>
                      <span className="text-stone-600">•</span>
                      <span className="text-xs text-stone-500">{recipe.material}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Бейджи качества */}
            <div className="flex flex-col items-end gap-1">
              <Badge className={cn('font-semibold cursor-help', qualityInfo.color)}>
                {qualityInfo.name}
              </Badge>
              <Badge variant="outline" className={cn('text-xs', tierColor.text, tierColor.border)}>
                {tierNames[tier]}
              </Badge>
            </div>
          </div>

          {/* Основные характеристики - с прогресс-барами */}
          <div className="space-y-2 mb-3">
            {primaryProps.map(prop => (
              <PropertyDisplay key={prop.id} property={prop} />
            ))}
          </div>

          {/* Вторичные характеристики */}
          {secondaryProps.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {secondaryProps.map(prop => (
                <PropertyDisplay key={prop.id} property={prop} compact />
              ))}
            </div>
          )}

          {/* Материалы */}
          {weapon.materialsUsed && weapon.materialsUsed.length > 0 && (
            <div className="mb-3 pt-2 border-t border-stone-700/50">
              <div className="text-xs text-stone-500 mb-1.5 uppercase tracking-wide flex items-center gap-1">
                <Diamond className="w-3 h-3" />
                Материалы
              </div>
              <div className="flex flex-wrap gap-1.5">
                {weapon.materialsUsed.map((mat, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline" 
                    className="text-xs bg-stone-800/60 border-stone-600/50"
                  >
                    <span className="text-stone-400 mr-1">{mat.partName}:</span>
                    <span className="text-amber-400">{mat.materialName}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Специальные свойства (Душа Войны, Эпичность) */}
          {specialProps.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 pt-2 border-t border-stone-700/50">
              {specialProps.map(prop => (
                <PropertyDisplay key={prop.id} property={prop} compact />
              ))}
            </div>
          )}

          {/* Зачарования (будущее расширение) */}
          {enchantmentProps.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 pt-2 border-t border-purple-700/30">
              {enchantmentProps.map(prop => (
                <PropertyDisplay key={prop.id} property={prop} compact />
              ))}
            </div>
          )}

          {/* Цена продажи и кнопка */}
          {showSellButton && (
            <div className="flex items-center justify-between pt-2 border-t border-stone-700/50">
              <div className="flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-semibold">{weapon.sellPrice}</span>
              </div>
              {onSell && (
                <Button 
                  size="sm"
                  variant="outline"
                  className="border-green-600/50 text-green-400 hover:bg-green-800/30"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSell(weapon.id)
                  }}
                >
                  Продать
                </Button>
              )}
            </div>
          )}

          {/* Индикатор экспедиции */}
          {isExpedition && (
            <div className="absolute top-2 right-2">
              <Badge className="bg-green-800/80 text-green-300 border-green-600">
                В экспедиции
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ================================
// МИНИ-КАРТОЧКА ДЛЯ ВЫБОРА
// ================================

interface WeaponMiniCardProps {
  weapon: CraftedWeapon
  selected?: boolean
  onSelect?: (weapon: CraftedWeapon) => void
  disabled?: boolean
}

export function WeaponMiniCard({ weapon, selected, onSelect, disabled }: WeaponMiniCardProps) {
  const qualityInfo = qualityGrades[weapon.qualityGrade]
  const typeStats = weaponTypeStats[weapon.type]
  const recipe = weaponRecipes.find(r => r.id === weapon.recipeId)
  const tier = recipe?.tier || 'common'
  const tierColor = qualityColors[tier]
  const durability = weapon.durability ?? 100

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      onClick={() => !disabled && onSelect?.(weapon)}
      className={cn(
        'cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        selected && 'ring-2 ring-amber-500'
      )}
    >
      <Card className={cn(
        'card-medieval p-3 transition-all',
        selected && 'border-amber-500',
        !disabled && 'hover:border-amber-600/50'
      )}>
        <div className="flex items-center gap-3">
          {/* Иконка */}
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
            tierColor.bg
          )}>
            <WeaponIcon type={weapon.type} />
          </div>
          
          {/* Информация */}
          <div className="flex-1 min-w-0">
            <h5 className="font-medium text-stone-200 truncate">{weapon.name}</h5>
            <div className="flex items-center gap-3 text-xs">
              {/* Атака */}
              <span className="flex items-center gap-1 text-red-400">
                <Sword className="w-3 h-3" />
                {weapon.attack}
              </span>
              
              {/* Прочность */}
              <span className={cn(
                'flex items-center gap-1',
                durability > 50 ? 'text-green-400' : durability > 25 ? 'text-yellow-400' : 'text-red-400'
              )}>
                <Heart className="w-3 h-3" />
                {durability}%
              </span>
              
              {/* Качество */}
              <span className={qualityInfo.color}>
                {qualityInfo.name}
              </span>
            </div>
          </div>
          
          {/* Цена */}
          <div className="flex items-center gap-1 text-amber-400 text-sm">
            <Coins className="w-3 h-3" />
            {weapon.sellPrice}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default WeaponCard

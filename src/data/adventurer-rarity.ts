/**
 * Система редкости искателей
 * Определяет параметры генерации в зависимости от редкости
 */

import type { Rarity } from '@/types/adventurer-extended'

export interface RarityConfig {
  name: string
  nameRu: string
  color: string
  bgColor: string
  borderColor: string
  textColor: string
  chance: number          // Базовый шанс генерации (%)
  minLevel: number        // Минимальный уровень
  maxLevel: number        // Максимальный уровень
  maxTraits: number       // Макс черт характера
  maxBonuses: number      // Макс уникальных преимуществ
  minWeaknesses: number   // Мин слабостей
  maxWeaknesses: number   // Макс слабостей
  maxStrengths: number    // Макс сильных сторон
  // Бонусы к характеристикам
  statBonus: {
    power: number
    precision: number
    endurance: number
    luck: number
  }
  // Множители наград
  rewardMultiplier: number
}

export const RARITY_CONFIG: Record<Rarity, RarityConfig> = {
  common: {
    name: 'common',
    nameRu: 'Обычный',
    color: 'gray',
    bgColor: 'bg-stone-800/50',
    borderColor: 'border-stone-600',
    textColor: 'text-stone-300',
    chance: 50,
    minLevel: 1,
    maxLevel: 10,
    maxTraits: 1,
    maxBonuses: 1,
    minWeaknesses: 0,
    maxWeaknesses: 1,
    maxStrengths: 1,
    statBonus: { power: 0, precision: 0, endurance: 0, luck: 0 },
    rewardMultiplier: 1.0
  },
  uncommon: {
    name: 'uncommon',
    nameRu: 'Необычный',
    color: 'green',
    bgColor: 'bg-green-900/30',
    borderColor: 'border-green-600/50',
    textColor: 'text-green-300',
    chance: 30,
    minLevel: 5,
    maxLevel: 20,
    maxTraits: 2,
    maxBonuses: 2,
    minWeaknesses: 0,
    maxWeaknesses: 1,
    maxStrengths: 1,
    statBonus: { power: 3, precision: 3, endurance: 2, luck: 2 },
    rewardMultiplier: 1.15
  },
  rare: {
    name: 'rare',
    nameRu: 'Редкий',
    color: 'blue',
    bgColor: 'bg-blue-900/30',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-300',
    chance: 15,
    minLevel: 15,
    maxLevel: 30,
    maxTraits: 2,
    maxBonuses: 2,
    minWeaknesses: 0,
    maxWeaknesses: 2,
    maxStrengths: 2,
    statBonus: { power: 8, precision: 8, endurance: 6, luck: 6 },
    rewardMultiplier: 1.35
  },
  epic: {
    name: 'epic',
    nameRu: 'Эпический',
    color: 'purple',
    bgColor: 'bg-purple-900/30',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-300',
    chance: 4,
    minLevel: 25,
    maxLevel: 40,
    maxTraits: 3,
    maxBonuses: 3,
    minWeaknesses: 1,
    maxWeaknesses: 2,
    maxStrengths: 2,
    statBonus: { power: 15, precision: 15, endurance: 12, luck: 12 },
    rewardMultiplier: 1.6
  },
  legendary: {
    name: 'legendary',
    nameRu: 'Легендарный',
    color: 'amber',
    bgColor: 'bg-amber-900/20',
    borderColor: 'border-amber-500/50',
    textColor: 'text-amber-300',
    chance: 1,
    minLevel: 35,
    maxLevel: 50,
    maxTraits: 3,
    maxBonuses: 3,
    minWeaknesses: 1,
    maxWeaknesses: 3,
    maxStrengths: 3,
    statBonus: { power: 25, precision: 25, endurance: 20, luck: 20 },
    rewardMultiplier: 2.0
  }
}

// Функция получения конфигурации по редкости
export function getRarityConfig(rarity: Rarity): RarityConfig {
  return RARITY_CONFIG[rarity]
}

// Функция генерации случайной редкости
export function generateRarity(guildLevel: number = 1): Rarity {
  // Бонус к шансу редких искателей от уровня гильдии
  const guildBonus = (guildLevel - 1) * 2 // +2% за каждый уровень
  
  const roll = Math.random() * 100
  
  // Накопительные шансы
  const legendaryChance = RARITY_CONFIG.legendary.chance + guildBonus * 0.5
  const epicChance = legendaryChance + RARITY_CONFIG.epic.chance + guildBonus
  const rareChance = epicChance + RARITY_CONFIG.rare.chance + guildBonus * 1.5
  const uncommonChance = rareChance + RARITY_CONFIG.uncommon.chance + guildBonus * 2
  
  if (roll < legendaryChance) return 'legendary'
  if (roll < epicChance) return 'epic'
  if (roll < rareChance) return 'rare'
  if (roll < uncommonChance) return 'uncommon'
  return 'common'
}

// Функция генерации уровня на основе редкости
export function generateLevel(rarity: Rarity): number {
  const config = RARITY_CONFIG[rarity]
  const range = config.maxLevel - config.minLevel
  // Нормальное распределение с уклоном к среднему
  const roll = (Math.random() + Math.random()) / 2 // 0-1 с пиком на 0.5
  return Math.floor(config.minLevel + roll * range)
}

// Функция получения цвета для UI
export function getRarityColor(rarity: Rarity): {
  bg: string
  border: string
  text: string
} {
  const config = RARITY_CONFIG[rarity]
  return {
    bg: config.bgColor,
    border: config.borderColor,
    text: config.textColor
  }
}

// Функция получения CSS-классов для карточки
export function getRarityClasses(rarity: Rarity): string {
  const config = RARITY_CONFIG[rarity]
  return `${config.bgColor} ${config.borderColor} ${config.textColor}`
}

// Количество звёзд для отображения редкости
export function getRarityStars(rarity: Rarity): number {
  const stars = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5
  }
  return stars[rarity]
}

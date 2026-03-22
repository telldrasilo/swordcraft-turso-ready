/**
 * Player Utilities
 * Чистые функции для логики игрока: опыт, уровни, титулы
 */

import {
  PLAYER_TITLES,
  BASE_EXPERIENCE_TO_LEVEL,
  EXPERIENCE_GROWTH_MULTIPLIER,
  FAME_PER_LEVEL,
  MAX_PLAYER_LEVEL,
} from './constants'
import type { LevelUpResult, PlayerTitleInfo } from './types'

// ================================
// ТИТУЛЫ
// ================================

/**
 * Получить титул по уровню
 */
export function getTitleByLevel(level: number): string {
  for (const { minLevel, title } of PLAYER_TITLES) {
    if (level >= minLevel) return title
  }
  return 'Новичок'
}

/**
 * Получить информацию о титуле для уровня
 */
export function getTitleInfo(level: number): PlayerTitleInfo {
  return {
    level,
    title: getTitleByLevel(level),
  }
}

/**
 * Получить следующий титул и уровень для него
 */
export function getNextTitle(currentLevel: number): PlayerTitleInfo | null {
  const sortedTitles = [...PLAYER_TITLES].sort((a, b) => a.minLevel - b.minLevel)
  for (const { minLevel, title } of sortedTitles) {
    if (minLevel > currentLevel) {
      return { level: minLevel, title }
    }
  }
  return null // Уже максимальный титул
}

// ================================
// ОПЫТ И УРОВНИ
// ================================

/**
 * Рассчитать опыт для следующего уровня
 */
export function getExperienceForLevel(level: number): number {
  return Math.floor(BASE_EXPERIENCE_TO_LEVEL * Math.pow(EXPERIENCE_GROWTH_MULTIPLIER, level - 1))
}

/**
 * Рассчитать общий опыт для достижения уровня
 */
export function getTotalExperienceForLevel(level: number): number {
  let total = 0
  for (let i = 1; i < level; i++) {
    total += getExperienceForLevel(i)
  }
  return total
}

/**
 * Добавить опыт и обработать повышение уровня
 */
export function addExperience(
  currentExp: number,
  currentLevel: number,
  currentExpToNext: number,
  currentFame: number,
  expToAdd: number
): LevelUpResult {
  let newExp = currentExp + expToAdd
  let newLevel = currentLevel
  let expToNext = currentExpToNext
  let fameGained = 0
  let levelsGained = 0

  // Обработка повышения уровня
  while (newExp >= expToNext && newLevel < MAX_PLAYER_LEVEL) {
    newExp -= expToNext
    newLevel++
    levelsGained++
    expToNext = Math.floor(expToNext * EXPERIENCE_GROWTH_MULTIPLIER)
    fameGained += FAME_PER_LEVEL
  }

  const newTitle = getTitleByLevel(newLevel)

  return {
    newLevel,
    newExperience: newExp,
    newExperienceToNext: expToNext,
    newTitle,
    fameGained,
    levelsGained,
  }
}

/**
 * Проверить, может ли игрок получить уровень
 */
export function canLevelUp(
  currentExp: number,
  expToNext: number,
  currentLevel: number
): boolean {
  return currentExp >= expToNext && currentLevel < MAX_PLAYER_LEVEL
}

/**
 * Рассчитать процент прогресса до следующего уровня
 */
export function getLevelProgress(currentExp: number, expToNext: number): number {
  return Math.min(100, (currentExp / expToNext) * 100)
}

// ================================
// СЛАВА
// ================================

/**
 * Добавить славу
 */
export function addFame(currentFame: number, fameToAdd: number): number {
  return Math.max(0, currentFame + fameToAdd)
}

/**
 * Рассчитать бонус славы за уровень
 */
export function calculateFameBonus(level: number): number {
  return level * FAME_PER_LEVEL
}

// ================================
// СТАТИСТИКА
// ================================

/**
 * Рассчитать общий прогресс игрока (для отображения)
 */
export function calculatePlayerProgress(
  level: number,
  experience: number,
  expToNext: number
): {
  levelProgress: number
  totalProgress: number
  nextMilestone: number
} {
  const levelProgress = getLevelProgress(experience, expToNext)
  const totalExpEarned = getTotalExperienceForLevel(level) + experience
  const totalExpForMax = getTotalExperienceForLevel(MAX_PLAYER_LEVEL)
  const totalProgress = (totalExpEarned / totalExpForMax) * 100

  // Найти следующий уровень титула
  const nextTitle = getNextTitle(level)
  const nextMilestone = nextTitle?.level ?? MAX_PLAYER_LEVEL

  return {
    levelProgress,
    totalProgress,
    nextMilestone,
  }
}

// ================================
// ЭКСТРЕННАЯ ПОМОЩЬ
// ================================

/**
 * Проверить, доступна ли экстренная помощь
 */
export function canGetEmergencyHelp(
  workerCount: number,
  goldAmount: number
): boolean {
  return workerCount === 0 && goldAmount < 50
}

/**
 * Рассчитать экстренную помощь
 */
export function calculateEmergencyHelp(): {
  goldBonus: number
  freeWorkerClass: 'apprentice'
} {
  return {
    goldBonus: 75,
    freeWorkerClass: 'apprentice',
  }
}

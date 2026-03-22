/**
 * Типы игрока
 */

// ================================
// ИГРОК
// ================================

/** Основные данные игрока */
export interface Player {
  name: string
  level: number
  experience: number
  experienceToNextLevel: number
  fame: number
  title: string
}

/** Титулы по уровням */
export interface PlayerTitle {
  minLevel: number
  maxLevel: number
  title: string
  rank: string
}

/** Ранги игрока */
export const PLAYER_TITLES: PlayerTitle[] = [
  { minLevel: 1, maxLevel: 4, title: 'Новичок', rank: 'novice' },
  { minLevel: 5, maxLevel: 9, title: 'Ученик', rank: 'apprentice' },
  { minLevel: 10, maxLevel: 14, title: 'Подмастерье', rank: 'journeyman' },
  { minLevel: 15, maxLevel: 19, title: 'Опытный кузнец', rank: 'experienced' },
  { minLevel: 20, maxLevel: 29, title: 'Опытный кузнец', rank: 'master' },
  { minLevel: 30, maxLevel: 39, title: 'Мастер-кузнец', rank: 'grandmaster' },
  { minLevel: 40, maxLevel: 49, title: 'Великий мастер', rank: 'legend' },
  { minLevel: 50, maxLevel: 999, title: 'Легендарный мастер', rank: 'legendary' },
]

/** Получить титул по уровню */
export function getTitleByLevel(level: number): string {
  const titleData = PLAYER_TITLES.find(
    t => level >= t.minLevel && level <= t.maxLevel
  )
  return titleData?.title ?? 'Новичок'
}

/** Опыт для следующего уровня */
export function getExperienceForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// ================================
// СТАТИСТИКА
// ================================

/** Статистика игры */
export interface GameStatistics {
  totalCrafts: number
  totalRefines: number
  totalGoldEarned: number
  totalWorkersHired: number
  playTime: number
  weaponsSold: number
  recipesUnlocked: number
  ordersCompleted: number
  weaponsSacrificed: number
  enchantmentsApplied: number
}

/** Начальная статистика */
export const initialStatistics: GameStatistics = {
  totalCrafts: 0,
  totalRefines: 0,
  totalGoldEarned: 0,
  totalWorkersHired: 0,
  playTime: 0,
  weaponsSold: 0,
  recipesUnlocked: 6,
  ordersCompleted: 0,
  weaponsSacrificed: 0,
  enchantmentsApplied: 0,
}

// ================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
// ================================

export const initialPlayer: Player = {
  name: 'Кузнец',
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  fame: 0,
  title: 'Новичок',
}

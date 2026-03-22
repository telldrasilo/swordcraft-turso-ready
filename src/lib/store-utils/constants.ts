/**
 * Store Utilities - Constants
 * Все константы и маппинги для игры
 */

import { ResourceKey } from '@/store/slices/resources-slice'

// ================================
// ТИТУЛЫ ИГРОКА
// ================================

export const PLAYER_TITLES: { minLevel: number; title: string }[] = [
  { minLevel: 50, title: 'Легендарный мастер' },
  { minLevel: 40, title: 'Великий мастер' },
  { minLevel: 30, title: 'Мастер-кузнец' },
  { minLevel: 20, title: 'Опытный кузнец' },
  { minLevel: 10, title: 'Подмастерье' },
  { minLevel: 5, title: 'Ученик' },
  { minLevel: 1, title: 'Новичок' },
]

// ================================
// ЦЕНЫ ПРОДАЖИ РЕСУРСОВ
// ================================

export const RESOURCE_SELL_PRICES: Partial<Record<ResourceKey, number>> = {
  // Сырьё
  wood: 0.3,
  stone: 0.4,
  iron: 2,
  coal: 1.5,
  copper: 3,
  tin: 3,
  silver: 8,
  goldOre: 15,
  mithril: 50,
  // Переработанные
  ironIngot: 4,
  copperIngot: 6,
  tinIngot: 6,
  bronzeIngot: 10,
  steelIngot: 15,
  silverIngot: 16,
  goldIngot: 30,
  mithrilIngot: 100,
  planks: 0.5,
  stoneBlocks: 0.6,
}

// ================================
// МНОЖИТЕЛИ ТИРОВ
// ================================

export const TIER_MULTIPLIERS: Record<string, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3,
  legendary: 5,
  mythic: 8,
}

// ================================
// КАЧЕСТВО ОРУЖИЯ
// ================================

export const QUALITY_GRADES: { min: number; max: number; grade: string; multiplier: number }[] = [
  { min: 0, max: 25, grade: 'poor', multiplier: 0.6 },
  { min: 26, max: 50, grade: 'normal', multiplier: 1.0 },
  { min: 51, max: 70, grade: 'good', multiplier: 1.3 },
  { min: 71, max: 85, grade: 'excellent', multiplier: 1.6 },
  { min: 86, max: 95, grade: 'masterwork', multiplier: 2.0 },
  { min: 96, max: 100, grade: 'legendary', multiplier: 3.0 },
]

// ================================
// КОНСТАНТЫ ИГРОКА
// ================================

/** Базовый опыт для следующего уровня */
export const BASE_EXPERIENCE_TO_LEVEL = 100

/** Множитель роста опыта */
export const EXPERIENCE_GROWTH_MULTIPLIER = 1.5

/** Бонус славы за уровень */
export const FAME_PER_LEVEL = 10

/** Максимальный уровень игрока */
export const MAX_PLAYER_LEVEL = 50

// ================================
// КОНСТАНТЫ РАБОЧИХ
// ================================

/** Базовый опыт для повышения уровня рабочего */
export const BASE_WORKER_EXP_TO_LEVEL = 100

/** Опыт за уровень рабочего */
export const WORKER_EXP_PER_LEVEL = 50

/** Максимальный уровень рабочего */
export const MAX_WORKER_LEVEL = 50

/** Множитель стоимости найма за каждого рабочего того же класса */
export const WORKER_COST_INCREASE_PER_CLASS = 0.5

/** Процент возврата при увольнении */
export const WORKER_FIRE_REFUND_PERCENT = 0.3

// ================================
// КОНСТАНТЫ КРАФТА
// ================================

/** Базовый опыт за крафт */
export const CRAFT_BASE_EXPERIENCE = 5

/** Множитель опыта за качество */
export const CRAFT_QUALITY_EXP_DIVISOR = 5

/** Базовая прочность оружия */
export const BASE_WEAPON_DURABILITY = 100

/** Базовый множитель эпичности */
export const BASE_EPIC_MULTIPLIER = 1.0

// ================================
// КОНСТАНТЫ ЗАЧАРОВАНИЯ
// ================================

/** Максимальное количество зачарований на оружии */
export const MAX_ENCHANTMENTS_PER_WEAPON = 3

// ================================
// КОНСТАНТЫ ЗАКАЗОВ
// ================================

/** Минимальное качество для заказа */
export const ORDER_MIN_QUALITY = 30

/** Максимальное качество для заказа */
export const ORDER_MAX_QUALITY = 90

/** Базовая награда золотом */
export const ORDER_BASE_GOLD_REWARD = 50

/** Базовая награда славой */
export const ORDER_BASE_FAME_REWARD = 5

// ================================
// КОНСТАНТЫ ЭКСПЕДИЦИЙ
// ================================

/** Время жизни искателя в пуле (мс) */
export const ADVENTURER_LIFETIME = 5 * 60 * 1000 // 5 минут

/** Базовый износ оружия */
export const BASE_WEAPON_WEAR = 10

/** Шанс критического успеха */
export const CRIT_SUCCESS_CHANCE = 10

// ================================
// МАТЕРИАЛЫ
// ================================

/** Названия материалов на русском */
export const MATERIAL_NAMES: Record<string, string> = {
  iron: 'Железо',
  bronze: 'Бронза',
  steel: 'Сталь',
  silver: 'Серебро',
  gold: 'Золото',
  mithril: 'Мифрил',
  copper: 'Медь',
  tin: 'Олово',
}

/** Названия частей оружия на русском */
export const WEAPON_PART_NAMES: Record<string, string> = {
  blade: 'Лезвие',
  guard: 'Гарда',
  grip: 'Рукоять',
  pommel: 'Навершие',
  wrapping: 'Обмотка',
}

// ================================
// КОНВЕРСИЯ ТИРОВ
// ================================

/** Маппинг числового тира в строковый */
export const TIER_NUMBER_TO_STRING: Record<number, string> = {
  1: 'common',
  2: 'uncommon',
  3: 'rare',
  4: 'epic',
  5: 'legendary',
  6: 'mythic',
}

/** Маппинг qualityGrade из V2 в legacy */
export const QUALITY_GRADE_V2_TO_LEGACY: Record<string, string> = {
  poor: 'poor',
  common: 'normal',
  good: 'good',
  excellent: 'excellent',
  masterpiece: 'masterwork',
  legendary: 'legendary',
}

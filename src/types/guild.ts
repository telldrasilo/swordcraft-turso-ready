/**
 * Типы данных для системы гильдии и экспедиций
 */

import type { CraftedWeapon } from './craft'
import type { AdventurerExtended } from './adventurer-extended'
import type { KnownAdventurer } from './known-adventurer'

// Импортируем типы из adventurer-traits
import type { AdventurerTrait } from '@/data/adventurer-traits'
import type { UniqueBonus } from '@/data/unique-bonuses'

// Реэкспорт для использования в других местах
export type { AdventurerTrait, UniqueBonus }

// ================================
// ИСКАТЕЛИ ПРИКЛЮЧЕНИЙ
// ================================

export interface WeaponRequirement {
  minAttack: number
  weaponType?: string
  minQuality?: number
  preferredEnchantment?: string
}

export interface Adventurer {
  id: string
  name: string
  title?: string
  nickname?: string
  skill: number // 0-30 (бонус к War Soul в процентах)
  traits: AdventurerTrait[]
  uniqueBonuses: UniqueBonus[] // Уникальные преимущества (1-3)
  requirements: WeaponRequirement
  portrait: number
  expiresAt: number
  createdAt: number
  hiredAt?: number // Когда был нанят (опционально)
}

// ================================
// ЭКСПЕДИЦИИ
// ================================

export type ExpeditionType = 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
export type ExpeditionDifficulty = 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'

export interface ExpeditionReward {
  baseGold: number
  baseWarSoul: number
  bonusResources?: { resource: string; amount: number; chance: number }[]
  bonusEssence?: number
}

export interface ExpeditionCost {
  supplies: number
  deposit: number
}

export interface ExpeditionTemplate {
  id: string
  name: string
  description: string
  icon: string
  type: ExpeditionType
  difficulty: ExpeditionDifficulty
  duration: number // секунды
  cost: ExpeditionCost
  reward: ExpeditionReward
  minGuildLevel: number
  failureChance: number
  weaponLossChance: number
  recommendedWeaponTypes: string[]
  minWeaponAttack: number
}

// ================================
// АКТИВНЫЕ ЭКСПЕДИЦИИ
// ================================

export interface ActiveExpedition {
  id: string
  expeditionId: string // ID шаблона
  expeditionName: string // Кэшируем имя для UI
  expeditionIcon: string
  adventurerId: string
  adventurerName: string // Кэшируем имя для UI
  adventurerData?: Adventurer // Старый формат для совместимости
  adventurerExtended?: AdventurerExtended // Полные данные Extended
  weaponId: string
  weaponName: string // Кэшируем имя для UI
  weaponData: CraftedWeapon // Копия данных об оружии (для восстановления)
  startedAt: number
  endsAt: number
  deposit: number // Сохранённый депозит
  suppliesCost: number // Сохранённая стоимость снабжения
}

// ================================
// КВЕСТЫ ВОССТАНОВЛЕНИЯ
// ================================

export interface RecoveryQuest {
  id: string
  lostWeaponId: string
  lostWeaponData: CraftedWeapon // Копия данных об оружии
  originalExpeditionId: string
  originalExpeditionName: string
  cost: number
  duration: number
  startedAt?: number
  endsAt?: number
  status: 'available' | 'active' | 'completed' | 'declined'
}

// ================================
// ИСТОРИЯ И СТАТИСТИКА
// ================================

export interface ExpeditionHistoryEntry {
  id: string
  expeditionName: string
  expeditionIcon: string
  adventurerName: string
  adventurerData?: Adventurer // Старый формат для совместимости
  adventurerExtended?: AdventurerExtended // Полные данные Extended со всеми чертами
  weaponName: string
  completedAt: number
  success: boolean
  commission: number
  warSoul: number
  glory: number
  weaponLost: boolean
  isCrit?: boolean // Критический успех
}

export interface GuildStats {
  totalExpeditions: number
  successfulExpeditions: number
  failedExpeditions: number
  weaponsLost: number
  weaponsRecovered: number
  totalCommission: number
  totalWarSoul: number
  totalGlory: number
}

// ================================
// СОСТОЯНИЕ ГИЛЬДИИ
// ================================

export interface GuildState {
  level: number
  glory: number
  totalGlory: number

  adventurers: Adventurer[]
  adventurerRefreshAt: number

  // База известных искателей (для контрактов)
  knownAdventurers: KnownAdventurer[]
  maxKnownAdventurers: number

  activeExpeditions: ActiveExpedition[]
  recoveryQuests: RecoveryQuest[]

  history: ExpeditionHistoryEntry[]
  stats: GuildStats
}

// ================================
// УРОВНИ ГИЛЬДИИ
// ================================

export const GUILD_LEVELS = [
  { level: 1, requiredGlory: 0, commissionBonus: 15 },
  { level: 2, requiredGlory: 500, commissionBonus: 17 },
  { level: 3, requiredGlory: 1500, commissionBonus: 20 },
  { level: 4, requiredGlory: 4000, commissionBonus: 24 },
  { level: 5, requiredGlory: 10000, commissionBonus: 30 },
]

// Функция получения уровня гильдии по славе
export function getGuildLevel(glory: number): number {
  for (let i = GUILD_LEVELS.length - 1; i >= 0; i--) {
    if (glory >= GUILD_LEVELS[i].requiredGlory) {
      return GUILD_LEVELS[i].level
    }
  }
  return 1
}

// Функция получения бонуса комиссии
export function getCommissionBonus(guildLevel: number): number {
  const levelData = GUILD_LEVELS.find(l => l.level === guildLevel)
  return levelData?.commissionBonus ?? 15
}

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialGuildState: GuildState = {
  level: 1,
  glory: 0,
  totalGlory: 0,
  adventurers: [],
  adventurerRefreshAt: 0,
  knownAdventurers: [],
  maxKnownAdventurers: 25,
  activeExpeditions: [],
  recoveryQuests: [],
  history: [],
  stats: {
    totalExpeditions: 0,
    successfulExpeditions: 0,
    failedExpeditions: 0,
    weaponsLost: 0,
    weaponsRecovered: 0,
    totalCommission: 0,
    totalWarSoul: 0,
    totalGlory: 0,
  },
}

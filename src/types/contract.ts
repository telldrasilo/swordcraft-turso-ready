/**
 * Типы данных для системы контрактов
 * Версия 1.0
 */

import type { AdventurerExtended, WeaponType } from './adventurer-extended'

// ================================
// ТИЕРЫ КОНТРАКТОВ
// ================================

export type ContractTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface ContractTerms {
  tier: ContractTier
  duration: number           // В днях (0 = бессрочный)
  commissionReduction: number // % снижения комиссии
  refusalReduction: number   // % снижения шанса отказа
  priorityAccess: boolean    // Первоочередной доступ к миссиям
  directAssignment: boolean  // Прямое назначение без поиска
  exclusiveMissions: boolean // Доступ к эксклюзивным миссиям
  bonusLoyalty: number       // Бонус к начальной лояльности
}

// ================================
// УСЛОВИЯ ЗАКЛЮЧЕНИЯ КОНТРАКТА
// ================================

export interface ContractRequirements {
  minMissionsCompleted: number    // Минимум миссий с искателем
  minSuccessRate: number          // Минимальный % успеха
  minGuildLevel: number           // Минимальный уровень гильдии
  requiredResources: {
    gold: number
    glory?: number
  }
}

// ================================
// КОНТРАКТНЫЙ ИСКАТЕЛЬ
// ================================

export interface ContractedAdventurer {
  id: string                       // ID записи контракта
  adventurerId: string             // ID искателя
  adventurer: AdventurerExtended   // Полные данные искателя
  
  // Условия контракта
  contract: ContractTerms
  contractStartAt: number          // Timestamp начала
  contractExpiresAt: number        // Timestamp окончания (0 = бессрочный)
  
  // Статистика отношений
  missionsCompleted: number        // Всего миссий по контракту
  missionsSucceeded: number        // Успешных миссий
  missionsFailed: number           // Провальных миссий
  totalGoldEarned: number          // Всего золота заработано
  totalWarSoulEarned: number       // Всего душ войны заработано
  
  // Лояльность
  loyalty: number                  // 0-100
  loyaltyHistory: LoyaltyChangeEvent[]
  
  // Дополнительно
  lastMissionAt?: number           // Timestamp последней миссии
  favoriteWeaponTypes: WeaponType[] // Предпочитаемое оружие
  notes?: string                   // Заметки игрока
}

// ================================
// ЛОЯЛЬНОСТЬ
// ================================

export type LoyaltyLevel = 'disgruntled' | 'neutral' | 'satisfied' | 'loyal'

export interface LoyaltyThresholds {
  disgruntled: number   // < 20
  neutral: number       // 20-50
  satisfied: number     // 50-80
  loyal: number         // > 80
}

export interface LoyaltyBonuses {
  refusalModifier: number      // Модификатор шанса отказа
  commissionModifier: number   // Модификатор комиссии
  critChance?: number          // Бонус к шансу крита
  expBonus?: number            // Бонус к опыту
}

export interface LoyaltyChangeEvent {
  timestamp: number
  change: number            // + или -
  reason: string            // Причина изменения
  newLoyalty: number        // Новое значение
}

// ================================
// КОНСТАНТЫ КОНТРАКТОВ
// ================================

export const CONTRACT_TERMS: Record<ContractTier, ContractTerms> = {
  bronze: {
    tier: 'bronze',
    duration: 0,              // Бессрочный
    commissionReduction: 5,
    refusalReduction: 10,
    priorityAccess: false,
    directAssignment: false,
    exclusiveMissions: false,
    bonusLoyalty: 10,
  },
  silver: {
    tier: 'silver',
    duration: 0,
    commissionReduction: 10,
    refusalReduction: 20,
    priorityAccess: true,
    directAssignment: false,
    exclusiveMissions: false,
    bonusLoyalty: 20,
  },
  gold: {
    tier: 'gold',
    duration: 0,
    commissionReduction: 15,
    refusalReduction: 35,
    priorityAccess: true,
    directAssignment: true,
    exclusiveMissions: false,
    bonusLoyalty: 30,
  },
  platinum: {
    tier: 'platinum',
    duration: 0,
    commissionReduction: 25,
    refusalReduction: 50,
    priorityAccess: true,
    directAssignment: true,
    exclusiveMissions: true,
    bonusLoyalty: 50,
  },
}

export const CONTRACT_REQUIREMENTS: Record<ContractTier, ContractRequirements> = {
  bronze: {
    minMissionsCompleted: 3,
    minSuccessRate: 60,
    minGuildLevel: 1,
    requiredResources: { gold: 100 },
  },
  silver: {
    minMissionsCompleted: 5,
    minSuccessRate: 70,
    minGuildLevel: 2,
    requiredResources: { gold: 500 },
  },
  gold: {
    minMissionsCompleted: 10,
    minSuccessRate: 75,
    minGuildLevel: 3,
    requiredResources: { gold: 2000, glory: 100 },
  },
  platinum: {
    minMissionsCompleted: 20,
    minSuccessRate: 85,
    minGuildLevel: 5,
    requiredResources: { gold: 10000, glory: 500 },
  },
}

export const GUILD_CONTRACT_LIMITS: Record<number, number> = {
  1: 1,   // Уровень 1: 1 контракт
  2: 2,   // Уровень 2: 2 контракта
  3: 3,   // Уровень 3: 3 контракта
  4: 5,   // Уровень 4: 5 контрактов
  5: 8,   // Уровень 5: 8 контрактов
}

// ================================
// КОНСТАНТЫ ЛОЯЛЬНОСТИ
// ================================

export const LOYALTY_THRESHOLDS: LoyaltyThresholds = {
  disgruntled: 20,
  neutral: 50,
  satisfied: 80,
  loyal: 100,
}

export const LOYALTY_BONUSES: Record<LoyaltyLevel, LoyaltyBonuses> = {
  disgruntled: {
    refusalModifier: 20,
    commissionModifier: 10,
  },
  neutral: {
    refusalModifier: 0,
    commissionModifier: 0,
  },
  satisfied: {
    refusalModifier: -5,
    commissionModifier: -3,
  },
  loyal: {
    refusalModifier: -10,
    commissionModifier: -5,
    critChance: 5,
    expBonus: 10,
  },
}

// Изменения лояльности
export const LOYALTY_CHANGES = {
  // Начисление
  missionSuccess: 5,
  missionCritSuccess: 10,
  missionAny: 2,
  
  // Потеря
  missionFail: -3,
  weaponLost: -5,
  idleWeek: -5,
  contractTerminated: -20,
}

// ================================
// СОБЫТИЯ КОНТРАКТА
// ================================

export interface ContractEvent {
  id: string
  contractId: string
  type: 'created' | 'completed' | 'terminated' | 'loyalty_change' | 'mission'
  timestamp: number
  data?: Record<string, unknown>
}

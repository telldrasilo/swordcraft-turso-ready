/**
 * Менеджер контрактов
 * Логика заключения, расторжения и управления контрактами
 */

import type { 
  ContractTier, 
  ContractTerms, 
  ContractedAdventurer, 
  ContractRequirements,
  LoyaltyLevel,
  LoyaltyChangeEvent,
  LoyaltyBonuses
} from '@/types/contract'
import { 
  CONTRACT_TERMS, 
  CONTRACT_REQUIREMENTS, 
  GUILD_CONTRACT_LIMITS,
  LOYALTY_THRESHOLDS,
  LOYALTY_BONUSES,
  LOYALTY_CHANGES
} from '@/types/contract'
import type { AdventurerExtended } from '@/types/adventurer-extended'

// ================================
// ОСНОВНЫЕ ФУНКЦИИ
// ================================

/**
 * Проверяет, можно ли предложить контракт данного уровня
 */
export function canOfferContract(
  tier: ContractTier,
  guildLevel: number,
  currentContractsCount: number,
  missionsWithAdventurer: number,
  successRate: number,
  availableGold: number,
  availableGlory: number = 0
): { can: boolean; reason: string } {
  const requirements = CONTRACT_REQUIREMENTS[tier]
  const maxContracts = getMaxContracts(guildLevel)
  
  // Проверка лимита контрактов
  if (currentContractsCount >= maxContracts) {
    return { 
      can: false, 
      reason: `Достигнут лимит контрактов (${maxContracts}) для вашего уровня гильдии` 
    }
  }
  
  // Проверка уровня гильдии
  if (guildLevel < requirements.minGuildLevel) {
    return { 
      can: false, 
      reason: `Требуется уровень гильдии ${requirements.minGuildLevel}` 
    }
  }
  
  // Проверка количества миссий
  if (missionsWithAdventurer < requirements.minMissionsCompleted) {
    return { 
      can: false, 
      reason: `Нужно минимум ${requirements.minMissionsCompleted} миссий с этим искателем` 
    }
  }
  
  // Проверка процента успеха
  if (successRate < requirements.minSuccessRate) {
    return { 
      can: false, 
      reason: `Требуется минимум ${requirements.minSuccessRate}% успешных миссий` 
    }
  }
  
  // Проверка ресурсов
  if (availableGold < requirements.requiredResources.gold) {
    return { 
      can: false, 
      reason: `Нужно ${requirements.requiredResources.gold} золота` 
    }
  }
  
  if (requirements.requiredResources.glory && availableGlory < requirements.requiredResources.glory) {
    return { 
      can: false, 
      reason: `Нужно ${requirements.requiredResources.glory} славы` 
    }
  }
  
  return { can: true, reason: '' }
}

/**
 * Получить максимальное количество контрактов для уровня гильдии
 */
export function getMaxContracts(guildLevel: number): number {
  return GUILD_CONTRACT_LIMITS[guildLevel] || GUILD_CONTRACT_LIMITS[1]
}

/**
 * Создать новый контракт
 */
export function createContract(
  adventurer: AdventurerExtended,
  tier: ContractTier
): ContractedAdventurer {
  const terms = CONTRACT_TERMS[tier]
  const now = Date.now()
  
  return {
    id: `contract-${adventurer.id}-${now}`,
    adventurerId: adventurer.id,
    adventurer: adventurer,
    
    contract: terms,
    contractStartAt: now,
    contractExpiresAt: 0, // Бессрочный
    
    missionsCompleted: 0,
    missionsSucceeded: 0,
    missionsFailed: 0,
    totalGoldEarned: 0,
    totalWarSoulEarned: 0,
    
    loyalty: terms.bonusLoyalty,
    loyaltyHistory: [{
      timestamp: now,
      change: terms.bonusLoyalty,
      reason: 'Заключение контракта',
      newLoyalty: terms.bonusLoyalty,
    }],
    
    favoriteWeaponTypes: adventurer.combat.preferredWeapons || [],
  }
}

/**
 * Расторгнуть контракт
 */
export function terminateContract(
  contractedAdventurer: ContractedAdventurer,
  reason: string = 'По инициативе гильдии'
): { 
  terminated: ContractedAdventurer
  penalty: { gold: number; glory: number }
} {
  const now = Date.now()
  
  // Применяем штраф к лояльности
  const newLoyalty = Math.max(0, contractedAdventurer.loyalty + LOYALTY_CHANGES.contractTerminated)
  
  // Штраф за расторжение (50% от стоимости контракта)
  const requirements = CONTRACT_REQUIREMENTS[contractedAdventurer.contract.tier]
  const penalty = {
    gold: Math.floor(requirements.requiredResources.gold * 0.5),
    glory: requirements.requiredResources.glory 
      ? Math.floor(requirements.requiredResources.glory * 0.5) 
      : 0,
  }
  
  const loyaltyEvent: LoyaltyChangeEvent = {
    timestamp: now,
    change: LOYALTY_CHANGES.contractTerminated,
    reason: `Расторжение контракта: ${reason}`,
    newLoyalty,
  }
  
  return {
    terminated: {
      ...contractedAdventurer,
      loyalty: newLoyalty,
      loyaltyHistory: [...contractedAdventurer.loyaltyHistory, loyaltyEvent],
    },
    penalty,
  }
}

// ================================
// ЛОЯЛЬНОСТЬ
// ================================

/**
 * Получить уровень лояльности
 */
export function getLoyaltyLevel(loyalty: number): LoyaltyLevel {
  if (loyalty < LOYALTY_THRESHOLDS.disgruntled) return 'disgruntled'
  if (loyalty < LOYALTY_THRESHOLDS.neutral) return 'neutral'
  if (loyalty < LOYALTY_THRESHOLDS.satisfied) return 'satisfied'
  return 'loyal'
}

/**
 * Получить бонусы лояльности
 */
export function getLoyaltyBonuses(loyalty: number): LoyaltyBonuses {
  const level = getLoyaltyLevel(loyalty)
  return LOYALTY_BONUSES[level]
}

/**
 * Получить статус лояльности (для совместимости с guild-slice)
 */
export function getLoyaltyStatus(loyalty: number): {
  level: LoyaltyLevel
  bonuses: LoyaltyBonuses
  description: string
} {
  const level = getLoyaltyLevel(loyalty)
  const bonuses = LOYALTY_BONUSES[level]
  
  const descriptions: Record<LoyaltyLevel, string> = {
    disgruntled: 'Недовольный — может расторгнуть контракт',
    neutral: 'Нейтральный — нормальные отношения',
    satisfied: 'Удовлетворённый — небольшие бонусы',
    loyal: 'Лояльный — значительные бонусы',
  }
  
  return { level, bonuses, description: descriptions[level] }
}

/**
 * Обновить лояльность (упрощённая версия для guild-slice)
 * Возвращает новое значение лояльности
 */
export function updateLoyalty(
  contractedAdventurer: ContractedAdventurer,
  success: boolean,
  isCrit: boolean,
  weaponLost: boolean
): number {
  let change = LOYALTY_CHANGES.missionAny
  
  if (success) {
    change += isCrit ? LOYALTY_CHANGES.missionCritSuccess : LOYALTY_CHANGES.missionSuccess
  } else {
    change += LOYALTY_CHANGES.missionFail
  }
  
  if (weaponLost) {
    change += LOYALTY_CHANGES.weaponLost
  }
  
  return Math.max(0, Math.min(100, contractedAdventurer.loyalty + change))
}

/**
 * Обновить лояльность после миссии
 */
export function updateLoyaltyAfterMission(
  contractedAdventurer: ContractedAdventurer,
  success: boolean,
  criticalSuccess: boolean = false,
  weaponLost: boolean = false
): ContractedAdventurer {
  const now = Date.now()
  let change = LOYALTY_CHANGES.missionAny
  let reason = 'Выполнение миссии'
  
  if (success) {
    change += LOYALTY_CHANGES.missionSuccess
    reason = 'Успешная миссия'
    
    if (criticalSuccess) {
      change += LOYALTY_CHANGES.missionCritSuccess - LOYALTY_CHANGES.missionSuccess
      reason = 'Критический успех!'
    }
  } else {
    change += LOYALTY_CHANGES.missionFail
    reason = 'Провал миссии'
  }
  
  if (weaponLost) {
    change += LOYALTY_CHANGES.weaponLost
    reason += ' (потеря оружия)'
  }
  
  const newLoyalty = Math.max(0, Math.min(100, contractedAdventurer.loyalty + change))
  
  const loyaltyEvent: LoyaltyChangeEvent = {
    timestamp: now,
    change,
    reason,
    newLoyalty,
  }
  
  return {
    ...contractedAdventurer,
    loyalty: newLoyalty,
    loyaltyHistory: [...contractedAdventurer.loyaltyHistory, loyaltyEvent],
    lastMissionAt: now,
  }
}

/**
 * Обновить лояльность за простой
 */
export function updateLoyaltyForIdle(
  contractedAdventurer: ContractedAdventurer,
  daysIdle: number
): ContractedAdventurer {
  if (daysIdle < 7) return contractedAdventurer
  
  const weeksIdle = Math.floor(daysIdle / 7)
  const change = LOYALTY_CHANGES.idleWeek * weeksIdle
  const newLoyalty = Math.max(0, contractedAdventurer.loyalty + change)
  
  const loyaltyEvent: LoyaltyChangeEvent = {
    timestamp: Date.now(),
    change,
    reason: `Простой ${weeksIdle} недель`,
    newLoyalty,
  }
  
  return {
    ...contractedAdventurer,
    loyalty: newLoyalty,
    loyaltyHistory: [...contractedAdventurer.loyaltyHistory, loyaltyEvent],
  }
}

// ================================
// СТАТИСТИКА МИССИЙ
// ================================

/**
 * Обновить статистику после миссии
 */
export function updateMissionStats(
  contractedAdventurer: ContractedAdventurer,
  success: boolean,
  goldEarned: number,
  warSoulEarned: number
): ContractedAdventurer {
  return {
    ...contractedAdventurer,
    missionsCompleted: contractedAdventurer.missionsCompleted + 1,
    missionsSucceeded: contractedAdventurer.missionsSucceeded + (success ? 1 : 0),
    missionsFailed: contractedAdventurer.missionsFailed + (success ? 0 : 1),
    totalGoldEarned: contractedAdventurer.totalGoldEarned + goldEarned,
    totalWarSoulEarned: contractedAdventurer.totalWarSoulEarned + warSoulEarned,
  }
}

/**
 * Получить процент успеха контрактника
 */
export function getContractorSuccessRate(contractedAdventurer: ContractedAdventurer): number {
  if (contractedAdventurer.missionsCompleted === 0) return 0
  return Math.round(
    (contractedAdventurer.missionsSucceeded / contractedAdventurer.missionsCompleted) * 100
  )
}

// ================================
// МОДИФИКАТОРЫ
// ================================

/**
 * Применить контрактные модификаторы к расчётам миссии
 */
export function applyContractModifiers(
  contractedAdventurer: ContractedAdventurer,
  baseCommission: number,
  baseRefusalChance: number
): {
  commission: number
  refusalChance: number
  critChance: number
} {
  const contract = contractedAdventurer.contract
  const loyaltyBonuses = getLoyaltyBonuses(contractedAdventurer.loyalty)
  
  // Снижение комиссии от контракта
  let commission = baseCommission * (1 - contract.commissionReduction / 100)
  
  // Доп. снижение от лояльности
  if (loyaltyBonuses.commissionModifier !== 0) {
    commission = commission * (1 + loyaltyBonuses.commissionModifier / 100)
  }
  
  // Снижение шанса отказа от контракта
  let refusalChance = baseRefusalChance * (1 - contract.refusalReduction / 100)
  
  // Доп. модификатор от лояльности
  if (loyaltyBonuses.refusalModifier !== 0) {
    refusalChance = refusalChance * (1 + loyaltyBonuses.refusalModifier / 100)
  }
  
  // Бонус к криту
  const critChance = loyaltyBonuses.critChance || 0
  
  return {
    commission: Math.max(0, Math.floor(commission)),
    refusalChance: Math.max(0, Math.min(100, Math.round(refusalChance))),
    critChance,
  }
}

// ================================
// УТИЛИТЫ
// ================================

/**
 * Получить название тиера контракта на русском
 */
export function getContractTierName(tier: ContractTier): string {
  const names: Record<ContractTier, string> = {
    bronze: 'Бронзовый',
    silver: 'Серебряный',
    gold: 'Золотой',
    platinum: 'Платиновый',
  }
  return names[tier]
}

/**
 * Получить цвет тиера контракта
 */
export function getContractTierColor(tier: ContractTier): string {
  const colors: Record<ContractTier, string> = {
    bronze: 'text-amber-600',
    silver: 'text-stone-300',
    gold: 'text-yellow-400',
    platinum: 'text-cyan-300',
  }
  return colors[tier]
}

/**
 * Получить иконку тиера контракта
 */
export function getContractTierIcon(tier: ContractTier): string {
  const icons: Record<ContractTier, string> = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
  }
  return icons[tier]
}

/**
 * Проверить, может ли искатель быть напрямую назначен на миссию
 */
export function canDirectAssign(contractedAdventurer: ContractedAdventurer): boolean {
  return contractedAdventurer.contract.directAssignment
}

/**
 * Проверить, есть ли доступ к эксклюзивным миссиям
 */
export function hasExclusiveAccess(contractedAdventurer: ContractedAdventurer): boolean {
  return contractedAdventurer.contract.exclusiveMissions
}

// ================================
// ФУНКЦИИ ДЛЯ GUILD-SLICE
// ================================

/**
 * Рассчитать шанс отказа контрактника от миссии
 */
export function calculateContractRefusalChance(
  contractedAdventurer: ContractedAdventurer,
  missionDifficulty: string
): number {
  // Базовый шанс отказа
  let baseRefusal = 5
  
  // Влияние лояльности
  const { bonuses } = getLoyaltyStatus(contractedAdventurer.loyalty)
  baseRefusal += bonuses.refusalModifier || 0
  
  // Снижение от контракта
  baseRefusal *= (1 - contractedAdventurer.contract.refusalReduction / 100)
  
  // Высокий уровень не хочет лёгкие миссии
  const adventurerLevel = contractedAdventurer.adventurer?.combat?.level || 1
  const difficultyTiers: Record<string, number> = {
    easy: 5, normal: 15, hard: 25, extreme: 35, legendary: 45
  }
  const diffTier = difficultyTiers[missionDifficulty] || 15
  
  if (adventurerLevel > diffTier + 10) {
    baseRefusal += 20 // Скучно
  }
  
  return Math.max(0, Math.min(50, Math.round(baseRefusal)))
}

/**
 * Проверить, хочет ли искатель расторгнуть контракт
 */
export function wantsToTerminate(contractedAdventurer: ContractedAdventurer): boolean {
  // Если лояльность ниже порога недовольства
  if (contractedAdventurer.loyalty < LOYALTY_THRESHOLDS.disgruntled) {
    // Шанс расторжения пропорционален низкой лояльности
    const terminateChance = (LOYALTY_THRESHOLDS.disgruntled - contractedAdventurer.loyalty) * 2
    return Math.random() * 100 < terminateChance
  }
  return false
}

/**
 * Рассчитать штраф за расторжение контракта
 */
export function calculateTerminationPenalty(contractedAdventurer: ContractedAdventurer): {
  gold: number
  glory: number
} {
  const tier = contractedAdventurer.contract.tier
  const requirements = CONTRACT_REQUIREMENTS[tier]
  
  return {
    gold: Math.floor(requirements.requiredResources.gold * 0.5),
    glory: requirements.requiredResources.glory 
      ? Math.floor(requirements.requiredResources.glory * 0.5) 
      : 0,
  }
}

/**
 * Проверить и применить потерю лояльности за простой
 */
export function checkIdleLoyaltyLoss(contractedAdventurer: ContractedAdventurer): {
  contracted: ContractedAdventurer
  loyaltyLost: number
} {
  if (!contractedAdventurer.lastMissionAt) {
    return { contracted: contractedAdventurer, loyaltyLost: 0 }
  }
  
  const daysSinceLastMission = (Date.now() - contractedAdventurer.lastMissionAt) / (1000 * 60 * 60 * 24)
  
  if (daysSinceLastMission < 7) {
    return { contracted: contractedAdventurer, loyaltyLost: 0 }
  }
  
  const weeksIdle = Math.floor(daysSinceLastMission / 7)
  const loyaltyLost = Math.abs(LOYALTY_CHANGES.idleWeek) * weeksIdle
  
  const updated = updateLoyaltyForIdle(contractedAdventurer, daysSinceLastMission)
  
  return {
    contracted: updated,
    loyaltyLost,
  }
}

/**
 * Экспорт createContract как alias для совместимости
 */
export { createContract }

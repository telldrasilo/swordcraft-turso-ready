/**
 * Менеджер базы известных искателей
 * Управляет хранением, обновлением и повторным появлением искателей
 */

import type { AdventurerExtended, WeaponType } from '@/types/adventurer-extended'
import type { 
  KnownAdventurer, 
  MissionResultForStats,
} from '@/types/known-adventurer'
import type { ContractTier } from '@/types/adventurer-extended'
import { 
  KNOWN_ADVENTURERS_CONFIG, 
  CONTRACT_REQUIREMENTS 
} from '@/types/known-adventurer'

// ================================
// ОСНОВНЫЕ ФУНКЦИИ
// ================================

/**
 * Обновить или добавить искателя в базу
 */
export function updateKnownAdventurer(
  known: KnownAdventurer[],
  adventurer: AdventurerExtended,
  missionResult?: MissionResultForStats
): KnownAdventurer[] {
  const existing = known.find(k => k.adventurerId === adventurer.id)
  const now = Date.now()
  
  if (existing) {
    // Обновить существующего
    return known.map(k => {
      if (k.adventurerId !== adventurer.id) return k
      
      const newMissionsCompleted = missionResult ? k.missionsCompleted + 1 : k.missionsCompleted
      const newMissionsSucceeded = missionResult?.success ? k.missionsSucceeded + 1 : k.missionsSucceeded
      
      // Обновление любимого оружия
      const newFavoriteWeapons = [...k.favoriteWeaponTypes]
      if (missionResult?.weaponType && !newFavoriteWeapons.includes(missionResult.weaponType)) {
        newFavoriteWeapons.push(missionResult.weaponType)
      }
      
      return {
        ...k,
        // Обновляем данные искателя (могли измениться)
        adventurer,
        // Обновляем статистику
        metCount: k.metCount + 1,
        missionsCompleted: newMissionsCompleted,
        missionsSucceeded: newMissionsSucceeded,
        totalGoldEarned: k.totalGoldEarned + (missionResult?.gold ?? 0),
        totalWarSoulEarned: k.totalWarSoulEarned + (missionResult?.warSoul ?? 0),
        // Обновляем временные метки
        lastMetAt: now,
        lastMissionAt: missionResult ? now : k.lastMissionAt,
        // Проверяем доступность контракта
        isAvailableForContract: newMissionsCompleted >= KNOWN_ADVENTURERS_CONFIG.MIN_MISSIONS_FOR_CONTRACT,
        // Обновляем предпочтения
        favoriteWeaponTypes: newFavoriteWeapons.slice(0, 3), // Максимум 3
      }
    })
  } else {
    // Проверка лимита перед добавлением
    let updatedKnown = [...known]
    if (updatedKnown.length >= KNOWN_ADVENTURERS_CONFIG.MAX_KNOWN_ADVENTURERS) {
      // Удалить самого старого неактивного
      updatedKnown = removeOldestInactive(updatedKnown)
    }
    
    // Добавить нового
    const newEntry: KnownAdventurer = {
      adventurerId: adventurer.id,
      adventurer,
      metCount: 1,
      missionsCompleted: missionResult ? 1 : 0,
      missionsSucceeded: missionResult?.success ? 1 : 0,
      totalGoldEarned: missionResult?.gold ?? 0,
      totalWarSoulEarned: missionResult?.warSoul ?? 0,
      firstMetAt: now,
      lastMetAt: now,
      lastMissionAt: missionResult ? now : undefined,
      isAvailableForContract: false,
      favoriteWeaponTypes: missionResult?.weaponType ? [missionResult.weaponType] : [],
    }
    
    return [...updatedKnown, newEntry]
  }
}

/**
 * Удалить самого старого неактивного искателя
 */
function removeOldestInactive(known: KnownAdventurer[]): KnownAdventurer[] {
  // Не удаляем контрактных
  const nonContracted = known.filter(k => !k.contractTier)
  
  if (nonContracted.length === 0) return known
  
  // Сортируем по последней встрече
  const sorted = [...nonContracted].sort((a, b) => a.lastMetAt - b.lastMetAt)
  const toRemove = sorted[0].adventurerId
  
  return known.filter(k => k.adventurerId !== toRemove)
}

/**
 * Очистка неактивных искателей
 */
export function cleanInactiveAdventurers(known: KnownAdventurer[]): KnownAdventurer[] {
  const threshold = Date.now() - KNOWN_ADVENTURERS_CONFIG.INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  
  return known.filter(k =>
    k.contractTier || // Контрактных не удаляем
    k.lastMetAt > threshold // Или активных
  )
}

/**
 * Получить информацию об искателе
 */
export function getKnownAdventurerInfo(
  known: KnownAdventurer[],
  adventurerId: string
): KnownAdventurer | undefined {
  return known.find(k => k.adventurerId === adventurerId)
}

/**
 * Проверить возможность заключения контракта
 */
export function canOfferContract(
  known: KnownAdventurer,
  tier: ContractTier,
  guildLevel: number
): { canOffer: boolean; reason?: string } {
  const requirements = CONTRACT_REQUIREMENTS[tier]
  
  // Проверка количества миссий
  if (known.missionsCompleted < requirements.minMissions) {
    return {
      canOffer: false,
      reason: `Нужно минимум ${requirements.minMissions} миссий (выполнено: ${known.missionsCompleted})`
    }
  }
  
  // Проверка процента успеха
  if (known.missionsCompleted > 0) {
    const successRate = (known.missionsSucceeded / known.missionsCompleted) * 100
    if (successRate < requirements.minSuccessRate) {
      return {
        canOffer: false,
        reason: `Нужно минимум ${requirements.minSuccessRate}% успеха (у вас: ${successRate.toFixed(0)}%)`
      }
    }
  }
  
  // Проверка уровня гильдии
  if (guildLevel < requirements.minGuildLevel) {
    return {
      canOffer: false,
      reason: `Нужен уровень гильдии ${requirements.minGuildLevel}`
    }
  }
  
  // Проверка, не в контракте ли уже
  if (known.contractTier) {
    return {
      canOffer: false,
      reason: `Искатель уже имеет ${getContractTierName(known.contractTier)} контракт`
    }
  }
  
  return { canOffer: true }
}

/**
 * Получить название тира контракта
 */
function getContractTierName(tier: ContractTier): string {
  const names: Record<ContractTier, string> = {
    bronze: 'Бронзовый',
    silver: 'Серебряный',
    gold: 'Золотой',
    platinum: 'Платиновый',
  }
  return names[tier]
}

// ================================
// СИСТЕМА ПОВТОРНОГО ПОЯВЛЕНИЯ
// ================================

/**
 * Выбрать искателей для повторного появления
 */
export function selectAdventurersForReappearance(
  known: KnownAdventurer[],
  count: number
): AdventurerExtended[] {
  const now = Date.now()
  const result: AdventurerExtended[] = []
  
  // Кандидаты: не контрактные и доступные для встреч
  const candidates = known
    .filter(k => !k.contractTier)
    .filter(k => k.isAvailableForContract || k.metCount < KNOWN_ADVENTURERS_CONFIG.MIN_MISSIONS_FOR_CONTRACT)
    .sort((a, b) => a.lastMetAt - b.lastMetAt) // Давно не виделись — приоритет
  
  for (const candidate of candidates) {
    if (result.length >= count) break
    
    // Расчёт шанса появления
    const daysSinceLastMet = (now - candidate.lastMetAt) / (24 * 60 * 60 * 1000)
    const chance = Math.min(
      KNOWN_ADVENTURERS_CONFIG.MAX_REAPPEAR_CHANCE,
      KNOWN_ADVENTURERS_CONFIG.BASE_REAPPEAR_CHANCE + 
      daysSinceLastMet * KNOWN_ADVENTURERS_CONFIG.REAPPEAR_CHANCE_PER_DAY
    )
    
    if (Math.random() * 100 < chance) {
      result.push(candidate.adventurer)
    }
  }
  
  return result
}

/**
 * Сгенерировать пул искателей с учётом повторного появления
 */
export function generateAdventurerPoolWithKnown(
  generateNew: (count: number, guildLevel: number) => AdventurerExtended[],
  knownAdventurers: KnownAdventurer[],
  count: number,
  guildLevel: number
): AdventurerExtended[] {
  // Попытка добавить известных искателей
  const reappearing = selectAdventurersForReappearance(knownAdventurers, Math.floor(count * 0.4))
  
  // Заполнить оставшиеся слоты новыми
  const newCount = count - reappearing.length
  const newAdventurers = generateNew(newCount, guildLevel)
  
  return [...reappearing, ...newAdventurers]
}

// ================================
// УТИЛИТЫ ДЛЯ UI
// ================================

/**
 * Получить текст для бейджа "Уже встречали"
 */
export function getMetInfoText(known: KnownAdventurer): string {
  let text = `Встречали ${known.metCount} раз(а)`
  
  if (known.missionsCompleted > 0) {
    text += ` • ${known.missionsSucceeded}/${known.missionsCompleted} успех`
  }
  
  return text
}

/**
 * Проверить, доступен ли для контракта (с текстом)
 */
export function getContractAvailabilityText(known: KnownAdventurer): { 
  available: boolean
  text: string 
  className: string 
} {
  if (known.contractTier) {
    return {
      available: false,
      text: `${getContractTierName(known.contractTier)} контракт`,
      className: 'text-purple-400'
    }
  }
  
  if (known.isAvailableForContract) {
    return {
      available: true,
      text: 'Доступен для контракта!',
      className: 'text-green-400 font-semibold'
    }
  }
  
  const remaining = KNOWN_ADVENTURERS_CONFIG.MIN_MISSIONS_FOR_CONTRACT - known.missionsCompleted
  return {
    available: false,
    text: `Нужно ещё ${remaining} мисс(и/ий) для контракта`,
    className: 'text-amber-400'
  }
}

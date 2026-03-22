/**
 * Типы для базы известных искателей
 * Хранит информацию о предыдущих встречах для системы контрактов
 */

import type { AdventurerExtended, ContractTier, WeaponType } from './adventurer-extended'

/**
 * Запись об известном искателе
 */
export interface KnownAdventurer {
  // Идентификация
  adventurerId: string
  
  // Полные данные искателя
  adventurer: AdventurerExtended
  
  // Статистика встреч
  metCount: number              // Количество встреч в гильдии
  missionsCompleted: number     // Завершённых миссий
  missionsSucceeded: number     // Успешных миссий
  
  // Финансовая статистика
  totalGoldEarned: number       // Всего заработано золота
  totalWarSoulEarned: number    // Всего заработано душ войны
  
  // Временные метки
  firstMetAt: number            // Первая встреча (timestamp)
  lastMetAt: number             // Последняя встреча (timestamp)
  lastMissionAt?: number        // Последняя миссия (timestamp)
  
  // Статус контракта
  isAvailableForContract: boolean // Доступен для контракта (>=3 миссий)
  contractTier?: ContractTier     // Если уже в контракте
  
  // Предпочтения (вычисляется из истории)
  favoriteWeaponTypes: WeaponType[]
}

/**
 * Результат миссии для обновления статистики
 */
export interface MissionResultForStats {
  success: boolean
  gold: number
  warSoul: number
  weaponType?: WeaponType
}

/**
 * Конфигурация системы
 */
export const KNOWN_ADVENTURERS_CONFIG = {
  // Максимальное количество хранимых искателей
  MAX_KNOWN_ADVENTURERS: 25,
  
  // Порог неактивности для очистки (дни)
  INACTIVE_THRESHOLD_DAYS: 7,
  
  // Минимальное количество миссий для контракта
  MIN_MISSIONS_FOR_CONTRACT: 3,
  
  // Базовый шанс повторного появления (%)
  BASE_REAPPEAR_CHANCE: 30,
  
  // Бонус к шансу за день отсутствия (%)
  REAPPEAR_CHANCE_PER_DAY: 5,
  
  // Максимальный шанс повторного появления (%)
  MAX_REAPPEAR_CHANCE: 60,
}

/**
 * Требования для заключения контракта
 */
export const CONTRACT_REQUIREMENTS: Record<ContractTier, {
  minMissions: number
  minSuccessRate: number
  minGuildLevel: number
}> = {
  bronze: { minMissions: 3, minSuccessRate: 50, minGuildLevel: 1 },
  silver: { minMissions: 5, minSuccessRate: 60, minGuildLevel: 2 },
  gold: { minMissions: 10, minSuccessRate: 70, minGuildLevel: 3 },
  platinum: { minMissions: 20, minSuccessRate: 80, minGuildLevel: 5 },
}

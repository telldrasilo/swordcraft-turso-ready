/**
 * Система поиска искателей для экспедиций
 * Симуляция реального поиска с логами и фразами
 */

import {
  AdventurerExtended,
  SearchState,
  SearchLogEntry,
  SearchEvent,
  Gender,
} from '@/types/adventurer-extended'
import { generateExtendedAdventurer, getAdventurerFullName } from './adventurer-generator-extended'
import { generateMessage } from '@/data/adventurer-phrases'

// ================================
// ТИПЫ
// ================================

interface ExpeditionInfo {
  id: string
  name: string
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'
  baseGold: number
  baseGlory: number
  riskLevel: number // 0-100
}

// ================================
// КОНСТАНТЫ
// ================================

const SEARCH_DURATION_MIN = 30000 // 30 секунд
const SEARCH_DURATION_MAX = 60000 // 60 секунд
const TARGET_ADVENTURERS = 3
const EVENTS_PER_SEARCH = 8 // Общее количество событий

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

const generateId = (): string => Math.random().toString(36).substring(2, 9)

// Получение всех тэгов искателя
function getAllTags(adventurer: AdventurerExtended): string[] {
  return [
    adventurer.personality.primaryTrait,
    adventurer.personality.secondaryTrait,
    ...adventurer.personality.motivations,
    ...adventurer.personality.socialTags,
    adventurer.personality.riskTolerance,
    adventurer.combat.combatStyle,
    ...adventurer.strengths.map(s => s.id),
    ...adventurer.weaknesses.map(w => w.id),
    'default',
  ].filter(Boolean) as string[]
}

// Расчёт шанса согласия искателя на миссию
export function calculateAcceptChance(
  adventurer: AdventurerExtended,
  expedition: ExpeditionInfo
): number {
  let baseChance = 50
  
  // Влияние уровня
  const levelDiff = adventurer.combat.level - getDifficultyLevel(expedition.difficulty)
  
  // Высокий уровень на лёгкую миссию
  if (levelDiff > 5) {
    if (adventurer.personality.primaryTrait === 'ambitious') {
      baseChance -= 15
    } else {
      baseChance -= 25
    }
  }
  // Низкий уровень на сложную миссию
  else if (levelDiff < -5) {
    if (adventurer.personality.primaryTrait === 'reckless' || 
        adventurer.personality.primaryTrait === 'brave') {
      baseChance += 15
    } else {
      baseChance -= 35
    }
  }
  
  // Влияние характера
  if (adventurer.personality.primaryTrait === 'greedy' || 
      adventurer.personality.secondaryTrait === 'greedy') {
    const goldRatio = expedition.baseGold / 50 // Относительно базовой награды
    if (goldRatio < 1) baseChance -= 20
    else if (goldRatio > 2) baseChance += 15
  }
  
  // Влияние мотивации
  for (const motivation of adventurer.personality.motivations) {
    switch (motivation) {
      case 'gold':
        baseChance += expedition.baseGold > 100 ? 10 : -5
        break
      case 'glory':
        baseChance += expedition.difficulty === 'legendary' ? 20 : 0
        break
      case 'challenge':
        baseChance += levelDiff < 0 ? 15 : -10
        break
      case 'safety':
        baseChance += expedition.riskLevel < 30 ? 15 : -15
        break
    }
  }
  
  // Влияние толерантности к риску
  if (adventurer.personality.riskTolerance === 'cautious' && expedition.riskLevel > 50) {
    baseChance -= 20
  }
  if (adventurer.personality.riskTolerance === 'reckless' && expedition.riskLevel > 50) {
    baseChance += 15
  }
  
  // Влияние слабостей
  for (const weakness of adventurer.weaknesses) {
    if (weakness.id === 'coward' && expedition.riskLevel > 60) {
      baseChance -= 25
    }
    if (weakness.id === 'arrogant' && expedition.difficulty === 'easy') {
      baseChance -= 15
    }
  }
  
  // Влияние сильных сторон
  for (const strength of adventurer.strengths) {
    if (strength.id === 'brave') {
      baseChance += 10
    }
  }
  
  return Math.max(5, Math.min(95, baseChance))
}

// Получение числового уровня сложности
function getDifficultyLevel(difficulty: string): number {
  const levels: Record<string, number> = {
    easy: 5,
    normal: 15,
    hard: 25,
    extreme: 35,
    legendary: 45,
  }
  return levels[difficulty] || 15
}

// ================================
// ГЕНЕРАЦИЯ СОБЫТИЙ ПОИСКА
// ================================

/**
 * Генерация событий поиска
 */
export function generateSearchEvents(
  expedition: ExpeditionInfo,
  guildLevel: number,
  duration: number
): SearchEvent[] {
  const events: SearchEvent[] = []
  const foundAdventurers: AdventurerExtended[] = []
  
  // Генерируем события с интервалами
  const interval = duration / EVENTS_PER_SEARCH
  
  for (let i = 0; i < EVENTS_PER_SEARCH; i++) {
    const time = Math.floor(interval * i + Math.random() * (interval / 2))
    const adventurer = generateExtendedAdventurer(guildLevel)
    const acceptChance = calculateAcceptChance(adventurer, expedition)
    const roll = Math.random() * 100
    const isAccepted = roll < acceptChance
    
    // Если уже нашли 3 согласившихся, остальные отказываются
    const alreadyFound = foundAdventurers.length
    const willAccept = isAccepted && alreadyFound < TARGET_ADVENTURERS
    
    if (willAccept) {
      foundAdventurers.push(adventurer)
    }
    
    const allTags = getAllTags(adventurer)
    const message = generateMessage(
      willAccept ? 'accepted' : 'declined',
      {
        name: adventurer.identity.firstName,
        title: adventurer.identity.lastName,
        gender: adventurer.identity.gender,
      },
      allTags,
      expedition.name
    )
    
    events.push({
      time,
      adventurer,
      decision: willAccept ? 'accepted' : 'declined',
      message,
    })
  }
  
  return events.sort((a, b) => a.time - b.time)
}

// ================================
// УПРАВЛЕНИЕ СОСТОЯНИЕМ ПОИСКА
// ================================

/**
 * Создание начального состояния поиска
 */
export function createSearchState(
  expedition: ExpeditionInfo,
  guildLevel: number
): SearchState {
  const duration = SEARCH_DURATION_MIN + Math.random() * (SEARCH_DURATION_MAX - SEARCH_DURATION_MIN)
  
  return {
    isSearching: true,
    startTime: Date.now(),
    duration: Math.floor(duration),
    progress: 0,
    logs: [],
    foundAdventurers: [],
    targetCount: TARGET_ADVENTURERS,
  }
}

/**
 * Обработка события поиска
 */
export function processSearchEvent(
  state: SearchState,
  event: SearchEvent
): SearchState {
  const name = getAdventurerFullName(event.adventurer)
  
  // Лог подхода
  const approachLog: SearchLogEntry = {
    id: generateId(),
    timestamp: event.time,
    adventurerId: event.adventurer.id,
    adventurerName: name,
    type: 'approaching',
    message: generateMessage(
      'approaching',
      {
        name: event.adventurer.identity.firstName,
        gender: event.adventurer.identity.gender,
      },
      getAllTags(event.adventurer),
      undefined
    ),
    emoji: '🚶',
  }
  
  // Лог размышления (иногда)
  const thinkingLog: SearchLogEntry | null = Math.random() < 0.5 ? {
    id: generateId(),
    timestamp: event.time + 1000 + Math.random() * 2000,
    adventurerId: event.adventurer.id,
    adventurerName: name,
    type: 'considering',
    message: generateMessage(
      'considering',
      {
        name: event.adventurer.identity.firstName,
        gender: event.adventurer.identity.gender,
      },
      getAllTags(event.adventurer),
      undefined
    ),
    emoji: '⏳',
  } : null
  
  // Лог решения
  const decisionLog: SearchLogEntry = {
    id: generateId(),
    timestamp: thinkingLog ? thinkingLog.timestamp + 2000 : event.time + 2000,
    adventurerId: event.adventurer.id,
    adventurerName: name,
    type: event.decision === 'accepted' ? 'accepted' : 'declined',
    message: event.message,
    emoji: event.decision === 'accepted' ? '✅' : '❌',
  }
  
  const newLogs = [
    ...state.logs,
    approachLog,
    ...(thinkingLog ? [thinkingLog] : []),
    decisionLog,
  ].sort((a, b) => a.timestamp - b.timestamp)
  
  const newFoundAdventurers = event.decision === 'accepted'
    ? [...state.foundAdventurers, event.adventurer]
    : state.foundAdventurers
  
  return {
    ...state,
    logs: newLogs,
    foundAdventurers: newFoundAdventurers,
    // Остановить поиск если нашли достаточно
    isSearching: newFoundAdventurers.length >= TARGET_ADVENTURERS ? false : state.isSearching,
  }
}

/**
 * Обновление прогресса поиска
 */
export function updateSearchProgress(state: SearchState): SearchState {
  if (!state.isSearching) return state
  
  const elapsed = Date.now() - state.startTime
  const progress = Math.min(100, (elapsed / state.duration) * 100)
  
  return {
    ...state,
    progress,
    isSearching: progress < 100 && state.foundAdventurers.length < TARGET_ADVENTURERS,
  }
}

/**
 * Остановка поиска
 */
export function stopSearch(state: SearchState): SearchState {
  return {
    ...state,
    isSearching: false,
  }
}

// ================================
// ЭКСПОРТ СТАРОЙ СИСТЕМЫ ДЛЯ СОВМЕСТИМОСТИ
// ================================

// Реэкспорт из старого генератора для обратной совместимости
export { 
  generateAdventurerPool,
  isAdventurerExpired,
  getAdventurerTimeRemaining,
  formatTimeRemaining,
  getAdventurerFullName,
} from './adventurer-generator-extended'

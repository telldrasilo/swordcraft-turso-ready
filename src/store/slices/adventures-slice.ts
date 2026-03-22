/**
 * Adventures Slice
 * Управление приключениями и подземельями
 * Использует store-utils для генерации
 */

import { StateCreator } from 'zustand'
import { generateId } from '@/lib/store-utils/generators'

// ================================
// ТИПЫ
// ================================

/** Статус приключения */
export type AdventureStatus = 'available' | 'active' | 'completed' | 'failed'

/** Тип события в приключении */
export type AdventureEventType = 'combat' | 'treasure' | 'trap' | 'rest' | 'boss' | 'story'

/** Событие приключения */
export interface AdventureEvent {
  id: string
  type: AdventureEventType
  title: string
  description: string
  choices?: AdventureChoice[]
  reward?: AdventureReward
  difficulty?: number
}

/** Выбор в событии */
export interface AdventureChoice {
  id: string
  text: string
  requirements?: {
    minLevel?: number
    minAttack?: number
    minDurability?: number
  }
  outcomes: AdventureOutcome[]
}

/** Исход выбора */
export interface AdventureOutcome {
  type: 'success' | 'failure' | 'neutral'
  probability: number
  rewards?: AdventureReward
  penalties?: AdventurePenalty
  message: string
}

/** Награда */
export interface AdventureReward {
  gold?: number
  experience?: number
  fame?: number
  resources?: Record<string, number>
  items?: string[]
}

/** Штраф */
export interface AdventurePenalty {
  durabilityLoss?: number
  goldLoss?: number
  staminaLoss?: number
}

/** Активное приключение */
export interface ActiveAdventure {
  id: string
  adventureId: string
  weaponId: string
  startTime: number
  endTime: number
  progress: number
  currentEventIndex: number
  events: AdventureEvent[]
  status: AdventureStatus
  results: AdventureResult[]
}

/** Результат приключения */
export interface AdventureResult {
  eventId: string
  choiceId?: string
  outcome: 'success' | 'failure' | 'neutral'
  rewards?: AdventureReward
  penalties?: AdventurePenalty
}

/** Состояние приключений */
export interface AdventuresState {
  activeAdventures: ActiveAdventure[]
  completedAdventuresCount: number
}

/** Actions для приключений */
export interface AdventuresActions {
  startAdventure: (adventureId: string, weaponId: string, duration: number) => boolean
  updateAdventureProgress: (adventureId: string, progress: number) => void
  processAdventureEvent: (adventureId: string, choiceId?: string) => AdventureResult | null
  completeAdventure: (adventureId: string) => AdventureReward | null
  cancelAdventure: (adventureId: string) => boolean
  getActiveAdventure: (adventureId: string) => ActiveAdventure | undefined
  isWeaponOnAdventure: (weaponId: string) => boolean
  addWeaponDurabilityLoss: (weaponId: string, loss: number) => void
  addPlayerExperience: (amount: number) => void
  addPlayerFame: (amount: number) => void
  addResources: (resources: Record<string, number>) => void
  addStatisticsValue: (key: string, value: number) => void
}

/** Полный тип slice */
export type AdventuresSlice = AdventuresState & AdventuresActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialAdventuresState: AdventuresState = {
  activeAdventures: [],
  completedAdventuresCount: 0,
}

// ================================
// КОНСТАНТЫ
// ================================

export const MAX_CONCURRENT_ADVENTURES = 3

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Генерация событий для приключения
 */
export function generateAdventureEvents(difficulty: number, length: number): AdventureEvent[] {
  const events: AdventureEvent[] = []
  
  for (let i = 0; i < length; i++) {
    const isBoss = i === length - 1
    const eventType: AdventureEventType = isBoss ? 'boss' : 
      ['combat', 'treasure', 'trap', 'rest', 'story'][Math.floor(Math.random() * 5)] as AdventureEventType

    events.push({
      id: `event_${i}`,
      type: eventType,
      title: isBoss ? 'Финальная битва!' : `Событие ${i + 1}`,
      description: isBoss ? 'Босс подземелья ждёт вас!' : `Случайное событие`,
      difficulty: isBoss ? difficulty + 2 : difficulty + Math.floor(Math.random() * 3),
    })
  }

  return events
}

/**
 * Расчёт итоговой награды
 */
export function calculateAdventureReward(
  adventure: ActiveAdventure,
  difficulty: number
): AdventureReward {
  const successCount = adventure.results.filter(r => r.outcome === 'success').length
  const totalEvents = adventure.events.length
  
  const baseGold = 20 * difficulty
  const baseExp = 10 * difficulty
  const baseFame = 2 * difficulty

  return {
    gold: Math.floor(baseGold * (1 + successCount / totalEvents)),
    experience: Math.floor(baseExp * (1 + successCount / totalEvents)),
    fame: Math.floor(baseFame * (1 + successCount / totalEvents)),
  }
}

// ================================
// SLICE
// ================================

export const createAdventuresSlice: StateCreator<
  AdventuresSlice,
  [],
  [],
  AdventuresSlice
> = (set, get) => ({
  // State
  activeAdventures: [],
  completedAdventuresCount: 0,

  // Actions
  startAdventure: (adventureId, weaponId, duration) => {
    const state = get()
    
    // Проверяем лимит одновременных приключений
    if (state.activeAdventures.length >= MAX_CONCURRENT_ADVENTURES) return false
    
    // Проверяем что оружие не занято
    if (state.isWeaponOnAdventure(weaponId)) return false

    const now = Date.now()
    const endTime = now + duration * 1000

    const adventure: ActiveAdventure = {
      id: generateId(),
      adventureId,
      weaponId,
      startTime: now,
      endTime,
      progress: 0,
      currentEventIndex: 0,
      events: generateAdventureEvents(1, 5),
      status: 'active',
      results: [],
    }

    set((state) => ({
      activeAdventures: [...state.activeAdventures, adventure]
    }))

    return true
  },

  updateAdventureProgress: (adventureId, progress) => {
    set((state) => ({
      activeAdventures: state.activeAdventures.map(a => 
        a.id === adventureId 
          ? { ...a, progress }
          : a
      )
    }))
  },

  processAdventureEvent: (adventureId, choiceId) => {
    const state = get()
    const adventure = state.activeAdventures.find(a => a.id === adventureId)
    
    if (!adventure || adventure.status !== 'active') return null

    const currentEvent = adventure.events[adventure.currentEventIndex]
    if (!currentEvent) return null

    // Простая логика: успех с вероятностью 60-80% в зависимости от сложности
    const successChance = 70 - (currentEvent.difficulty || 1) * 5
    const roll = Math.random() * 100
    const outcome = roll < successChance ? 'success' : 'failure'

    const result: AdventureResult = {
      eventId: currentEvent.id,
      choiceId,
      outcome,
      rewards: outcome === 'success' ? {
        gold: 10 + Math.floor(Math.random() * 20),
        experience: 5 + Math.floor(Math.random() * 10),
      } : undefined,
      penalties: outcome === 'failure' ? {
        durabilityLoss: 5 + Math.floor(Math.random() * 10),
      } : undefined,
    }

    // Применяем результаты
    if (result.rewards?.gold) {
      state.addResources({ gold: result.rewards.gold })
    }
    if (result.rewards?.experience) {
      state.addPlayerExperience(result.rewards.experience)
    }
    if (result.penalties?.durabilityLoss) {
      state.addWeaponDurabilityLoss(adventure.weaponId, result.penalties.durabilityLoss)
    }

    // Обновляем приключение
    set((state) => ({
      activeAdventures: state.activeAdventures.map(a => 
        a.id === adventureId 
          ? {
              ...a,
              currentEventIndex: a.currentEventIndex + 1,
              results: [...a.results, result],
              status: a.currentEventIndex + 1 >= a.events.length ? 'completed' : 'active',
            }
          : a
      )
    }))

    return result
  },

  completeAdventure: (adventureId) => {
    const state = get()
    const adventure = state.activeAdventures.find(a => a.id === adventureId)
    
    if (!adventure || adventure.status !== 'completed') return null

    const finalReward = calculateAdventureReward(adventure, 1)

    // Начисляем награды
    if (finalReward.gold) {
      state.addResources({ gold: finalReward.gold })
    }
    if (finalReward.experience) {
      state.addPlayerExperience(finalReward.experience)
    }
    if (finalReward.fame) {
      state.addPlayerFame(finalReward.fame)
    }

    state.addStatisticsValue('adventuresCompleted', 1)

    // Удаляем из активных
    set((state) => ({
      activeAdventures: state.activeAdventures.filter(a => a.id !== adventureId),
      completedAdventuresCount: state.completedAdventuresCount + 1,
    }))

    return finalReward
  },

  cancelAdventure: (adventureId) => {
    const state = get()
    const adventure = state.activeAdventures.find(a => a.id === adventureId)
    
    if (!adventure || adventure.status !== 'active') return false

    set((state) => ({
      activeAdventures: state.activeAdventures.filter(a => a.id !== adventureId)
    }))

    return true
  },

  getActiveAdventure: (adventureId) => {
    return get().activeAdventures.find(a => a.id === adventureId)
  },

  isWeaponOnAdventure: (weaponId) => {
    const state = get()
    return state.activeAdventures.some(a => a.weaponId === weaponId && a.status === 'active')
  },

  // Заглушки для методов, делегируемых в основной store
  addWeaponDurabilityLoss: () => {},
  addPlayerExperience: () => {},
  addPlayerFame: () => {},
  addResources: () => {},
  addStatisticsValue: () => {},
})

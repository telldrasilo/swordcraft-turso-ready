/**
 * Player Slice
 * Управление данными игрока: уровень, опыт, слава, титул
 * Использует player-utils для бизнес-логики
 */

import { StateCreator } from 'zustand'
import {
  getTitleByLevel,
  getExperienceForLevel,
  addExperience as addExperienceUtil,
  addFame as addFameUtil,
} from '@/lib/store-utils/player-utils'

// ================================
// ТИПЫ
// ================================

/** Данные игрока */
export interface Player {
  name: string
  level: number
  experience: number
  experienceToNextLevel: number
  fame: number
  title: string
}

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

/** Состояние игрока */
export interface PlayerState {
  player: Player
  statistics: GameStatistics
}

/** Actions для игрока */
export interface PlayerActions {
  setPlayerName: (name: string) => void
  addExperience: (amount: number) => void
  addFame: (amount: number) => void
  updateStatistics: (updates: Partial<GameStatistics>) => void
  getTitleByLevel: (level: number) => string
  getExperienceForLevel: (level: number) => number
}

/** Полный тип slice */
export type PlayerSlice = PlayerState & PlayerActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialPlayer: Player = {
  name: 'Кузнец',
  level: 1,
  experience: 0,
  experienceToNextLevel: 100,
  fame: 0,
  title: 'Новичок',
}

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
// SLICE
// ================================

export const createPlayerSlice: StateCreator<
  PlayerSlice,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  // State
  player: initialPlayer,
  statistics: initialStatistics,

  // Actions
  setPlayerName: (name) => set((state) => ({
    player: { ...state.player, name }
  })),

  addExperience: (amount) => set((state) => {
    const result = addExperienceUtil(
      state.player.experience,
      state.player.level,
      state.player.experienceToNextLevel,
      state.player.fame,
      amount
    )

    return {
      player: {
        ...state.player,
        experience: result.newExperience,
        level: result.newLevel,
        experienceToNextLevel: result.newExperienceToNext,
        fame: result.fameGained > 0 ? state.player.fame + result.fameGained : state.player.fame,
        title: result.newTitle,
      }
    }
  }),

  addFame: (amount) => set((state) => ({
    player: {
      ...state.player,
      fame: addFameUtil(state.player.fame, amount)
    }
  })),

  updateStatistics: (updates) => set((state) => ({
    statistics: {
      ...state.statistics,
      ...updates
    }
  })),

  getTitleByLevel: (level) => getTitleByLevel(level),

  getExperienceForLevel: (level) => getExperienceForLevel(level),
})

// ================================
// ЭКСПОРТ ТИПОВ (для game-store)
// ================================

export type { Player, GameStatistics, PlayerState, PlayerActions }

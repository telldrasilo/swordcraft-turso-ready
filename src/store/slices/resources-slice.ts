/**
 * Resources Slice
 * Управление всеми ресурсами игры
 * Использует constants для цен продажи
 */

import { StateCreator } from 'zustand'
import { RESOURCE_SELL_PRICES } from '@/lib/store-utils/constants'

// ================================
// ТИПЫ
// ================================

/** Все ресурсы в игре */
export interface Resources {
  gold: number
  soulEssence: number
  // Сырьё
  wood: number
  stone: number
  iron: number
  coal: number
  copper: number
  tin: number
  silver: number
  goldOre: number
  mithril: number
  // Переработанные
  ironIngot: number
  copperIngot: number
  tinIngot: number
  bronzeIngot: number
  steelIngot: number
  silverIngot: number
  goldIngot: number
  mithrilIngot: number
  planks: number
  stoneBlocks: number
}

/** Ключи ресурсов */
export type ResourceKey = keyof Resources

/** Стоимость (словарь ресурсов) */
export type CraftingCost = Partial<Record<ResourceKey, number>>

/** Состояние ресурсов */
export interface ResourcesState {
  resources: Resources
}

/** Actions для ресурсов */
export interface ResourcesActions {
  addResource: (resource: ResourceKey, amount: number) => void
  spendResource: (resource: ResourceKey, amount: number) => boolean
  canAfford: (cost: CraftingCost) => boolean
  spendResources: (cost: CraftingCost) => boolean
  sellResource: (resource: ResourceKey, amount: number) => boolean
  getResourceSellPrice: (resource: ResourceKey) => number
}

/** Полный тип slice */
export type ResourcesSlice = ResourcesState & ResourcesActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialResources: Resources = {
  gold: 200,
  soulEssence: 0,
  // Сырьё
  wood: 50,
  stone: 30,
  iron: 30,
  coal: 25,
  copper: 0,
  tin: 0,
  silver: 0,
  goldOre: 0,
  mithril: 0,
  // Переработанные
  ironIngot: 10,
  copperIngot: 0,
  tinIngot: 0,
  bronzeIngot: 0,
  steelIngot: 0,
  silverIngot: 0,
  goldIngot: 0,
  mithrilIngot: 0,
  planks: 15,
  stoneBlocks: 5,
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

/**
 * Проверить наличие ресурсов
 */
function checkCanAfford(resources: Resources, cost: CraftingCost): boolean {
  for (const [resource, amount] of Object.entries(cost)) {
    if ((resources[resource as ResourceKey] || 0) < (amount || 0)) {
      return false
    }
  }
  return true
}

// ================================
// SLICE
// ================================

export const createResourcesSlice: StateCreator<
  ResourcesSlice,
  [],
  [],
  ResourcesSlice
> = (set, get) => ({
  // State
  resources: initialResources,

  // Actions
  addResource: (resource, amount) => set((state) => ({
    resources: {
      ...state.resources,
      [resource]: Math.max(0, state.resources[resource] + amount)
    }
  })),

  spendResource: (resource, amount) => {
    const state = get()
    if (state.resources[resource] >= amount) {
      set({
        resources: {
          ...state.resources,
          [resource]: state.resources[resource] - amount
        }
      })
      return true
    }
    return false
  },

  canAfford: (cost) => {
    const state = get()
    return checkCanAfford(state.resources, cost)
  },

  spendResources: (cost) => {
    const state = get()
    if (!checkCanAfford(state.resources, cost)) return false

    const newResources = { ...state.resources }
    for (const [resource, amount] of Object.entries(cost)) {
      if (amount) {
        newResources[resource as ResourceKey] -= amount
      }
    }
    set({ resources: newResources })
    return true
  },

  sellResource: (resource, amount) => {
    const state = get()
    if ((state.resources[resource] || 0) < amount) return false

    const price = state.getResourceSellPrice(resource)
    const totalGold = price * amount

    set((state) => ({
      resources: {
        ...state.resources,
        [resource]: state.resources[resource] - amount,
        gold: state.resources.gold + totalGold,
      }
    }))

    return true
  },

  getResourceSellPrice: (resource) => {
    return RESOURCE_SELL_PRICES[resource] || 1
  },
})

// ================================
// ЭКСПОРТ ТИПОВ (для game-store)
// ================================

export type { Resources, ResourceKey, CraftingCost }

/**
 * Craft Slice
 * Управление крафтом оружия, переработкой и инвентарём
 * Использует craft-utils для бизнес-логики
 */

import { StateCreator } from 'zustand'
import { CraftingCost } from './resources-slice'

// Импорт утилит
import { generateId } from '@/lib/store-utils/generators'
import {
  getQualityGrade,
  getQualityMultiplier,
} from '@/lib/store-utils/craft-utils'

// ================================
// ТИПЫ
// ================================

/** Тип оружия */
export type WeaponType = 'sword' | 'dagger' | 'axe' | 'mace' | 'spear' | 'hammer' | 'bow' | 'staff'

/** Тир оружия */
export type WeaponTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

/** Материал оружия */
export type WeaponMaterial = 'iron' | 'bronze' | 'steel' | 'silver' | 'gold' | 'mithril'

/** Градация качества */
export type QualityGrade = 'poor' | 'normal' | 'good' | 'excellent' | 'masterwork' | 'legendary'

/** Материал, использованный при создании оружия */
export interface WeaponMaterialUsed {
  partId: string           // 'blade', 'guard', 'grip', 'pommel'
  partName: string         // 'Лезвие', 'Гарда', 'Рукоять', 'Навершие'
  materialId: string       // ID материала
  materialName: string     // Имя для отображения (на русском)
  quantity: number
}

/** Созданное оружие */
export interface CraftedWeapon {
  id: string
  recipeId: string
  name: string
  type: WeaponType
  tier: WeaponTier
  material: WeaponMaterial
  quality: number
  qualityGrade: QualityGrade
  attack: number
  durability: number
  maxDurability: number
  sellPrice: number
  createdAt: number
  warSoul: number
  adventureCount: number
  epicMultiplier: number
  materials: CraftingCost
  primaryMaterial: WeaponMaterial
  enchantments?: WeaponEnchantment[]
  materialsUsed?: WeaponMaterialUsed[]
  techniquesUsed?: string[]
}

/** Зачарование на оружии */
export interface WeaponEnchantment {
  id: string
  enchantmentId: string
  appliedAt: number
}

/** Активный крафт */
export interface ActiveCraft {
  recipeId: string | null
  weaponName: string
  progress: number
  startTime: number | null
  endTime: number | null
  quality: number
}

/** Активная переработка */
export interface ActiveRefining {
  recipeId: string | null
  resourceName: string
  progress: number
  startTime: number | null
  endTime: number | null
  amount: number
}

/** Инвентарь оружия */
export interface WeaponInventory {
  weapons: CraftedWeapon[]
  maxSlots: number
}

/** Разблокированные рецепты */
export interface UnlockedRecipes {
  weaponRecipes: string[]
  refiningRecipes: string[]
}

/** Источник получения рецепта */
export interface RecipeSource {
  recipeId: string
  source: 'purchase' | 'order' | 'expedition' | 'level'
  obtainedAt: number
}

/** Состояние крафта */
export interface CraftState {
  activeCraft: ActiveCraft
  activeRefining: ActiveRefining
  weaponInventory: WeaponInventory
  unlockedRecipes: UnlockedRecipes
  recipeSources: RecipeSource[]
  unlockedEnchantments: string[]
}

/** Actions для крафта */
export interface CraftActions {
  startCraft: (recipe: { id: string; name: string; cost: CraftingCost; baseCraftTime: number; tier: number; type: WeaponType; material: WeaponMaterial; baseSellPrice: number; requiredLevel: number }) => boolean
  updateCraftProgress: (progress: number) => void
  completeCraft: () => CraftedWeapon | null
  isCrafting: () => boolean
  startRefining: (recipe: { id: string; name: string; processTime: number; inputs: { resource: string; amount: number }[]; extraCost?: { coal: number }; output: { resource: string; amount: number }; requiredLevel: number }, amount: number) => boolean
  updateRefiningProgress: (progress: number) => void
  completeRefining: () => boolean
  isRefining: () => boolean
  sellWeapon: (weaponId: string) => boolean
  getWeaponById: (weaponId: string) => CraftedWeapon | undefined
  addWeapon: (weapon: CraftedWeapon) => void
  removeWeapon: (weaponId: string) => boolean
  unlockRecipe: (recipeId: string, source: 'purchase' | 'order' | 'expedition' | 'level') => boolean
  isRecipeUnlocked: (recipeId: string) => boolean
  getRecipeSource: (recipeId: string) => RecipeSource | undefined
  unlockEnchantment: (enchantmentId: string) => boolean
  isEnchantmentUnlocked: (enchantmentId: string) => boolean
  addWarSoulToWeapon: (weaponId: string, points: number, durabilityLoss?: number, epicGain?: number) => boolean
}

/** Полный тип slice */
export type CraftSlice = CraftState & CraftActions

// ================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
// ================================

export const initialActiveCraft: ActiveCraft = {
  recipeId: null,
  weaponName: 'Нет активного крафта',
  progress: 0,
  startTime: null,
  endTime: null,
  quality: 0,
}

export const initialActiveRefining: ActiveRefining = {
  recipeId: null,
  resourceName: 'Нет активной переработки',
  progress: 0,
  startTime: null,
  endTime: null,
  amount: 0,
}

export const initialWeaponInventory: WeaponInventory = {
  weapons: [],
  maxSlots: 20,
}

export const initialUnlockedRecipes: UnlockedRecipes = {
  weaponRecipes: ['iron_sword', 'iron_dagger', 'iron_axe', 'iron_mace', 'iron_spear', 'iron_hammer'],
  refiningRecipes: ['iron_ingot', 'copper_ingot', 'tin_ingot', 'wood_planks', 'stone_blocks'],
}

// ================================
// SLICE
// ================================

export const createCraftSlice: StateCreator<
  CraftSlice,
  [],
  [],
  CraftSlice
> = (set, get) => ({
  // State
  activeCraft: initialActiveCraft,
  activeRefining: initialActiveRefining,
  weaponInventory: initialWeaponInventory,
  unlockedRecipes: initialUnlockedRecipes,
  recipeSources: [],
  unlockedEnchantments: [],

  // Actions - Крафт
  startCraft: (recipe) => {
    const state = get()
    if (state.activeCraft.recipeId) return false
    if (!state.isRecipeUnlocked(recipe.id)) return false
    // Проверка ресурсов и уровня делается в game-store
    
    const now = Date.now()
    const endTime = now + recipe.baseCraftTime * 1000
    
    set({
      activeCraft: {
        recipeId: recipe.id,
        weaponName: recipe.name,
        progress: 0,
        startTime: now,
        endTime: endTime,
        quality: 0,
      }
    })
    return true
  },

  updateCraftProgress: (progress) => set((state) => ({
    activeCraft: { ...state.activeCraft, progress: Math.min(100, progress) }
  })),

  completeCraft: () => {
    const state = get()
    if (!state.activeCraft.recipeId) return null
    
    // Создание оружия делается в game-store где есть доступ к recipe и player
    return null
  },

  isCrafting: () => get().activeCraft.recipeId !== null,

  // Actions - Переработка
  startRefining: (recipe, amount) => {
    const state = get()
    if (state.activeRefining.recipeId) return false
    // Проверка ресурсов делается в game-store
    
    const now = Date.now()
    const endTime = now + recipe.processTime * 1000 * amount
    
    set({
      activeRefining: {
        recipeId: recipe.id,
        resourceName: recipe.name,
        progress: 0,
        startTime: now,
        endTime: endTime,
        amount,
      }
    })
    return true
  },

  updateRefiningProgress: (progress) => set((state) => ({
    activeRefining: { ...state.activeRefining, progress: Math.min(100, progress) }
  })),

  completeRefining: () => {
    const state = get()
    if (!state.activeRefining.recipeId) return false
    
    // Начисление ресурсов делается в game-store
    set({ activeRefining: initialActiveRefining })
    return true
  },

  isRefining: () => get().activeRefining.recipeId !== null,

  // Actions - Инвентарь
  sellWeapon: (weaponId) => {
    const state = get()
    const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
    if (!weapon) return false
    
    // Начисление золота делается в game-store
    set((state) => ({
      weaponInventory: {
        ...state.weaponInventory,
        weapons: state.weaponInventory.weapons.filter(w => w.id !== weaponId),
      }
    }))
    return true
  },

  getWeaponById: (weaponId) => get().weaponInventory.weapons.find(w => w.id === weaponId),

  addWeapon: (weapon) => set((state) => ({
    weaponInventory: {
      ...state.weaponInventory,
      weapons: [...state.weaponInventory.weapons, weapon],
    }
  })),

  removeWeapon: (weaponId) => {
    const state = get()
    const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
    if (!weapon) return false
    
    set((state) => ({
      weaponInventory: {
        ...state.weaponInventory,
        weapons: state.weaponInventory.weapons.filter(w => w.id !== weaponId),
      }
    }))
    return true
  },

  // Actions - Рецепты
  unlockRecipe: (recipeId, source) => {
    const state = get()
    if (state.unlockedRecipes.weaponRecipes.includes(recipeId) ||
        state.unlockedRecipes.refiningRecipes.includes(recipeId)) {
      return false
    }
    
    // Определение типа рецепта делается в game-store
    
    const newSource: RecipeSource = {
      recipeId,
      source,
      obtainedAt: Date.now(),
    }
    
    set((state) => ({
      recipeSources: [...state.recipeSources, newSource],
    }))
    
    return true
  },

  isRecipeUnlocked: (recipeId) => {
    const state = get()
    return state.unlockedRecipes.weaponRecipes.includes(recipeId) ||
           state.unlockedRecipes.refiningRecipes.includes(recipeId)
  },

  getRecipeSource: (recipeId) => get().recipeSources.find(s => s.recipeId === recipeId),

  // Actions - Зачарования
  unlockEnchantment: (enchantmentId) => {
    const state = get()
    if (state.unlockedEnchantments.includes(enchantmentId)) return false
    
    set((state) => ({
      unlockedEnchantments: [...state.unlockedEnchantments, enchantmentId]
    }))
    return true
  },

  isEnchantmentUnlocked: (enchantmentId) => get().unlockedEnchantments.includes(enchantmentId),

  // Actions - Война душ
  addWarSoulToWeapon: (weaponId, points, durabilityLoss = 5, epicGain = 0.05) => {
    const state = get()
    const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
    if (!weapon) return false
    
    const newDurability = Math.max(0, weapon.durability - durabilityLoss)
    const newEpicMultiplier = Math.min(5.0, weapon.epicMultiplier + epicGain)
    
    set((state) => ({
      weaponInventory: {
        ...state.weaponInventory,
        weapons: state.weaponInventory.weapons.map(w => 
          w.id === weaponId ? {
            ...w,
            warSoul: w.warSoul + points,
            durability: newDurability,
            epicMultiplier: newEpicMultiplier,
            adventureCount: w.adventureCount + 1,
          } : w
        ),
      }
    }))
    return true
  },
})

// ================================
// ЭКСПОРТ УТИЛИТ (для game-store)
// ================================

// Реэкспорт утилит для использования в game-store
export { generateId, getQualityGrade, getQualityMultiplier }

// Экспорт типов для использования в game-store
// Re-export all types for Turbopack compatibility
export type {
  ActiveCraft,
  ActiveRefining,
  WeaponInventory,
  UnlockedRecipes,
  RecipeSource,
  WeaponEnchantment,
  WeaponMaterialUsed,
  CraftedWeapon,
  CraftSlice,
  CraftState,
  CraftActions,
  WeaponType,
  WeaponTier,
  WeaponMaterial,
  QualityGrade,
}

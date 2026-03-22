/**
 * Store Utilities - Types
 * Общие типы для утилит store
 */

import { ResourceKey } from '@/store/slices/resources-slice'

// ================================
// БАЗОВЫЕ ТИПЫ
// ================================

/** Результат операции с ресурсами */
export interface ResourceOperationResult {
  success: boolean
  newResources?: Record<ResourceKey, number>
  error?: string
}

/** Результат с начислением золота */
export interface GoldTransactionResult {
  success: boolean
  goldChange: number
  resourceChange?: Partial<Record<ResourceKey, number>>
  error?: string
}

/** Информация о стоимости */
export interface CostInfo {
  gold: number
  resources: Partial<Record<ResourceKey, number>>
}

/** Результат генерации */
export interface GenerationResult<T> {
  data: T
  cost?: CostInfo
}

// ================================
// ТИПЫ ДЛЯ ИГРОКА
// ================================

export interface LevelUpResult {
  newLevel: number
  newExperience: number
  newExperienceToNext: number
  newTitle: string
  fameGained: number
  levelsGained: number
}

export interface PlayerTitleInfo {
  level: number
  title: string
}

// ================================
// ТИПЫ ДЛЯ РАБОЧИХ
// ================================

export interface WorkerHireParams {
  workerClass: 'apprentice' | 'blacksmith' | 'miner' | 'woodcutter'
  currentWorkerCount: number
  currentClassCount: number
  maxWorkers: number
  availableGold: number
}

export interface WorkerHireResult {
  success: boolean
  cost: number
  worker?: {
    id: string
    name: string
    class: string
    level: number
    stamina: number
    stats: {
      speed: number
      quality: number
      stamina_max: number
      intelligence: number
      loyalty: number
    }
  }
  error?: string
}

export interface WorkerLevelUpResult {
  newLevel: number
  newExperience: number
  statsBonus: {
    speed: number
    quality: number
    stamina_max: number
    intelligence: number
    loyalty: number
  }
}

// ================================
// ТИПЫ ДЛЯ КРАФТА
// ================================

export interface CraftStartParams {
  recipeId: string
  recipeName: string
  baseCraftTime: number
  canAfford: boolean
  isRecipeUnlocked: boolean
  playerLevel: number
  requiredLevel: number
  isAlreadyCrafting: boolean
}

export interface CraftStartResult {
  success: boolean
  startTime: number
  endTime: number
  error?: string
}

export interface CraftCompletionParams {
  recipeId: string
  recipeName: string
  recipeType: string
  recipeTier: string
  recipeMaterial: string
  recipeBaseSellPrice: number
  workersQuality: number
  playerLevel: number
}

export interface CraftedWeaponResult {
  id: string
  recipeId: string
  name: string
  type: string
  tier: string
  material: string
  quality: number
  qualityGrade: string
  attack: number
  durability: number
  maxDurability: number
  sellPrice: number
  createdAt: number
  warSoul: number
  adventureCount: number
  epicMultiplier: number
  materials: Record<string, number>
  primaryMaterial: string
}

// ================================
// ТИПЫ ДЛЯ ПЕРЕРАБОТКИ
// ================================

export interface RefiningStartParams {
  recipeId: string
  recipeName: string
  processTime: number
  amount: number
  hasResources: boolean
  hasCoal: boolean
  playerLevel: number
  requiredLevel: number
  isAlreadyRefining: boolean
}

export interface RefiningStartResult {
  success: boolean
  startTime: number
  endTime: number
  error?: string
}

// ================================
// ТИПЫ ДЛЯ ЗАЧАРОВАНИЯ
// ================================

export interface SacrificeResult {
  soulEssence: number
  bonusGold: number
}

export interface EnchantParams {
  weaponId: string
  enchantmentId: string
  isUnlocked: boolean
  currentEnchantments: string[]
  maxEnchantments: number
  isCompatible: boolean
}

export interface EnchantResult {
  success: boolean
  newEnchantment: {
    id: string
    enchantmentId: string
    appliedAt: number
  } | null
  error?: string
}

// ================================
// ТИПЫ ДЛЯ ЗАКАЗОВ
// ================================

export interface OrderCompletionParams {
  orderId: string
  weaponId: string
  weaponQuality: number
  weaponAttack: number
  weaponType: string
  weaponRecipeId: string
  orderMinQuality: number
  orderMinAttack?: number
  orderMaterial?: string
  orderWeaponType: string
  orderGoldReward: number
  orderFameReward: number
  orderBonusItems?: { resource: string; amount: number }[]
}

export interface OrderCompletionResult {
  success: boolean
  goldEarned: number
  fameEarned: number
  bonusItems?: { resource: string; amount: number }[]
  error?: string
}

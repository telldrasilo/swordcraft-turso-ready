/**
 * Craft Utilities
 * Чистые функции для логики крафта, переработки и инвентаря
 */

import { generateId } from './generators'
import {
  QUALITY_GRADES,
  TIER_MULTIPLIERS,
  BASE_WEAPON_DURABILITY,
  BASE_EPIC_MULTIPLIER,
} from './constants'
import type {
  CraftStartParams,
  CraftStartResult,
  CraftedWeaponResult,
  RefiningStartParams,
  RefiningStartResult,
} from './types'
import { ResourceKey } from '@/store/slices/resources-slice'

// ================================
// КАЧЕСТВО ОРУЖИЯ
// ================================

/**
 * Получить градацию качества по значению
 */
export function getQualityGrade(quality: number): string {
  const grade = QUALITY_GRADES.find(g => quality >= g.min && quality <= g.max)
  return grade?.grade ?? 'normal'
}

/**
 * Получить множитель качества
 */
export function getQualityMultiplier(quality: number): number {
  const grade = QUALITY_GRADES.find(g => quality >= g.min && quality <= g.max)
  return grade?.multiplier ?? 1.0
}

/**
 * Рассчитать качество крафта
 */
export function calculateCraftQuality(
  workersQuality: number,
  playerLevel: number,
  recipeTier: string | number
): number {
  const tierNum = typeof recipeTier === 'string'
    ? Object.keys(TIER_MULTIPLIERS).indexOf(recipeTier) + 1
    : recipeTier

  // Базовое качество = среднее между качеством рабочих и уровнем игрока
  const baseQuality = (workersQuality + playerLevel * 2) / 2

  // Случайный разброс ±15%
  const variance = 0.15
  const randomFactor = 1 + (Math.random() * 2 - 1) * variance

  // Штраф за высокий тир (сложнее сделать качественно)
  const tierPenalty = Math.max(0.5, 1 - (tierNum - 1) * 0.1)

  const finalQuality = Math.floor(baseQuality * randomFactor * tierPenalty)

  return Math.max(5, Math.min(100, finalQuality))
}

// ================================
// АТАКА ОРУЖИЯ
// ================================

/**
 * Рассчитать атаку оружия
 */
export function calculateAttack(
  weaponType: string,
  tier: string | number,
  material: string,
  quality: number
): number {
  // Базовая атака по типу оружия
  const baseAttackByType: Record<string, number> = {
    sword: 10,
    dagger: 6,
    axe: 12,
    mace: 11,
    spear: 9,
    hammer: 13,
    bow: 8,
    staff: 7,
  }

  const tierStr = typeof tier === 'string' ? tier : Object.keys(TIER_MULTIPLIERS)[tier - 1] || 'common'
  const tierMult = TIER_MULTIPLIERS[tierStr] || 1

  // Множитель материала
  const materialMult = getMaterialMultiplier(material)

  // Множитель качества
  const qualityMult = getQualityMultiplier(quality)

  const baseAttack = baseAttackByType[weaponType] || 10

  return Math.floor(baseAttack * tierMult * materialMult * qualityMult)
}

/**
 * Получить множитель материала
 */
function getMaterialMultiplier(material: string): number {
  const materialMultipliers: Record<string, number> = {
    iron: 1.0,
    bronze: 1.1,
    steel: 1.3,
    silver: 1.2,
    gold: 1.15,
    mithril: 1.5,
    copper: 0.9,
    tin: 0.8,
  }
  return materialMultipliers[material] || 1.0
}

// ================================
// ЦЕНА ОРУЖИЯ
// ================================

/**
 * Рассчитать цену продажи оружия
 */
export function calculateSellPrice(
  baseSellPrice: number,
  quality: number,
  tier: string | number
): number {
  const tierStr = typeof tier === 'string' ? tier : Object.keys(TIER_MULTIPLIERS)[tier - 1] || 'common'
  const tierMult = TIER_MULTIPLIERS[tierStr] || 1
  const qualityMult = getQualityMultiplier(quality)

  return Math.floor(baseSellPrice * tierMult * qualityMult)
}

// ================================
// КРАФТ
// ================================

/**
 * Проверить возможность начала крафта
 */
export function canStartCraft(params: CraftStartParams): { can: boolean; reason: string } {
  if (params.isAlreadyCrafting) {
    return { can: false, reason: 'Уже что-то крафтится' }
  }

  if (!params.isRecipeUnlocked) {
    return { can: false, reason: 'Рецепт не разблокирован' }
  }

  if (!params.canAfford) {
    return { can: false, reason: 'Недостаточно ресурсов' }
  }

  if (params.playerLevel < params.requiredLevel) {
    return { can: false, reason: `Требуется уровень ${params.requiredLevel}` }
  }

  return { can: true, reason: '' }
}

/**
 * Начать крафт
 */
export function startCraft(params: CraftStartParams): CraftStartResult {
  const check = canStartCraft(params)

  if (!check.can) {
    return {
      success: false,
      startTime: 0,
      endTime: 0,
      error: check.reason,
    }
  }

  const now = Date.now()
  const endTime = now + params.baseCraftTime * 1000

  return {
    success: true,
    startTime: now,
    endTime,
  }
}

/**
 * Создать оружие после завершения крафта
 */
export function createWeapon(params: {
  recipeId: string
  recipeName: string
  recipeType: string
  recipeTier: string | number
  recipeMaterial: string
  recipeBaseSellPrice: number
  recipeCost: Partial<Record<ResourceKey, number>>
  workersQuality: number
  playerLevel: number
}): CraftedWeaponResult {
  const quality = calculateCraftQuality(
    params.workersQuality,
    params.playerLevel,
    params.recipeTier
  )

  const tierStr = typeof params.recipeTier === 'string'
    ? params.recipeTier
    : Object.keys(TIER_MULTIPLIERS)[params.recipeTier - 1] || 'common'

  return {
    id: generateId(),
    recipeId: params.recipeId,
    name: params.recipeName,
    type: params.recipeType,
    tier: tierStr,
    material: params.recipeMaterial,
    quality,
    qualityGrade: getQualityGrade(quality),
    attack: calculateAttack(
      params.recipeType,
      params.recipeTier,
      params.recipeMaterial,
      quality
    ),
    durability: BASE_WEAPON_DURABILITY,
    maxDurability: BASE_WEAPON_DURABILITY,
    sellPrice: calculateSellPrice(
      params.recipeBaseSellPrice,
      quality,
      params.recipeTier
    ),
    createdAt: Date.now(),
    warSoul: 0,
    adventureCount: 0,
    epicMultiplier: BASE_EPIC_MULTIPLIER,
    materials: { ...params.recipeCost },
    primaryMaterial: params.recipeMaterial,
  }
}

/**
 * Рассчитать опыт за крафт
 */
export function calculateCraftExperience(quality: number): number {
  return Math.floor(quality / 5) + 5
}

// ================================
// ПЕРЕРАБОТКА
// ================================

/**
 * Проверить возможность переработки
 */
export function canRefine(
  params: RefiningStartParams & {
    resources: Partial<Record<ResourceKey, number>>
    coalAmount: number
  }
): { can: boolean; reason: string } {
  if (params.isAlreadyRefining) {
    return { can: false, reason: 'Уже что-то перерабатывается' }
  }

  if (!params.hasResources) {
    return { can: false, reason: 'Недостаточно материалов' }
  }

  if (!params.hasCoal) {
    return { can: false, reason: 'Недостаточно угля' }
  }

  if (params.playerLevel < params.requiredLevel) {
    return { can: false, reason: `Требуется уровень ${params.requiredLevel}` }
  }

  return { can: true, reason: '' }
}

/**
 * Начать переработку
 */
export function startRefining(params: RefiningStartParams): RefiningStartResult {
  if (params.isAlreadyRefining) {
    return {
      success: false,
      startTime: 0,
      endTime: 0,
      error: 'Уже что-то перерабатывается',
    }
  }

  const now = Date.now()
  const endTime = now + params.processTime * 1000 * params.amount

  return {
    success: true,
    startTime: now,
    endTime,
  }
}

/**
 * Рассчитать опыт за переработку
 */
export function calculateRefiningExperience(amount: number): number {
  return 2 * amount
}

// ================================
// РЕЦЕПТЫ
// ================================

/**
 * Проверить, разблокирован ли рецепт
 */
export function isRecipeUnlocked(
  recipeId: string,
  weaponRecipes: string[],
  refiningRecipes: string[]
): boolean {
  return weaponRecipes.includes(recipeId) || refiningRecipes.includes(recipeId)
}

/**
 * Определить тип рецепта
 */
export function getRecipeType(
  recipeId: string,
  weaponRecipeIds: string[],
  refiningRecipeIds: string[]
): 'weapon' | 'refining' | null {
  if (weaponRecipeIds.includes(recipeId)) return 'weapon'
  if (refiningRecipeIds.includes(recipeId)) return 'refining'
  return null
}

// ================================
// ПРОГРЕСС
// ================================

/**
 * Рассчитать прогресс крафта/переработки
 */
export function calculateProgress(
  startTime: number,
  endTime: number,
  currentTime: number = Date.now()
): number {
  if (currentTime >= endTime) return 100
  if (currentTime <= startTime) return 0

  const totalDuration = endTime - startTime
  const elapsed = currentTime - startTime

  return Math.min(100, (elapsed / totalDuration) * 100)
}

/**
 * Проверить, завершён ли процесс
 */
export function isProcessComplete(endTime: number, currentTime: number = Date.now()): boolean {
  return currentTime >= endTime
}

/**
 * Получить оставшееся время в секундах
 */
export function getRemainingTime(endTime: number, currentTime: number = Date.now()): number {
  return Math.max(0, Math.ceil((endTime - currentTime) / 1000))
}

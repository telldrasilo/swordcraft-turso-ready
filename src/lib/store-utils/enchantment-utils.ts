/**
 * Enchantment Utilities
 * Чистые функции для логики зачарований и жертвования оружия
 */

import { generateId } from './generators'
import { MAX_ENCHANTMENTS_PER_WEAPON, TIER_MULTIPLIERS } from './constants'
import type { SacrificeResult, EnchantParams, EnchantResult } from './types'

// ================================
// ЖЕРТВОВАНИЕ ОРУЖИЯ
// ================================

/**
 * Рассчитать ценность оружия при жертвовании
 */
export function calculateSacrificeValue(
  quality: number,
  tier: string,
  warSoul: number,
  epicMultiplier: number = 1
): SacrificeResult {
  const tierMult = TIER_MULTIPLIERS[tier] || 1

  // Базовая эссенция души
  const baseSoulEssence = Math.floor((quality / 10) * tierMult)

  // Бонус за душу войны
  const warSoulBonus = Math.floor(warSoul / 5)

  // Бонус за эпичность
  const epicBonus = Math.floor(baseSoulEssence * (epicMultiplier - 1))

  // Золото (меньше, чем продажа)
  const bonusGold = Math.floor(quality * tierMult * 0.5)

  return {
    soulEssence: baseSoulEssence + warSoulBonus + epicBonus,
    bonusGold,
  }
}

/**
 * Проверить возможность жертвования
 */
export function canSacrifice(
  hasWeapon: boolean,
  isWeaponInExpedition: boolean
): { can: boolean; reason: string } {
  if (!hasWeapon) {
    return { can: false, reason: 'Оружие не найдено' }
  }

  if (isWeaponInExpedition) {
    return { can: false, reason: 'Оружие в экспедиции' }
  }

  return { can: true, reason: '' }
}

// ================================
// РАЗБЛОКИРОВКА ЗАЧАРОВАНИЙ
// ================================

/**
 * Проверить возможность разблокировки зачарования
 */
export function canUnlockEnchantment(params: {
  soulEssenceCost: number
  goldCost: number
  requiredLevel: number
  requiredFame: number
  currentSoulEssence: number
  currentGold: number
  currentLevel: number
  currentFame: number
  isAlreadyUnlocked: boolean
}): { can: boolean; reason: string } {
  if (params.isAlreadyUnlocked) {
    return { can: false, reason: 'Зачарование уже разблокировано' }
  }

  if (params.currentLevel < params.requiredLevel) {
    return { can: false, reason: `Требуется уровень ${params.requiredLevel}` }
  }

  if (params.currentFame < params.requiredFame) {
    return { can: false, reason: `Требуется слава ${params.requiredFame}` }
  }

  if (params.currentSoulEssence < params.soulEssenceCost) {
    return { can: false, reason: 'Недостаточно эссенции души' }
  }

  if (params.currentGold < params.goldCost) {
    return { can: false, reason: 'Недостаточно золота' }
  }

  return { can: true, reason: '' }
}

// ================================
// ЗАЧАРОВАНИЕ ОРУЖИЯ
// ================================

/**
 * Проверить возможность зачарования
 */
export function canEnchant(params: EnchantParams): { can: boolean; reason: string } {
  if (!params.isUnlocked) {
    return { can: false, reason: 'Зачарование не разблокировано' }
  }

  if (params.currentEnchantments.length >= params.maxEnchantments) {
    return { can: false, reason: 'Достигнут лимит зачарований' }
  }

  if (params.currentEnchantments.includes(params.enchantmentId)) {
    return { can: false, reason: 'Это зачарование уже наложено' }
  }

  if (!params.isCompatible) {
    return { can: false, reason: 'Зачарования несовместимы' }
  }

  return { can: true, reason: '' }
}

/**
 * Наложить зачарование
 */
export function applyEnchantment(params: EnchantParams): EnchantResult {
  const check = canEnchant(params)

  if (!check.can) {
    return {
      success: false,
      newEnchantment: null,
      error: check.reason,
    }
  }

  return {
    success: true,
    newEnchantment: {
      id: generateId(),
      enchantmentId: params.enchantmentId,
      appliedAt: Date.now(),
    },
  }
}

/**
 * Проверить совместимость зачарований
 */
export function areEnchantmentsCompatible(
  currentEnchantments: { enchantmentId: string }[],
  newEnchantmentId: string,
  incompatibleMap: Record<string, string[]>
): boolean {
  const currentIds = currentEnchantments.map(e => e.enchantmentId)
  const incompatible = incompatibleMap[newEnchantmentId] || []

  for (const existingId of currentIds) {
    if (incompatible.includes(existingId)) {
      return false
    }
    // Проверяем обратную несовместимость
    const existingIncompatible = incompatibleMap[existingId] || []
    if (existingIncompatible.includes(newEnchantmentId)) {
      return false
    }
  }

  return true
}

// ================================
// УДАЛЕНИЕ ЗАЧАРОВАНИЯ
// ================================

/**
 * Проверить возможность удаления зачарования
 */
export function canRemoveEnchantment(params: {
  weaponId: string
  enchantmentId: string
  hasEnchantment: boolean
}): { can: boolean; reason: string } {
  if (!params.hasEnchantment) {
    return { can: false, reason: 'Зачарование не найдено на оружии' }
  }

  return { can: true, reason: '' }
}

// ================================
// ДУША ВОЙНЫ
// ================================

/**
 * Добавить душу войны к оружию
 */
export function addWarSoul(
  currentWarSoul: number,
  pointsToAdd: number,
  currentDurability: number,
  durabilityLoss: number = 5,
  currentEpicMultiplier: number = 1,
  epicGain: number = 0.05
): {
  newWarSoul: number
  newDurability: number
  newEpicMultiplier: number
} {
  return {
    newWarSoul: currentWarSoul + pointsToAdd,
    newDurability: Math.max(0, currentDurability - durabilityLoss),
    newEpicMultiplier: Math.min(5.0, currentEpicMultiplier + epicGain),
  }
}

/**
 * Рассчитать бонус атаки от души войны
 */
export function calculateWarSoulAttackBonus(warSoul: number): number {
  // Каждые 10 единиц души войны = +1 к атаке
  return Math.floor(warSoul / 10)
}

/**
 * Рассчитать бонус к качеству от эпичности
 */
export function calculateEpicQualityBonus(epicMultiplier: number): number {
  return Math.floor((epicMultiplier - 1) * 50)
}

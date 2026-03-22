/**
 * Repair Utilities
 * Функции для системы ремонта оружия
 * Вынесено из game-store-composed.ts для уменьшения размера
 */

import { ResourceKey } from '@/store/slices/resources-slice'
import { Worker } from '@/store/slices/workers-slice'
import {
  RepairOption,
  RepairType,
  ExecuteRepairResult,
  getRepairOptions as calculateRepairOptions,
  executeRepair as executeWeaponRepairLogic,
} from '@/data/repair-system'

// ================================
// ТИПЫ
// ================================

export interface WeaponForRepair {
  id: string
  tier: string
  durability: number
  maxDurability: number
  warSoul: number
  attack: number
  epicMultiplier: number
  quality: number
}

export interface RepairCosts {
  goldCost: number
  materials: Partial<Record<ResourceKey, number>>
  staminaCost: number
}

export interface RepairResult {
  success: boolean
  durabilityRestored: number
  maxDurabilityAfter: number
  soulLost: number
  attackLost: number
  epicLost: number
}

// ================================
// КОНСТАНТЫ
// ================================

const TIER_MULTIPLIERS: Record<string, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2,
  epic: 3,
  legendary: 5,
  mythic: 8
}

// ================================
// ФУНКЦИИ
// ================================

/**
 * Найти лучшего кузнеца для ремонта
 */
export function findBestBlacksmith(workers: Worker[]): Worker | null {
  const blacksmiths = workers.filter(w => w.class === 'blacksmith')
  if (blacksmiths.length === 0) return null
  return blacksmiths.sort((a, b) => b.level - a.level)[0]
}

/**
 * Получить опции ремонта для оружия
 */
export function getRepairOptionsForWeapon(
  weapon: WeaponForRepair,
  blacksmith: Worker | null
): RepairOption[] {
  return calculateRepairOptions(weapon, blacksmith)
}

/**
 * Рассчитать стоимость ремонта
 */
export function calculateRepairCost(
  weapon: WeaponForRepair,
  playerLevel: number
): number {
  const durabilityLost = (weapon.maxDurability ?? 100) - (weapon.durability ?? 100)
  if (durabilityLost <= 0) return 0

  const tierMult = TIER_MULTIPLIERS[weapon.tier] || 1
  const baseCost = durabilityLost * tierMult
  const playerDiscount = Math.min(0.5, playerLevel * 0.05)

  return Math.floor(baseCost * (1 - playerDiscount))
}

/**
 * Рассчитать максимальный процент восстановления
 */
export function calculateMaxRepairPercent(playerLevel: number): number {
  const maxRepair = 50 + (playerLevel * 5)
  return Math.min(100, maxRepair)
}

/**
 * Проверить возможность ремонта
 */
export function canRepair(
  weapon: WeaponForRepair,
  gold: number,
  resources: Partial<Record<ResourceKey, number>>,
  playerLevel: number
): { can: boolean; reason: string } {
  const currentDurability = weapon.durability ?? 100
  const maxDurability = weapon.maxDurability ?? 100

  if (currentDurability >= maxDurability) {
    return { can: false, reason: 'Оружие не требует ремонта' }
  }

  const cost = calculateRepairCost(weapon, playerLevel)
  if (gold < cost) {
    return { can: false, reason: 'Недостаточно золота' }
  }

  return { can: true, reason: '' }
}

/**
 * Выполнить ремонт оружия
 */
export function executeRepair(
  weapon: WeaponForRepair,
  repairType: RepairType,
  blacksmith: Worker | null,
  gold: number,
  resources: Partial<Record<ResourceKey, number>>
): ExecuteRepairResult {
  const options = calculateRepairOptions(weapon, blacksmith)
  const option = options.find(o => o.type === repairType)

  if (!option) {
    return { success: false, error: 'Опция ремонта недоступна' }
  }

  // Проверка материалов
  for (const [mat, amount] of Object.entries(option.materials)) {
    const resourceKey = mat as ResourceKey
    if ((resources[resourceKey] || 0) < (amount || 0)) {
      return { success: false, error: `Недостаточно материалов: ${mat}` }
    }
  }

  // Проверка золота
  if (gold < option.goldCost) {
    return { success: false, error: 'Недостаточно золота' }
  }

  // Проверка выносливости
  if (blacksmith && blacksmith.stamina < option.staminaCost) {
    return { success: false, error: 'У кузнеца недостаточно сил' }
  }

  return executeWeaponRepairLogic(weapon, option, blacksmith)
}

/**
 * Рассчитать материалы для вычитания
 */
export function getMaterialDeductions(
  repairType: RepairType,
  weapon: WeaponForRepair,
  blacksmith: Worker | null
): Partial<Record<ResourceKey, number>> {
  const options = calculateRepairOptions(weapon, blacksmith)
  const option = options.find(o => o.type === repairType)
  return option?.materials || {}
}

/**
 * Применить результат ремонта к оружию
 */
export function applyRepairToWeapon(
  weapon: WeaponForRepair,
  result: RepairResult
): WeaponForRepair {
  return {
    ...weapon,
    durability: Math.min(100, weapon.durability + result.durabilityRestored),
    maxDurability: result.maxDurabilityAfter,
    warSoul: Math.max(0, weapon.warSoul - result.soulLost),
    attack: Math.max(1, weapon.attack - result.attackLost),
    epicMultiplier: Math.max(1, weapon.epicMultiplier - result.epicLost),
  }
}

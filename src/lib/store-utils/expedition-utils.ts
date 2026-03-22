/**
 * Expedition Utilities
 * Функции для завершения экспедиций
 * Вынесено из game-store-composed.ts для уменьшения размера
 */

import { ActiveExpedition, RecoveryQuest, GuildState } from '@/types/guild'
import { AdventurerExtended } from '@/types/adventurer-extended'
import { MissionResultForStats, KnownAdventurer } from '@/types/known-adventurer'
import { updateKnownAdventurer } from '@/lib/known-adventurers-manager'
import {
  calculateExpeditionResult as calculateExpeditionResultV2,
  ExpeditionCalculation,
} from '@/lib/expedition-calculator-v2'
import {
  ExpeditionTemplate,
  expeditionTemplates,
  calculateCommission,
  calculateWarSoul,
  calculateSuccessChance,
  calculateWeaponLossChance,
} from '@/data/expedition-templates'

// ================================
// ТИПЫ
// ================================

export interface WeaponForExpedition {
  id: string
  name: string
  type: string
  attack: number
  quality: number
  durability: number
  warSoul: number
  epicMultiplier: number
}

export interface ExpeditionCompletionParams {
  expedition: ActiveExpedition
  guildLevel: number
  weapon?: WeaponForExpedition
}

export interface ExpeditionCompletionResult {
  success: boolean
  commission: number
  warSoul: number
  glory: number
  weaponWear: number
  weaponLost: boolean
  isCrit: boolean
  newKnownAdventurers?: KnownAdventurer[]
}

// ================================
// ГЕНЕРАЦИЯ ID
// ================================

const generateId = (): string => Math.random().toString(36).substring(2, 9)

// ================================
// ОСНОВНЫЕ ФУНКЦИИ
// ================================

/**
 * Рассчитать результат экспедиции
 */
export function calculateExpeditionOutcome(
  params: ExpeditionCompletionParams
): ExpeditionCompletionResult {
  const { expedition, guildLevel, weapon } = params
  const template = expeditionTemplates.find(t => t.id === expedition.expeditionId)
  
  if (!template) {
    return {
      success: false,
      commission: 0,
      warSoul: 0,
      glory: 0,
      weaponWear: 0,
      weaponLost: false,
      isCrit: false,
    }
  }

  const extendedAdventurer = expedition.adventurerExtended

  let success: boolean
  let commission: number
  let warSoul: number
  let gloryGained: number
  let weaponLost: boolean
  let weaponWear: number
  let isCrit = false

  if (extendedAdventurer && weapon) {
    // Новая система расчёта через модификаторы
    const calculation = calculateExpeditionResultV2(
      extendedAdventurer,
      template,
      guildLevel,
      weapon.attack,
      weapon.quality,
      weapon.type,
      weapon.id
    )

    const roll = Math.random() * 100
    success = roll < calculation.successChance

    isCrit = success && Math.random() * 100 < calculation.critChance
    const critMultiplier = isCrit ? 2 : 1

    commission = success ? Math.floor(calculation.commission * critMultiplier) : 0
    warSoul = success ? Math.floor(calculation.warSoul * critMultiplier) : 0
    gloryGained = success ? Math.floor((5 + Math.random() * 5) * critMultiplier) : 1

    weaponLost = !success && Math.random() * 100 < calculation.weaponLossChance
    weaponWear = calculation.weaponWear
  } else {
    // Fallback на старую систему
    const weaponAttack = weapon?.attack || 10
    const successChance = calculateSuccessChance(template, weaponAttack, 0)
    const roll = Math.random() * 100
    success = roll < successChance

    const weaponLossChance = calculateWeaponLossChance(template, weapon?.quality || 50, 0)
    weaponLost = !success && Math.random() * 100 < weaponLossChance

    commission = success ? calculateCommission(template, guildLevel, 0) : 0
    warSoul = success ? calculateWarSoul(template, 10, weapon?.quality || 50) : 0
    gloryGained = success ? 5 + Math.floor(Math.random() * 5) : 1
    weaponWear = success ? 5 + Math.floor(Math.random() * 10) : 20
  }

  return {
    success,
    commission,
    warSoul,
    glory: gloryGained,
    weaponWear,
    weaponLost,
    isCrit,
  }
}

/**
 * Обновить базу известных искателей после экспедиции
 */
export function updateKnownAdventurersAfterMission(
  knownAdventurers: KnownAdventurer[],
  extendedAdventurer: AdventurerExtended | undefined,
  result: ExpeditionCompletionResult,
  weaponType?: string
): KnownAdventurer[] {
  if (!extendedAdventurer) return knownAdventurers

  const missionResult: MissionResultForStats = {
    success: result.success,
    gold: result.commission,
    warSoul: result.warSoul,
    weaponType: weaponType as any,
  }

  return updateKnownAdventurer(knownAdventurers, extendedAdventurer, missionResult)
}

/**
 * Создать квест восстановления для потерянного оружия
 */
export function createRecoveryQuest(
  expedition: ActiveExpedition,
  template: ExpeditionTemplate,
  weapon: WeaponForExpedition
): RecoveryQuest {
  return {
    id: generateId(),
    lostWeaponId: weapon.id,
    lostWeaponData: weapon as any,
    originalExpeditionId: expedition.expeditionId,
    originalExpeditionName: expedition.expeditionName,
    cost: Math.floor(template.cost.deposit * 0.5),
    duration: template.duration * 2 * 1000,
    status: 'available',
  }
}

/**
 * Создать запись истории экспедиции
 */
export function createHistoryEntry(
  expedition: ActiveExpedition,
  result: ExpeditionCompletionResult
): GuildState['history'][0] {
  return {
    id: generateId(),
    expeditionName: expedition.expeditionName,
    expeditionIcon: expedition.expeditionIcon,
    adventurerName: expedition.adventurerName,
    adventurerData: expedition.adventurerData,
    adventurerExtended: expedition.adventurerExtended,
    weaponName: expedition.weaponName,
    completedAt: Date.now(),
    success: result.success,
    commission: result.commission,
    warSoul: result.warSoul,
    glory: result.glory,
    weaponLost: result.weaponLost,
  }
}

/**
 * Обновить статистику гильдии после экспедиции
 */
export function updateGuildStats(
  stats: GuildState['stats'],
  result: ExpeditionCompletionResult
): GuildState['stats'] {
  return {
    ...stats,
    totalExpeditions: stats.totalExpeditions + 1,
    successfulExpeditions: result.success
      ? stats.successfulExpeditions + 1
      : stats.successfulExpeditions,
    failedExpeditions: !result.success
      ? stats.failedExpeditions + 1
      : stats.failedExpeditions,
    weaponsLost: result.weaponLost
      ? stats.weaponsLost + 1
      : stats.weaponsLost,
    totalCommission: stats.totalCommission + result.commission,
    totalWarSoul: stats.totalWarSoul + result.warSoul,
    totalGlory: (stats.totalGlory ?? 0) + result.glory,
  }
}

/**
 * Рассчитать экспедицию для предпросмотра
 */
export function calculateExpeditionPreview(
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate,
  weapon: WeaponForExpedition,
  guildLevel: number
): ExpeditionCalculation {
  return calculateExpeditionResultV2(
    adventurer,
    expedition,
    guildLevel,
    weapon.attack,
    weapon.quality,
    weapon.type,
    weapon.id
  )
}

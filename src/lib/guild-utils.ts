/**
 * Утилиты для гильдии
 */

import {
  Adventurer,
  ActiveExpedition,
  RecoveryQuest,
  ExpeditionHistoryEntry,
  GuildStats,
  GuildState,
  getGuildLevel,
  GUILD_LEVELS,
} from '@/types/guild'
import { CraftedWeapon } from '@/data/weapon-recipes'
import {
  generateAdventurerPool,
  isAdventurerExpired,
  getAdventurerFullName,
  calculateAdventurerBonuses,
  ADVENTURER_LIFETIME,
} from '@/lib/adventurer-generator'
import {
  ExpeditionTemplate,
  calculateCommission,
  calculateWarSoul,
  calculateSuccessChance,
  calculateWeaponLossChance,
  rollBonusRewards,
  expeditionTemplates,
  getAvailableExpeditions,
} from '@/data/expedition-templates'

// ================================
// Тип результата экспедиции
// ================================

export interface ExpeditionResult {
  success: boolean
  partialSuccess: boolean
  weaponLost: boolean
  commission: number
  warSoul: number
  bonusGold: number
  bonusResources: { resource: string; amount: number }[]
  glory: number
  weaponWear: number
  recoveryQuest?: RecoveryQuest
}

// ================================
// Slice State и Actions
// ================================

export type GuildSliceState = GuildState

export type GuildActions = {
  // Искатели
  refreshAdventurers: () => void
  initializeAdventurers: () => void

  // Экспедиции
  startExpedition: (
    expedition: ExpeditionTemplate,
    adventurer: Adventurer,
    weapon: CraftedWeapon
  ) => boolean
  cancelExpedition: (expeditionId: string) => void
  completeExpedition: (expeditionId: string) => ExpeditionResult | null

}


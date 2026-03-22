/**
 * Расширенные типы данных для системы искателей приключений
 * Версия 2.0 — Система контрактов и расширенные механики
 */

import type { CraftedWeapon } from './craft'

// ================================
// БАЗОВЫЕ ТИПЫ
// ================================

export type Gender = 'male' | 'female'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ContractTier = 'bronze' | 'silver' | 'gold' | 'platinum'

// ================================
// ИДЕНТИЧНОСТЬ
// ================================

export interface AdventurerIdentity {
  firstName: string
  lastName?: string
  nickname?: string
  gender: Gender
  portraitId: number
}

// ================================
// БОЕВЫЕ ХАРАКТЕРИСТИКИ
// ================================

export type CombatStyleId = 
  | 'berserker' | 'tank' | 'assassin' | 'duelist' | 'hunter'
  | 'scout' | 'paladin' | 'battle_mage' | 'weapon_master' | 'dual_wielder'

export type WeaponType = 'sword' | 'axe' | 'dagger' | 'mace' | 'spear' | 'hammer'

export interface CombatStats {
  level: number           // 1-50
  rarity: Rarity
  power: number           // 1-50 (влияет на души войны)
  precision: number       // 1-50 (влияет на успех)
  endurance: number       // 1-50 (влияет на износ оружия)
  luck: number            // 1-50 (криты, бонусы)
  combatStyle: CombatStyleId
  preferredWeapons: WeaponType[]
  avoidedWeapons: WeaponType[]
}

// ================================
// ЛИЧНОСТЬ
// ================================

export type PersonalityTraitId = 
  | 'brave' | 'cautious' | 'greedy' | 'honourable' | 'reckless' | 'mercenary'
  | 'glory_seeker' | 'survivor' | 'ambitious' | 'lazy' | 'veteran' | 'hot_headed'

export type MotivationId = 
  | 'gold' | 'glory' | 'challenge' | 'safety' | 'experience' 
  | 'revenge' | 'curiosity' | 'duty'

export type SocialTagId = 
  | 'noble' | 'peasant' | 'outcast' | 'famous' 
  | 'newcomer' | 'veteran_guild' | 'mysterious' | 'legendary'

export type RiskTolerance = 'cautious' | 'balanced' | 'reckless'

export interface Personality {
  primaryTrait: PersonalityTraitId
  secondaryTrait?: PersonalityTraitId
  riskTolerance: RiskTolerance
  motivations: MotivationId[]
  socialTags: SocialTagId[]
}

// ================================
// СПОСОБНОСТИ
// ================================

export type StrengthId = 
  | 'iron_will' | 'keen_eye' | 'quick_reflexes' | 'tough' | 'charismatic'
  | 'night_owl' | 'day_warrior' | 'lucky_star' | 'resourceful' | 'sturdy'

export type WeaknessId = 
  | 'arrogant' | 'greedy_fault' | 'coward' | 'old_wound' | 'superstitious'
  | 'impatient' | 'haunted' | 'notorious' | 'reckless_fault' | 'phobia'

export interface Strength {
  id: StrengthId
  name: string
  description: string
  effect: string
}

export interface Weakness {
  id: WeaknessId
  name: string
  description: string
  penalty: number
  appliesTo?: string[] // Типы миссий или ситуаций
}

// ================================
// ТРЕБОВАНИЯ К ОРУЖИЮ
// ================================

export interface WeaponRequirement {
  minAttack: number
  weaponType?: WeaponType
  minQuality?: number
  preferredEnchantment?: string
}

// ================================
// ПОЛНЫЙ ИСКАТЕЛЬ
// ================================

export interface AdventurerExtended {
  id: string
  
  // Идентичность
  identity: AdventurerIdentity
  
  // Боевые характеристики
  combat: CombatStats
  
  // Личность
  personality: Personality
  
  // Способности (существующая система + новая)
  traits: AdventurerTrait[]
  uniqueBonuses: UniqueBonus[]
  strengths: Strength[]
  weaknesses: Weakness[]
  
  // Требования
  requirements: WeaponRequirement
  
  // Метаданные
  createdAt: number
  expiresAt: number
}

// Существующие типы (для совместимости)
export interface AdventurerTrait {
  id: string
  name: string
  icon: string
  description: string
  effects: Record<string, number>
}

export interface UniqueBonus {
  id: string
  name: string
  description: string
  type: string
  value: number
}

// ================================
// КОНТРАКТЫ
// ================================

export interface ContractTerms {
  tier: ContractTier
  duration: number           // В днях (0 = бессрочный)
  commissionReduction: number // % снижения комиссии
  priorityAccess: boolean
  directAssignment: boolean
  refusalReduction: number   // % снижения шанса отказа
  bonusLoyalty: number       // Бонус к начальной лояльности
}

export interface ContractedAdventurer {
  adventurerId: string
  adventurer: AdventurerExtended
  contract: ContractTerms
  contractStartAt: number
  missionsCompleted: number
  missionsSucceeded: number
  totalGoldEarned: number
  totalWarSoulEarned: number
  loyalty: number            // 0-100
  lastMissionAt?: number
  favoriteWeaponTypes: WeaponType[]
}

// ================================
// УСЛОВИЯ КОНТРАКТА
// ================================

export interface ContractRequirements {
  minMissionsCompleted: number
  minSuccessRate: number
  minGuildLevel: number
  requiredResources: {
    gold: number
    glory?: number
  }
}

// ================================
// ПОИСК ИСКАТЕЛЕЙ
// ================================

export interface SearchLogEntry {
  id: string
  timestamp: number
  adventurerId: string
  adventurerName: string
  type: 'approaching' | 'considering' | 'accepted' | 'declined' | 'thinking'
  message: string
  emoji: string
}

export interface SearchState {
  isSearching: boolean
  startTime: number
  duration: number         // 30000-60000 мс
  progress: number         // 0-100
  logs: SearchLogEntry[]
  foundAdventurers: AdventurerExtended[]
  targetCount: number      // Обычно 3
}

export interface SearchEvent {
  time: number
  adventurer: AdventurerExtended
  decision: 'accepted' | 'declined'
  message: string
}

// ================================
// ФРАЗЫ
// ================================

export type PhraseType = 'accepted' | 'declined' | 'approaching' | 'considering'

export interface PhraseTemplate {
  id: string
  tags: string[]
  gender?: Gender | 'any'
  type: PhraseType
  template: string
}

// ================================
// РЕЗУЛЬТАТЫ ЭКСПЕДИЦИИ
// ================================

export interface ExpeditionRewards {
  gold: number
  warSoul: number
  glory: number
  wear: number
  lossChance: number
  isCrit: boolean
}

// ================================
// ЛОЯЛЬНОСТЬ
// ================================

export interface LoyaltyThresholds {
  disgruntled: number
  neutral: number
  satisfied: number
  loyal: number
}

export interface LoyaltyBonuses {
  refusalModifier: number
  commissionModifier?: number
  critChance?: number
}

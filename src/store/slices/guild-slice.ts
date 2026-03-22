/**
 * Slice для гильдии - управление expeditions и контрактами
 * Версия 2.0 — Расширенная система искателей
 * Использует utils для генерации
 */

import {
  Adventurer,
  ActiveExpedition,
  RecoveryQuest,
  GuildState,
  initialGuildState,
  GUILD_LEVELS,
} from '@/types/guild'
import {
  AdventurerExtended,
  SearchState,
} from '@/types/adventurer-extended'
import type {
  ContractedAdventurer,
  ContractTier,
  ContractTerms,
} from '@/types/contract'
import { CONTRACT_TERMS, CONTRACT_REQUIREMENTS, GUILD_CONTRACT_LIMITS } from '@/types/contract'
import { CraftedWeapon } from '@/data/weapon-recipes'
import {
  generateAdventurerPool,
  isAdventurerExpired,
  ADVENTURER_LIFETIME,
  getAdventurerFullName,
  calculateAdventurerBonuses,
  generateExtendedAdventurer,
  toLegacyAdventurer,
} from '@/lib/adventurer-generator-extended'
import {
  ExpeditionTemplate,
  expeditionTemplates,
  calculateCommission,
  calculateWarSoul,
  calculateSuccessChance,
  calculateWeaponLossChance,
} from '@/data/expedition-templates'
import {
  applyBonusesToResult,
} from '@/data/unique-bonuses'
import {
  createContract,
  canOfferContract,
  getMaxContracts,
  updateLoyalty,
  getLoyaltyStatus,
  wantsToTerminate,
  calculateTerminationPenalty,
  checkIdleLoyaltyLoss,
  applyContractModifiers,
  getContractTierName,
  getContractTierIcon,
} from '@/lib/contract-manager'

// Импорт утилит
import { generateId } from '@/lib/store-utils/generators'

// ================================
// Тип результата экспедиции
// ================================

export interface ExpeditionResult {
  success: boolean
  commission: number
  warSoul: number
  bonusGold: number
  glory: number
  weaponWear: number
  weaponLost: boolean
  recoveryQuest?: RecoveryQuest
  bonusResources?: { resource: string; amount: number }[]
  bonusEssence?: number
  isCrit?: boolean
  // Новые поля для контрактов
  loyaltyChange?: number
  contractTerminated?: boolean
}

// ================================
// Время жизни искателей
// ================================

export { ADVENTURER_LIFETIME }

// ================================
// Расширенное состояние гильдии
// ================================

export interface ExtendedGuildState extends GuildState {
  // Контрактные искатели
  contractedAdventurers: ContractedAdventurer[]
  
  // Состояние поиска
  searchState: SearchState | null
}

export const initialExtendedGuildState: ExtendedGuildState = {
  ...initialGuildState,
  contractedAdventurers: [],
  searchState: null,
}

// ================================
// Slice State и Actions
// ================================

export type GuildSliceState = ExtendedGuildState

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
  cancelExpedition: (expeditionId: string) => boolean
  completeExpedition: (expeditionId: string) => ExpeditionResult | null

  // Восстановление
  startRecoveryQuest: (questId: string) => boolean
  completeRecoveryQuest: (questId: string) => boolean
  declineRecoveryQuest: (questId: string) => void

  // Слава
  addGlory: (amount: number) => void

  // Контракты
  offerContract: (
    adventurer: Adventurer,
    tier: ContractTier,
    missionsCompleted: number,
    missionsSucceeded: number,
    resources: { gold: number; glory: number }
  ) => { success: boolean; reason?: string }
  terminateContract: (adventurerId: string) => { success: boolean; penalty: number }
  updateContractLoyalty: (
    adventurerId: string,
    success: boolean,
    isCrit: boolean,
    weaponLost: boolean
  ) => void
  checkContractTermination: () => string[] // Возвращает ID искателей, расторгнувших контракт
  
  // Поиск
  startSearch: (expedition: ExpeditionTemplate) => void
  stopSearch: () => void
  selectFoundAdventurer: (adventurerId: string) => Adventurer | null
  
  // Утилиты
  getAdventurerById: (id: string) => Adventurer | undefined
  getActiveExpeditionById: (id: string) => ActiveExpedition | undefined
  getAvailableAdventurers: () => Adventurer[]
  getAvailableWeapons: (weapons: CraftedWeapon[]) => CraftedWeapon[]
  isWeaponInExpedition: (weaponId: string) => boolean
  getContractedAdventurer: (id: string) => ContractedAdventurer | undefined
  canSelectAdventurer: (adventurer: Adventurer, expedition: ExpeditionTemplate) => { can: boolean; reason: string }
}

// ================================
// Функции-помощники (чистые функции)
// ================================

export const shouldRefreshAdventurers = (state: GuildSliceState): boolean => {
  return Date.now() >= state.adventurerRefreshAt
}

export const getTimeUntilRefresh = (state: GuildSliceState): number => {
  return Math.max(0, state.adventurerRefreshAt - Date.now())
}

export const getGuildLevelInfo = (state: GuildSliceState) => {
  const currentLevel = state.level
  const currentGlory = state.glory
  const nextLevel = GUILD_LEVELS.find(l => l.level === currentLevel + 1)
  const requiredGlory = nextLevel?.requiredGlory ?? 0

  return {
    level: currentLevel,
    currentGlory,
    nextLevelGlory: requiredGlory,
    progress: nextLevel ? Math.min(100, (currentGlory / requiredGlory) * 100) : 0,
  }
}

export const canStartExpedition = (
  expedition: ExpeditionTemplate,
  adventurer: Adventurer,
  weapon: CraftedWeapon,
  gold: number,
  activeExpeditions: ActiveExpedition[]
): { can: boolean; reason: string } => {
  // Проверка затрат
  const totalCost = expedition.cost.supplies + expedition.cost.deposit
  if (gold < totalCost) {
    return { can: false, reason: 'Недостаточно золота' }
  }

  // Проверка оружия
  if (weapon.durability <= 10) {
    return { can: false, reason: 'Оружие слишком повреждено' }
  }

  if (weapon.attack < expedition.minWeaponAttack) {
    return { can: false, reason: `Требуется атака ${expedition.minWeaponAttack}+` }
  }

  // Проверка требований искателя
  const minAttack = adventurer.requirements?.minAttack ?? 0
  if (weapon.attack < minAttack) {
    return { can: false, reason: `Искатель требует атаку ${minAttack}+` }
  }

  // Проверяем, что оружие не в другой экспедиции
  if (activeExpeditions.some(e => e.weaponId === weapon.id)) {
    return { can: false, reason: 'Оружие уже в экспедиции' }
  }

  // Проверяем, что искатель не в другой экспедиции
  if (activeExpeditions.some(e => e.adventurerId === adventurer.id)) {
    return { can: false, reason: 'Искатель уже в экспедиции' }
  }

  return { can: true, reason: '' }
}

// ================================
// Расчёт результата экспедиции
// ================================

export const calculateExpeditionResult = (
  expedition: ExpeditionTemplate,
  adventurer: Adventurer,
  weapon: CraftedWeapon,
  guildLevel: number,
  guildGlory: number,
  contract?: ContractedAdventurer
): ExpeditionResult => {
  // Рассчитываем бонусы искателя
  const adventurerBonuses = calculateAdventurerBonuses(adventurer)

  // Базовые расчёты с применением бонусов
  const baseSuccessChance = calculateSuccessChance(expedition, weapon.attack, 0)
  const baseWeaponLossChance = calculateWeaponLossChance(expedition, weapon.quality, 0)

  // Применяем бонусы к шансам
  let successChance = Math.min(95, Math.max(5, 
    baseSuccessChance + adventurerBonuses.successRateBonus
  ))
  let weaponLossChance = Math.max(0, 
    baseWeaponLossChance * (1 + adventurerBonuses.weaponLossModifier / 100)
  )

  // Бонусы от контракта
  let commissionReduction = 0
  let critBonus = 0
  
  if (contract) {
    // Бонус к успеху от лояльности
    const { bonuses } = getLoyaltyStatus(contract.loyalty)
    successChance += bonuses.critChance ?? 0
    
    // Снижение комиссии
    commissionReduction = contract.contract.commissionReduction
    
    // Бонус к криту от высокой лояльности
    if (bonuses.critChance) {
      critBonus = bonuses.critChance
    }
  }

  // Определяем успех
  const roll = Math.random() * 100
  const success = roll < successChance

  // Проверяем критический успех (удвоение наград)
  const isCrit = success && Math.random() * 100 < (adventurerBonuses.critChance + critBonus)
  const critMultiplier = isCrit ? adventurerBonuses.critMultiplier : 1

  // Определяем потерю оружия
  const weaponLost = !success && Math.random() * 100 < weaponLossChance

  // Рассчитываем награды с бонусами
  const baseCommission = calculateCommission(expedition, guildLevel, guildGlory)
  const baseWarSoul = calculateWarSoul(expedition, adventurer.skill, weapon.quality)

  // Применяем бонусы к наградам (с учётом снижения комиссии)
  const commissionMultiplier = 1 + (adventurerBonuses.goldBonus - commissionReduction) / 100
  const commission = Math.floor(baseCommission * Math.max(0.5, commissionMultiplier) * critMultiplier)
  const warSoul = Math.floor(baseWarSoul * (1 + adventurerBonuses.warSoulBonus / 100) * critMultiplier)
  const glory = Math.floor((expedition.reward.baseWarSoul * 0.1 + (success ? 5 : 2)) * critMultiplier)

  // Износ оружия (если не потеряно)
  const baseWear = 5 + Math.random() * 10
  const weaponWear = Math.max(0, Math.floor(baseWear * (1 + adventurerBonuses.wearModifier / 100)))

  // Бонусные ресурсы от "Добытчика"
  const bonusResources: { resource: string; amount: number }[] = []
  if (adventurerBonuses.resourceChance > 0 && success && Math.random() * 100 < adventurerBonuses.resourceChance) {
    const types = ['iron', 'copper', 'tin', 'coal', 'wood', 'stone']
    const resource = types[Math.floor(Math.random() * types.length)]
    const amount = 1 + Math.floor(Math.random() * 3)
    bonusResources.push({ resource, amount })
  }

  // Бонусная эссенция от "Мага"
  let bonusEssence = adventurerBonuses.essenceGuaranteed
  if (adventurerBonuses.essenceChance > 0 && success && Math.random() * 100 < adventurerBonuses.essenceChance) {
    bonusEssence += 1
  }

  // Создаём квест восстановления если оружие потеряно
  let recoveryQuest: RecoveryQuest | undefined
  if (weaponLost) {
    recoveryQuest = {
      id: generateId(),
      lostWeaponId: weapon.id,
      lostWeaponData: weapon,
      originalExpeditionId: expedition.id,
      originalExpeditionName: expedition.name,
      cost: Math.floor(expedition.cost.deposit * 0.5),
      duration: expedition.duration * 1000 * 2,
      status: 'available',
    }
  }

  // Расчёт изменения лояльности для контракта
  let loyaltyChange = 0
  let contractTerminated = false
  
  if (contract) {
    const newLoyalty = updateLoyalty(contract, success, isCrit, weaponLost)
    loyaltyChange = newLoyalty - contract.loyalty
    
    // Проверка на расторжение контракта
    if (wantsToTerminate({ ...contract, loyalty: newLoyalty })) {
      contractTerminated = true
    }
  }

  return {
    success,
    commission,
    warSoul,
    bonusGold: 0,
    glory,
    weaponWear,
    weaponLost,
    recoveryQuest,
    bonusResources: bonusResources.length > 0 ? bonusResources : undefined,
    bonusEssence: bonusEssence > 0 ? bonusEssence : undefined,
    isCrit,
    loyaltyChange,
    contractTerminated,
  }
}

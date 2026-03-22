/**
 * Утилиты для расчёта результатов экспедиции
 * Версия 2.0 — Использует унифицированную систему модификаторов
 * 
 * ВАЖНО: Вся логика модификаторов вынесена в провайдеры.
 * Для добавления нового эффекта — создайте нового провайдера.
 * НЕ НУЖНО изменять этот файл для добавления новых модификаторов!
 */

import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { ExpeditionTemplate, ExpeditionDifficulty, ExpeditionType } from '@/data/expedition-templates'
import { difficultyInfo } from '@/data/expedition-templates'
import { 
  calculateModifiers, 
  type ModifierContext,
  type AppliedModifier,
  type ModifierTarget,
} from './modifier-system'

// ================================
// ТИПЫ
// ================================

export interface ModifierDetail {
  source: string
  sourceIcon: string
  value: number
  description: string
  type: 'positive' | 'negative' | 'neutral'
}

export interface ExpeditionCalculation {
  successChance: number
  commission: number
  warSoul: number
  weaponWear: number
  weaponLossChance: number
  critChance: number
  
  successModifiers: ModifierDetail[]
  goldModifiers: ModifierDetail[]
  warSoulModifiers: ModifierDetail[]
  weaponLossModifiers: ModifierDetail[]
  weaponWearModifiers: ModifierDetail[]
  critModifiers: ModifierDetail[]
  
  levelMatch: {
    adventurerLevel: number
    missionTier: number
    missionTierName: string
    match: 'optimal' | 'underlevel' | 'overlevel' | 'dangerous'
    matchDescription: string
  }
  
  recommendation: {
    rating: 'excellent' | 'good' | 'risky' | 'dangerous'
    description: string
  }
}

// ================================
// КОНСТАНТЫ
// ================================

const BASE_COMMISSION_PERCENT = 15
const COMMISSION_PER_GUILD_LEVEL = 2
const MAX_COMMISSION_PERCENT = 30

const BASE_CRIT_CHANCE = 5 // 5% базовый шанс крита

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

function getRarityName(rarity: string): string {
  const names: Record<string, string> = {
    common: 'Обычный',
    uncommon: 'Необычный',
    rare: 'Редкий',
    epic: 'Эпический',
    legendary: 'Легендарный'
  }
  return names[rarity] || 'Обычный'
}

function getMissionTypeName(type: ExpeditionType): string {
  const names: Record<ExpeditionType, string> = {
    hunt: 'охоту',
    scout: 'разведку',
    clear: 'зачистку',
    delivery: 'доставку',
    magic: 'магические миссии'
  }
  return names[type] || 'миссию'
}

/**
 * Преобразовать AppliedModifier в ModifierDetail для UI
 */
function appliedToDetail(applied: AppliedModifier): ModifierDetail {
  return {
    source: applied.source.name,
    sourceIcon: applied.source.icon,
    value: applied.effectiveValue,
    description: applied.source.description || '',
    type: applied.effectiveValue > 0 ? 'positive' : applied.effectiveValue < 0 ? 'negative' : 'neutral'
  }
}

/**
 * Определить соответствие уровня
 */
function calculateLevelMatch(
  adventurerLevel: number,
  difficulty: ExpeditionDifficulty
): ExpeditionCalculation['levelMatch'] {
  const difficultyData = difficultyInfo[difficulty]
  const missionTier = difficultyData.tier
  const [minLevel, maxLevel] = difficultyData.levelRange
  
  if (adventurerLevel < minLevel - 5) {
    return {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'dangerous',
      matchDescription: `Уровень искателя слишком низкий для этой миссии (рекомендуется ${minLevel}+)`
    }
  } else if (adventurerLevel > maxLevel + 10) {
    return {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'overlevel',
      matchDescription: `Искатель слишком опытный для такой простой миссии`
    }
  } else if (adventurerLevel >= minLevel && adventurerLevel <= maxLevel) {
    return {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'optimal',
      matchDescription: `Отличное соответствие уровню миссии`
    }
  } else {
    return {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'underlevel',
      matchDescription: `Уровень чуть ниже рекомендованного, но допустимо`
    }
  }
}

// ================================
// ОСНОВНАЯ ФУНКЦИЯ РАСЧЁТА
// ================================

export function calculateExpeditionResult(
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate,
  guildLevel: number,
  weaponAttack: number,
  weaponQuality: number = 50,
  weaponType: string = 'sword',
  weaponId: string = 'weapon_0'
): ExpeditionCalculation {
  // ===== 1. ПОДГОТОВКА КОНТЕКСТА =====
  const context: ModifierContext = {
    adventurer,
    expedition: {
      id: expedition.id,
      type: expedition.type,
      difficulty: expedition.difficulty,
      duration: expedition.duration,
      minWeaponAttack: expedition.minWeaponAttack || 5,
      enemyTypes: [], // TODO: добавить в шаблон
    },
    weapon: {
      id: weaponId,
      type: weaponType as any,
      attack: weaponAttack,
      quality: weaponQuality,
    },
    guild: {
      level: guildLevel,
      glory: 0, // TODO: передать из контекста
    },
  }
  
  // ===== 2. БАЗОВЫЕ ЗНАЧЕНИЯ =====
  const difficultyData = difficultyInfo[expedition.difficulty]
  const baseSuccess = 100 - difficultyData.failureChance
  const baseGold = expedition.reward?.baseGold || 50
  const baseWarSoul = expedition.reward?.baseWarSoul || 3
  const baseWeaponLoss = difficultyData.weaponLossChance || 5
  const baseWeaponWear = 10
  
  const baseValues: Record<ModifierTarget, number> = {
    successChance: baseSuccess,
    gold: baseGold,
    warSoul: baseWarSoul,
    glory: 0,
    weaponWear: baseWeaponWear,
    weaponLossChance: baseWeaponLoss,
    critChance: BASE_CRIT_CHANCE,
    commission: 0,
  }
  
  // ===== 3. РАСЧЁТ ЧЕРЕЗ СИСТЕМУ МОДИФИКАТОРОВ =====
  const result = calculateModifiers(context, baseValues)
  
  // ===== 4. ФОРМИРОВАНИЕ РЕЗУЛЬТАТОВ =====
  
  // Шанс успеха (ограничен 5-95%)
  const finalSuccess = Math.max(5, Math.min(95, result.totals.successChance))
  
  // Золото (базовое * множители)
  // Модификаторы золота — это проценты, преобразуем в множитель
  let goldMult = 1
  const goldModifiers = result.byTarget.gold.filter(m => m.applied)
  for (const mod of goldModifiers) {
    goldMult += mod.effectiveValue / 100
  }
  const finalGold = Math.floor(baseGold * goldMult)
  
  // Комиссия
  const commissionPercent = Math.min(
    MAX_COMMISSION_PERCENT,
    BASE_COMMISSION_PERCENT + (guildLevel - 1) * COMMISSION_PER_GUILD_LEVEL
  )
  const finalCommission = Math.floor(finalGold * commissionPercent / 100)
  
  // Души войны
  let warSoulMult = 1
  const warSoulModifiers = result.byTarget.warSoul.filter(m => m.applied)
  for (const mod of warSoulModifiers) {
    warSoulMult += mod.effectiveValue / 100
  }
  const finalWarSoul = Math.max(1, Math.floor(baseWarSoul * warSoulMult))
  
  // Износ оружия
  let weaponWearMod = 0
  const weaponWearModifiers = result.byTarget.weaponWear.filter(m => m.applied)
  for (const mod of weaponWearModifiers) {
    weaponWearMod += mod.effectiveValue
  }
  const finalWeaponWear = Math.max(1, Math.min(50, baseWeaponWear + weaponWearMod))
  
  // Шанс потери оружия
  let weaponLossMod = 0
  const weaponLossModifiers = result.byTarget.weaponLossChance.filter(m => m.applied)
  for (const mod of weaponLossModifiers) {
    weaponLossMod += mod.effectiveValue
  }
  const finalWeaponLoss = Math.max(0, Math.min(50, baseWeaponLoss + weaponLossMod))
  
  // Шанс крита
  let critChance = BASE_CRIT_CHANCE
  const critModifiers = result.byTarget.critChance.filter(m => m.applied)
  for (const mod of critModifiers) {
    critChance += mod.effectiveValue
  }
  const finalCritChance = Math.max(0, Math.min(25, critChance))
  
  // ===== 5. ФОРМИРОВАНИЕ МОДИФИКАТОРОВ ДЛЯ UI =====
  
  const toModifierDetail = (applied: AppliedModifier): ModifierDetail => ({
    source: applied.source.name,
    sourceIcon: applied.source.icon,
    value: applied.effectiveValue,
    description: applied.source.description || '',
    type: applied.effectiveValue > 0 ? 'positive' : applied.effectiveValue < 0 ? 'negative' : 'neutral'
  })
  
  // ===== 6. РЕКОМЕНДАЦИЯ =====
  let recommendation: ExpeditionCalculation['recommendation']
  
  if (finalSuccess >= 80) {
    recommendation = {
      rating: 'excellent',
      description: 'Отличный выбор! Высокий шанс успеха и хорошая награда.'
    }
  } else if (finalSuccess >= 60) {
    recommendation = {
      rating: 'good',
      description: 'Хороший выбор. Шанс успеха приемлемый.'
    }
  } else if (finalSuccess >= 40) {
    recommendation = {
      rating: 'risky',
      description: 'Рискованно. Есть значительный шанс провала.'
    }
  } else {
    recommendation = {
      rating: 'dangerous',
      description: 'Опасно! Высокий риск провала и потери оружия.'
    }
  }
  
  // ===== 7. ВОЗВРАТ РЕЗУЛЬТАТА =====
  return {
    successChance: finalSuccess,
    commission: finalCommission,
    warSoul: finalWarSoul,
    weaponWear: finalWeaponWear,
    weaponLossChance: finalWeaponLoss,
    critChance: finalCritChance,
    
    successModifiers: result.byTarget.successChance.filter(m => m.applied).map(toModifierDetail),
    goldModifiers: result.byTarget.gold.filter(m => m.applied).map(toModifierDetail),
    warSoulModifiers: result.byTarget.warSoul.filter(m => m.applied).map(toModifierDetail),
    weaponLossModifiers: result.byTarget.weaponLossChance.filter(m => m.applied).map(toModifierDetail),
    weaponWearModifiers: result.byTarget.weaponWear.filter(m => m.applied).map(toModifierDetail),
    critModifiers: result.byTarget.critChance.filter(m => m.applied).map(toModifierDetail),
    
    levelMatch: calculateLevelMatch(adventurer.combat.level, expedition.difficulty),
    recommendation,
  }
}

// ================================
// ФОРМАТИРОВАНИЕ
// ================================

export function formatModifierValue(value: number): string {
  return value > 0 ? `+${value}%` : `${value}%`
}

export function getRatingColor(rating: string): string {
  switch (rating) {
    case 'excellent': return 'text-green-400'
    case 'good': return 'text-blue-400'
    case 'risky': return 'text-amber-400'
    case 'dangerous': return 'text-red-400'
    default: return 'text-stone-400'
  }
}

export function getRatingBgColor(rating: string): string {
  switch (rating) {
    case 'excellent': return 'bg-green-900/30 border-green-600/50'
    case 'good': return 'bg-blue-900/30 border-blue-600/50'
    case 'risky': return 'bg-amber-900/30 border-amber-600/50'
    case 'dangerous': return 'bg-red-900/30 border-red-600/50'
    default: return 'bg-stone-900/30 border-stone-600/50'
  }
}

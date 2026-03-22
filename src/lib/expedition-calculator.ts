/**
 * Утилиты для расчёта результатов экспедиции
 * Явные формулы с показом влияния каждого фактора
 * 
 * ВАЖНО: Все эффекты берутся из реальных данных тегов
 */

import type { AdventurerExtended, Strength, Weakness } from '@/types/adventurer-extended'
import type { ExpeditionTemplate, ExpeditionDifficulty, ExpeditionType } from '@/data/expedition-templates'
import { difficultyInfo } from '@/data/expedition-templates'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import { getStrengthById, doesStrengthApply, type StrengthData } from '@/data/adventurer-tags/strengths'
import { getWeaknessById, doesWeaknessApply, type WeaknessData } from '@/data/adventurer-tags/weaknesses'
import { getSocialTagById } from '@/data/adventurer-tags/social-tags'
import { getCombatStyleById, getMissionBonus } from '@/data/adventurer-tags/combat-styles'

// ================================
// ТИПЫ
// ================================

export interface ModifierDetail {
  source: string      // Источник модификатора
  sourceIcon: string  // Иконка источника
  value: number       // Значение (+ или -)
  description: string // Описание влияния
  type: 'positive' | 'negative' | 'neutral'
}

export interface ExpeditionCalculation {
  // Основные результаты
  successChance: number
  commission: number
  warSoul: number
  weaponWear: number
  weaponLossChance: number
  
  // Детализация модификаторов
  successModifiers: ModifierDetail[]
  goldModifiers: ModifierDetail[]
  warSoulModifiers: ModifierDetail[]
  weaponLossModifiers: ModifierDetail[]
  weaponWearModifiers: ModifierDetail[]
  
  // Соответствие уровню миссии
  levelMatch: {
    adventurerLevel: number
    missionTier: number
    missionTierName: string
    match: 'optimal' | 'underlevel' | 'overlevel' | 'dangerous'
    matchDescription: string
  }
  
  // Рекомендация
  recommendation: {
    rating: 'excellent' | 'good' | 'risky' | 'dangerous'
    description: string
  }
}

// ================================
// КОНСТАНТЫ
// ================================

// Базовая комиссия гильдии
const BASE_COMMISSION_PERCENT = 15
const COMMISSION_PER_GUILD_LEVEL = 2
const MAX_COMMISSION_PERCENT = 30

// Множители редкости
const RARITY_MULTIPLIERS = {
  common: { gold: 1.0, warSoul: 1.0 },
  uncommon: { gold: 1.1, warSoul: 1.15 },
  rare: { gold: 1.2, warSoul: 1.3 },
  epic: { gold: 1.35, warSoul: 1.5 },
  legendary: { gold: 1.5, warSoul: 2.0 },
}

// ================================
// ОСНОВНАЯ ФУНКЦИЯ РАСЧЁТА
// ================================

export function calculateExpeditionResult(
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate,
  guildLevel: number,
  weaponAttack: number,
  weaponQuality: number = 50
): ExpeditionCalculation {
  const successModifiers: ModifierDetail[] = []
  const goldModifiers: ModifierDetail[] = []
  const warSoulModifiers: ModifierDetail[] = []
  const weaponLossModifiers: ModifierDetail[] = []
  const weaponWearModifiers: ModifierDetail[] = []

  // Получаем информацию о сложности и типе миссии
  const difficulty = expedition.difficulty
  const missionType = expedition.type
  const difficultyData = difficultyInfo[difficulty]
  
  // ===== 1. РАСЧЁТ СООТВЕТСТВИЯ УРОВНЯ =====
  const adventurerLevel = adventurer.combat.level
  const missionTier = difficultyData.tier
  const [minLevel, maxLevel] = difficultyData.levelRange
  
  let baseSuccess = 100 - difficultyData.failureChance
  let levelMatch: ExpeditionCalculation['levelMatch']
  
  if (adventurerLevel < minLevel - 5) {
    // Опасно — уровень слишком низкий
    levelMatch = {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'dangerous',
      matchDescription: `Уровень искателя слишком низкий для этой миссии (рекомендуется ${minLevel}+)`
    }
    const penalty = Math.min(30, (minLevel - adventurerLevel) * 3)
    baseSuccess -= penalty
    successModifiers.push({
      source: 'Уровень',
      sourceIcon: '📉',
      value: -penalty,
      description: `Слишком низкий уровень (${adventurerLevel} против рекомендованного ${minLevel}+)`,
      type: 'negative'
    })
  } else if (adventurerLevel > maxLevel + 10) {
    // Скучно — уровень слишком высокий
    levelMatch = {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'overlevel',
      matchDescription: `Искатель слишком опытный для такой простой миссии`
    }
    const penalty = Math.min(15, (adventurerLevel - maxLevel - 10) * 1.5)
    baseSuccess -= penalty
    successModifiers.push({
      source: 'Скука',
      sourceIcon: '😴',
      value: -penalty,
      description: 'Опытному искателю скучно на лёгких миссиях',
      type: 'negative'
    })
  } else if (adventurerLevel >= minLevel && adventurerLevel <= maxLevel) {
    // Оптимально
    levelMatch = {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'optimal',
      matchDescription: `Отличное соответствие уровню миссии`
    }
    baseSuccess += 5
    successModifiers.push({
      source: 'Уровень',
      sourceIcon: '✓',
      value: 5,
      description: 'Идеальное соответствие уровню миссии',
      type: 'positive'
    })
  } else {
    // Допустимо
    levelMatch = {
      adventurerLevel,
      missionTier,
      missionTierName: difficultyData.tierName,
      match: 'underlevel',
      matchDescription: `Уровень чуть ниже рекомендованного, но допустимо`
    }
  }
  
  // ===== 2. ВЛИЯНИЕ ОРУЖИЯ =====
  const minWeaponAttack = expedition.minWeaponAttack || 5
  const attackDiff = weaponAttack - minWeaponAttack
  if (attackDiff > 0) {
    const bonus = Math.min(15, attackDiff * 0.5)
    baseSuccess += bonus
    successModifiers.push({
      source: 'Оружие',
      sourceIcon: '⚔️',
      value: bonus,
      description: `Атака оружия выше требуемой на ${attackDiff}`,
      type: 'positive'
    })
  } else if (attackDiff < 0) {
    successModifiers.push({
      source: 'Оружие',
      sourceIcon: '⚔️',
      value: 0,
      description: `Атака оружия соответствует требованиям`,
      type: 'neutral'
    })
  }
  
  // ===== 3. ВЛИЯНИЕ РЕДКОСТИ =====
  const rarityMult = RARITY_MULTIPLIERS[adventurer.combat.rarity]
  if (adventurer.combat.rarity !== 'common') {
    warSoulModifiers.push({
      source: 'Редкость',
      sourceIcon: '⭐',
      value: Math.round((rarityMult.warSoul - 1) * 100),
      description: `${getRarityName(adventurer.combat.rarity)} искатель приносит больше душ`,
      type: 'positive'
    })
    goldModifiers.push({
      source: 'Редкость',
      sourceIcon: '⭐',
      value: Math.round((rarityMult.gold - 1) * 100),
      description: `${getRarityName(adventurer.combat.rarity)} искатель находит больше золота`,
      type: 'positive'
    })
  }
  
  // ===== 4. ВЛИЯНИЕ ХАРАКТЕРА =====
  const primaryTrait = getPersonalityTraitById(adventurer.personality.primaryTrait)
  if (primaryTrait) {
    const traitBonus = calculateTraitBonus(adventurer.personality.primaryTrait, difficulty)
    if (traitBonus !== 0) {
      baseSuccess += traitBonus
      successModifiers.push({
        source: primaryTrait.name,
        sourceIcon: primaryTrait.icon,
        value: traitBonus,
        description: primaryTrait.description,
        type: traitBonus > 0 ? 'positive' : 'negative'
      })
    }
  }
  
  // ===== 5. ВЛИЯНИЕ СТИЛЯ БОЯ =====
  const combatStyle = getCombatStyleById(adventurer.combat.combatStyle)
  if (combatStyle) {
    // Бонус от стиля боя к типу миссии
    const missionBonus = getMissionBonus(combatStyle, missionType)
    if (missionBonus !== 0) {
      baseSuccess += missionBonus
      successModifiers.push({
        source: combatStyle.name,
        sourceIcon: combatStyle.icon,
        value: missionBonus,
        description: missionBonus > 0 
          ? `Специализация на ${getMissionTypeName(missionType)}`
          : `Не подходит для ${getMissionTypeName(missionType)}`,
        type: missionBonus > 0 ? 'positive' : 'negative'
      })
    }
  }
  
  // ===== 6. ВЛИЯНИЕ СОЦИАЛЬНЫХ ТЕГОВ =====
  for (const socialTagId of adventurer.personality.socialTags) {
    const socialTag = getSocialTagById(socialTagId)
    if (socialTag) {
      // Модификатор золота
      if (socialTag.effects.goldModifier !== 0) {
        goldModifiers.push({
          source: socialTag.name,
          sourceIcon: socialTag.icon,
          value: socialTag.effects.goldModifier,
          description: socialTag.effects.goldModifier > 0
            ? 'Лучшие контракты благодаря репутации'
            : 'Скромные запросы',
          type: socialTag.effects.goldModifier > 0 ? 'positive' : 'negative'
        })
      }
    }
  }
  
  // ===== 7. ВЛИЯНИЕ СИЛЬНЫХ СТОРОН =====
  for (const strength of adventurer.strengths) {
    const data = getStrengthById(strength.id)
    if (data && doesStrengthApply(data, difficulty, missionType)) {
      // Бонус к успеху
      if (data.effects.successBonus !== 0) {
        baseSuccess += data.effects.successBonus
        successModifiers.push({
          source: data.name,
          sourceIcon: data.icon,
          value: data.effects.successBonus,
          description: data.description,
          type: 'positive'
        })
      }
      // Бонус к золоту
      if (data.effects.goldBonus !== 0) {
        goldModifiers.push({
          source: data.name,
          sourceIcon: data.icon,
          value: data.effects.goldBonus,
          description: data.description,
          type: 'positive'
        })
      }
      // Бонус к душам войны
      if (data.effects.warSoulBonus !== 0) {
        warSoulModifiers.push({
          source: data.name,
          sourceIcon: data.icon,
          value: data.effects.warSoulBonus,
          description: data.description,
          type: 'positive'
        })
      }
      // Снижение шанса потери оружия
      if (data.effects.weaponLossReduction !== 0) {
        weaponLossModifiers.push({
          source: data.name,
          sourceIcon: data.icon,
          value: -data.effects.weaponLossReduction,
          description: 'Защищает оружие',
          type: 'positive'
        })
      }
      // Снижение износа оружия
      if (data.effects.weaponWearReduction !== 0) {
        weaponWearModifiers.push({
          source: data.name,
          sourceIcon: data.icon,
          value: -data.effects.weaponWearReduction,
          description: 'Меньше износа',
          type: 'positive'
        })
      }
    }
  }
  
  // ===== 8. ВЛИЯНИЕ СЛАБОСТЕЙ =====
  for (const weakness of adventurer.weaknesses) {
    const data = getWeaknessById(weakness.id)
    if (data && doesWeaknessApply(data, difficulty, missionType)) {
      // Штраф к успеху
      if (data.effects.successPenalty !== 0) {
        baseSuccess += data.effects.successPenalty // Уже отрицательное число
        successModifiers.push({
          source: data.name,
          sourceIcon: '⚠️',
          value: data.effects.successPenalty,
          description: data.description,
          type: 'negative'
        })
      }
      // Штраф к золоту
      if (data.effects.goldPenalty !== 0) {
        goldModifiers.push({
          source: data.name,
          sourceIcon: '⚠️',
          value: -data.effects.goldPenalty,
          description: data.description,
          type: 'negative'
        })
      }
      // Штраф к душам войны
      if (data.effects.warSoulPenalty !== 0) {
        warSoulModifiers.push({
          source: data.name,
          sourceIcon: '⚠️',
          value: -data.effects.warSoulPenalty,
          description: data.description,
          type: 'negative'
        })
      }
      // Увеличение шанса потери оружия
      if (data.effects.weaponLossIncrease !== 0) {
        weaponLossModifiers.push({
          source: data.name,
          sourceIcon: '⚠️',
          value: data.effects.weaponLossIncrease,
          description: 'Риск для оружия',
          type: 'negative'
        })
      }
      // Увеличение износа оружия
      if (data.effects.weaponWearIncrease !== 0) {
        weaponWearModifiers.push({
          source: data.name,
          sourceIcon: '⚠️',
          value: data.effects.weaponWearIncrease,
          description: 'Больше износа',
          type: 'negative'
        })
      }
    }
  }
  
  // ===== 9. РАСЧЁТ КОМИССИИ =====
  const commissionPercent = Math.min(
    MAX_COMMISSION_PERCENT,
    BASE_COMMISSION_PERCENT + (guildLevel - 1) * COMMISSION_PER_GUILD_LEVEL
  )
  
  // Суммируем модификаторы золота
  let totalGoldMult = rarityMult.gold
  for (const mod of goldModifiers) {
    totalGoldMult += mod.value / 100
  }
  
  const baseGold = expedition.reward?.baseGold || 50
  const totalGold = Math.floor(baseGold * totalGoldMult)
  const commission = Math.floor(totalGold * commissionPercent / 100)
  
  // ===== 10. РАСЧЁТ ДУШ ВОЙНЫ =====
  // Суммируем модификаторы душ
  let totalWarSoulMult = rarityMult.warSoul
  for (const mod of warSoulModifiers) {
    totalWarSoulMult += mod.value / 100
  }
  
  const baseWarSoul = expedition.reward?.baseWarSoul || 3
  const warSoul = Math.max(1, Math.floor(baseWarSoul * totalWarSoulMult))
  
  // ===== 11. ИЗНОС ОРУЖИЯ =====
  let baseWeaponWear = 10 // Базовый износ
  for (const mod of weaponWearModifiers) {
    baseWeaponWear += mod.value
  }
  const weaponWear = Math.max(1, Math.min(50, baseWeaponWear))
  
  // ===== 12. ШАНС ПОТЕРИ ОРУЖИЯ =====
  let baseWeaponLossChance = difficultyData.weaponLossChance || 5
  for (const mod of weaponLossModifiers) {
    baseWeaponLossChance += mod.value
  }
  const weaponLossChance = Math.max(0, Math.min(50, baseWeaponLossChance))
  
  // ===== 13. РЕКОМЕНДАЦИЯ =====
  const finalSuccess = Math.max(5, Math.min(95, baseSuccess))
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
  
  return {
    successChance: finalSuccess,
    commission,
    warSoul,
    weaponWear,
    weaponLossChance,
    successModifiers,
    goldModifiers,
    warSoulModifiers,
    weaponLossModifiers,
    weaponWearModifiers,
    levelMatch,
    recommendation
  }
}

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

function calculateTraitBonus(traitId: string, difficulty: ExpeditionDifficulty): number {
  // Храбрые лучше на сложных миссиях
  if (traitId === 'brave' && (difficulty === 'hard' || difficulty === 'extreme' || difficulty === 'legendary')) {
    return 10
  }
  // Осторожные лучше на лёгких
  if (traitId === 'cautious' && difficulty === 'easy') {
    return 5
  }
  // Безрассудные всегда в плюсе на успех, но увеличивают риск
  if (traitId === 'reckless') {
    return 8
  }
  // Ветераны стабильны
  if (traitId === 'veteran') {
    return 5
  }
  // Ленивые хуже на долгих миссиях
  if (traitId === 'lazy') {
    return -5
  }
  return 0
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

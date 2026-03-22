/**
 * Система вариативных советов для искателей
 * Генерирует персонализированные советы на основе комбинаций черт
 */

import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { ExpeditionTemplate, ExpeditionDifficulty, ExpeditionType } from '@/data/expedition-templates'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import { getCombatStyleById } from '@/data/adventurer-tags/combat-styles'
import { getStrengthById, doesStrengthApply } from '@/data/adventurer-tags/strengths'
import { getWeaknessById, doesWeaknessApply } from '@/data/adventurer-tags/weaknesses'
import { getSocialTagById } from '@/data/adventurer-tags/social-tags'

// ================================
// ТИПЫ
// ================================

export interface Advice {
  text: string
  icon: string
  type: 'excellent' | 'good' | 'risky' | 'dangerous' | 'warning' | 'special'
  detail?: string // Дополнительная информация
}

export interface AdviceContext {
  adventurer: AdventurerExtended
  expedition: ExpeditionTemplate
  successChance: number
  goldReward: number
  warSoulReward: number
}

// ================================
// ШАБЛОНЫ СОВЕТОВ
// ================================

interface AdviceRule {
  id: string
  priority: number // Чем выше, тем важнее
  condition: (ctx: AdviceContext) => boolean
  advice: (ctx: AdviceContext) => Advice
}

const adviceRules: AdviceRule[] = [
  // === ОСОБЫЕ КОМБИНАЦИИ (высший приоритет) ===
  {
    id: 'brave_reckless',
    priority: 100,
    condition: (ctx) => {
      const traits = [ctx.adventurer.personality.primaryTrait, ctx.adventurer.personality.secondaryTrait]
      return traits.includes('brave') && traits.includes('reckless')
    },
    advice: () => ({
      text: 'Храбрый и безрассудный — смертельный коктейль!',
      icon: '🔥',
      type: 'special',
      detail: 'Высокий риск, но и высокий потенциал. Отлично для сложных миссий.'
    })
  },
  {
    id: 'cautious_survivor',
    priority: 100,
    condition: (ctx) => {
      const traits = [ctx.adventurer.personality.primaryTrait, ctx.adventurer.personality.secondaryTrait]
      return traits.includes('cautious') && traits.includes('survivor')
    },
    advice: () => ({
      text: 'Осторожный выживший — перестраховщик!',
      icon: '🛡️',
      type: 'good',
      detail: 'Минимизирует риски. Идеален для безопасных миссий.'
    })
  },
  {
    id: 'greedy_mercenary',
    priority: 95,
    condition: (ctx) => {
      const traits = [ctx.adventurer.personality.primaryTrait, ctx.adventurer.personality.secondaryTrait]
      return traits.includes('greedy') || traits.includes('mercenary')
    },
    advice: (ctx) => ({
      text: 'Алчный наёмник — плати больше!',
      icon: '💰',
      type: 'warning',
      detail: ctx.goldReward > 100 
        ? 'Хорошая награда — доволен. Будет стараться.'
        : 'Награда низковата. Может отказаться.'
    })
  },
  
  // === СООТВЕТСТВИЕ СТИЛЯ БОЯ ===
  {
    id: 'combat_style_match',
    priority: 90,
    condition: (ctx) => {
      const style = getCombatStyleById(ctx.adventurer.combat.combatStyle)
      if (!style) return false
      const bonus = style.missionBonuses.find(b => b.missionType === ctx.expedition.type || b.missionType === 'any')
      return (bonus?.bonus ?? 0) > 10
    },
    advice: (ctx) => {
      const style = getCombatStyleById(ctx.adventurer.combat.combatStyle)!
      const bonus = style.missionBonuses.find(b => b.missionType === ctx.expedition.type || b.missionType === 'any')
      return {
        text: `${style.name} на ${getMissionTypeName(ctx.expedition.type)} — идеально!`,
        icon: '🎯',
        type: 'excellent',
        detail: `Бонус +${bonus!.bonus}% к успеху за специализацию`
      }
    }
  },
  {
    id: 'combat_style_mismatch',
    priority: 88,
    condition: (ctx) => {
      const style = getCombatStyleById(ctx.adventurer.combat.combatStyle)
      if (!style) return false
      const bonus = style.missionBonuses.find(b => b.missionType === ctx.expedition.type)
      return (bonus?.bonus ?? 0) < 0
    },
    advice: (ctx) => {
      const style = getCombatStyleById(ctx.adventurer.combat.combatStyle)!
      const bonus = style.missionBonuses.find(b => b.missionType === ctx.expedition.type)
      return {
        text: `${style.name} на такой миссии — не идеально`,
        icon: '⚠️',
        type: 'risky',
        detail: `Штраф ${bonus!.bonus}% к успеху. Лучше выбрать другого.`
      }
    }
  },
  
  // === СИЛЬНЫЕ СТОРОНЫ ===
  {
    id: 'strength_applies',
    priority: 80,
    condition: (ctx) => {
      for (const s of ctx.adventurer.strengths) {
        const data = getStrengthById(s.id)
        if (data && doesStrengthApply(data, ctx.expedition.difficulty, ctx.expedition.type)) {
          if (data.effects.successBonus > 5 || data.effects.goldBonus > 5) return true
        }
      }
      return false
    },
    advice: (ctx) => {
      for (const s of ctx.adventurer.strengths) {
        const data = getStrengthById(s.id)
        if (data && doesStrengthApply(data, ctx.expedition.difficulty, ctx.expedition.type)) {
          if (data.effects.successBonus > 5) {
            return {
              text: `${data.icon} ${data.name} — отличный бонус!`,
              icon: '💪',
              type: 'good',
              detail: `+${data.effects.successBonus}% успеха на этой миссии`
            }
          }
          if (data.effects.goldBonus > 5) {
            return {
              text: `${data.icon} ${data.name} — больше золота!`,
              icon: '💰',
              type: 'good',
              detail: `+${data.effects.goldBonus}% к награде`
            }
          }
        }
      }
      return { text: 'Есть сильные стороны', icon: '✓', type: 'good' }
    }
  },
  
  // === СЛАБОСТИ ===
  {
    id: 'weakness_applies',
    priority: 85,
    condition: (ctx) => {
      for (const w of ctx.adventurer.weaknesses) {
        const data = getWeaknessById(w.id)
        if (data && doesWeaknessApply(data, ctx.expedition.difficulty, ctx.expedition.type)) {
          if (data.effects.successPenalty < -5 || data.effects.refuseChanceBonus > 10) return true
        }
      }
      return false
    },
    advice: (ctx) => {
      for (const w of ctx.adventurer.weaknesses) {
        const data = getWeaknessById(w.id)
        if (data && doesWeaknessApply(data, ctx.expedition.difficulty, ctx.expedition.type)) {
          if (data.effects.successPenalty < -5) {
            return {
              text: `⚠️ ${data.name} — проблема на этой миссии!`,
              icon: '⚠️',
              type: 'dangerous',
              detail: `${data.effects.successPenalty}% к успеху. Лучше выбрать другого.`
            }
          }
          if (data.effects.refuseChanceBonus > 10) {
            return {
              text: `${data.name} — может отказаться`,
              icon: '❓',
              type: 'warning',
              detail: `+${data.effects.refuseChanceBonus}% к отказу`
            }
          }
        }
      }
      return { text: 'Слабости не сильно мешают', icon: '✓', type: 'good' }
    }
  },
  
  // === УРОВЕНЬ ===
  {
    id: 'level_overqualified',
    priority: 70,
    condition: (ctx) => {
      const advLevel = ctx.adventurer.combat.level
      const [minLevel, maxLevel] = getDifficultyLevelRange(ctx.expedition.difficulty)
      return advLevel > maxLevel + 10
    },
    advice: (ctx) => ({
      text: 'Слишком опытный для такой миссии',
      icon: '😴',
      type: 'warning',
      detail: 'Ему скучно на простых заданиях. Лучше дать что-то сложнее.'
    })
  },
  {
    id: 'level_underlevel',
    priority: 70,
    condition: (ctx) => {
      const advLevel = ctx.adventurer.combat.level
      const [minLevel, maxLevel] = getDifficultyLevelRange(ctx.expedition.difficulty)
      return advLevel < minLevel - 5
    },
    advice: (ctx) => ({
      text: 'Уровень слишком низкий!',
      icon: '💀',
      type: 'dangerous',
      detail: 'Высокий риск провала. Рекомендуется более опытный искатель.'
    })
  },
  
  // === РЕДКОСТЬ ===
  {
    id: 'rarity_legendary',
    priority: 60,
    condition: (ctx) => ctx.adventurer.combat.rarity === 'legendary',
    advice: () => ({
      text: '🌟 Легендарный искатель!',
      icon: '🌟',
      type: 'excellent',
      detail: '+50% к золоту, +100% к душам войны. Сокровище!'
    })
  },
  {
    id: 'rarity_epic',
    priority: 58,
    condition: (ctx) => ctx.adventurer.combat.rarity === 'epic',
    advice: () => ({
      text: '⭐ Эпический искатель!',
      icon: '⭐',
      type: 'good',
      detail: '+35% к золоту, +50% к душам войны.'
    })
  },
  
  // === БАЗОВЫЕ (по шансу успеха) ===
  {
    id: 'success_excellent',
    priority: 10,
    condition: (ctx) => ctx.successChance >= 80,
    advice: () => ({
      text: 'Отличный выбор для этой миссии!',
      icon: '✅',
      type: 'excellent'
    })
  },
  {
    id: 'success_good',
    priority: 10,
    condition: (ctx) => ctx.successChance >= 60 && ctx.successChance < 80,
    advice: () => ({
      text: 'Хороший выбор. Должен справиться.',
      icon: '👍',
      type: 'good'
    })
  },
  {
    id: 'success_risky',
    priority: 10,
    condition: (ctx) => ctx.successChance >= 40 && ctx.successChance < 60,
    advice: () => ({
      text: 'Есть риски. Успех не гарантирован.',
      icon: '⚠️',
      type: 'risky'
    })
  },
  {
    id: 'success_dangerous',
    priority: 10,
    condition: (ctx) => ctx.successChance < 40,
    advice: () => ({
      text: 'Опасно! Высокий риск провала.',
      icon: '💀',
      type: 'dangerous'
    })
  }
]

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

function getMissionTypeName(type: ExpeditionType): string {
  const names: Record<ExpeditionType, string> = {
    hunt: 'охоте',
    scout: 'разведке',
    clear: 'зачистке',
    delivery: 'доставке',
    magic: 'магической миссии'
  }
  return names[type]
}

function getDifficultyLevelRange(difficulty: ExpeditionDifficulty): [number, number] {
  const ranges: Record<ExpeditionDifficulty, [number, number]> = {
    easy: [1, 10],
    normal: [8, 20],
    hard: [18, 30],
    extreme: [28, 40],
    legendary: [38, 50]
  }
  return ranges[difficulty]
}

// ================================
// ОСНОВНАЯ ФУНКЦИЯ
// ================================

export function generateAdvice(
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate,
  successChance: number,
  goldReward: number,
  warSoulReward: number
): Advice {
  const ctx: AdviceContext = {
    adventurer,
    expedition,
    successChance,
    goldReward,
    warSoulReward
  }
  
  // Сортируем по приоритету (по убыванию)
  const sortedRules = [...adviceRules].sort((a, b) => b.priority - a.priority)
  
  // Находим первое подходящее правило
  for (const rule of sortedRules) {
    if (rule.condition(ctx)) {
      return rule.advice(ctx)
    }
  }
  
  // Fallback
  return {
    text: 'Подходит для миссии',
    icon: '✓',
    type: 'good'
  }
}

/**
 * Генерирует список всех применимых советов (для детального просмотра)
 */
export function generateAllAdvice(
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate,
  successChance: number,
  goldReward: number,
  warSoulReward: number
): Advice[] {
  const ctx: AdviceContext = {
    adventurer,
    expedition,
    successChance,
    goldReward,
    warSoulReward
  }
  
  const results: Advice[] = []
  const sortedRules = [...adviceRules].sort((a, b) => b.priority - a.priority)
  
  for (const rule of sortedRules) {
    if (rule.condition(ctx)) {
      results.push(rule.advice(ctx))
    }
  }
  
  return results
}

/**
 * Форматирует эффект для отображения в UI
 */
export function formatEffect(value: number, type: 'success' | 'gold' | 'warSoul' | 'weaponLoss'): string {
  const sign = value > 0 ? '+' : ''
  const labels = {
    success: 'успех',
    gold: 'золото',
    warSoul: 'души',
    weaponLoss: 'потеря оружия'
  }
  return `${sign}${value}% ${labels[type]}`
}

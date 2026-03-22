/**
 * Провайдер модификаторов характера (Personality Traits)
 * 
 * Все 12 черт влияют на экспедицию:
 * - brave: +10% успех на сложных
 * - cautious: +5% успех на easy
 * - reckless: +8% успех всегда, но риск
 * - veteran: +5% успех всегда
 * - lazy: -5% успех на долгих
 * - greedy: +10% золото, +5% потеря оружия
 * - honourable: +8% успех на защите/эскорте
 * - mercenary: +5% золото, -3% успех
 * - glory_seeker: +15% успех на legendary, -10% на easy
 * - survivor: -15% потеря оружия, -10% износ
 * - ambitious: +10% души
 * - hot_headed: ±10% случайный бонус
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'
import { getPersonalityTraitById } from '@/data/adventurer-tags/personality-traits'
import type { ExpeditionType } from '@/data/expedition-templates'

// Карта экспедиционных эффектов характера
const TRAIT_EXPEDITION_EFFECTS: Record<string, {
  successBonus?: number
  goldBonus?: number
  warSoulBonus?: number
  weaponLossMod?: number
  weaponWearMod?: number
  critBonus?: number
  conditions?: {
    difficulty?: string[]
    missionType?: ExpeditionType[]
    random?: { min: number; max: number }
  }
}> = {
  brave: {
    successBonus: 10,
    conditions: { difficulty: ['hard', 'extreme', 'legendary'] }
  },
  cautious: {
    successBonus: 5,
    conditions: { difficulty: ['easy'] }
  },
  reckless: {
    successBonus: 8,
    // Риск компенсируется высокой наградой
  },
  veteran: {
    successBonus: 5,
  },
  lazy: {
    successBonus: -5,
    // Долгие миссии определяются по длительности
  },
  greedy: {
    goldBonus: 10,
    weaponLossMod: 5, // Риск из-за жадности
  },
  honourable: {
    successBonus: 8,
    conditions: { missionType: ['delivery'] as ExpeditionType[] }, // Эскорт/защита
  },
  mercenary: {
    goldBonus: 5,
    successBonus: -3, // Нет героизма
  },
  glory_seeker: {
    successBonus: 15,
    conditions: { difficulty: ['legendary'] },
  },
  survivor: {
    weaponLossMod: -15,
    weaponWearMod: -10,
  },
  ambitious: {
    warSoulBonus: 10,
  },
  hot_headed: {
    // Случайный бонус обрабатывается отдельно
    conditions: { random: { min: -10, max: 10 } }
  },
}

export const personalityTraitsProvider: ModifierProvider = {
  name: 'personalityTraits',
  priority: 20, // После базовых модификаторов
  
  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer, expedition } = context
    
    const primaryTraitId = adventurer.personality.primaryTrait
    const secondaryTraitId = adventurer.personality.secondaryTrait
    
    // Обрабатываем обе черты
    for (const traitId of [primaryTraitId, secondaryTraitId]) {
      if (!traitId) continue
      
      const traitData = getPersonalityTraitById(traitId)
      if (!traitData) continue
      
      const effects = TRAIT_EXPEDITION_EFFECTS[traitId]
      if (!effects) continue
      
      // Проверка условий
      const conditions = effects.conditions
      if (conditions) {
        // Проверка сложности
        if (conditions.difficulty && !conditions.difficulty.includes(expedition.difficulty)) {
          continue
        }
        // Проверка типа миссии
        if (conditions.missionType && !conditions.missionType.includes(expedition.type)) {
          continue
        }
      }
      
      // Специальная обработка для hot_headed (случайный бонус)
      if (traitId === 'hot_headed') {
        const randomBonus = (Math.random() - 0.5) * 20 // -10% to +10%
        modifiers.push(
          ModifierBuilder.create(`trait_hot_headed_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              randomBonus > 0 ? 'Удача на стороне!' : 'Не повезло...')
            .target('successChance')
            .add(randomBonus)
            .priority(20)
            .build()
        )
        continue
      }
      
      // Специальная обработка для lazy (долгие миссии)
      if (traitId === 'lazy' && expedition.duration > 30) {
        modifiers.push(
          ModifierBuilder.create(`trait_lazy_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              'Лень снижает успех на долгой миссии')
            .target('successChance')
            .add(-5)
            .priority(20)
            .build()
        )
        continue
      }
      
      // Специальная обработка для glory_seeker (штраф на лёгких)
      if (traitId === 'glory_seeker' && expedition.difficulty === 'easy') {
        modifiers.push(
          ModifierBuilder.create(`trait_glory_seeker_penalty_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              'Искатель славы пренебрегает лёгкими миссиями')
            .target('successChance')
            .add(-10)
            .priority(20)
            .build()
        )
        continue
      }
      
      // Стандартные эффекты
      if (effects.successBonus) {
        modifiers.push(
          ModifierBuilder.create(`trait_${traitId}_success_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              traitData.description)
            .target('successChance')
            .add(effects.successBonus)
            .priority(20)
            .build()
        )
      }
      
      if (effects.goldBonus) {
        modifiers.push(
          ModifierBuilder.create(`trait_${traitId}_gold_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              `Характер: +${effects.goldBonus}% золота`)
            .target('gold')
            .add(effects.goldBonus)
            .priority(20)
            .build()
        )
      }
      
      if (effects.warSoulBonus) {
        modifiers.push(
          ModifierBuilder.create(`trait_${traitId}_warsoul_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              `Характер: +${effects.warSoulBonus}% душ войны`)
            .target('warSoul')
            .add(effects.warSoulBonus)
            .priority(20)
            .build()
        )
      }
      
      if (effects.weaponLossMod) {
        modifiers.push(
          ModifierBuilder.create(`trait_${traitId}_weaponloss_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              effects.weaponLossMod > 0 
                ? `Риск потери оружия +${effects.weaponLossMod}%`
                : `Защита оружия ${effects.weaponLossMod}%`)
            .target('weaponLossChance')
            .add(effects.weaponLossMod)
            .priority(20)
            .build()
        )
      }
      
      if (effects.weaponWearMod) {
        modifiers.push(
          ModifierBuilder.create(`trait_${traitId}_weaponwear_${adventurer.id}`)
            .source('trait', traitId, traitData.name, traitData.icon,
              `Износ оружия ${effects.weaponWearMod}%`)
            .target('weaponWear')
            .add(effects.weaponWearMod)
            .priority(20)
            .build()
        )
      }
    }
    
    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(personalityTraitsProvider)

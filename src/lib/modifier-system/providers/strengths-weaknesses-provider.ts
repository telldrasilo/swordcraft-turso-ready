/**
 * Провайдер модификаторов сильных и слабых сторон
 * 
 * Сильные стороны:
 * - iron_will: +10% успех на сложных
 * - keen_eye: +15% золото
 * - quick_reflexes: -25% потеря оружия
 * - tough: +5% успех, -10% потеря оружия
 * - lucky_star: +5% успех, +8% золото, +5% души, -10% потеря оружия
 * - sturdy: -30% износ
 * 
 * Слабые стороны:
 * - arrogant: -12% успех на лёгких
 * - coward: -20% успех на сложных, +25% шанс отказа
 * - superstitious: -15% успех на магических, +30% шанс отказа
 * - old_wound: -5% успех всегда
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'
import { getStrengthById, doesStrengthApply } from '@/data/adventurer-tags/strengths'
import { getWeaknessById, doesWeaknessApply } from '@/data/adventurer-tags/weaknesses'

export const strengthsWeaknessesProvider: ModifierProvider = {
  name: 'strengthsWeaknesses',
  priority: 35, // После социальных тегов
  
  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer, expedition } = context
    const difficulty = expedition.difficulty
    const missionType = expedition.type
    
    // ===== СИЛЬНЫЕ СТОРОНЫ =====
    for (const strength of adventurer.strengths) {
      const data = getStrengthById(strength.id)
      if (!data) continue
      
      // Проверка условий применения
      if (!doesStrengthApply(data, difficulty, missionType)) continue
      
      // Бонус к успеху
      if (data.effects.successBonus !== 0) {
        modifiers.push(
          ModifierBuilder.create(`strength_${strength.id}_success_${adventurer.id}`)
            .source('strength', strength.id, data.name, data.icon,
              data.description)
            .target('successChance')
            .add(data.effects.successBonus)
            .priority(35)
            .build()
        )
      }
      
      // Бонус к золоту
      if (data.effects.goldBonus !== 0) {
        modifiers.push(
          ModifierBuilder.create(`strength_${strength.id}_gold_${adventurer.id}`)
            .source('strength', strength.id, data.name, data.icon,
              data.description)
            .target('gold')
            .add(data.effects.goldBonus)
            .priority(35)
            .build()
        )
      }
      
      // Бонус к душам войны
      if (data.effects.warSoulBonus !== 0) {
        modifiers.push(
          ModifierBuilder.create(`strength_${strength.id}_warsoul_${adventurer.id}`)
            .source('strength', strength.id, data.name, data.icon,
              data.description)
            .target('warSoul')
            .add(data.effects.warSoulBonus)
            .priority(35)
            .build()
        )
      }
      
      // Снижение шанса потери оружия
      if (data.effects.weaponLossReduction !== 0) {
        modifiers.push(
          ModifierBuilder.create(`strength_${strength.id}_weaponloss_${adventurer.id}`)
            .source('strength', strength.id, data.name, data.icon,
              'Защищает оружие от потери')
            .target('weaponLossChance')
            .add(-data.effects.weaponLossReduction)
            .priority(35)
            .build()
        )
      }
      
      // Снижение износа оружия
      if (data.effects.weaponWearReduction !== 0) {
        modifiers.push(
          ModifierBuilder.create(`strength_${strength.id}_weaponwear_${adventurer.id}`)
            .source('strength', strength.id, data.name, data.icon,
              'Меньше износа оружия')
            .target('weaponWear')
            .add(-data.effects.weaponWearReduction)
            .priority(35)
            .build()
        )
      }
    }
    
    // ===== СЛАБЫЕ СТОРОНЫ =====
    for (const weakness of adventurer.weaknesses) {
      const data = getWeaknessById(weakness.id)
      if (!data) continue
      
      // Проверка условий применения
      if (!doesWeaknessApply(data, difficulty, missionType)) continue
      
      // Штраф к успеху
      if (data.effects.successPenalty !== 0) {
        modifiers.push(
          ModifierBuilder.create(`weakness_${weakness.id}_success_${adventurer.id}`)
            .source('weakness', weakness.id, data.name, '⚠️',
              data.description)
            .target('successChance')
            .add(data.effects.successPenalty) // Уже отрицательное
            .priority(35)
            .build()
        )
      }
      
      // Штраф к золоту
      if (data.effects.goldPenalty !== 0) {
        modifiers.push(
          ModifierBuilder.create(`weakness_${weakness.id}_gold_${adventurer.id}`)
            .source('weakness', weakness.id, data.name, '⚠️',
              data.description)
            .target('gold')
            .add(-data.effects.goldPenalty)
            .priority(35)
            .build()
        )
      }
      
      // Штраф к душам войны
      if (data.effects.warSoulPenalty !== 0) {
        modifiers.push(
          ModifierBuilder.create(`weakness_${weakness.id}_warsoul_${adventurer.id}`)
            .source('weakness', weakness.id, data.name, '⚠️',
              data.description)
            .target('warSoul')
            .add(-data.effects.warSoulPenalty)
            .priority(35)
            .build()
        )
      }
      
      // Увеличение шанса потери оружия
      if (data.effects.weaponLossIncrease !== 0) {
        modifiers.push(
          ModifierBuilder.create(`weakness_${weakness.id}_weaponloss_${adventurer.id}`)
            .source('weakness', weakness.id, data.name, '⚠️',
              'Риск потери оружия')
            .target('weaponLossChance')
            .add(data.effects.weaponLossIncrease)
            .priority(35)
            .build()
        )
      }
      
      // Увеличение износа оружия
      if (data.effects.weaponWearIncrease !== 0) {
        modifiers.push(
          ModifierBuilder.create(`weakness_${weakness.id}_weaponwear_${adventurer.id}`)
            .source('weakness', weakness.id, data.name, '⚠️',
              'Больше износа оружия')
            .target('weaponWear')
            .add(data.effects.weaponWearIncrease)
            .priority(35)
            .build()
        )
      }
    }
    
    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(strengthsWeaknessesProvider)

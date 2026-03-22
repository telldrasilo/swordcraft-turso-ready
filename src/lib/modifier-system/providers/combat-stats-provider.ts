/**
 * Провайдер модификаторов боевых характеристик
 * Power → Души войны
 * Precision → Шанс успеха
 * Endurance → Износ оружия
 * Luck → Шанс крита
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'

export const combatStatsProvider: ModifierProvider = {
  name: 'combatStats',
  priority: 10, // Базовые модификаторы, применяются первыми
  
  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer } = context
    const { power, precision, endurance, luck } = adventurer.combat
    
    // Power → War Soul
    // Нормализация вокруг 25: power=25 → 0%, power=40 → +7.5%, power=10 → -7.5%
    const powerBonus = (power - 25) * 0.5
    if (Math.abs(powerBonus) > 0.1) {
      modifiers.push(
        ModifierBuilder.create(`combat_power_${adventurer.id}`)
          .source('combatStat', 'power', 'Сила', '💪', 
            powerBonus > 0 
              ? `Мощь увеличивает добычу душ на +${powerBonus.toFixed(1)}%`
              : `Слабость снижает добычу душ на ${powerBonus.toFixed(1)}%`)
          .target('warSoul')
          .add(powerBonus)
          .priority(10)
          .build()
      )
    }
    
    // Precision → Success Chance
    const precisionBonus = (precision - 25) * 0.3
    if (Math.abs(precisionBonus) > 0.1) {
      modifiers.push(
        ModifierBuilder.create(`combat_precision_${adventurer.id}`)
          .source('combatStat', 'precision', 'Меткость', '🎯',
            precisionBonus > 0
              ? `Точность повышает успех на +${precisionBonus.toFixed(1)}%`
              : `Неточность снижает успех на ${precisionBonus.toFixed(1)}%`)
          .target('successChance')
          .add(precisionBonus)
          .priority(10)
          .build()
      )
    }
    
    // Endurance → Weapon Wear Reduction
    // Положительное значение = меньше износа
    const wearReduction = (endurance - 25) * 0.4
    if (Math.abs(wearReduction) > 0.1) {
      modifiers.push(
        ModifierBuilder.create(`combat_endurance_${adventurer.id}`)
          .source('combatStat', 'endurance', 'Выносливость', '🛡️',
            wearReduction > 0
              ? `Стойкость защищает оружие (−${wearReduction.toFixed(1)}% износ)`
              : `Слабая выносливость увеличивает износ (+${Math.abs(wearReduction).toFixed(1)}%)`)
          .target('weaponWear')
          .add(-wearReduction) // Отрицательное = меньше износа
          .priority(10)
          .build()
      )
    }
    
    // Luck → Crit Chance
    // Базовый крит 5% + модификатор от удачи
    const luckCritBonus = (luck - 25) * 0.2
    if (Math.abs(luckCritBonus) > 0.1) {
      modifiers.push(
        ModifierBuilder.create(`combat_luck_${adventurer.id}`)
          .source('combatStat', 'luck', 'Удача', '⭐',
            luckCritBonus > 0
              ? `Удача увеличивает шанс крита на +${luckCritBonus.toFixed(1)}%`
              : `Невезучесть снижает шанс крита на ${luckCritBonus.toFixed(1)}%`)
          .target('critChance')
          .add(luckCritBonus)
          .priority(10)
          .build()
      )
    }
    
    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(combatStatsProvider)

/**
 * Провайдер модификаторов мотивации
 * 
 * Мотивация влияет на результаты миссии:
 * - gold: +15% золото
 * - glory: +20% слава
 * - challenge: +10% успех, +15% души на hard/extreme/legendary
 * - safety: -20% потеря оружия, -15% износ
 * - experience: +25% души
 * - revenge: +15% успех, +10% золото (против определённых врагов)
 * - curiosity: +10% золото (находки)
 * - duty: +10% успех, +15% слава на защитных миссиях
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'
import { getMotivationById } from '@/data/adventurer-tags/motivations'
import type { ExpeditionType, ExpeditionDifficulty } from '@/data/expedition-templates'

// Карта эффектов мотивации
const MOTIVATION_EFFECTS: Record<string, {
  successBonus?: number
  goldBonus?: number
  warSoulBonus?: number
  gloryBonus?: number
  weaponLossMod?: number
  weaponWearMod?: number
  conditions?: {
    difficulty?: ExpeditionDifficulty[]
    missionType?: ExpeditionType[]
  }
}> = {
  gold: {
    goldBonus: 15,
  },
  glory: {
    gloryBonus: 20,
  },
  challenge: {
    successBonus: 10,
    warSoulBonus: 15,
    conditions: { difficulty: ['hard', 'extreme', 'legendary'] }
  },
  safety: {
    weaponLossMod: -20,
    weaponWearMod: -15,
  },
  experience: {
    warSoulBonus: 25,
  },
  revenge: {
    successBonus: 15,
    goldBonus: 10,
    // Условие по врагам проверяется отдельно
  },
  curiosity: {
    goldBonus: 10, // Находки
  },
  duty: {
    successBonus: 10,
    gloryBonus: 15,
    conditions: { missionType: ['delivery'] } // Защитные миссии
  },
}

export const motivationsProvider: ModifierProvider = {
  name: 'motivations',
  priority: 25, // После характера
  
  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer, expedition } = context
    
    for (const motivationId of adventurer.personality.motivations) {
      const motivationData = getMotivationById(motivationId)
      if (!motivationData) continue
      
      const effects = MOTIVATION_EFFECTS[motivationId]
      if (!effects) continue
      
      // Проверка условий
      const conditions = effects.conditions
      if (conditions) {
        if (conditions.difficulty && !conditions.difficulty.includes(expedition.difficulty)) {
          continue
        }
        if (conditions.missionType && !conditions.missionType.includes(expedition.type)) {
          continue
        }
      }
      
      // Специальная проверка для revenge (враги)
      if (motivationId === 'revenge') {
        const hasPersonalEnemy = expedition.enemyTypes?.some(enemy => 
          ['goblin', 'undead', 'bandit'].includes(enemy)
        )
        if (!hasPersonalEnemy) continue
      }
      
      // Применение эффектов
      if (effects.successBonus) {
        modifiers.push(
          ModifierBuilder.create(`motivation_${motivationId}_success_${adventurer.id}`)
            .source('motivation', motivationId, motivationData.name, motivationData.icon,
              `Мотивация: ${motivationData.description}`)
            .target('successChance')
            .add(effects.successBonus)
            .priority(25)
            .build()
        )
      }
      
      if (effects.goldBonus) {
        modifiers.push(
          ModifierBuilder.create(`motivation_${motivationId}_gold_${adventurer.id}`)
            .source('motivation', motivationId, motivationData.name, motivationData.icon,
              `Мотивирован на +${effects.goldBonus}% золота`)
            .target('gold')
            .add(effects.goldBonus)
            .priority(25)
            .build()
        )
      }
      
      if (effects.warSoulBonus) {
        modifiers.push(
          ModifierBuilder.create(`motivation_${motivationId}_warsoul_${adventurer.id}`)
            .source('motivation', motivationId, motivationData.name, motivationData.icon,
              `Стремится к опыту: +${effects.warSoulBonus}% душ`)
            .target('warSoul')
            .add(effects.warSoulBonus)
            .priority(25)
            .build()
        )
      }
      
      if (effects.gloryBonus) {
        modifiers.push(
          ModifierBuilder.create(`motivation_${motivationId}_glory_${adventurer.id}`)
            .source('motivation', motivationId, motivationData.name, motivationData.icon,
              `Стремится к славе: +${effects.gloryBonus}%`)
            .target('glory')
            .add(effects.gloryBonus)
            .priority(25)
            .build()
        )
      }
      
      if (effects.weaponLossMod) {
        modifiers.push(
          ModifierBuilder.create(`motivation_${motivationId}_weaponloss_${adventurer.id}`)
            .source('motivation', motivationId, motivationData.name, motivationData.icon,
              `Осторожность: ${effects.weaponLossMod}% потеря оружия`)
            .target('weaponLossChance')
            .add(effects.weaponLossMod)
            .priority(25)
            .build()
        )
      }
      
      if (effects.weaponWearMod) {
        modifiers.push(
          ModifierBuilder.create(`motivation_${motivationId}_weaponwear_${adventurer.id}`)
            .source('motivation', motivationId, motivationData.name, motivationData.icon,
              `Бережёт оружие: ${effects.weaponWearMod}% износ`)
            .target('weaponWear')
            .add(effects.weaponWearMod)
            .priority(25)
            .build()
        )
      }
    }
    
    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(motivationsProvider)

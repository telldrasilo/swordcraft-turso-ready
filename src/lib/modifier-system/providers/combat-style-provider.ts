/**
 * Провайдер модификаторов стиля боя и предпочтений оружия
 * 
 * Стиль боя:
 * - Бонусы к типам миссий (berserker: +15% охота, +10% зачистка)
 * - Штрафы к неподходящим миссиям
 * 
 * Предпочитаемое оружие:
 * - +5% успех при использовании любимого оружия
 * - -5% успех при использовании нелюбимого оружия
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'
import { getCombatStyleById, getMissionBonus } from '@/data/adventurer-tags/combat-styles'

// Перевод типов оружия
const WEAPON_TYPE_NAMES: Record<string, string> = {
  sword: 'Меч',
  axe: 'Топор',
  dagger: 'Кинжал',
  mace: 'Булава',
  spear: 'Копьё',
  hammer: 'Молот',
}

export const combatStyleProvider: ModifierProvider = {
  name: 'combatStyle',
  priority: 40, // После сильных/слабых сторон
  
  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer, expedition, weapon } = context
    
    const combatStyle = getCombatStyleById(adventurer.combat.combatStyle)
    if (!combatStyle) return modifiers
    
    // ===== БОНУС ОТ СТИЛЯ БОЯ К ТИПУ МИССИИ =====
    const missionBonus = getMissionBonus(combatStyle, expedition.type)
    if (missionBonus !== 0) {
      const missionTypeNames: Record<string, string> = {
        hunt: 'охоту',
        scout: 'разведку',
        clear: 'зачистку',
        delivery: 'доставку',
        magic: 'магические миссии',
      }
      
      modifiers.push(
        ModifierBuilder.create(`combatstyle_${combatStyle.id}_mission_${adventurer.id}`)
          .source('combatStyle', combatStyle.id, combatStyle.name, combatStyle.icon,
            missionBonus > 0
              ? `Специализация на ${missionTypeNames[expedition.type] || 'этом типе миссий'}`
              : `Не подходит для ${missionTypeNames[expedition.type] || 'этого типа миссий'}`)
          .target('successChance')
          .add(missionBonus)
          .priority(40)
          .build()
      )
    }
    
    // ===== БОНУС ЗА ПРЕДПОЧИТАЕМОЕ ОРУЖИЕ =====
    const weaponType = weapon.type
    const preferredWeapons = adventurer.combat.preferredWeapons || []
    const avoidedWeapons = adventurer.combat.avoidedWeapons || []
    
    const isPreferred = preferredWeapons.includes(weaponType)
    const isAvoided = avoidedWeapons.includes(weaponType)
    
    if (isPreferred) {
      modifiers.push(
        ModifierBuilder.create(`weapon_preferred_${adventurer.id}`)
          .source('weapon', 'preferred', 'Любимое оружие', '⚔️',
            `${WEAPON_TYPE_NAMES[weaponType] || weaponType} — излюбленное оружие искателя`)
          .target('successChance')
          .add(5)
          .priority(40)
          .build()
      )
    } else if (isAvoided) {
      modifiers.push(
        ModifierBuilder.create(`weapon_avoided_${adventurer.id}`)
          .source('weapon', 'avoided', 'Нелюбимое оружие', '⚠️',
            `${WEAPON_TYPE_NAMES[weaponType] || weaponType} — неудобное для искателя`)
          .target('successChance')
          .add(-5)
          .priority(40)
          .build()
      )
    }
    
    // ===== БОНУС ОТ АТАКИ ОРУЖИЯ =====
    const minWeaponAttack = expedition.minWeaponAttack
    const attackDiff = weapon.attack - minWeaponAttack
    
    if (attackDiff > 0) {
      const attackBonus = Math.min(15, attackDiff * 0.5)
      modifiers.push(
        ModifierBuilder.create(`weapon_attack_${adventurer.id}`)
          .source('weapon', 'attack', 'Оружие', '⚔️',
            `Атака оружия выше требуемой на ${attackDiff}`)
          .target('successChance')
          .add(attackBonus)
          .priority(40)
          .build()
      )
    }
    
    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(combatStyleProvider)

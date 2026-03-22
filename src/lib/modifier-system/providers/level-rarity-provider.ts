/**
 * Провайдер модификаторов уровня и редкости
 * 
 * Уровень:
 * - levelMatch: +5% optimal, -penalty underlevel, -boredom overlevel
 * - Бонус к душам: level/10%
 * - Бонус к криту: level/20%
 * 
 * Редкость:
 * - Множители к золоту и душам войны
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'
import { difficultyInfo } from '@/data/expedition-templates'

// Множители редкости
const RARITY_MULTIPLIERS = {
  common: { gold: 0, warSoul: 0 },
  uncommon: { gold: 10, warSoul: 15 },
  rare: { gold: 20, warSoul: 30 },
  epic: { gold: 35, warSoul: 50 },
  legendary: { gold: 50, warSoul: 100 },
}

export const levelRarityProvider: ModifierProvider = {
  name: 'levelRarity',
  priority: 5, // Самые базовые модификаторы
  
  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer, expedition } = context
    const level = adventurer.combat.level
    const rarity = adventurer.combat.rarity
    const difficultyData = difficultyInfo[expedition.difficulty]
    
    // ===== УРОВЕНЬ =====
    
    // Соответствие уровню миссии
    const [minLevel, maxLevel] = difficultyData.levelRange
    
    if (level < minLevel - 5) {
      // Опасно низкий уровень
      const penalty = Math.min(30, (minLevel - level) * 3)
      modifiers.push(
        ModifierBuilder.create(`level_penalty_${adventurer.id}`)
          .source('level', 'dangerous', 'Уровень', '📉',
            `Слишком низкий уровень (${level} против ${minLevel}+)`)
          .target('successChance')
          .add(-penalty)
          .priority(5)
          .build()
      )
    } else if (level > maxLevel + 10) {
      // Слишком высокий уровень (скука)
      const penalty = Math.min(15, (level - maxLevel - 10) * 1.5)
      modifiers.push(
        ModifierBuilder.create(`level_boredom_${adventurer.id}`)
          .source('level', 'overlevel', 'Скука', '😴',
            'Опытному искателю скучно на лёгких миссиях')
          .target('successChance')
          .add(-penalty)
          .priority(5)
          .build()
      )
    } else if (level >= minLevel && level <= maxLevel) {
      // Оптимальный уровень
      modifiers.push(
        ModifierBuilder.create(`level_optimal_${adventurer.id}`)
          .source('level', 'optimal', 'Уровень', '✓',
            'Идеальное соответствие уровню миссии')
          .target('successChance')
          .add(5)
          .priority(5)
          .build()
      )
    }
    
    // Бонус к душам от уровня
    const levelWarSoulBonus = level / 10 // 1% за 10 уровней
    if (levelWarSoulBonus > 0) {
      modifiers.push(
        ModifierBuilder.create(`level_warsoul_${adventurer.id}`)
          .source('level', 'bonus', 'Опыт', '📈',
            `Опыт уровня ${level} даёт +${levelWarSoulBonus.toFixed(1)}% душ`)
          .target('warSoul')
          .add(levelWarSoulBonus)
          .priority(5)
          .build()
      )
    }
    
    // Бонус к криту от уровня
    const levelCritBonus = level / 20 // 0.5% за 10 уровней
    if (levelCritBonus > 0) {
      modifiers.push(
        ModifierBuilder.create(`level_crit_${adventurer.id}`)
          .source('level', 'crit', 'Мастерство', '✨',
            `Мастерство уровня ${level} даёт +${levelCritBonus.toFixed(1)}% крита`)
          .target('critChance')
          .add(levelCritBonus)
          .priority(5)
          .build()
      )
    }
    
    // ===== РЕДКОСТЬ =====
    
    const rarityMods = RARITY_MULTIPLIERS[rarity]
    const rarityNames: Record<string, string> = {
      common: 'Обычный',
      uncommon: 'Необычный',
      rare: 'Редкий',
      epic: 'Эпический',
      legendary: 'Легендарный',
    }
    
    if (rarityMods.gold > 0) {
      modifiers.push(
        ModifierBuilder.create(`rarity_gold_${adventurer.id}`)
          .source('rarity', rarity, `${rarityNames[rarity]} искатель`, '⭐',
            `${rarityNames[rarity]} искатель находит +${rarityMods.gold}% золота`)
          .target('gold')
          .add(rarityMods.gold)
          .priority(5)
          .build()
      )
    }
    
    if (rarityMods.warSoul > 0) {
      modifiers.push(
        ModifierBuilder.create(`rarity_warsoul_${adventurer.id}`)
          .source('rarity', rarity, `${rarityNames[rarity]} искатель`, '⭐',
            `${rarityNames[rarity]} искатель приносит +${rarityMods.warSoul}% душ`)
          .target('warSoul')
          .add(rarityMods.warSoul)
          .priority(5)
          .build()
      )
    }
    
    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(levelRarityProvider)

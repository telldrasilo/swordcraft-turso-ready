/**
 * Провайдер модификаторов социальных тегов
 * 
 * Социальные теги влияют на успех и награды:
 * - noble: -5% успех, +10% золото (привык к комфорту)
 * - peasant: +3% успех (закалённый трудом)
 * - outcast: +5% успех (нечего терять)
 * - famous: -3% успех, +20% золото (груз репутации)
 * - newcomer: +5% успех (старается проявить себя)
 * - veteran_guild: +8% успех (опыт в гильдии)
 * - mysterious: ±5% случайный (непредсказуемо)
 * - legendary: +10% успех, +30% золото
 */

import type { ModifierProvider, Modifier, ModifierContext } from '../types'
import { ModifierBuilder } from '../types'
import { modifierRegistry } from '../registry'
import { getSocialTagById } from '@/data/adventurer-tags/social-tags'

// Карта эффектов социальных тегов
const SOCIAL_TAG_EFFECTS: Record<string, {
  successModifier?: number
  goldModifier?: number
  warSoulModifier?: number
  random?: { min: number; max: number }
}> = {
  noble: {
    successModifier: -5, // Привык к комфорту, труднее в поле
    goldModifier: 10,    // Уже есть в существующем коде
  },
  peasant: {
    successModifier: 3, // Закалённый трудом
  },
  outcast: {
    successModifier: 5, // Нечего терять
  },
  famous: {
    successModifier: -3, // Груз репутации
    goldModifier: 20,    // Уже есть
  },
  newcomer: {
    successModifier: 5, // Старается проявить себя
  },
  veteran_guild: {
    successModifier: 8, // Опыт работы в гильдии
  },
  mysterious: {
    random: { min: -5, max: 5 }, // Непредсказуемо
  },
  legendary: {
    successModifier: 10,
    goldModifier: 30, // Уже есть
  },
}

export const socialTagsProvider: ModifierProvider = {
  name: 'socialTags',
  priority: 30, // После мотиваций
  
  getModifiers(context: ModifierContext): Modifier[] {
    const modifiers: Modifier[] = []
    const { adventurer } = context
    
    for (const tagId of adventurer.personality.socialTags) {
      const tagData = getSocialTagById(tagId)
      if (!tagData) continue
      
      const effects = SOCIAL_TAG_EFFECTS[tagId]
      if (!effects) continue
      
      // Существующие goldModifier из tagData
      if (tagData.effects.goldModifier !== 0) {
        modifiers.push(
          ModifierBuilder.create(`social_${tagId}_gold_${adventurer.id}`)
            .source('socialTag', tagId, tagData.name, tagData.icon,
              tagData.effects.goldModifier > 0
                ? 'Лучшие контракты благодаря репутации'
                : 'Скромные запросы')
            .target('gold')
            .add(tagData.effects.goldModifier)
            .priority(30)
            .build()
        )
      }
      
      // Новые successModifier
      if (effects.successModifier !== undefined && effects.successModifier !== 0) {
        modifiers.push(
          ModifierBuilder.create(`social_${tagId}_success_${adventurer.id}`)
            .source('socialTag', tagId, tagData.name, tagData.icon,
              effects.successModifier > 0
                ? `${tagData.description}: +${effects.successModifier}% успех`
                : `${tagData.description}: ${effects.successModifier}% успех`)
            .target('successChance')
            .add(effects.successModifier)
            .priority(30)
            .build()
        )
      }
      
      // Случайный бонус для mysterious
      if (effects.random) {
        const randomBonus = effects.random.min + Math.random() * (effects.random.max - effects.random.min)
        if (Math.abs(randomBonus) > 0.1) {
          modifiers.push(
            ModifierBuilder.create(`social_${tagId}_random_${adventurer.id}`)
              .source('socialTag', tagId, tagData.name, tagData.icon,
                randomBonus > 0 ? 'Удача сопутствует...' : 'Неожиданные препятствия...')
              .target('successChance')
              .add(randomBonus)
              .priority(30)
              .build()
          )
        }
      }
    }
    
    return modifiers
  },
}

// Автоматическая регистрация
modifierRegistry.register(socialTagsProvider)

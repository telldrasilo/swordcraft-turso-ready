/**
 * Черты характера искателей приключений
 */

export type TraitRarity = 'common' | 'uncommon' | 'rare'
export type TraitEffectType = 'success_rate' | 'bonus_chance' | 'wear' | 'soul_points' | 'duration' | 'magic' | 'weapon_loss'

export interface AdventurerTrait {
  id: string
  name: string
  icon: string
  description: string
  effect: {
    type: TraitEffectType
    value: number // Процентный бонус/штраф (может быть отрицательным)
  }
  rarity: TraitRarity
}

// Полный список черт характера
export const adventurerTraits: AdventurerTrait[] = [
  // === ОБЫЧНЫЕ (Common) ===
  {
    id: 'brave',
    name: 'Храбрый',
    icon: '🦁',
    description: 'Не боится опасностей',
    effect: { type: 'success_rate', value: 10 },
    rarity: 'common',
  },
  {
    id: 'cautious',
    name: 'Осторожный',
    icon: '🛡️',
    description: 'Бережёт себя и снаряжение',
    effect: { type: 'wear', value: -20 },
    rarity: 'common',
  },
  {
    id: 'stubborn',
    name: 'Упорный',
    icon: '🦬',
    description: 'Не сдаётся без боя',
    effect: { type: 'success_rate', value: 5 },
    rarity: 'common',
  },
  {
    id: 'tired',
    name: 'Уставший',
    icon: '😴',
    description: 'Давно в пути',
    effect: { type: 'success_rate', value: -5 },
    rarity: 'common',
  },
  {
    id: 'novice',
    name: 'Новичок',
    icon: '🌱',
    description: 'Только начинает путь',
    effect: { type: 'soul_points', value: -5 },
    rarity: 'common',
  },
  {
    id: 'careful',
    name: 'Бережливый',
    icon: '💎',
    description: 'Заботится о своём оружии',
    effect: { type: 'weapon_loss', value: -10 },
    rarity: 'common',
  },

  // === НЕОБЫЧНЫЕ (Uncommon) ===
  {
    id: 'cunning',
    name: 'Хитрый',
    icon: '🦊',
    description: 'Находит дополнительные бонусы',
    effect: { type: 'bonus_chance', value: 15 },
    rarity: 'uncommon',
  },
  {
    id: 'strong',
    name: 'Сильный',
    icon: '💪',
    description: 'Мощные удары приносят больше душ',
    effect: { type: 'soul_points', value: 10 },
    rarity: 'uncommon',
  },
  {
    id: 'fast',
    name: 'Быстрый',
    icon: '🦅',
    description: 'Действует стремительно',
    effect: { type: 'duration', value: -25 },
    rarity: 'uncommon',
  },
  {
    id: 'greedy',
    name: 'Алчный',
    icon: '💰',
    description: 'Всегда ищет золото',
    effect: { type: 'bonus_chance', value: 20 },
    rarity: 'uncommon',
  },
  {
    id: 'rusher',
    name: 'Гонщик',
    icon: '⚡',
    description: 'Спешит закончить дело',
    effect: { type: 'duration', value: -30 },
    rarity: 'uncommon',
  },
  {
    id: 'veteran',
    name: 'Ветеран',
    icon: '🎖️',
    description: 'Много повидал на своём веку',
    effect: { type: 'success_rate', value: 8 },
    rarity: 'uncommon',
  },
  {
    id: 'scout',
    name: 'Разведчик',
    icon: '🔭',
    description: 'Видит опасности заранее',
    effect: { type: 'weapon_loss', value: -15 },
    rarity: 'uncommon',
  },

  // === РЕДКИЕ (Rare) ===
  {
    id: 'lucky',
    name: 'Удачливый',
    icon: '🎭',
    description: 'Удача сопутствует ему',
    effect: { type: 'bonus_chance', value: 25 },
    rarity: 'rare',
  },
  {
    id: 'magical',
    name: 'Магический',
    icon: '🧙',
    description: 'Особенно силён в магических квестах',
    effect: { type: 'magic', value: 20 },
    rarity: 'rare',
  },
  {
    id: 'soul_seeker',
    name: 'Искатель душ',
    icon: '👻',
    description: 'Чувствует души и притягивает их',
    effect: { type: 'soul_points', value: 20 },
    rarity: 'rare',
  },
  {
    id: 'reckless',
    name: 'Безрассудный',
    icon: '🔥',
    description: 'Рискует всем ради победы',
    effect: { type: 'success_rate', value: 15 },
    rarity: 'rare',
  },
  {
    id: 'ghost_walker',
    name: 'Призрачный шаг',
    icon: '🌫️',
    description: 'Неуловим, как призрак',
    effect: { type: 'weapon_loss', value: -25 },
    rarity: 'rare',
  },
  {
    id: 'treasure_hunter',
    name: 'Охотник за сокровищами',
    icon: '🗝️',
    description: 'Находит редкости там, где другие не смотрят',
    effect: { type: 'bonus_chance', value: 30 },
    rarity: 'rare',
  },
]

// Функция получения черты по ID
export function getTraitById(id: string): AdventurerTrait | undefined {
  return adventurerTraits.find(t => t.id === id)
}

// Функция получения черт по редкости
export function getTraitsByRarity(rarity: TraitRarity): AdventurerTrait[] {
  return adventurerTraits.filter(t => t.rarity === rarity)
}

// Функция случайного выбора черты с учётом редкости
export function getRandomTrait(guildLevel: number = 1): AdventurerTrait {
  const roll = Math.random()

  // Вероятности зависят от уровня гильдии
  const rareChance = 0.05 + (guildLevel - 1) * 0.02 // 5% + 2% за уровень
  const uncommonChance = 0.25 + (guildLevel - 1) * 0.03 // 25% + 3% за уровень

  if (roll < rareChance) {
    const rareTraits = getTraitsByRarity('rare')
    return rareTraits[Math.floor(Math.random() * rareTraits.length)]
  } else if (roll < rareChance + uncommonChance) {
    const uncommonTraits = getTraitsByRarity('uncommon')
    return uncommonTraits[Math.floor(Math.random() * uncommonTraits.length)]
  } else {
    const commonTraits = getTraitsByRarity('common')
    return commonTraits[Math.floor(Math.random() * commonTraits.length)]
  }
}

// Функция генерации набора черт для искателя
export function generateTraits(guildLevel: number = 1, count?: number): AdventurerTrait[] {
  // Случайное количество черт (0-3), зависит от уровня гильдии
  const maxTraits = Math.min(3, 1 + Math.floor(guildLevel / 2))
  const actualCount = count ?? Math.floor(Math.random() * (maxTraits + 1))

  const traits: AdventurerTrait[] = []
  const usedIds = new Set<string>()

  for (let i = 0; i < actualCount; i++) {
    let trait = getRandomTrait(guildLevel)
    // Избегаем дубликатов
    let attempts = 0
    while (usedIds.has(trait.id) && attempts < 10) {
      trait = getRandomTrait(guildLevel)
      attempts++
    }
    if (!usedIds.has(trait.id)) {
      traits.push(trait)
      usedIds.add(trait.id)
    }
  }

  return traits
}

// Функция расчёта общего эффекта черт
export function calculateTraitsEffect(traits: AdventurerTrait[]): Record<TraitEffectType, number> {
  const effects: Record<TraitEffectType, number> = {
    success_rate: 0,
    bonus_chance: 0,
    wear: 0,
    soul_points: 0,
    duration: 0,
    magic: 0,
    weapon_loss: 0,
  }

  for (const trait of traits) {
    effects[trait.effect.type] += trait.effect.value
  }

  return effects
}

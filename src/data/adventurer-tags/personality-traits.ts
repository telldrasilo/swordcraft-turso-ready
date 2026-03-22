/**
 * Тэги характера искателей
 * Влияют на фразы и вероятность согласия/отказа
 */

import type { PersonalityTraitId } from '@/types/adventurer-extended'

export interface PersonalityTraitData {
  id: PersonalityTraitId
  name: string
  description: string
  icon: string
  // Влияние на шанс согласия
  acceptModifiers: {
    easy: number      // Модификатор для лёгких миссий
    normal: number
    hard: number
    extreme: number
    legendary: number
  }
  // Особые условия
  specialConditions?: {
    condition: string
    modifier: number
  }[]
}

export const personalityTraits: PersonalityTraitData[] = [
  {
    id: 'brave',
    name: 'Храбрый',
    description: 'Не боится сложных миссий и опасностей',
    icon: '🦁',
    acceptModifiers: { easy: 0, normal: 5, hard: 15, extreme: 20, legendary: 25 },
    specialConditions: [
      { condition: 'low_health', modifier: 10 } // Согласится даже при низком HP
    ]
  },
  {
    id: 'cautious',
    name: 'Осторожный',
    description: 'Избегает лишнего риска, бережёт себя',
    icon: '🛡️',
    acceptModifiers: { easy: 15, normal: 5, hard: -10, extreme: -25, legendary: -40 },
    specialConditions: [
      { condition: 'safe_mission', modifier: 10 }
    ]
  },
  {
    id: 'greedy',
    name: 'Алчный',
    description: 'Хочет больше награды за свою работу',
    icon: '💰',
    acceptModifiers: { easy: -5, normal: 0, hard: 5, extreme: 10, legendary: 15 },
    specialConditions: [
      { condition: 'high_gold', modifier: 20 },
      { condition: 'low_gold', modifier: -30 }
    ]
  },
  {
    id: 'honourable',
    name: 'Благородный',
    description: 'Выбирает справедливые и праведные миссии',
    icon: '⚔️',
    acceptModifiers: { easy: 5, normal: 10, hard: 5, extreme: 0, legendary: -5 },
    specialConditions: [
      { condition: 'protect_mission', modifier: 20 },
      { condition: 'assassin_mission', modifier: -20 }
    ]
  },
  {
    id: 'reckless',
    name: 'Безрассудный',
    description: 'Рискует без раздумий, ищет острых ощущений',
    icon: '🔥',
    acceptModifiers: { easy: -10, normal: 5, hard: 20, extreme: 30, legendary: 35 },
    specialConditions: [
      { condition: 'any_mission', modifier: 15 } // Всегда есть базовый бонус
    ]
  },
  {
    id: 'mercenary',
    name: 'Наёмник',
    description: 'Всё решает золото, никаких сантиментов',
    icon: '🗡️',
    acceptModifiers: { easy: 0, normal: 0, hard: 0, extreme: 0, legendary: 0 },
    specialConditions: [
      { condition: 'high_gold', modifier: 25 },
      { condition: 'low_gold', modifier: -25 },
      { condition: 'high_risk', modifier: -15 } // Требует доплату за риск
    ]
  },
  {
    id: 'glory_seeker',
    name: 'Искатель славы',
    description: 'Хочет громких побед и всеобщего признания',
    icon: '⭐',
    acceptModifiers: { easy: -20, normal: -5, hard: 10, extreme: 20, legendary: 40 },
    specialConditions: [
      { condition: 'legendary_mission', modifier: 20 },
      { condition: 'unknown_mission', modifier: -10 }
    ]
  },
  {
    id: 'survivor',
    name: 'Выживший',
    description: 'Ценит жизнь превыше всего, знает цену опасностям',
    icon: '🏃',
    acceptModifiers: { easy: 10, normal: 5, hard: -5, extreme: -20, legendary: -35 },
    specialConditions: [
      { condition: 'low_risk', modifier: 15 },
      { condition: 'high_risk', modifier: -20 }
    ]
  },
  {
    id: 'ambitious',
    name: 'Амбициозный',
    description: 'Хочет сложные задания для роста',
    icon: '📈',
    acceptModifiers: { easy: -25, normal: -10, hard: 10, extreme: 20, legendary: 25 },
    specialConditions: [
      { condition: 'overqualified', modifier: -30 }, // Слишком лёгкая миссия
      { condition: 'challenge', modifier: 20 }
    ]
  },
  {
    id: 'lazy',
    name: 'Ленивый',
    description: 'Предпочитает простые и короткие задания',
    icon: '😴',
    acceptModifiers: { easy: 20, normal: 5, hard: -15, extreme: -30, legendary: -40 },
    specialConditions: [
      { condition: 'short_mission', modifier: 15 },
      { condition: 'long_mission', modifier: -20 }
    ]
  },
  {
    id: 'veteran',
    name: 'Ветеран',
    description: 'Спокоен и опытен, повидал многое',
    icon: '🎖️',
    acceptModifiers: { easy: 5, normal: 10, hard: 10, extreme: 5, legendary: 0 },
    specialConditions: [
      { condition: 'any_mission', modifier: 5 } // Стабильный небольшой бонус
    ]
  },
  {
    id: 'hot_headed',
    name: 'Горячий',
    description: 'Реагирует эмоционально, решения непредсказуемы',
    icon: '😤',
    acceptModifiers: { easy: 0, normal: 0, hard: 0, extreme: 0, legendary: 0 },
    specialConditions: [
      { condition: 'random', modifier: 0 } // Случайный модификатор ±20
    ]
  }
]

// Функция получения тэга по ID
export function getPersonalityTraitById(id: PersonalityTraitId): PersonalityTraitData | undefined {
  return personalityTraits.find(t => t.id === id)
}

// Функция получения случайного тэга
export function getRandomPersonalityTrait(): PersonalityTraitData {
  return personalityTraits[Math.floor(Math.random() * personalityTraits.length)]
}

// Функция получения случайной пары тэгов (основной + вторичный)
export function generatePersonalityTraits(): {
  primary: PersonalityTraitData
  secondary?: PersonalityTraitData
} {
  const primary = getRandomPersonalityTrait()
  
  // 40% шанс иметь вторичный тэг
  if (Math.random() < 0.4) {
    let secondary = getRandomPersonalityTrait()
    let attempts = 0
    // Избегаем дубликатов
    while (secondary.id === primary.id && attempts < 10) {
      secondary = getRandomPersonalityTrait()
      attempts++
    }
    if (secondary.id !== primary.id) {
      return { primary, secondary }
    }
  }
  
  return { primary }
}

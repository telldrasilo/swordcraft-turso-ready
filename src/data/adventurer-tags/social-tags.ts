/**
 * Социальные тэги искателей
 * Определяют происхождение и репутацию
 */

import type { SocialTagId } from '@/types/adventurer-extended'

export interface SocialTagData {
  id: SocialTagId
  name: string
  description: string
  icon: string
  // Влияние на отношения
  effects: {
    goldModifier: number      // Модификатор награды
    refuseChance: number      // Модификатор отказа
    specialAccess?: string    // Особый доступ
  }
  // Требования к миссиям
  missionPreferences?: {
    prefers: string[]         // Предпочитаемые типы
    avoids: string[]          // Избегаемые типы
  }
}

export const socialTags: SocialTagData[] = [
  {
    id: 'noble',
    name: 'Дворянин',
    description: 'Высокое происхождение, требует уважения',
    icon: '👑',
    effects: {
      goldModifier: 10,     // +10% награда (лучшие контракты)
      refuseChance: 15      // +15% шанс отказа (привередлив)
    },
    missionPreferences: {
      prefers: ['protect', 'diplomatic', 'escort'],
      avoids: ['assassination', 'thievery']
    }
  },
  {
    id: 'peasant',
    name: 'Простолюдин',
    description: 'Простое происхождение, нетребователен',
    icon: '🌾',
    effects: {
      goldModifier: -5,     // -5% награда (скромные запросы)
      refuseChance: -10     // -10% шанс отказа (берёт любую работу)
    }
  },
  {
    id: 'outcast',
    name: 'Изгнанник',
    description: 'Отвержен обществом, берёт любую работу',
    icon: '🌑',
    effects: {
      goldModifier: -15,    // -15% награда (готов работать за меньше)
      refuseChance: -25     // -25% шанс отказа (нужна работа)
    },
    missionPreferences: {
      prefers: ['dangerous', 'shady', 'suicide'],
      avoids: []
    }
  },
  {
    id: 'famous',
    name: 'Знаменитый',
    description: 'Известен в гильдии, требует достойных миссий',
    icon: '🌟',
    effects: {
      goldModifier: 20,     // +20% награда (известное имя)
      refuseChance: 20      // +20% шанс отказа (репутация)
    },
    missionPreferences: {
      prefers: ['legendary', 'extreme', 'heroic'],
      avoids: ['easy', 'trivial']
    }
  },
  {
    id: 'newcomer',
    name: 'Новичок',
    description: 'Недавно в гильдии, берётся за простые миссии',
    icon: '🌱',
    effects: {
      goldModifier: -10,    // -10% награда (малый опыт)
      refuseChance: -15     // -15% шанс отказа (нужен опыт)
    },
    missionPreferences: {
      prefers: ['easy', 'normal', 'training'],
      avoids: ['extreme', 'legendary']
    }
  },
  {
    id: 'veteran_guild',
    name: 'Старожил',
    description: 'Давно в гильдии, знает все тонкости',
    icon: '🏛️',
    effects: {
      goldModifier: 5,      // +5% награда (опыт)
      refuseChance: -5      // -5% шанс отказа (лоялен)
    }
  },
  {
    id: 'mysterious',
    name: 'Загадочный',
    description: 'Тёмное прошлое, непредсказуем',
    icon: '🎭',
    effects: {
      goldModifier: 0,
      refuseChance: 0       // Непредсказуемо
    },
    missionPreferences: {
      prefers: ['mysterious', 'magical', 'forbidden'],
      avoids: []
    }
  },
  {
    id: 'legendary',
    name: 'Легенда',
    description: 'О нём ходят легенды, только важные миссии',
    icon: '💫',
    effects: {
      goldModifier: 30,     // +30% награда (легендарный статус)
      refuseChance: 40      // +40% шанс отказа (только важные)
    },
    missionPreferences: {
      prefers: ['legendary', 'world_saving', 'epic'],
      avoids: ['easy', 'normal', 'trivial']
    }
  }
]

// Функция получения тэга по ID
export function getSocialTagById(id: SocialTagId): SocialTagData | undefined {
  return socialTags.find(t => t.id === id)
}

// Функция генерации случайного социального тэга
export function generateSocialTag(): SocialTagId {
  // Взвешенная генерация
  const weights = {
    peasant: 35,      // Самый частый
    newcomer: 25,
    veteran_guild: 15,
    outcast: 10,
    noble: 6,
    mysterious: 4,
    famous: 3,
    legendary: 2      // Самый редкий
  }
  
  const roll = Math.random() * 100
  let cumulative = 0
  
  for (const [id, weight] of Object.entries(weights)) {
    cumulative += weight
    if (roll < cumulative) {
      return id as SocialTagId
    }
  }
  
  return 'peasant'
}

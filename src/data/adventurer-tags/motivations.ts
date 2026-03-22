/**
 * Тэги мотивации искателей
 * Что мотивирует искателя согласиться на миссию
 */

import type { MotivationId } from '@/types/adventurer-extended'

export interface MotivationData {
  id: MotivationId
  name: string
  description: string
  icon: string
  // Бонусы к согласию при определённых условиях
  triggers: {
    condition: string
    bonus: number
  }[]
}

export const motivations: MotivationData[] = [
  {
    id: 'gold',
    name: 'Золото',
    description: 'Больше золота = выше шанс согласия',
    icon: '💰',
    triggers: [
      { condition: 'gold_100_plus', bonus: 15 },
      { condition: 'gold_200_plus', bonus: 25 },
      { condition: 'gold_below_50', bonus: -15 }
    ]
  },
  {
    id: 'glory',
    name: 'Слава',
    description: 'Больше славы = выше шанс согласия',
    icon: '⭐',
    triggers: [
      { condition: 'glory_10_plus', bonus: 10 },
      { condition: 'glory_20_plus', bonus: 20 },
      { condition: 'legendary_mission', bonus: 25 }
    ]
  },
  {
    id: 'challenge',
    name: 'Вызов',
    description: 'Сложность миссии привлекает',
    icon: '🎯',
    triggers: [
      { condition: 'hard_mission', bonus: 15 },
      { condition: 'extreme_mission', bonus: 25 },
      { condition: 'legendary_mission', bonus: 35 },
      { condition: 'easy_mission', bonus: -10 }
    ]
  },
  {
    id: 'safety',
    name: 'Безопасность',
    description: 'Низкий риск привлекает',
    icon: '🛡️',
    triggers: [
      { condition: 'low_risk', bonus: 20 },
      { condition: 'medium_risk', bonus: 5 },
      { condition: 'high_risk', bonus: -20 },
      { condition: 'extreme_risk', bonus: -35 }
    ]
  },
  {
    id: 'experience',
    name: 'Опыт',
    description: 'Возможность прокачки навыков',
    icon: '📚',
    triggers: [
      { condition: 'new_enemy_type', bonus: 15 },
      { condition: 'new_location', bonus: 15 },
      { condition: 'repetitive_mission', bonus: -10 }
    ]
  },
  {
    id: 'revenge',
    name: 'Месть',
    description: 'Личная вендетта против определённых врагов',
    icon: '⚔️',
    triggers: [
      { condition: 'goblin_enemy', bonus: 20 },
      { condition: 'undead_enemy', bonus: 20 },
      { condition: 'bandit_enemy', bonus: 15 },
      { condition: 'personal_enemy', bonus: 40 }
    ]
  },
  {
    id: 'curiosity',
    name: 'Любопытство',
    description: 'Новые типы миссий и мест',
    icon: '🔍',
    triggers: [
      { condition: 'new_mission_type', bonus: 20 },
      { condition: 'unexplored_area', bonus: 15 },
      { condition: 'mystery_mission', bonus: 25 },
      { condition: 'repetitive_mission', bonus: -15 }
    ]
  },
  {
    id: 'duty',
    name: 'Долг',
    description: 'Защита слабых, благородные цели',
    icon: '🙏',
    triggers: [
      { condition: 'protect_mission', bonus: 25 },
      { condition: 'rescue_mission', bonus: 20 },
      { condition: 'innocents_at_risk', bonus: 30 },
      { condition: 'assassin_mission', bonus: -20 }
    ]
  }
]

// Функция получения мотивации по ID
export function getMotivationById(id: MotivationId): MotivationData | undefined {
  return motivations.find(m => m.id === id)
}

// Функция генерации случайных мотиваций (1-3)
export function generateMotivations(): MotivationId[] {
  const count = 1 + Math.floor(Math.random() * 3) // 1-3 мотивации
  const shuffled = [...motivations].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(m => m.id)
}

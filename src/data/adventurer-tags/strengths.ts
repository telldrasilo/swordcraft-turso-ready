/**
 * Сильные стороны искателей
 * Положительные особенности, дающие бонусы
 * 
 * ВАЖНО: Каждый эффект РЕАЛЬНО влияет на расчёты в expedition-calculator.ts
 */

import type { StrengthId } from '@/types/adventurer-extended'

export interface StrengthData {
  id: StrengthId
  name: string
  description: string
  icon: string
  // Численные эффекты для расчётов
  effects: {
    successBonus: number      // Бонус к шансу успеха (%)
    goldBonus: number         // Бонус к золоту (%)
    warSoulBonus: number      // Бонус к душам войны (%)
    weaponLossReduction: number // Снижение шанса потери оружия (%)
    weaponWearReduction: number // Снижение износа оружия (%)
  }
  // Условия применения (опционально)
  conditions?: {
    difficulty?: ('easy' | 'normal' | 'hard' | 'extreme' | 'legendary')[]
    missionType?: ('hunt' | 'scout' | 'clear' | 'delivery' | 'magic')[]
  }
}

export const strengths: StrengthData[] = [
  {
    id: 'iron_will',
    name: 'Железная воля',
    description: 'Несгибаемая решимость в опасных ситуациях',
    icon: '💪',
    effects: {
      successBonus: 10,        // +10% к успеху на сложных миссиях
      goldBonus: 0,
      warSoulBonus: 0,
      weaponLossReduction: 0,
      weaponWearReduction: 0
    },
    conditions: {
      difficulty: ['hard', 'extreme', 'legendary']
    }
  },
  {
    id: 'keen_eye',
    name: 'Острый глаз',
    description: 'Замечает скрытые сокровища и ресурсы',
    icon: '👁️',
    effects: {
      successBonus: 0,
      goldBonus: 15,           // +15% к золоту
      warSoulBonus: 0,
      weaponLossReduction: 0,
      weaponWearReduction: 0
    }
  },
  {
    id: 'quick_reflexes',
    name: 'Быстрые рефлексы',
    description: 'Молниеносная реакция спасает оружие от потери',
    icon: '⚡',
    effects: {
      successBonus: 3,
      goldBonus: 0,
      warSoulBonus: 0,
      weaponLossReduction: 25, // -25% к шансу потери оружия
      weaponWearReduction: 0
    }
  },
  {
    id: 'tough',
    name: 'Жилистый',
    description: 'Закалённое тело выдерживает больше повреждений',
    icon: '🪨',
    effects: {
      successBonus: 5,         // +5% к успеху (выживает там, где другие падают)
      goldBonus: 0,
      warSoulBonus: 0,
      weaponLossReduction: 10,
      weaponWearReduction: 0
    }
  },
  {
    id: 'charismatic',
    name: 'Харизматичный',
    description: 'Умеет договариваться о лучших наградах',
    icon: '😊',
    effects: {
      successBonus: 0,
      goldBonus: 10,           // +10% к золоту от заказчиков
      warSoulBonus: 0,
      weaponLossReduction: 0,
      weaponWearReduction: 0
    }
  },
  {
    id: 'night_owl',
    name: 'Ночной охотник',
    description: 'Особо эффективен в разведке и зачистках',
    icon: '🌙',
    effects: {
      successBonus: 8,
      goldBonus: 0,
      warSoulBonus: 0,
      weaponLossReduction: 0,
      weaponWearReduction: 0
    },
    conditions: {
      missionType: ['scout', 'clear']
    }
  },
  {
    id: 'day_warrior',
    name: 'Дневной воин',
    description: 'Эффективен в охоте и доставке',
    icon: '☀️',
    effects: {
      successBonus: 8,
      goldBonus: 0,
      warSoulBonus: 0,
      weaponLossReduction: 0,
      weaponWearReduction: 0
    },
    conditions: {
      missionType: ['hunt', 'delivery']
    }
  },
  {
    id: 'lucky_star',
    name: 'Счастливая звезда',
    description: 'Удача сопутствует во всех делах',
    icon: '🍀',
    effects: {
      successBonus: 5,
      goldBonus: 8,            // +8% к золоту (удачные находки)
      warSoulBonus: 5,         // +5% к душам войны
      weaponLossReduction: 10,
      weaponWearReduction: 0
    }
  },
  {
    id: 'resourceful',
    name: 'Находчивый',
    description: 'Находит выходы из любых трудностей',
    icon: '🧠',
    effects: {
      successBonus: 8,         // +8% к успеху (выходит из сложных ситуаций)
      goldBonus: 0,
      warSoulBonus: 0,
      weaponLossReduction: 5,
      weaponWearReduction: 0
    }
  },
  {
    id: 'sturdy',
    name: 'Крепкий',
    description: 'Закалённое тело и дух, оружие служит дольше',
    icon: '🛡️',
    effects: {
      successBonus: 0,
      goldBonus: 0,
      warSoulBonus: 0,
      weaponLossReduction: 0,
      weaponWearReduction: 30  // -30% к износу оружия
    }
  }
]

// Функция получения сильной стороны по ID
export function getStrengthById(id: StrengthId): StrengthData | undefined {
  return strengths.find(s => s.id === id)
}

// Функция проверки, применяется ли сила к данной миссии
export function doesStrengthApply(
  strength: StrengthData,
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary',
  missionType: 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
): boolean {
  if (!strength.conditions) return true // Применяется всегда
  
  if (strength.conditions.difficulty && !strength.conditions.difficulty.includes(difficulty)) {
    return false
  }
  
  if (strength.conditions.missionType && !strength.conditions.missionType.includes(missionType)) {
    return false
  }
  
  return true
}

// Функция генерации случайных сильных сторон (1-2)
export function generateStrengths(count?: number): StrengthId[] {
  const actualCount = count ?? (Math.random() < 0.6 ? 1 : 2)
  const shuffled = [...strengths].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, actualCount).map(s => s.id)
}

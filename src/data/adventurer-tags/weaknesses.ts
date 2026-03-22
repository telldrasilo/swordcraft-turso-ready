/**
 * Слабости искателей
 * Отрицательные особенности, дающие штрафы
 * 
 * ВАЖНО: Каждый эффект РЕАЛЬНО влияет на расчёты в expedition-calculator.ts
 */

import type { WeaknessId } from '@/types/adventurer-extended'

export interface WeaknessData {
  id: WeaknessId
  name: string
  description: string
  icon: string
  // Численные штрафы для расчётов
  effects: {
    successPenalty: number      // Штраф к шансу успеха (%)
    goldPenalty: number         // Штраф к золоту (%)
    warSoulPenalty: number      // Штраф к душам войны (%)
    weaponLossIncrease: number  // Увеличение шанса потери оружия (%)
    weaponWearIncrease: number  // Увеличение износа оружия (%)
    refuseChanceBonus: number   // Бонус к шансу отказа (%)
  }
  // Условия применения (опционально)
  conditions?: {
    difficulty?: ('easy' | 'normal' | 'hard' | 'extreme' | 'legendary')[]
    missionType?: ('hunt' | 'scout' | 'clear' | 'delivery' | 'magic')[]
  }
}

export const weaknesses: WeaknessData[] = [
  {
    id: 'arrogant',
    name: 'Высокомерный',
    description: 'Недооценивает противников на лёгких миссиях',
    icon: '😏',
    effects: {
      successPenalty: 12,      // -12% успеха на лёгких и обычных
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 5,   // +5% шанс потери (небрежность)
      weaponWearIncrease: 0,
      refuseChanceBonus: 0
    },
    conditions: {
      difficulty: ['easy', 'normal']
    }
  },
  {
    id: 'greedy_fault',
    name: 'Жадность',
    description: 'Требует больше оплаты, может отказаться при низкой награде',
    icon: '🤑',
    effects: {
      successPenalty: 0,
      goldPenalty: 10,         // -10% к золоту (требует больше себе)
      warSoulPenalty: 0,
      weaponLossIncrease: 0,
      weaponWearIncrease: 0,
      refuseChanceBonus: 20    // +20% шанс отказа на миссиях с малой наградой
    }
  },
  {
    id: 'coward',
    name: 'Трус',
    description: 'Боится опасных ситуаций, теряет эффективность',
    icon: '😨',
    effects: {
      successPenalty: 20,      // -20% успеха на сложных миссиях
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 0,
      weaponWearIncrease: 0,
      refuseChanceBonus: 25    // +25% шанс отказа
    },
    conditions: {
      difficulty: ['hard', 'extreme', 'legendary']
    }
  },
  {
    id: 'old_wound',
    name: 'Старая рана',
    description: 'Старые травмы снижают выносливость',
    icon: '🩹',
    effects: {
      successPenalty: 5,       // -5% успеха (ограниченная выносливость)
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 0,
      weaponWearIncrease: 10   // +10% износ (сложнее защищать оружие)
    }
  },
  {
    id: 'superstitious',
    name: 'Суеверный',
    description: 'Боится магии и мистических миссий',
    icon: '🔮',
    effects: {
      successPenalty: 15,      // -15% успеха на магических миссиях
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 0,
      weaponWearIncrease: 0,
      refuseChanceBonus: 30    // +30% шанс отказа от магических миссий
    },
    conditions: {
      missionType: ['magic']
    }
  },
  {
    id: 'impatient',
    name: 'Нетерпеливый',
    description: 'Торопится, совершает ошибки',
    icon: '⏰',
    effects: {
      successPenalty: 8,       // -8% успеха (спешка)
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 10,  // +10% шанс потери (небрежность)
      weaponWearIncrease: 5,   // +5% износ
      refuseChanceBonus: 0
    }
  },
  {
    id: 'haunted',
    name: 'Одержимый',
    description: 'Призраки прошлого отвлекают, снижают концентрацию',
    icon: '👻',
    effects: {
      successPenalty: 8,       // -8% успеха (отвлечённость)
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 5,
      weaponWearIncrease: 0,
      refuseChanceBonus: 0
    }
  },
  {
    id: 'notorious',
    name: 'Дурная слава',
    description: 'Плохая репутация снижает награды',
    icon: '💢',
    effects: {
      successPenalty: 0,
      goldPenalty: 15,         // -15% к золоту (заказчики не доверяют)
      warSoulPenalty: 0,
      weaponLossIncrease: 0,
      weaponWearIncrease: 0,
      refuseChanceBonus: 0
    }
  },
  {
    id: 'reckless_fault',
    name: 'Безрассудство',
    description: 'Действует не подумав, рискует оружием',
    icon: '🔥',
    effects: {
      successPenalty: 0,
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 20,  // +20% шанс потери оружия
      weaponWearIncrease: 15,  // +15% износ
      refuseChanceBonus: -10   // -10% шанс отказа (готов на всё)
    }
  },
  {
    id: 'phobia',
    name: 'Фобия',
    description: 'Имеет специфический страх (определяется случайно)',
    icon: '😱',
    effects: {
      successPenalty: 10,      // -10% успеха
      goldPenalty: 0,
      warSoulPenalty: 0,
      weaponLossIncrease: 0,
      weaponWearIncrease: 0,
      refuseChanceBonus: 15    // +15% шанс отказа
    }
  }
]

// Специфические фобии (для описания, влияют на отказ от определённых миссий)
export const PHOBIA_TYPES = [
  { enemyType: 'spider', name: 'Арахнофобия', description: 'Боится пауков (миссии охоты)', missionType: 'hunt' },
  { enemyType: 'undead', name: 'Некрофобия', description: 'Боится нежити (магические миссии)', missionType: 'magic' },
  { enemyType: 'water', name: 'Аквафобия', description: 'Боится воды (разведка)', missionType: 'scout' },
  { enemyType: 'height', name: 'Акрофобия', description: 'Боится высоты (зачистки)', missionType: 'clear' },
  { enemyType: 'fire', name: 'Пирофобия', description: 'Боится огня (охота)', missionType: 'hunt' },
  { enemyType: 'dark', name: 'Никтофобия', description: 'Боится темноты (разведка, зачистки)', missionType: 'scout' },
  { enemyType: 'magic', name: 'Магефобия', description: 'Боится магии', missionType: 'magic' },
]

// Функция получения слабости по ID
export function getWeaknessById(id: WeaknessId): WeaknessData | undefined {
  return weaknesses.find(w => w.id === id)
}

// Функция проверки, применяется ли слабость к данной миссии
export function doesWeaknessApply(
  weakness: WeaknessData,
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary',
  missionType: 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
): boolean {
  if (!weakness.conditions) return true // Применяется всегда
  
  if (weakness.conditions.difficulty && !weakness.conditions.difficulty.includes(difficulty)) {
    return false
  }
  
  if (weakness.conditions.missionType && !weakness.conditions.missionType.includes(missionType)) {
    return false
  }
  
  return true
}

// Функция генерации случайной фобии
export function generateRandomPhobia(): typeof PHOBIA_TYPES[0] {
  return PHOBIA_TYPES[Math.floor(Math.random() * PHOBIA_TYPES.length)]
}

// Функция генерации слабостей (0-2, зависит от редкости)
export function generateWeaknesses(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): WeaknessId[] {
  // Чем выше редкость, тем больше может быть слабостей для баланса
  const maxWeaknesses = {
    common: 1,
    uncommon: 1,
    rare: 2,
    epic: 2,
    legendary: 3
  }
  
  const chance = {
    common: 0.3,      // 30% шанс иметь слабость
    uncommon: 0.4,    // 40%
    rare: 0.6,        // 60%
    epic: 0.8,        // 80%
    legendary: 1.0    // 100%
  }
  
  const result: WeaknessId[] = []
  const shuffled = [...weaknesses].sort(() => Math.random() - 0.5)
  
  const count = Math.min(
    maxWeaknesses[rarity],
    Math.random() < chance[rarity] ? 1 + Math.floor(Math.random() * maxWeaknesses[rarity]) : 0
  )
  
  for (let i = 0; i < count && i < shuffled.length; i++) {
    result.push(shuffled[i].id)
  }
  
  return result
}

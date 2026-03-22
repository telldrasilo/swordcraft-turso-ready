/**
 * Стили боя искателей
 * Определяют предпочтения в оружии и тактике
 * 
 * ВАЖНО: missionBonuses используют РЕАЛЬНЫЕ типы миссий из expedition-templates.ts:
 * 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
 */

import type { CombatStyleId, WeaponType } from '@/types/adventurer-extended'
import type { ExpeditionType } from '@/data/expedition-templates'

export interface CombatStyleData {
  id: CombatStyleId
  name: string
  description: string
  icon: string
  // Бонусы к характеристикам
  statModifiers: {
    power?: number
    precision?: number
    endurance?: number
    luck?: number
  }
  // Предпочитаемое оружие
  preferredWeapons: WeaponType[]
  avoidedWeapons: WeaponType[]
  // Бонусы к типам миссий
  missionBonuses: {
    missionType: ExpeditionType | 'any'  // Тип миссии или 'any' для всех
    bonus: number                         // Бонус/штраф к успеху (%)
  }[]
}

export const combatStyles: CombatStyleData[] = [
  {
    id: 'berserker',
    name: 'Берсерк',
    description: 'Агрессивный стиль, ярость и сила. Лучше всего в охоте и зачистках.',
    icon: '🪓',
    statModifiers: {
      power: 10,
      precision: -5,
      endurance: -5,
      luck: 0
    },
    preferredWeapons: ['axe', 'hammer'],
    avoidedWeapons: ['dagger'],
    missionBonuses: [
      { missionType: 'hunt', bonus: 15 },      // Охота — агрессивные действия
      { missionType: 'clear', bonus: 10 },     // Зачистка — массовый бой
      { missionType: 'delivery', bonus: -10 }  // Скучно для берсерка
    ]
  },
  {
    id: 'tank',
    name: 'Танк',
    description: 'Защитный стиль, выдержка и стойкость. Идеален для доставки и защиты.',
    icon: '🛡️',
    statModifiers: {
      power: -5,
      precision: 0,
      endurance: 15,
      luck: 0
    },
    preferredWeapons: ['sword', 'mace'],
    avoidedWeapons: ['dagger'],
    missionBonuses: [
      { missionType: 'delivery', bonus: 20 },  // Защита караванов
      { missionType: 'clear', bonus: 10 },     // Удержание позиций
      { missionType: 'hunt', bonus: -10 }      // Медленный для погони
    ]
  },
  {
    id: 'assassin',
    name: 'Убийца',
    description: 'Скрытный стиль, точные удары. Мастер разведки и магических миссий.',
    icon: '🗡️',
    statModifiers: {
      power: 0,
      precision: 15,
      endurance: -10,
      luck: 5
    },
    preferredWeapons: ['dagger', 'sword'],
    avoidedWeapons: ['hammer', 'mace'],
    missionBonuses: [
      { missionType: 'scout', bonus: 20 },     // Незаметность
      { missionType: 'magic', bonus: 15 },     // Точность против магов
      { missionType: 'clear', bonus: -10 }     // Открытый бой не для убийцы
    ]
  },
  {
    id: 'duelist',
    name: 'Дуэлянт',
    description: 'Мастер один на один. Превосходен в охоте на сильных противников.',
    icon: '⚔️',
    statModifiers: {
      power: 5,
      precision: 10,
      endurance: 0,
      luck: 0
    },
    preferredWeapons: ['sword', 'spear'],
    avoidedWeapons: ['hammer'],
    missionBonuses: [
      { missionType: 'hunt', bonus: 15 },      // Охота на сильных
      { missionType: 'magic', bonus: 10 },     // Дуэли с магами
      { missionType: 'delivery', bonus: -10 }  // Скучная работа
    ]
  },
  {
    id: 'hunter',
    name: 'Охотник',
    description: 'Специалист по монстрам и зверям. Лучший выбор для охоты.',
    icon: '🏹',
    statModifiers: {
      power: 5,
      precision: 10,
      endurance: 0,
      luck: 5
    },
    preferredWeapons: ['spear', 'dagger'],
    avoidedWeapons: [],
    missionBonuses: [
      { missionType: 'hunt', bonus: 25 },      // Охота — специализация
      { missionType: 'scout', bonus: 10 },     // Выслеживание
      { missionType: 'clear', bonus: 10 }      // Зачистка от монстров
    ]
  },
  {
    id: 'scout',
    name: 'Разведчик',
    description: 'Быстрый и незаметный. Мастер разведки и поиска сокровищ.',
    icon: '👁️',
    statModifiers: {
      power: -5,
      precision: 10,
      endurance: 5,
      luck: 10
    },
    preferredWeapons: ['dagger', 'spear'],
    avoidedWeapons: ['hammer', 'mace'],
    missionBonuses: [
      { missionType: 'scout', bonus: 30 },     // Разведка — специализация
      { missionType: 'delivery', bonus: 15 },  // Быстрая доставка
      { missionType: 'clear', bonus: -10 }     // Избегает прямого боя
    ]
  },
  {
    id: 'paladin',
    name: 'Паладин',
    description: 'Священный воин. Превосходен против нежити и в магических миссиях.',
    icon: '✝️',
    statModifiers: {
      power: 5,
      precision: 0,
      endurance: 10,
      luck: 0
    },
    preferredWeapons: ['sword', 'mace'],
    avoidedWeapons: ['dagger'],
    missionBonuses: [
      { missionType: 'magic', bonus: 25 },     // Против тёмной магии
      { missionType: 'clear', bonus: 15 },     // Зачистка от нечисти
      { missionType: 'hunt', bonus: 10 }       // Охота на монстров
    ]
  },
  {
    id: 'battle_mage',
    name: 'Боевой маг',
    description: 'Магия и меч в гармонии. Идеален для магических миссий.',
    icon: '🔮',
    statModifiers: {
      power: 0,
      precision: 10,
      endurance: -5,
      luck: 10
    },
    preferredWeapons: ['sword', 'dagger'],
    avoidedWeapons: ['hammer', 'axe'],
    missionBonuses: [
      { missionType: 'magic', bonus: 30 },     // Магические миссии — специализация
      { missionType: 'scout', bonus: 15 },     // Магическая разведка
      { missionType: 'hunt', bonus: 5 }        // Поддержка магией
    ]
  },
  {
    id: 'weapon_master',
    name: 'Мастер оружия',
    description: 'Универсален с любым оружием. Стабильный бонус на все миссии.',
    icon: '⚔️',
    statModifiers: {
      power: 5,
      precision: 5,
      endurance: 5,
      luck: 0
    },
    preferredWeapons: [], // Все оружие
    avoidedWeapons: [],
    missionBonuses: [
      { missionType: 'any', bonus: 10 }        // Универсальный бонус
    ]
  },
  {
    id: 'dual_wielder',
    name: 'Дуалист',
    description: 'Два оружия, скорость и агрессия. Хорош в охоте и зачистках.',
    icon: '⚔️⚔️',
    statModifiers: {
      power: 5,
      precision: 10,
      endurance: -5,
      luck: 5
    },
    preferredWeapons: ['dagger', 'sword'],
    avoidedWeapons: ['hammer', 'spear'],
    missionBonuses: [
      { missionType: 'hunt', bonus: 15 },      // Агрессивная охота
      { missionType: 'clear', bonus: 15 },     // Быстрая зачистка
      { missionType: 'delivery', bonus: -10 }  // Не для защиты
    ]
  }
]

// Функция получения стиля по ID
export function getCombatStyleById(id: CombatStyleId): CombatStyleData | undefined {
  return combatStyles.find(s => s.id === id)
}

// Функция получения случайного стиля боя
export function getRandomCombatStyle(): CombatStyleData {
  return combatStyles[Math.floor(Math.random() * combatStyles.length)]
}

// Функция проверки предпочтения оружия
export function getWeaponPreference(style: CombatStyleData): {
  preferred: WeaponType[]
  avoided: WeaponType[]
} {
  return {
    preferred: style.preferredWeapons,
    avoided: style.avoidedWeapons
  }
}

// Функция расчёта бонуса к миссии
export function getMissionBonus(style: CombatStyleData, missionType: ExpeditionType): number {
  // Сначала ищем конкретный тип миссии
  const specificBonus = style.missionBonuses.find(b => b.missionType === missionType)
  if (specificBonus) {
    return specificBonus.bonus
  }
  
  // Если не найден, ищем 'any'
  const anyBonus = style.missionBonuses.find(b => b.missionType === 'any')
  return anyBonus?.bonus ?? 0
}

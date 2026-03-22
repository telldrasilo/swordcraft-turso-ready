/**
 * Шаблоны экспедиций для гильдии
 */

import { CraftingCost } from './weapon-recipes'

// ================================
// ТИПЫ
// ================================

export type ExpeditionType = 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
export type ExpeditionDifficulty = 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'

export interface ExpeditionReward {
  baseGold: number
  baseWarSoul: number
  bonusResources?: { resource: string; amount: number; chance: number }[]
  bonusEssence?: number
}

export interface ExpeditionCost {
  supplies: number
  deposit: number
}

export interface ExpeditionTemplate {
  id: string
  name: string
  description: string
  icon: string
  type: ExpeditionType
  difficulty: ExpeditionDifficulty
  duration: number // Время в секундах
  cost: ExpeditionCost
  reward: ExpeditionReward
  minGuildLevel: number
  failureChance: number // Базовый шанс провала (0-100)
  weaponLossChance: number // Базовый шанс потери оружия при провале
  recommendedWeaponTypes: string[]
  minWeaponAttack: number
}

// ================================
// ДАННЫЕ О СЛОЖНОСТЯХ
// ================================

export const difficultyInfo: Record<ExpeditionDifficulty, {
  name: string
  color: string
  bgColor: string
  stars: number
  tier: number // Уровень миссии (1-5) — для сопоставления с искателями
  tierName: string // Название уровня
  levelRange: [number, number] // Диапазон уровней искателей
  failureChance: number
  weaponLossChance: number
}> = {
  easy: { 
    name: 'Лёгкая', 
    color: 'text-green-400', 
    bgColor: 'bg-green-900/30', 
    stars: 1, 
    tier: 1,
    tierName: 'Новичок',
    levelRange: [1, 10],
    failureChance: 5, 
    weaponLossChance: 5 
  },
  normal: { 
    name: 'Обычная', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/30', 
    stars: 2, 
    tier: 2,
    tierName: 'Опытный',
    levelRange: [8, 20],
    failureChance: 15, 
    weaponLossChance: 10 
  },
  hard: { 
    name: 'Сложная', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-900/30', 
    stars: 3, 
    tier: 3,
    tierName: 'Ветеран',
    levelRange: [18, 30],
    failureChance: 30, 
    weaponLossChance: 15 
  },
  extreme: { 
    name: 'Экстремальная', 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/30', 
    stars: 4, 
    tier: 4,
    tierName: 'Мастер',
    levelRange: [28, 40],
    failureChance: 50, 
    weaponLossChance: 20 
  },
  legendary: { 
    name: 'Легендарная', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-900/30', 
    stars: 5, 
    tier: 5,
    tierName: 'Герой',
    levelRange: [38, 50],
    failureChance: 70, 
    weaponLossChance: 25 
  },
}

// ================================
// ДАННЫЕ О ТИПАХ
// ================================

export const typeInfo: Record<ExpeditionType, {
  name: string
  icon: string
  description: string
  warSoulMultiplier: number
}> = {
  hunt: { name: 'Охота', icon: '⚔️', description: 'Убийство монстров', warSoulMultiplier: 1.2 },
  scout: { name: 'Разведка', icon: '💎', description: 'Поиск сокровищ', warSoulMultiplier: 1.0 },
  clear: { name: 'Зачистка', icon: '🏰', description: 'Очистка подземелья', warSoulMultiplier: 1.5 },
  delivery: { name: 'Доставка', icon: '📜', description: 'Сопровождение каравана', warSoulMultiplier: 0.8 },
  magic: { name: 'Магическая', icon: '🧙', description: 'Специальные задания', warSoulMultiplier: 1.3 },
}

// ================================
// ШАБЛОНЫ ЭКСПЕДИЦИЙ
// ================================

export const expeditionTemplates: ExpeditionTemplate[] = [
  // === ЛЁГКИЕ (Уровень гильдии 1) - для начинающих ===
  {
    id: 'goblin_hunt',
    name: 'Охота на гоблинов',
    description: 'Небольшой отряд гоблинов замечен у дороги. Награда за их устранение.',
    icon: '⚔️',
    type: 'hunt',
    difficulty: 'easy',
    duration: 180, // 3 минуты - быстрая для начинающих
    cost: { supplies: 10, deposit: 20 },
    reward: { baseGold: 50, baseWarSoul: 3 },
    minGuildLevel: 1,
    failureChance: 5,
    weaponLossChance: 3,
    recommendedWeaponTypes: ['sword', 'axe'],
    minWeaponAttack: 5, // Доступно с самого первого оружия
  },
  {
    id: 'forest_scout',
    name: 'Разведка леса',
    description: 'Исследовать лес на предмет опасностей и ресурсов.',
    icon: '💎',
    type: 'scout',
    difficulty: 'easy',
    duration: 240, // 4 минуты
    cost: { supplies: 15, deposit: 25 },
    reward: {
      baseGold: 40,
      baseWarSoul: 2,
      bonusResources: [
        { resource: 'wood', amount: 10, chance: 0.6 },
        { resource: 'iron', amount: 3, chance: 0.3 },
      ],
    },
    minGuildLevel: 1,
    failureChance: 5,
    weaponLossChance: 3,
    recommendedWeaponTypes: ['dagger', 'spear'],
    minWeaponAttack: 5,
  },
  {
    id: 'merchant_escort',
    name: 'Сопровождение торговца',
    description: 'Проводить торговца до соседней деревни. Простая работа.',
    icon: '📜',
    type: 'delivery',
    difficulty: 'easy',
    duration: 300, // 5 минут
    cost: { supplies: 20, deposit: 35 },
    reward: { baseGold: 70, baseWarSoul: 2 },
    minGuildLevel: 1,
    failureChance: 5,
    weaponLossChance: 3,
    recommendedWeaponTypes: ['sword', 'mace'],
    minWeaponAttack: 5,
  },
  {
    id: 'rat_cellar',
    name: 'Крысы в подвале',
    description: 'Крысы заполонили подвал таверны. Простая работа для начинающего искателя.',
    icon: '🐀',
    type: 'clear',
    difficulty: 'easy',
    duration: 120, // 2 минуты - самая простая
    cost: { supplies: 5, deposit: 10 },
    reward: { baseGold: 25, baseWarSoul: 1 },
    minGuildLevel: 1,
    failureChance: 3,
    weaponLossChance: 2,
    recommendedWeaponTypes: ['dagger', 'sword'],
    minWeaponAttack: 3, // Минимальное требование
  },

  // === ОБЫЧНЫЕ (Уровень гильдии 1-2) ===
  {
    id: 'wolf_pack',
    name: 'Стая волков',
    description: 'Стая агрессивных волков терроризирует окрестности.',
    icon: '🐺',
    type: 'hunt',
    difficulty: 'normal',
    duration: 480, // 8 минут
    cost: { supplies: 30, deposit: 60 },
    reward: { baseGold: 120, baseWarSoul: 6 },
    minGuildLevel: 1,
    failureChance: 12,
    weaponLossChance: 8,
    recommendedWeaponTypes: ['spear', 'axe'],
    minWeaponAttack: 10, // Снижено с 10
  },
  {
    id: 'old_mine_clear',
    name: 'Зачистка старой шахты',
    description: 'В заброшенной шахте завелись крысы и кто-то пострашнее.',
    icon: '🏰',
    type: 'clear',
    difficulty: 'normal',
    duration: 600, // 10 минут
    cost: { supplies: 40, deposit: 80 },
    reward: {
      baseGold: 180,
      baseWarSoul: 10,
      bonusResources: [
        { resource: 'iron', amount: 8, chance: 0.5 },
        { resource: 'coal', amount: 6, chance: 0.4 },
      ],
    },
    minGuildLevel: 1,
    failureChance: 12,
    weaponLossChance: 8,
    recommendedWeaponTypes: ['hammer', 'mace'],
    minWeaponAttack: 12,
  },
  {
    id: 'treasure_hunt_1',
    name: 'Поиски клада',
    description: 'Старая карта указывает на спрятанные сокровища.',
    icon: '💎',
    type: 'scout',
    difficulty: 'normal',
    duration: 540, // 9 минут
    cost: { supplies: 35, deposit: 70 },
    reward: {
      baseGold: 150,
      baseWarSoul: 5,
      bonusResources: [
        { resource: 'silver', amount: 2, chance: 0.3 },
      ],
    },
    minGuildLevel: 2,
    failureChance: 12,
    weaponLossChance: 8,
    recommendedWeaponTypes: ['dagger'],
    minWeaponAttack: 10,
  },

  // === СЛОЖНЫЕ (Уровень гильдии 2-3) ===
  {
    id: 'bandit_fort',
    name: 'Логово разбойников',
    description: 'Разбойники устроили базу в старом форте. Время навести порядок.',
    icon: '🏰',
    type: 'clear',
    difficulty: 'hard',
    duration: 900, // 15 минут
    cost: { supplies: 80, deposit: 150 },
    reward: { baseGold: 350, baseWarSoul: 18 },
    minGuildLevel: 2,
    failureChance: 25,
    weaponLossChance: 12,
    recommendedWeaponTypes: ['sword', 'axe', 'hammer'],
    minWeaponAttack: 18,
  },
  {
    id: 'undead_rise',
    name: 'Восстание мёртвых',
    description: 'На старом кладбище пробудилась нежить. Кто осмелится их успокоить?',
    icon: '💀',
    type: 'hunt',
    difficulty: 'hard',
    duration: 1200, // 20 минут
    cost: { supplies: 100, deposit: 200 },
    reward: {
      baseGold: 400,
      baseWarSoul: 25,
      bonusEssence: 2,
    },
    minGuildLevel: 3,
    failureChance: 25,
    weaponLossChance: 12,
    recommendedWeaponTypes: ['mace', 'sword'],
    minWeaponAttack: 22,
  },
  {
    id: 'magic_tower',
    name: 'Магическая аномалия',
    description: 'Странная энергия исходит от заброшенной башни мага.',
    icon: '🧙',
    type: 'magic',
    difficulty: 'hard',
    duration: 1500, // 25 минут
    cost: { supplies: 120, deposit: 250 },
    reward: {
      baseGold: 320,
      baseWarSoul: 30,
      bonusEssence: 4,
    },
    minGuildLevel: 3,
    failureChance: 25,
    weaponLossChance: 12,
    recommendedWeaponTypes: ['sword', 'dagger'],
    minWeaponAttack: 20,
  },

  // === ЭКСТРЕМАЛЬНЫЕ (Уровень гильдии 4) ===
  {
    id: 'dragon_lair',
    name: 'Логово дракона',
    description: 'Древний дракон пробудился. Смертельно опасно, но награда велика.',
    icon: '🐉',
    type: 'hunt',
    difficulty: 'extreme',
    duration: 1800, // 30 минут
    cost: { supplies: 250, deposit: 500 },
    reward: {
      baseGold: 1000,
      baseWarSoul: 60,
      bonusResources: [
        { resource: 'goldOre', amount: 8, chance: 0.4 },
        { resource: 'mithril', amount: 2, chance: 0.15 },
      ],
    },
    minGuildLevel: 4,
    failureChance: 40,
    weaponLossChance: 18,
    recommendedWeaponTypes: ['spear', 'axe', 'sword'],
    minWeaponAttack: 35,
  },
  {
    id: 'demon_portal',
    name: 'Демонический разлом',
    description: 'Портал в демоническое измерение открыт. Закройте его!',
    icon: '🧙',
    type: 'magic',
    difficulty: 'extreme',
    duration: 2700, // 45 минут
    cost: { supplies: 350, deposit: 700 },
    reward: {
      baseGold: 1200,
      baseWarSoul: 80,
      bonusEssence: 12,
    },
    minGuildLevel: 4,
    failureChance: 40,
    weaponLossChance: 18,
    recommendedWeaponTypes: ['sword', 'hammer', 'mace'],
    minWeaponAttack: 40,
  },

  // === ЛЕГЕНДАРНЫЕ (Уровень гильдии 5) ===
  {
    id: 'titan_remains',
    name: 'Останки титана',
    description: 'Древний титан спит. Или мёртв? Никто не знает наверняка.',
    icon: '🗿',
    type: 'clear',
    difficulty: 'legendary',
    duration: 3600, // 60 минут
    cost: { supplies: 600, deposit: 1200 },
    reward: {
      baseGold: 2800,
      baseWarSoul: 140,
      bonusResources: [
        { resource: 'mithril', amount: 8, chance: 0.5 },
      ],
    },
    minGuildLevel: 5,
    failureChance: 55,
    weaponLossChance: 22,
    recommendedWeaponTypes: ['sword', 'axe', 'hammer'],
    minWeaponAttack: 50,
  },
  {
    id: 'lich_tomb',
    name: 'Гробница лича',
    description: 'Древний лич хранит секреты бессмертия. Осмелитесь ли вы потревожить его?',
    icon: '💀',
    type: 'magic',
    difficulty: 'legendary',
    duration: 5400, // 90 минут
    cost: { supplies: 800, deposit: 1600 },
    reward: {
      baseGold: 4000,
      baseWarSoul: 200,
      bonusEssence: 25,
    },
    minGuildLevel: 5,
    failureChance: 55,
    weaponLossChance: 22,
    recommendedWeaponTypes: ['sword', 'mace', 'hammer'],
    minWeaponAttack: 60,
  },
]

// ================================
// ФУНКЦИИ
// ================================

export function getExpeditionById(id: string): ExpeditionTemplate | undefined {
  return expeditionTemplates.find(e => e.id === id)
}

export function getExpeditionsByType(type: ExpeditionType): ExpeditionTemplate[] {
  return expeditionTemplates.filter(e => e.type === type)
}

export function getExpeditionsByDifficulty(difficulty: ExpeditionDifficulty): ExpeditionTemplate[] {
  return expeditionTemplates.filter(e => e.difficulty === difficulty)
}

export function getAvailableExpeditions(guildLevel: number): ExpeditionTemplate[] {
  return expeditionTemplates.filter(e => e.minGuildLevel <= guildLevel)
}

// Расчёт полной стоимости экспедиции
export function calculateTotalCost(template: ExpeditionTemplate): number {
  return template.cost.supplies + template.cost.deposit
}

// Расчёт комиссии игрока
export function calculateCommission(
  template: ExpeditionTemplate,
  guildLevel: number,
  glory: number
): number {
  // Базовая комиссия: 15% + 2% за каждый уровень гильдии
  const baseCommission = 15 + (guildLevel - 1) * 2

  // Бонус от славы: +1% за каждые 100 очков
  const gloryBonus = Math.floor(glory / 100)

  const totalCommission = Math.min(30, baseCommission + gloryBonus)

  return Math.floor(template.reward.baseGold * totalCommission / 100)
}

// Расчёт Души Войны для оружия
export function calculateWarSoul(
  template: ExpeditionTemplate,
  adventurerSkill: number,
  weaponQuality: number
): number {
  const typeMultiplier = typeInfo[template.type].warSoulMultiplier
  const skillBonus = 1 + adventurerSkill / 100
  const qualityBonus = 0.8 + (weaponQuality / 100) * 0.4 // 0.8-1.2

  const base = template.reward.baseWarSoul
  const result = base * typeMultiplier * skillBonus * qualityBonus

  // Добавляем случайность ±20%
  const variance = 0.8 + Math.random() * 0.4

  return Math.floor(result * variance)
}

// Расчёт шанса успеха
export function calculateSuccessChance(
  template: ExpeditionTemplate,
  weaponAttack: number,
  adventurerBonuses: number = 0
): number {
  // Базовый шанс успеха = 100% - шанс провала
  let baseSuccess = 100 - template.failureChance

  // Бонус от атаки оружия
  const attackBonus = Math.min(20, (weaponAttack - template.minWeaponAttack) / 2)
  baseSuccess += Math.max(0, attackBonus)

  // Бонус от искателя
  baseSuccess += adventurerBonuses

  // Ограничение: 10% - 95%
  return Math.max(10, Math.min(95, baseSuccess))
}

// Расчёт шанса потери оружия
export function calculateWeaponLossChance(
  template: ExpeditionTemplate,
  weaponQuality: number,
  adventurerBonuses: number = 0
): number {
  // Базовый шанс потери
  let lossChance = template.weaponLossChance

  // Каждые +20 качества = -2% к шансу потери
  const qualityReduction = Math.floor(weaponQuality / 20) * 2
  lossChance -= qualityReduction

  // Бонус от искателя
  lossChance += adventurerBonuses // Обычно отрицательный

  // Ограничение: 0% - 50%
  return Math.max(0, Math.min(50, lossChance))
}

// Расчёт случайных бонусов
export function rollBonusRewards(
  template: ExpeditionTemplate
): { type: string; amount: number }[] {
  const bonuses: { type: string; amount: number }[] = []

  // Guild Bonus (20% шанс)
  if (Math.random() < 0.2) {
    bonuses.push({
      type: 'guild_bonus',
      amount: Math.floor(10 + Math.random() * 40), // 10-50 золота
    })
  }

  // Lucky Find (10% шанс)
  if (Math.random() < 0.1) {
    bonuses.push({
      type: 'lucky_find',
      amount: Math.floor(25 + Math.random() * 75), // 25-100 золота
    })
  }

  // Special Event (5% шанс)
  if (Math.random() < 0.05) {
    bonuses.push({
      type: 'special_event',
      amount: Math.floor(50 + Math.random() * 150), // 50-200 золота
    })
  }

  return bonuses
}

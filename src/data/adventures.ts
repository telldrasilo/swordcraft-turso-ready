/**
 * Система вылазок и приключений для SwordCraft: Idle Forge
 * 
 * Вылазки — это различные экспедиции, где созданное игроком оружие
 * используется искателями приключений для заработка очков души.
 */

// ================================
// ТИПЫ
// ================================

export type AdventureTag =
  | 'exploration'    // Исследование
  | 'treasure_hunt'  // Поиск сокровищ
  | 'monster_hunt'   // Охота на монстров
  | 'rescue'         // Спасение
  | 'escort'         // Сопровождение
  | 'dungeon'        // Подземелье
  | 'ruins'          // Руины
  | 'forest'         // Лес
  | 'mountain'       // Горы
  | 'swamp'          // Болото
  | 'cave'           // Пещера
  | 'castle'         // Замок
  | 'village'        // Деревня
  | 'graveyard'      // Кладбище
  | 'underground'    // Подземелье
  | 'water'          // Вода/река
  | 'night'          // Ночное
  | 'undead'         // Нежить
  | 'beasts'         // Звери
  | 'bandits'        // Разбойники
  | 'magic'          // Магия
  | 'ancient'        // Древнее
  | 'haunted'        // Проклятое место
  | 'trading'        // Торговля

export type AdventureDifficulty = 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'

export type AdventureStatus = 'available' | 'in_progress' | 'completed' | 'failed'

export interface AdventureReward {
  gold: number
  warSoulForWeapon: { min: number; max: number } // Очки Души Войны, которые получит оружие
  bonusItems?: { resource: string; amount: number; chance: number }[]
  bonusWeapon?: string // ID рецепта оружия (награда)
  bonusRecipe?: string // ID рецепта крафта/переработки
  fame: number
}

export interface Adventure {
  id: string
  name: string
  description: string
  icon: string
  tags: AdventureTag[]
  difficulty: AdventureDifficulty
  // Требования
  requiredLevel: number
  requiredFame: number
  minWeaponLevel: number // Минимальный уровень оружия
  recommendedWeaponTypes: string[] // Рекомендуемые типы оружия
  // Параметры
  duration: number // Время в секундах
  staminaCost: number // Расход выносливости искателя
  // Награды
  baseReward: AdventureReward
  // События
  eventChance: number // Базовый шанс события (0-1)
  maxEvents: number // Максимум событий за вылазку
  // UI
  color: string
  bgColor: string
}

// ================================
// ТЕГИ ВЫЛАЗОК
// ================================

export const adventureTagsInfo: Record<AdventureTag, { name: string; icon: string; description: string }> = {
  exploration: { name: 'Исследование', icon: '🗺️', description: 'Изучение неизвестных территорий' },
  treasure_hunt: { name: 'Поиск сокровищ', icon: '💎', description: 'Охота за ценностями и артефактами' },
  monster_hunt: { name: 'Охота на монстров', icon: '🎯', description: 'Уничтожение опасных существ' },
  rescue: { name: 'Спасение', icon: '🆘', description: 'Спасение пленников или попавших в беду' },
  escort: { name: 'Сопровождение', icon: '🛡️', description: 'Охрана важных персон или грузов' },
  dungeon: { name: 'Подземелье', icon: '🏰', description: 'Исследование подземелий и катакомб' },
  ruins: { name: 'Руины', icon: '🏚️', description: 'Древние развалины с тайнами' },
  forest: { name: 'Лес', icon: '🌲', description: 'Густые леса и чащи' },
  mountain: { name: 'Горы', icon: '⛰️', description: 'Горные перевалы и пещеры' },
  swamp: { name: 'Болото', icon: '🌿', description: 'Опасные топи и трясины' },
  cave: { name: 'Пещера', icon: '🕳️', description: 'Тёмные пещеры и гроты' },
  castle: { name: 'Замок', icon: '🏯', description: 'Старинные замки и крепости' },
  village: { name: 'Деревня', icon: '🏘️', description: 'Сельская местность и поселения' },
  graveyard: { name: 'Кладбище', icon: '🪦', description: 'Заброшенные кладбища и склепы' },
  underground: { name: 'Подземелье', icon: '⛏️', description: 'Шахты и подземные ходы' },
  water: { name: 'Вода', icon: '🌊', description: 'Реки, озёра и побережья' },
  night: { name: 'Ночное', icon: '🌙', description: 'Ночные приключения' },
  undead: { name: 'Нежить', icon: '💀', description: 'Сражения с нежитью' },
  beasts: { name: 'Звери', icon: '🐺', description: 'Опасные звери и монстры' },
  bandits: { name: 'Разбойники', icon: '🗡️', description: 'Бандиты и разбойники' },
  magic: { name: 'Магия', icon: '✨', description: 'Магические аномалии' },
  ancient: { name: 'Древнее', icon: '📜', description: 'Древние артефакты и тайны' },
  haunted: { name: 'Проклятое', icon: '👻', description: 'Проклятые места' },
  trading: { name: 'Торговля', icon: '🛒', description: 'Торговые маршруты' },
}

// ================================
// СПИСОК ВЫЛАЗОК
// ================================

export const adventures: Adventure[] = [
  // === ЛЁГКИЕ (Уровень 1-3) ===
  {
    id: 'goblin_cave',
    name: 'Пещера гоблинов',
    description: 'Небольшая пещера, облюбованная гоблинами. Идеальное место для первого приключения.',
    icon: '🕳️',
    tags: ['cave', 'monster_hunt', 'beasts', 'exploration'],
    difficulty: 'easy',
    requiredLevel: 1,
    requiredFame: 0,
    minWeaponLevel: 1,
    recommendedWeaponTypes: ['sword', 'dagger'],
    duration: 180, // 3 минуты
    staminaCost: 20,
    baseReward: {
      gold: 50,
      warSoulForWeapon: { min: 1, max: 3 }, // Очки Души Войны для оружия
      bonusItems: [
        { resource: 'iron', amount: 5, chance: 0.5 },
        { resource: 'coal', amount: 3, chance: 0.3 },
      ],
      fame: 2,
    },
    eventChance: 0.3,
    maxEvents: 1,
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
  },
  {
    id: 'forest_path',
    name: 'Лесная тропа',
    description: 'Опасный путь через густой лес. Волки и разбойники — обычные гости здесь.',
    icon: '🌲',
    tags: ['forest', 'exploration', 'beasts', 'bandits'],
    difficulty: 'easy',
    requiredLevel: 1,
    requiredFame: 0,
    minWeaponLevel: 1,
    recommendedWeaponTypes: ['axe', 'spear'],
    duration: 150, // 2.5 минуты
    staminaCost: 15,
    baseReward: {
      gold: 40,
      warSoulForWeapon: { min: 1, max: 2 },
      bonusItems: [
        { resource: 'wood', amount: 10, chance: 0.6 },
      ],
      fame: 1,
    },
    eventChance: 0.25,
    maxEvents: 1,
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
  },
  {
    id: 'old_quarry',
    name: 'Старая каменоломня',
    description: 'Заброшенная каменоломня. Каменщики ушли, но кто-то остался...',
    icon: '⛏️',
    tags: ['mountain', 'exploration', 'treasure_hunt'],
    difficulty: 'easy',
    requiredLevel: 2,
    requiredFame: 5,
    minWeaponLevel: 2,
    recommendedWeaponTypes: ['hammer', 'mace'],
    duration: 200, // ~3.3 минуты
    staminaCost: 25,
    baseReward: {
      gold: 65,
      warSoulForWeapon: { min: 2, max: 4 },
      bonusItems: [
        { resource: 'stone', amount: 15, chance: 0.7 },
        { resource: 'iron', amount: 3, chance: 0.4 },
      ],
      fame: 3,
    },
    eventChance: 0.35,
    maxEvents: 2,
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
  },

  // === ОБЫЧНЫЕ (Уровень 4-7) ===
  {
    id: 'abandoned_mine',
    name: 'Заброшенные шахты',
    description: 'Старые шахты, полные нежити. Ходят слухи о несметных сокровищах в глубине.',
    icon: '⛏️',
    tags: ['underground', 'undead', 'treasure_hunt', 'dungeon'],
    difficulty: 'normal',
    requiredLevel: 4,
    requiredFame: 15,
    minWeaponLevel: 3,
    recommendedWeaponTypes: ['sword', 'mace'],
    duration: 360, // 6 минут
    staminaCost: 35,
    baseReward: {
      gold: 150,
      warSoulForWeapon: { min: 5, max: 12 },
      bonusItems: [
        { resource: 'iron', amount: 10, chance: 0.6 },
        { resource: 'coal', amount: 8, chance: 0.5 },
        { resource: 'copper', amount: 5, chance: 0.3 },
      ],
      fame: 8,
    },
    eventChance: 0.45,
    maxEvents: 2,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
  },
  {
    id: 'spider_lair',
    name: 'Логово пауков',
    description: 'Тёмные туннели с гигантскими пауками. Их яд ценится алхимиками.',
    icon: '🕷️',
    tags: ['cave', 'monster_hunt', 'beasts', 'haunted'],
    difficulty: 'normal',
    requiredLevel: 5,
    requiredFame: 20,
    minWeaponLevel: 4,
    recommendedWeaponTypes: ['sword', 'dagger', 'spear'],
    duration: 420, // 7 минут
    staminaCost: 40,
    baseReward: {
      gold: 200,
      warSoulForWeapon: { min: 8, max: 18 },
      bonusItems: [
        { resource: 'iron', amount: 8, chance: 0.4 },
      ],
      fame: 12,
    },
    eventChance: 0.5,
    maxEvents: 3,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
  },
  {
    id: 'bandit_camp',
    name: 'Лагерь разбойников',
    description: 'Разбойники устроили лагерь на тракте. Пора проучить негодяев!',
    icon: '🏕️',
    tags: ['forest', 'bandits', 'treasure_hunt'],
    difficulty: 'normal',
    requiredLevel: 5,
    requiredFame: 25,
    minWeaponLevel: 4,
    recommendedWeaponTypes: ['axe', 'sword'],
    duration: 300, // 5 минут
    staminaCost: 30,
    baseReward: {
      gold: 250,
      warSoulForWeapon: { min: 6, max: 15 },
      bonusItems: [
        { resource: 'iron', amount: 6, chance: 0.3 },
      ],
      fame: 15,
    },
    eventChance: 0.4,
    maxEvents: 2,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
  },
  {
    id: 'swamp_expedition',
    name: 'Экспедиция в болото',
    description: 'Туманное болото скрывает древние тайны и опасных тварей.',
    icon: '🌿',
    tags: ['swamp', 'exploration', 'beasts', 'ancient'],
    difficulty: 'normal',
    requiredLevel: 6,
    requiredFame: 30,
    minWeaponLevel: 5,
    recommendedWeaponTypes: ['spear', 'axe'],
    duration: 480, // 8 минут
    staminaCost: 45,
    baseReward: {
      gold: 180,
      warSoulForWeapon: { min: 10, max: 25 },
      bonusItems: [
        { resource: 'coal', amount: 5, chance: 0.4 },
      ],
      fame: 10,
    },
    eventChance: 0.55,
    maxEvents: 3,
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
  },

  // === СЛОЖНЫЕ (Уровень 8-12) ===
  {
    id: 'ancient_ruins',
    name: 'Древние руины',
    description: 'Забытый храм с древними стражами. Говорят, там хранятся артефакты древних.',
    icon: '🏚️',
    tags: ['ruins', 'undead', 'ancient', 'magic', 'treasure_hunt'],
    difficulty: 'hard',
    requiredLevel: 8,
    requiredFame: 50,
    minWeaponLevel: 6,
    recommendedWeaponTypes: ['sword', 'mace', 'hammer'],
    duration: 600, // 10 минут
    staminaCost: 55,
    baseReward: {
      gold: 400,
      warSoulForWeapon: { min: 15, max: 35 },
      bonusItems: [
        { resource: 'silver', amount: 5, chance: 0.4 },
        { resource: 'goldOre', amount: 2, chance: 0.2 },
      ],
      fame: 25,
    },
    eventChance: 0.6,
    maxEvents: 4,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
  },
  {
    id: 'haunted_castle',
    name: 'Проклятый замок',
    description: 'Старинный замок, проклятый тёмной магией. Призраки не любят гостей.',
    icon: '🏯',
    tags: ['castle', 'haunted', 'undead', 'night', 'exploration'],
    difficulty: 'hard',
    requiredLevel: 9,
    requiredFame: 60,
    minWeaponLevel: 7,
    recommendedWeaponTypes: ['sword', 'dagger'],
    duration: 720, // 12 минут
    staminaCost: 60,
    baseReward: {
      gold: 500,
      warSoulForWeapon: { min: 20, max: 45 },
      bonusItems: [
        { resource: 'silver', amount: 8, chance: 0.5 },
      ],
      fame: 30,
    },
    eventChance: 0.65,
    maxEvents: 4,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
  },
  {
    id: 'silver_mine_depths',
    name: 'Глубины серебряного рудника',
    description: 'В глубоких штольнях рудника завелись странные твари, но серебро там есть.',
    icon: '⛏️',
    tags: ['underground', 'monster_hunt', 'treasure_hunt', 'beasts'],
    difficulty: 'hard',
    requiredLevel: 10,
    requiredFame: 75,
    minWeaponLevel: 8,
    recommendedWeaponTypes: ['hammer', 'mace', 'axe'],
    duration: 540, // 9 минут
    staminaCost: 50,
    baseReward: {
      gold: 350,
      warSoulForWeapon: { min: 12, max: 30 },
      bonusItems: [
        { resource: 'silver', amount: 12, chance: 0.6 },
        { resource: 'iron', amount: 10, chance: 0.4 },
      ],
      fame: 20,
    },
    eventChance: 0.55,
    maxEvents: 3,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
  },
  {
    id: 'graveyard_night',
    name: 'Ночь на кладбище',
    description: 'Кладбище оживёт этой ночью. Кто осмелится пройти через него?',
    icon: '🪦',
    tags: ['graveyard', 'undead', 'night', 'haunted', 'magic'],
    difficulty: 'hard',
    requiredLevel: 10,
    requiredFame: 80,
    minWeaponLevel: 7,
    recommendedWeaponTypes: ['mace', 'sword'],
    duration: 480, // 8 минут
    staminaCost: 45,
    baseReward: {
      gold: 300,
      warSoulForWeapon: { min: 25, max: 55 },
      fame: 35,
    },
    eventChance: 0.7,
    maxEvents: 5,
    color: 'text-orange-400',
    bgColor: 'bg-orange-900/30',
  },

  // === ЭКСТРЕМАЛЬНЫЕ (Уровень 13-17) ===
  {
    id: 'dragon_lair',
    name: 'Логово дракона',
    description: 'Древний дракон охраняет несметные сокровища. Смертельно опасно.',
    icon: '🐉',
    tags: ['cave', 'monster_hunt', 'ancient', 'treasure_hunt', 'beasts'],
    difficulty: 'extreme',
    requiredLevel: 13,
    requiredFame: 120,
    minWeaponLevel: 10,
    recommendedWeaponTypes: ['spear', 'axe', 'sword'],
    duration: 900, // 15 минут
    staminaCost: 80,
    baseReward: {
      gold: 1200,
      warSoulForWeapon: { min: 40, max: 90 },
      bonusItems: [
        { resource: 'goldOre', amount: 10, chance: 0.5 },
        { resource: 'mithril', amount: 2, chance: 0.15 },
      ],
      fame: 60,
    },
    eventChance: 0.75,
    maxEvents: 5,
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
  },
  {
    id: 'lich_tomb',
    name: 'Гробница лича',
    description: 'Древний лич спит в своей гробнице. Пробуждение будет... интересным.',
    icon: '💀',
    tags: ['dungeon', 'undead', 'magic', 'ancient', 'haunted'],
    difficulty: 'extreme',
    requiredLevel: 14,
    requiredFame: 140,
    minWeaponLevel: 11,
    recommendedWeaponTypes: ['sword', 'mace', 'hammer'],
    duration: 1020, // 17 минут
    staminaCost: 90,
    baseReward: {
      gold: 1000,
      warSoulForWeapon: { min: 50, max: 120 },
      bonusItems: [
        { resource: 'mithril', amount: 3, chance: 0.25 },
      ],
      fame: 75,
    },
    eventChance: 0.8,
    maxEvents: 6,
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
  },
  {
    id: 'dark_forest',
    name: 'Тёмный лес',
    description: 'Проклятый лес, где деревья шепчут и тени охотятся.',
    icon: '🌲',
    tags: ['forest', 'haunted', 'magic', 'night', 'beasts'],
    difficulty: 'extreme',
    requiredLevel: 15,
    requiredFame: 160,
    minWeaponLevel: 12,
    recommendedWeaponTypes: ['axe', 'sword', 'dagger'],
    duration: 840, // 14 минут
    staminaCost: 75,
    baseReward: {
      gold: 800,
      warSoulForWeapon: { min: 45, max: 100 },
      bonusItems: [
        { resource: 'silver', amount: 15, chance: 0.5 },
        { resource: 'goldOre', amount: 5, chance: 0.3 },
      ],
      fame: 50,
    },
    eventChance: 0.7,
    maxEvents: 5,
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
  },

  // === ЛЕГЕНДАРНЫЕ (Уровень 18+) ===
  {
    id: 'demon_portal',
    name: 'Демонический портал',
    description: 'Разрыв между мирами. Демоны хлынули в наш мир. Закройте портал!',
    icon: '🌀',
    tags: ['dungeon', 'magic', 'ancient', 'monster_hunt'],
    difficulty: 'legendary',
    requiredLevel: 18,
    requiredFame: 250,
    minWeaponLevel: 15,
    recommendedWeaponTypes: ['sword', 'spear', 'axe', 'hammer'],
    duration: 1200, // 20 минут
    staminaCost: 100,
    baseReward: {
      gold: 2500,
      warSoulForWeapon: { min: 80, max: 180 },
      bonusItems: [
        { resource: 'mithril', amount: 8, chance: 0.4 },
      ],
      fame: 120,
    },
    eventChance: 0.85,
    maxEvents: 7,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
  },
  {
    id: 'titan_remains',
    name: 'Останки титана',
    description: 'Тело древнего титана — теперь лабиринт из костей и плоти. Внутри — сердце титана.',
    icon: '🗿',
    tags: ['ancient', 'dungeon', 'monster_hunt', 'treasure_hunt'],
    difficulty: 'legendary',
    requiredLevel: 20,
    requiredFame: 350,
    minWeaponLevel: 18,
    recommendedWeaponTypes: ['hammer', 'axe', 'sword'],
    duration: 1500, // 25 минут
    staminaCost: 120,
    baseReward: {
      gold: 5000,
      warSoulForWeapon: { min: 120, max: 280 },
      bonusItems: [
        { resource: 'mithril', amount: 15, chance: 0.6 },
      ],
      fame: 200,
    },
    eventChance: 0.9,
    maxEvents: 8,
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
  },
]

// ================================
// ФУНКЦИИ
// ================================

export function getAdventure(id: string): Adventure | undefined {
  return adventures.find(a => a.id === id)
}

export function getAdventuresByDifficulty(difficulty: AdventureDifficulty): Adventure[] {
  return adventures.filter(a => a.difficulty === difficulty)
}

export function getAdventuresByTag(tag: AdventureTag): Adventure[] {
  return adventures.filter(a => a.tags.includes(tag))
}

export function getAvailableAdventures(playerLevel: number, fame: number): Adventure[] {
  return adventures.filter(a => 
    a.requiredLevel <= playerLevel && a.requiredFame <= fame
  )
}

export function getDifficultyInfo(difficulty: AdventureDifficulty): { 
  name: string
  color: string
  stars: number 
} {
  const info = {
    easy: { name: 'Лёгкая', color: 'text-green-400', stars: 1 },
    normal: { name: 'Обычная', color: 'text-amber-400', stars: 2 },
    hard: { name: 'Сложная', color: 'text-orange-400', stars: 3 },
    extreme: { name: 'Экстремальная', color: 'text-red-400', stars: 4 },
    legendary: { name: 'Легендарная', color: 'text-purple-400', stars: 5 },
  }
  return info[difficulty]
}

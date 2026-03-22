/**
 * Система переработки ресурсов для SwordCraft: Idle Forge
 * 
 * Руды → Слитки
 * Дерево → Доски
 * И т.д.
 */

// ================================
// ТИПЫ
// ================================

export type RawResource = 'iron' | 'copper' | 'tin' | 'silver' | 'goldOre' | 'mithril' | 'wood' | 'stone'
export type RefinedResource = 'ironIngot' | 'copperIngot' | 'tinIngot' | 'bronzeIngot' | 'silverIngot' | 'goldIngot' | 'mithrilIngot' | 'planks' | 'stoneBlocks'

export interface RefiningRecipe {
  id: string
  name: string
  // Входные ресурсы (может быть несколько для сплавов)
  inputs: Array<{
    resource: RawResource
    amount: number
  }>
  // Выходные ресурсы
  output: {
    resource: RefinedResource
    amount: number
  }
  // Дополнительные расходы (уголь для плавки)
  extraCost?: {
    coal?: number
  }
  // Время переработки в секундах
  processTime: number
  // Требуемый уровень
  requiredLevel: number
  // Требуемое здание
  requiredBuilding: 'smelter' | 'sawmill' | 'quarry'
  // Разблокирован ли рецепт
  unlocked: boolean
  // Описание
  description: string
  // Является ли сплавом (для UI)
  isAlloy?: boolean
}

// ================================
// ДАННЫЕ РЕЦЕПТОВ ПЕРЕРАБОТКИ
// ================================

export const refiningRecipes: RefiningRecipe[] = [
  // === ПЛАВКА РУДЫ В СЛИТКИ ===
  {
    id: 'iron_ingot',
    name: 'Железный слиток',
    inputs: [{ resource: 'iron', amount: 3 }],
    output: { resource: 'ironIngot', amount: 1 },
    extraCost: { coal: 2 },
    processTime: 20,
    requiredLevel: 1,
    requiredBuilding: 'smelter',
    unlocked: true,
    description: 'Переплавка железной руды в слиток. Требуется уголь.'
  },
  {
    id: 'copper_ingot',
    name: 'Медный слиток',
    inputs: [{ resource: 'copper', amount: 3 }],
    output: { resource: 'copperIngot', amount: 1 },
    extraCost: { coal: 2 },
    processTime: 25,
    requiredLevel: 3,
    requiredBuilding: 'smelter',
    unlocked: true,
    description: 'Переплавка медной руды в слиток.'
  },
  {
    id: 'tin_ingot',
    name: 'Оловянный слиток',
    inputs: [{ resource: 'tin', amount: 3 }],
    output: { resource: 'tinIngot', amount: 1 },
    extraCost: { coal: 2 },
    processTime: 25,
    requiredLevel: 3,
    requiredBuilding: 'smelter',
    unlocked: true,
    description: 'Переплавка оловянной руды в слиток.'
  },
  {
    id: 'bronze_ingot',
    name: 'Бронзовый слиток',
    inputs: [
      { resource: 'copper', amount: 2 },
      { resource: 'tin', amount: 1 }
    ],
    output: { resource: 'bronzeIngot', amount: 2 },
    extraCost: { coal: 4 },
    processTime: 35,
    requiredLevel: 5,
    requiredBuilding: 'smelter',
    unlocked: false,
    description: 'Сплав меди и олова. Прочнее железа.',
    isAlloy: true
  },
  {
    id: 'steel_ingot',
    name: 'Стальной слиток',
    inputs: [{ resource: 'iron', amount: 4 }],
    output: { resource: 'steelIngot', amount: 1 },
    extraCost: { coal: 5 },
    processTime: 45,
    requiredLevel: 8,
    requiredBuilding: 'smelter',
    unlocked: false,
    description: 'Закалённая сталь. Требует мастерства.'
  },
  {
    id: 'silver_ingot',
    name: 'Серебряный слиток',
    inputs: [{ resource: 'silver', amount: 3 }],
    output: { resource: 'silverIngot', amount: 1 },
    extraCost: { coal: 3 },
    processTime: 40,
    requiredLevel: 10,
    requiredBuilding: 'smelter',
    unlocked: false,
    description: 'Чистое серебро. Магический металл.'
  },
  {
    id: 'gold_ingot',
    name: 'Золотой слиток',
    inputs: [{ resource: 'goldOre', amount: 3 }],
    output: { resource: 'goldIngot', amount: 1 },
    extraCost: { coal: 4 },
    processTime: 60,
    requiredLevel: 15,
    requiredBuilding: 'smelter',
    unlocked: false,
    description: 'Благородное золото. Символ богатства.'
  },
  {
    id: 'mithril_ingot',
    name: 'Мифриловый слиток',
    inputs: [{ resource: 'mithril', amount: 2 }],
    output: { resource: 'mithrilIngot', amount: 1 },
    extraCost: { coal: 8 },
    processTime: 120,
    requiredLevel: 20,
    requiredBuilding: 'smelter',
    unlocked: false,
    description: 'Легендарный мифрил. Эльфийский секрет.'
  },
  
  // === ОБРАБОТКА ДЕРЕВА ===
  {
    id: 'wood_planks',
    name: 'Доски',
    inputs: [{ resource: 'wood', amount: 2 }],
    output: { resource: 'planks', amount: 1 },
    processTime: 10,
    requiredLevel: 1,
    requiredBuilding: 'sawmill',
    unlocked: true,
    description: 'Обработка брёвен в доски. Основной материал.'
  },
  
  // === ОБРАБОТКА КАМНЯ ===
  {
    id: 'stone_blocks',
    name: 'Каменные блоки',
    inputs: [{ resource: 'stone', amount: 3 }],
    output: { resource: 'stoneBlocks', amount: 1 },
    processTime: 15,
    requiredLevel: 1,
    requiredBuilding: 'quarry',
    unlocked: true,
    description: 'Обтёсанный камень для строительства.'
  },
]

// ================================
// ДАННЫЕ ПЕРЕРАБОТАННЫХ РЕСУРСОВ
// ================================

export interface RefinedResourceInfo {
  id: RefinedResource
  name: string
  icon: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

export const refinedResourcesInfo: Record<RefinedResource, RefinedResourceInfo> = {
  ironIngot: {
    id: 'ironIngot',
    name: 'Железный слиток',
    icon: '🔩',
    description: 'Основа металлообработки. Прочный и надёжный.',
    rarity: 'common'
  },
  copperIngot: {
    id: 'copperIngot',
    name: 'Медный слиток',
    icon: '🟤',
    description: 'Мягкий металл с отличной проводимостью.',
    rarity: 'common'
  },
  tinIngot: {
    id: 'tinIngot',
    name: 'Оловянный слиток',
    icon: '⚪',
    description: 'Лёгкий металл для сплавов.',
    rarity: 'common'
  },
  bronzeIngot: {
    id: 'bronzeIngot',
    name: 'Бронзовый слиток',
    icon: '🥉',
    description: 'Сплав меди и олова. Прочнее железа.',
    rarity: 'uncommon'
  },
  steelIngot: {
    id: 'steelIngot',
    name: 'Стальной слиток',
    icon: '⚙️',
    description: 'Закалённая сталь для качественного оружия.',
    rarity: 'rare'
  },
  silverIngot: {
    id: 'silverIngot',
    name: 'Серебряный слиток',
    icon: '🥈',
    description: 'Чистое серебро. Эффективно против нечисти.',
    rarity: 'epic'
  },
  goldIngot: {
    id: 'goldIngot',
    name: 'Золотой слиток',
    icon: '🥇',
    description: 'Благородное золото для роскошного оружия.',
    rarity: 'epic'
  },
  mithrilIngot: {
    id: 'mithrilIngot',
    name: 'Мифриловый слиток',
    icon: '💠',
    description: 'Легендарный металл. Лёгкий и неразрушимый.',
    rarity: 'legendary'
  },
  planks: {
    id: 'planks',
    name: 'Доски',
    icon: '🪵',
    description: 'Обработанные доски для рукоятей и строительства.',
    rarity: 'common'
  },
  stoneBlocks: {
    id: 'stoneBlocks',
    name: 'Каменные блоки',
    icon: '🧱',
    description: 'Обтёсанный камень для строительства и наковален.',
    rarity: 'common'
  },
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

export function getRefiningRecipe(id: string): RefiningRecipe | undefined {
  return refiningRecipes.find(r => r.id === id)
}

export function getRecipesByBuilding(building: 'smelter' | 'sawmill' | 'quarry'): RefiningRecipe[] {
  return refiningRecipes.filter(r => r.requiredBuilding === building)
}

export function getAvailableRefiningRecipes(playerLevel: number): RefiningRecipe[] {
  return refiningRecipes.filter(r => r.requiredLevel <= playerLevel && r.unlocked)
}

// Конвертация input ресурса в output (для бронзы нужны оба металла)
export const alloyRecipes: { id: string; inputs: { resource: RawResource; amount: number }[]; output: { resource: RefinedResource; amount: number }; coal: number }[] = [
  {
    id: 'bronze_alloy',
    inputs: [
      { resource: 'copper', amount: 2 },
      { resource: 'tin', amount: 1 }
    ],
    output: { resource: 'bronzeIngot', amount: 2 },
    coal: 4
  }
]

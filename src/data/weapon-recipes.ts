/**
 * Система рецептов и оружия для SwordCraft: Idle Forge
 */

// ================================
// ТИПЫ
// ================================

// Импортируем типы из единого источника
import type { 
  CraftedWeapon, 
  WeaponType, 
  WeaponTier, 
  WeaponMaterial,
  QualityGrade 
} from '@/store/slices/craft-slice'

// Реэкспорт для совместимости
export type { CraftedWeapon, WeaponType, WeaponTier, WeaponMaterial, QualityGrade }
export type MaterialType = WeaponMaterial

// Ресурсы для крафта
export interface CraftingCost {
  gold?: number
  // Сырьё
  wood?: number
  stone?: number
  iron?: number
  coal?: number
  copper?: number
  tin?: number
  silver?: number
  goldOre?: number
  mithril?: number
  // Переработанные
  ironIngot?: number
  copperIngot?: number
  tinIngot?: number
  bronzeIngot?: number
  steelIngot?: number
  silverIngot?: number
  goldIngot?: number
  mithrilIngot?: number
  planks?: number
  stoneBlocks?: number
}

// Рецепт оружия
export interface WeaponRecipe {
  id: string
  name: string
  type: WeaponType
  tier: WeaponTier
  material: MaterialType
  
  // Стоимость крафта
  cost: CraftingCost
  
  // Время крафта в секундах
  baseCraftTime: number
  
  // Базовая цена продажи
  baseSellPrice: number
  
  // Требуемый уровень кузнеца
  requiredLevel: number
  
  // Описание
  description: string
  
  // Разблокировка
  unlocked: boolean
  unlockCondition?: string
  
  // UI
  material?: string // Отображаемое имя материала
}

// Активный крафт
export interface ActiveCrafting {
  recipeId: string
  startTime: number
  endTime: number
  progress: number
}

// ================================
// ДАННЫЕ РЕЦЕПТОВ
// ================================

export const weaponRecipes: WeaponRecipe[] = [
  // === ЖЕЛЕЗНОЕ ОРУЖИЕ (Начальное) - требует слитки ===
  {
    id: 'iron_sword',
    name: 'Железный меч',
    type: 'sword',
    tier: 'common',
    material: 'iron',
    cost: { ironIngot: 3, coal: 5, planks: 2 },
    baseCraftTime: 30, // 30 секунд
    baseSellPrice: 25,
    requiredLevel: 1,
    description: 'Простой железный меч. Надёжный, но без изысков.',
    unlocked: true
  },
  {
    id: 'iron_dagger',
    name: 'Железный кинжал',
    type: 'dagger',
    tier: 'common',
    material: 'iron',
    cost: { ironIngot: 2, coal: 3, planks: 1 },
    baseCraftTime: 15,
    baseSellPrice: 12,
    requiredLevel: 1,
    description: 'Лёгкий кинжал для ближнего боя.',
    unlocked: true
  },
  {
    id: 'iron_axe',
    name: 'Железный топор',
    type: 'axe',
    tier: 'common',
    material: 'iron',
    cost: { ironIngot: 4, coal: 6, planks: 2 },
    baseCraftTime: 35,
    baseSellPrice: 30,
    requiredLevel: 1,
    description: 'Тяжёлый топор с железным лезвием.',
    unlocked: true
  },
  {
    id: 'iron_mace',
    name: 'Железная булава',
    type: 'mace',
    tier: 'common',
    material: 'iron',
    cost: { ironIngot: 5, coal: 7, stoneBlocks: 2 },
    baseCraftTime: 40,
    baseSellPrice: 35,
    requiredLevel: 1,
    description: 'Массивная булава для сокрушительных ударов.',
    unlocked: true
  },
  
  // === ЖЕЛЕЗНОЕ ОРУЖИЕ (Продвинутое) ===
  {
    id: 'iron_spear',
    name: 'Железное копьё',
    type: 'spear',
    tier: 'uncommon',
    material: 'iron',
    cost: { ironIngot: 5, coal: 8, planks: 3 },
    baseCraftTime: 45,
    baseSellPrice: 45,
    requiredLevel: 3,
    description: 'Длинное копьё с железным наконечником.',
    unlocked: true
  },
  {
    id: 'iron_hammer',
    name: 'Боевой молот',
    type: 'hammer',
    tier: 'uncommon',
    material: 'iron',
    cost: { ironIngot: 7, coal: 10, planks: 3 },
    baseCraftTime: 50,
    baseSellPrice: 55,
    requiredLevel: 3,
    description: 'Тяжёлый боевой молот.',
    unlocked: true
  },
  
  // === БРОНЗОВОЕ ОРУЖИЕ (Уровень 5+) ===
  {
    id: 'bronze_sword',
    name: 'Бронзовый меч',
    type: 'sword',
    tier: 'uncommon',
    material: 'bronze',
    cost: { bronzeIngot: 4, coal: 6, planks: 2 },
    baseCraftTime: 40,
    baseSellPrice: 50,
    requiredLevel: 5,
    description: 'Меч из бронзового сплава. Прочнее железного.',
    unlocked: false,
    unlockCondition: 'Купить рецепт у торговца'
  },
  {
    id: 'bronze_axe',
    name: 'Бронзовый топор',
    type: 'axe',
    tier: 'uncommon',
    material: 'bronze',
    cost: { bronzeIngot: 5, coal: 8, planks: 3 },
    baseCraftTime: 50,
    baseSellPrice: 60,
    requiredLevel: 5,
    description: 'Топор из бронзы. Отлично держит заточку.',
    unlocked: false,
    unlockCondition: 'Купить рецепт у торговца'
  },
  
  // === СТАЛЬНОЕ ОРУЖИЕ (Уровень 8+) ===
  {
    id: 'steel_sword',
    name: 'Стальной меч',
    type: 'sword',
    tier: 'rare',
    material: 'steel',
    cost: { steelIngot: 5, coal: 12, planks: 3 },
    baseCraftTime: 60,
    baseSellPrice: 80,
    requiredLevel: 8,
    description: 'Меч из закалённой стали. Острый и прочный.',
    unlocked: false,
    unlockCondition: 'Получить за заказ гвардии'
  },
  {
    id: 'steel_dagger',
    name: 'Стальной кинжал',
    type: 'dagger',
    tier: 'rare',
    material: 'steel',
    cost: { steelIngot: 3, coal: 6, planks: 1 },
    baseCraftTime: 35,
    baseSellPrice: 45,
    requiredLevel: 8,
    description: 'Изящный стальной кинжал.',
    unlocked: false,
    unlockCondition: 'Награда от воровской гильдии'
  },
  {
    id: 'steel_spear',
    name: 'Стальное копьё',
    type: 'spear',
    tier: 'rare',
    material: 'steel',
    cost: { steelIngot: 6, coal: 10, planks: 4 },
    baseCraftTime: 70,
    baseSellPrice: 95,
    requiredLevel: 8,
    description: 'Копьё со стальным наконечником.',
    unlocked: false,
    unlockCondition: 'Заказ от наёмников'
  },
  
  // === СЕРЕБРЯНОЕ ОРУЖИЕ (Уровень 10+) ===
  {
    id: 'silver_sword',
    name: 'Серебряный меч',
    type: 'sword',
    tier: 'epic',
    material: 'silver',
    cost: { silverIngot: 4, ironIngot: 2, coal: 8, planks: 2 },
    baseCraftTime: 90,
    baseSellPrice: 180,
    requiredLevel: 10,
    description: 'Меч из серебра. Эффективен против нечисти.',
    unlocked: false,
    unlockCondition: 'Найти в экспедиции'
  },
  {
    id: 'silver_dagger',
    name: 'Серебряный кинжал',
    type: 'dagger',
    tier: 'epic',
    material: 'silver',
    cost: { silverIngot: 3, ironIngot: 1, coal: 5, planks: 1 },
    baseCraftTime: 60,
    baseSellPrice: 120,
    requiredLevel: 10,
    description: 'Кинжал для охотников на нечисть.',
    unlocked: false,
    unlockCondition: 'Награда за охоту на нечисть'
  },
  
  // === ЗОЛОТОЕ ОРУЖИЕ (Уровень 15+) ===
  {
    id: 'gold_sword',
    name: 'Золотой меч',
    type: 'sword',
    tier: 'epic',
    material: 'gold',
    cost: { goldIngot: 5, ironIngot: 3, coal: 10, planks: 3 },
    baseCraftTime: 120,
    baseSellPrice: 350,
    requiredLevel: 15,
    description: 'Роскошный золотой меч. Символ статуса.',
    unlocked: false,
    unlockCondition: 'Королевский заказ'
  },
  
  // === МИФРИЛОВОЕ ОРУЖИЕ (Уровень 20+) ===
  {
    id: 'mithril_sword',
    name: 'Мифриловый меч',
    type: 'sword',
    tier: 'legendary',
    material: 'mithril',
    cost: { mithrilIngot: 5, ironIngot: 2, coal: 15, planks: 3 },
    baseCraftTime: 180,
    baseSellPrice: 800,
    requiredLevel: 20,
    description: 'Легендарный меч из мифрила. Лёгкий и неразрушимый.',
    unlocked: false,
    unlockCondition: 'Найти в эльфийских руинах'
  },
  {
    id: 'mithril_dagger',
    name: 'Мифриловый кинжал',
    type: 'dagger',
    tier: 'legendary',
    material: 'mithril',
    cost: { mithrilIngot: 3, ironIngot: 1, coal: 8, planks: 1 },
    baseCraftTime: 100,
    baseSellPrice: 500,
    requiredLevel: 20,
    description: 'Эльфийский кинжал из мифрила.',
    unlocked: false,
    unlockCondition: 'Найти в глубинах'
  },
]

// ================================
// СИСТЕМА КАЧЕСТВА
// ================================

export const qualityGrades: Record<QualityGrade, { name: string; min: number; max: number; multiplier: number; color: string }> = {
  poor: { name: 'Плохое', min: 0, max: 25, multiplier: 0.6, color: 'text-red-400' },
  normal: { name: 'Обычное', min: 26, max: 50, multiplier: 1.0, color: 'text-stone-300' },
  good: { name: 'Хорошее', min: 51, max: 70, multiplier: 1.3, color: 'text-green-400' },
  excellent: { name: 'Отличное', min: 71, max: 85, multiplier: 1.6, color: 'text-blue-400' },
  masterwork: { name: 'Шедевр', min: 86, max: 95, multiplier: 2.0, color: 'text-purple-400' },
  legendary: { name: 'Легендарное', min: 96, max: 100, multiplier: 3.0, color: 'text-amber-400' }
}

export type QualityGrade = keyof typeof qualityGrades

// Определение качества по числу
export function getQualityGrade(quality: number): QualityGrade {
  if (quality <= 25) return 'poor'
  if (quality <= 50) return 'normal'
  if (quality <= 70) return 'good'
  if (quality <= 85) return 'excellent'
  if (quality <= 95) return 'masterwork'
  return 'legendary'
}

// Расчёт качества при крафте
export function calculateCraftQuality(
  workerQuality: number, // Характеристика качества рабочих
  playerLevel: number,
  recipeTier: WeaponTier
): number {
  // Базовое качество (случайное)
  const base = Math.random() * 40 + 30 // 30-70
  
  // Бонус от рабочих
  const workerBonus = workerQuality / 100 * 20 // до +20
  
  // Бонус от уровня игрока
  const levelBonus = Math.min(playerLevel * 0.5, 15) // до +15
  
  // Шанс критического успеха
  const critChance = Math.min(workerQuality / 100 * 0.1 + playerLevel * 0.01, 0.2)
  const critBonus = Math.random() < critChance ? 20 : 0
  
  // Шанс провала для высоких тиров
  const tierPenalty = { common: 0, uncommon: 2, rare: 5, epic: 8, legendary: 12, mythic: 15 }
  const penalty = Math.random() * (tierPenalty[recipeTier] || 0)
  
  const finalQuality = Math.max(1, Math.min(100, base + workerBonus + levelBonus + critBonus - penalty))
  
  return Math.round(finalQuality)
}

// ================================
// ХАРАКТЕРИСТИКИ ОРУЖИЯ
// ================================

export const weaponTypeStats = {
  sword: { attackBase: 10, attackPerTier: 5, name: 'Меч', icon: '⚔️' },
  dagger: { attackBase: 6, attackPerTier: 3, name: 'Кинжал', icon: '🗡️' },
  axe: { attackBase: 14, attackPerTier: 7, name: 'Топор', icon: '🪓' },
  mace: { attackBase: 16, attackPerTier: 8, name: 'Булава', icon: '🔨' },
  spear: { attackBase: 12, attackPerTier: 6, name: 'Копьё', icon: '🔱' },
  hammer: { attackBase: 18, attackPerTier: 9, name: 'Молот', icon: '⚒️' },
  bow: { attackBase: 8, attackPerTier: 4, name: 'Лук', icon: '🏹' },
  staff: { attackBase: 7, attackPerTier: 3, name: 'Посох', icon: '🪄' },
}

export const tierMultipliers = {
  common: 1.0,
  uncommon: 1.2,
  rare: 1.5,
  epic: 2.0,
  legendary: 3.0,
  mythic: 5.0
}

export const materialMultipliers = {
  iron: 1.0,
  bronze: 1.15,
  steel: 1.3,
  silver: 1.4,
  gold: 1.5,
  mithril: 2.0
}

// Расчёт атаки оружия
export function calculateAttack(
  type: WeaponType,
  tier: WeaponTier,
  material: MaterialType,
  quality: number
): number {
  const typeStats = weaponTypeStats[type]
  const tierMult = tierMultipliers[tier]
  const materialMult = materialMultipliers[material]
  const qualityMult = qualityGrades[getQualityGrade(quality)].multiplier
  
  const baseAttack = typeStats.attackBase + typeStats.attackPerTier * Object.keys(tierMultipliers).indexOf(tier)
  
  return Math.round(baseAttack * tierMult * materialMult * qualityMult)
}

// Расчёт цены продажи
export function calculateSellPrice(
  basePrice: number,
  quality: number,
  tier: WeaponTier
): number {
  const qualityMult = qualityGrades[getQualityGrade(quality)].multiplier
  const tierMult = tierMultipliers[tier]
  
  return Math.round(basePrice * qualityMult * tierMult)
}

// ================================
// ФУНКЦИИ ПОЛУЧЕНИЯ ДАННЫХ
// ================================

export function getRecipe(id: string): WeaponRecipe | undefined {
  return weaponRecipes.find(r => r.id === id)
}

export function getAvailableRecipes(playerLevel: number): WeaponRecipe[] {
  return weaponRecipes.filter(r => r.requiredLevel <= playerLevel)
}

export function canCraft(recipe: WeaponRecipe, resources: CraftingCost): boolean {
  for (const [resource, amount] of Object.entries(recipe.cost)) {
    if ((resources[resource as keyof CraftingCost] || 0) < amount) {
      return false
    }
  }
  return true
}

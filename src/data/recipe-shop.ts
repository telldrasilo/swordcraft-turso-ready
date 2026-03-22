/**
 * Система покупки и получения рецептов для SwordCraft: Idle Forge
 * 
 * Рецепты можно получить:
 * - Купить у торговца за золото
 * - Получить как награду за заказ NPC
 * - Найти в экспедиции
 * - Разблокировать по уровню кузнеца
 */

import { WeaponTier } from './weapon-recipes'

// ================================
// ТИПЫ
// ================================

export type RecipeSource = 'purchase' | 'order' | 'expedition' | 'level'

export interface RecipePrice {
  recipeId: string
  name: string // Русское название
  source: RecipeSource
  gold?: number
  requiredLevel?: number
  requiredFame?: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  description: string
}

// ================================
// ЦЕНЫ НА РЕЦЕПТЫ ОРУЖИЯ
// ================================

export const weaponRecipePrices: RecipePrice[] = [
  // === БРОНЗОВОЕ ОРУЖИЕ (Покупка) ===
  {
    recipeId: 'bronze_sword',
    name: 'Бронзовый меч',
    source: 'purchase',
    gold: 200,
    requiredLevel: 5,
    rarity: 'uncommon',
    description: 'Рецепт бронзового меча. Можно купить у торговца.'
  },
  {
    recipeId: 'bronze_axe',
    name: 'Бронзовый топор',
    source: 'purchase',
    gold: 250,
    requiredLevel: 5,
    rarity: 'uncommon',
    description: 'Рецепт бронзового топора. Можно купить у торговца.'
  },
  
  // === СТАЛЬНОЕ ОРУЖИЕ (Заказы) ===
  {
    recipeId: 'steel_sword',
    name: 'Стальной меч',
    source: 'order',
    gold: 100,
    requiredLevel: 8,
    requiredFame: 50,
    rarity: 'rare',
    description: 'Рецепт стального меча. Выдаётся за выполнение заказа гвардии.'
  },
  {
    recipeId: 'steel_dagger',
    name: 'Стальной кинжал',
    source: 'order',
    gold: 80,
    requiredLevel: 8,
    requiredFame: 40,
    rarity: 'rare',
    description: 'Рецепт стального кинжала. Награда от воровской гильдии.'
  },
  {
    recipeId: 'steel_spear',
    name: 'Стальное копьё',
    source: 'order',
    gold: 150,
    requiredLevel: 8,
    requiredFame: 60,
    rarity: 'rare',
    description: 'Рецепт стального копья. Заказ от наёмников.'
  },
  
  // === СЕРЕБРЯНОЕ ОРУЖИЕ (Экспедиции) ===
  {
    recipeId: 'silver_sword',
    name: 'Серебряный меч',
    source: 'expedition',
    requiredLevel: 10,
    requiredFame: 100,
    rarity: 'epic',
    description: 'Рецепт серебряного меча. Можно найти в древних руинах.'
  },
  {
    recipeId: 'silver_dagger',
    name: 'Серебряный кинжал',
    source: 'expedition',
    requiredLevel: 10,
    requiredFame: 80,
    rarity: 'epic',
    description: 'Рецепт серебряного кинжала. Награда за охоту на нечисть.'
  },
  
  // === ЗОЛОТОЕ ОРУЖИЕ (Заказы знати) ===
  {
    recipeId: 'gold_sword',
    name: 'Золотой меч',
    source: 'order',
    gold: 500,
    requiredLevel: 15,
    requiredFame: 200,
    rarity: 'epic',
    description: 'Рецепт золотого меча. Королевский заказ.'
  },
  
  // === МИФРИЛОВОЕ ОРУЖИЕ (Экспедиции) ===
  {
    recipeId: 'mithril_sword',
    name: 'Мифриловый меч',
    source: 'expedition',
    requiredLevel: 20,
    requiredFame: 500,
    rarity: 'legendary',
    description: 'Рецепт мифрилового меча. Тайна эльфийских кузнецов.'
  },
  {
    recipeId: 'mithril_dagger',
    name: 'Мифриловый кинжал',
    source: 'expedition',
    requiredLevel: 20,
    requiredFame: 400,
    rarity: 'legendary',
    description: 'Рецепт мифрилового кинжала. Находка в глубинах.'
  },
]

// ================================
// ЦЕНЫ НА РЕЦЕПТЫ ПЕРЕРАБОТКИ
// ================================

export const refiningRecipePrices: RecipePrice[] = [
  // === БРОНЗА (Покупка) ===
  {
    recipeId: 'bronze_ingot',
    name: 'Бронзовый слиток',
    source: 'purchase',
    gold: 100,
    requiredLevel: 5,
    rarity: 'uncommon',
    description: 'Рецепт бронзового сплава. Основы металлургии.'
  },
  
  // === СТАЛЬ (Покупка) ===
  {
    recipeId: 'steel_ingot',
    name: 'Стальной слиток',
    source: 'purchase',
    gold: 200,
    requiredLevel: 8,
    rarity: 'rare',
    description: 'Рецепт закалённой стали. Требует мастерства.'
  },
  
  // === СЕРЕБРО (Экспедиция) ===
  {
    recipeId: 'silver_ingot',
    name: 'Серебряный слиток',
    source: 'expedition',
    requiredLevel: 10,
    requiredFame: 100,
    rarity: 'epic',
    description: 'Рецепт очистки серебра. Магические техники.'
  },
  
  // === ЗОЛОТО (Заказ) ===
  {
    recipeId: 'gold_ingot',
    name: 'Золотой слиток',
    source: 'order',
    gold: 300,
    requiredLevel: 15,
    requiredFame: 150,
    rarity: 'epic',
    description: 'Рецепт золотого слитка. Секрет ювелиров.'
  },
  
  // === МИФРИЛ (Экспедиция) ===
  {
    recipeId: 'mithril_ingot',
    name: 'Мифриловый слиток',
    source: 'expedition',
    requiredLevel: 20,
    requiredFame: 500,
    rarity: 'legendary',
    description: 'Рецепт мифрилового слитка. Утерянное знание.'
  },
]

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

export function getRecipePrice(recipeId: string): RecipePrice | undefined {
  return weaponRecipePrices.find(p => p.recipeId === recipeId) ||
         refiningRecipePrices.find(p => p.recipeId === recipeId)
}

export function getRecipesBySource(source: RecipeSource): RecipePrice[] {
  return [...weaponRecipePrices, ...refiningRecipePrices].filter(p => p.source === source)
}

export function getPurchasableRecipes(): RecipePrice[] {
  return getRecipesBySource('purchase')
}

export function getOrderRecipes(): RecipePrice[] {
  return getRecipesBySource('order')
}

export function getExpeditionRecipes(): RecipePrice[] {
  return getRecipesBySource('expedition')
}

// Редкость → цвет
export const rarityColors = {
  common: 'text-stone-300',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-amber-400'
}

export const rarityBgColors = {
  common: 'bg-stone-700/50',
  uncommon: 'bg-green-900/30',
  rare: 'bg-blue-900/30',
  epic: 'bg-purple-900/30',
  legendary: 'bg-amber-900/30'
}

export const rarityBorderColors = {
  common: 'border-stone-600',
  uncommon: 'border-green-600',
  rare: 'border-blue-600',
  epic: 'border-purple-600',
  legendary: 'border-amber-600'
}

// Источник → иконка
export const sourceIcons = {
  purchase: '🛒',
  order: '📜',
  expedition: '🗺️',
  level: '⭐'
}

export const sourceNames = {
  purchase: 'Покупка',
  order: 'Заказ',
  expedition: 'Экспедиция',
  level: 'Уровень'
}

/**
 * Библиотека рецептов оружия
 * Экспорт всех рецептов
 */

import type { WeaponRecipe } from '@/types/craft-v2'

import { swordRecipes } from './swords'
import { daggerRecipes, axeRecipes } from './melee'

// Все рецепты в одном массиве
export const allRecipes: WeaponRecipe[] = [
  ...swordRecipes,
  ...daggerRecipes,
  ...axeRecipes,
]

// Карта рецептов по ID
export const recipeById: Map<string, WeaponRecipe> = new Map(
  allRecipes.map(recipe => [recipe.id, recipe])
)

// Группировка по типам
export const recipesByType = {
  sword: swordRecipes,
  dagger: daggerRecipes,
  axe: axeRecipes,
}

/**
 * Получить рецепт по ID
 */
export function getRecipeById(id: string): WeaponRecipe | undefined {
  return recipeById.get(id)
}

/**
 * Получить рецепты по типу оружия
 */
export function getRecipesByType(type: string): WeaponRecipe[] {
  return recipesByType[type as keyof typeof recipesByType] || []
}

/**
 * Получить рецепты, доступные игроку
 */
export function getAvailableRecipes(
  playerLevel: number,
  unlockedRecipes: string[] = []
): WeaponRecipe[] {
  return allRecipes.filter(recipe => {
    // Если рецепт в списке разблокированных
    if (unlockedRecipes.includes(recipe.id)) return true
    
    // Проверяем уровень
    if (recipe.requiredLevel && playerLevel < recipe.requiredLevel) {
      return false
    }
    
    // Проверяем условие разблокировки
    if (recipe.source.unlockCondition) {
      const levelMatch = recipe.source.unlockCondition.match(/Уровень кузнеца (\d+)/)
      if (levelMatch) {
        return playerLevel >= parseInt(levelMatch[1])
      }
      return false
    }
    
    // Рецепты без условия доступны
    return recipe.source.rarity === 'common'
  })
}

/**
 * Получить список частей рецепта
 */
export function getRecipeParts(recipeId: string): string[] {
  const recipe = recipeById.get(recipeId)
  return recipe?.parts.map(p => p.id) || []
}

/**
 * Получить допустимые категории материалов для части
 */
export function getAllowedMaterialCategories(recipeId: string, partId: string): string[] {
  const recipe = recipeById.get(recipeId)
  const part = recipe?.parts.find(p => p.id === partId)
  return part?.materialTypes || []
}

// Экспорт
export { swordRecipes } from './swords'
export { daggerRecipes, axeRecipes } from './melee'

/**
 * Типы для системы крафта
 */

import type { ResourceKey, CraftingCost } from './resources'

// ================================
// КРАФТ
// ================================

/** Активный крафт */
export interface ActiveCraft {
  recipeId: string | null
  weaponName: string
  progress: number
  startTime: number | null
  endTime: number | null
  quality: number
}

/** Инвентарь оружия */
export interface WeaponInventory {
  weapons: CraftedWeapon[]
  maxSlots: number
}

/** Активная переработка */
export interface ActiveRefining {
  recipeId: string | null
  resourceName: string
  progress: number
  startTime: number | null
  endTime: number | null
  amount: number
}

// ================================
// РЕЦЕПТЫ
// ================================

/** Разблокированные рецепты */
export interface UnlockedRecipes {
  weaponRecipes: string[]
  refiningRecipes: string[]
}

/** Источник получения рецепта */
export interface RecipeSource {
  recipeId: string
  source: 'purchase' | 'order' | 'expedition' | 'level'
  obtainedAt: number
}

// ================================
// ОРУЖИЕ
// ================================

/** Тип оружия */
export type WeaponType = 'sword' | 'dagger' | 'axe' | 'mace' | 'spear' | 'hammer' | 'bow' | 'staff'

/** Тир оружия */
export type WeaponTier = 1 | 2 | 3 | 4 | 5 | 6

/** Материал оружия */
export type WeaponMaterial = 'iron' | 'bronze' | 'steel' | 'silver' | 'gold' | 'mithril'

/** Градация качества */
export type QualityGrade = 'poor' | 'common' | 'good' | 'excellent' | 'masterpiece' | 'legendary'

/** Созданное оружие */
export interface CraftedWeapon {
  id: string
  recipeId: string
  name: string
  type: WeaponType
  tier: WeaponTier
  material: WeaponMaterial
  quality: number
  qualityGrade: QualityGrade
  attack: number
  durability: number
  maxDurability: number
  sellPrice: number
  createdAt: number
  warSoul: number
  adventureCount: number
  epicMultiplier: number
  materials: CraftingCost
  enchantments?: WeaponEnchantment[]
}

/** Зачарование на оружии */
export interface WeaponEnchantment {
  id: string
  enchantmentId: string
  appliedAt: number
}

// ================================
// ГРАДАЦИИ КАЧЕСТВА
// ================================

export const QUALITY_GRADES: { min: number; max: number; grade: QualityGrade; multiplier: number; color: string }[] = [
  { min: 0, max: 25, grade: 'poor', multiplier: 0.6, color: 'text-red-400' },
  { min: 26, max: 50, grade: 'common', multiplier: 1.0, color: 'text-gray-400' },
  { min: 51, max: 70, grade: 'good', multiplier: 1.3, color: 'text-green-400' },
  { min: 71, max: 85, grade: 'excellent', multiplier: 1.6, color: 'text-blue-400' },
  { min: 86, max: 95, grade: 'masterpiece', multiplier: 2.0, color: 'text-purple-400' },
  { min: 96, max: 100, grade: 'legendary', multiplier: 3.0, color: 'text-amber-400' },
]

/** Получить градацию качества */
export function getQualityGrade(quality: number): QualityGrade {
  const grade = QUALITY_GRADES.find(g => quality >= g.min && quality <= g.max)
  return grade?.grade ?? 'common'
}

/** Получить множитель качества */
export function getQualityMultiplier(quality: number): number {
  const grade = QUALITY_GRADES.find(g => quality >= g.min && quality <= g.max)
  return grade?.multiplier ?? 1.0
}

/** Получить цвет качества */
export function getQualityColor(quality: number): string {
  const grade = QUALITY_GRADES.find(g => quality >= g.min && quality <= g.max)
  return grade?.color ?? 'text-gray-400'
}

// ================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
// ================================

export const initialCraft: ActiveCraft = {
  recipeId: null,
  weaponName: 'Нет активного крафта',
  progress: 0,
  startTime: null,
  endTime: null,
  quality: 0,
}

export const initialWeaponInventory: WeaponInventory = {
  weapons: [],
  maxSlots: 20,
}

export const initialRefining: ActiveRefining = {
  recipeId: null,
  resourceName: 'Нет активной переработки',
  progress: 0,
  startTime: null,
  endTime: null,
  amount: 0,
}

export const initialUnlockedRecipes: UnlockedRecipes = {
  weaponRecipes: ['iron_sword', 'iron_dagger', 'iron_axe', 'iron_mace', 'iron_spear', 'iron_hammer'],
  refiningRecipes: ['iron_ingot', 'copper_ingot', 'tin_ingot', 'wood_planks', 'stone_blocks'],
}

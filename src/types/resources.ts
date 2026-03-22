/**
 * Типы ресурсов игры
 */

// ================================
// РЕСУРСЫ
// ================================

/** Все ресурсы в игре */
export interface Resources {
  gold: number
  soulEssence: number
  // Сырьё
  wood: number
  stone: number
  iron: number
  coal: number
  copper: number
  tin: number
  silver: number
  goldOre: number
  mithril: number
  // Переработанные
  ironIngot: number
  copperIngot: number
  tinIngot: number
  bronzeIngot: number
  steelIngot: number
  silverIngot: number
  goldIngot: number
  mithrilIngot: number
  planks: number
  stoneBlocks: number
}

/** Ключи ресурсов для типизации */
export type ResourceKey = keyof Resources

/** Сырьевые ресурсы (добыча) */
export type RawResourceKey = 
  | 'wood' | 'stone' | 'iron' | 'coal' 
  | 'copper' | 'tin' | 'silver' | 'goldOre' | 'mithril'

/** Переработанные ресурсы (крафт) */
export type RefinedResourceKey =
  | 'ironIngot' | 'copperIngot' | 'tinIngot' | 'bronzeIngot'
  | 'steelIngot' | 'silverIngot' | 'goldIngot' | 'mithrilIngot'
  | 'planks' | 'stoneBlocks'

/** Стоимость (словарь ресурсов) */
export type CraftingCost = Partial<Record<ResourceKey, number>>

// ================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
// ================================

export const initialResources: Resources = {
  gold: 200,
  soulEssence: 0,
  // Сырьё
  wood: 50,
  stone: 30,
  iron: 30,
  coal: 25,
  copper: 0,
  tin: 0,
  silver: 0,
  goldOre: 0,
  mithril: 0,
  // Переработанные
  ironIngot: 10,
  copperIngot: 0,
  tinIngot: 0,
  bronzeIngot: 0,
  steelIngot: 0,
  silverIngot: 0,
  goldIngot: 0,
  mithrilIngot: 0,
  planks: 15,
  stoneBlocks: 5,
}

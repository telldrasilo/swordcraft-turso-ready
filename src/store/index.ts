/**
 * Store Entry Point
 * Модульная архитектура store (slices + utils + composed)
 * 
 * @see docs/REFACTORING_PLAN.md - план рефакторинга
 */

// Основные экспорты
export {
  useGameStore,
  // Типы
  type Resources,
  type ResourceKey,
  type CraftingCost,
  type Player,
  type GameStatistics,
  type Worker,
  type ProductionBuilding,
  type CraftedWeapon,
  type ActiveCraft,
  type ActiveRefining,
  type WeaponInventory,
  type UnlockedRecipes,
  type RecipeSource,
  type WeaponType,
  type WeaponTier,
  type WeaponMaterial,
  type QualityGrade,
  type GameScreen,
  // Начальные значения
  initialPlayer,
  initialStatistics,
  initialResources,
  initialBuildings,
  initialActiveCraft,
  initialActiveRefining,
  initialWeaponInventory,
  initialUnlockedRecipes,
  // Данные
  workerClassData,
} from './game-store-composed'

// Типы из slices
export type { NPCOrder, OrderStatus, OrderBonusItem } from './slices/orders-slice'
export type { TutorialState } from './slices/tutorial-slice'
export type { WorkerStats, WorkerClass } from './slices/workers-slice'

// Hooks (утилиты)
export { useFormattedResources, useWorkerHireCost } from './game-store-composed'

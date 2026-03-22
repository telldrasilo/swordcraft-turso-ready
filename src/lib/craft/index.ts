/**
 * Система крафта v2
 * Экспорт всех модулей
 */

// Генератор процесса
export { 
  generateCraftStages, 
  createCraftPlan, 
  createActiveCraft 
} from './process-generator'

// Калькулятор характеристик
export { 
  calculateWeapon,
  getQualityInfo,
} from './calculator'
export type { WeaponCalculationResult } from './calculator'

// Генератор имён
export {
  generateWeaponName,
  getSuffixLevel,
  getSuffixDescription,
} from './name-generator'
export type { WeaponNameResult } from './name-generator'

// Типы
export type {
  Material,
  CraftStageInstance,
  Technique,
  WeaponRecipe,
  CraftPlan,
  ActiveCraftV2,
  WeaponStats,
  QualityGrade,
  MaterialAssignment,
} from '@/types/craft-v2'

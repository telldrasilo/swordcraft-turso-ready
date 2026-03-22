/**
 * Библиотека этапов крафта
 * Экспорт всех категорий этапов
 */

import type { StageTypeDefinition } from '@/types/craft-v2'

import { preparationStages } from './preparation'
import { processingStages } from './processing'
import { formingStages } from './forming'
import { assemblyStages } from './assembly'
import { finishingStages } from './finishing'

// Все этапы в одном массиве
export const allStages: StageTypeDefinition[] = [
  ...preparationStages,
  ...processingStages,
  ...formingStages,
  ...assemblyStages,
  ...finishingStages,
]

// Карта этапов по ID для быстрого доступа
export const stageById: Map<string, StageTypeDefinition> = new Map(
  allStages.map(stage => [stage.id, stage])
)

// Группировка по категориям
export const stagesByCategory = {
  preparation: preparationStages,
  processing: processingStages,
  forming: formingStages,
  assembly: assemblyStages,
  finishing: finishingStages,
}

/**
 * Получить этап по ID
 */
export function getStageById(id: string): StageTypeDefinition | undefined {
  return stageById.get(id)
}

/**
 * Получить этапы по категории
 */
export function getStagesByCategory(category: string): StageTypeDefinition[] {
  return stagesByCategory[category as keyof typeof stagesByCategory] || []
}

/**
 * Получить все базовые этапы (без особых требований)
 */
export function getBasicStages(): StageTypeDefinition[] {
  return allStages.filter(stage => 
    !stage.environmentRequired && 
    !stage.requirements
  )
}

/**
 * Получить этапы с требованиями к окружению
 */
export function getEnvironmentStages(): StageTypeDefinition[] {
  return allStages.filter(stage => stage.environmentRequired)
}

/**
 * Получить этапы с требованиями к ингредиентам
 */
export function getIngredientStages(): StageTypeDefinition[] {
  return allStages.filter(stage => stage.requirements)
}

// Экспорт отдельных категорий
export { preparationStages } from './preparation'
export { processingStages } from './processing'
export { formingStages } from './forming'
export { assemblyStages } from './assembly'
export { finishingStages } from './finishing'

/**
 * Генератор процесса крафта
 * Создаёт последовательность этапов из рецепта с учётом материалов и техник
 */

import type { 
  WeaponRecipe, 
  Material, 
  Technique, 
  CraftStageInstance, 
  MaterialAssignment,
  CraftPlan,
  ActiveCraftV2,
  GameConfig,
  StageTypeDefinition
} from '@/types/craft-v2'
import { DEFAULT_GAME_CONFIG } from '@/types/craft-v2'
import { getStageById, allStages } from '@/data/stages'
import { getMaterialById } from '@/data/materials'

/**
 * Контекст для генерации процесса
 */
interface GenerationContext {
  recipe: WeaponRecipe
  materials: MaterialAssignment
  techniques: Technique[]
  blacksmithLevel: number
  forgeLevel: number
  config: GameConfig
}

/**
 * Сгенерировать экземпляры этапов из плана крафта
 */
export function generateCraftStages(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[] = [],
  blacksmithLevel: number = 1,
  forgeLevel: number = 1,
  config: GameConfig = DEFAULT_GAME_CONFIG
): CraftStageInstance[] {
  const context: GenerationContext = {
    recipe,
    materials,
    techniques,
    blacksmithLevel,
    forgeLevel,
    config,
  }
  
  // 1. Базовая последовательность этапов из рецепта
  let stageConfigs = [...recipe.stages]
  
  // 2. Применяем модификации от материалов
  stageConfigs = applyMaterialMods(stageConfigs, materials, context)
  
  // 3. Применяем модификации от техник
  stageConfigs = applyTechniqueMods(stageConfigs, techniques, context)
  
  // 4. Создаём экземпляры этапов
  const instances: CraftStageInstance[] = stageConfigs.map((config, index) => {
    const stageType = getStageById(config.stageType)
    if (!stageType) {
      console.warn(`Stage type not found: ${config.stageType}`)
      return null
    }
    
    return createStageInstance(
      stageType,
      config,
      index,
      context
    )
  }).filter(Boolean) as CraftStageInstance[]
  
  return instances
}

/**
 * Применить модификации от материалов
 */
function applyMaterialMods(
  stages: WeaponRecipe['stages'],
  materials: MaterialAssignment,
  context: GenerationContext
): WeaponRecipe['stages'] {
  const result = [...stages]
  
  // Для каждого материала проверяем processingProfile
  for (const [partId, { materialId }] of Object.entries(materials)) {
    const material = getMaterialById(materialId)
    if (!material?.processingProfile?.stages) continue
    
    const { replacements, forbidden } = material.processingProfile.stages
    
    // Удаляем запрещённые этапы
    if (forbidden) {
      for (let i = result.length - 1; i >= 0; i--) {
        if (forbidden.includes(result[i].stageType)) {
          result.splice(i, 1)
        }
      }
    }
    
    // Заменяем этапы
    if (replacements) {
      for (let i = 0; i < result.length; i++) {
        const replacement = replacements[result[i].stageType]
        if (replacement) {
          result[i] = { ...result[i], stageType: replacement }
        }
      }
    }
  }
  
  return result
}

/**
 * Применить модификации от техник
 */
function applyTechniqueMods(
  stages: WeaponRecipe['stages'],
  techniques: Technique[],
  context: GenerationContext
): WeaponRecipe['stages'] {
  const result = [...stages]
  
  for (const technique of techniques) {
    if (!technique.processMods) continue
    
    const { replaceStage, addStage } = technique.processMods
    
    // Замена этапов
    if (replaceStage) {
      for (let i = 0; i < result.length; i++) {
        const replacement = replaceStage[result[i].stageType]
        if (replacement) {
          result[i] = { ...result[i], stageType: replacement }
        }
      }
    }
    
    // Добавление этапов
    if (addStage) {
      const insertIndex = addStage.after
        ? result.findIndex(s => s.stageType === addStage.after) + 1
        : addStage.before
        ? result.findIndex(s => s.stageType === addStage.before)
        : result.length
      
      if (insertIndex >= 0) {
        result.splice(insertIndex, 0, { stageType: addStage.stage })
      }
    }
  }
  
  return result
}

/**
 * Создать экземпляр этапа
 */
function createStageInstance(
  stageType: StageTypeDefinition,
  config: { stageType: string; material?: string; target?: string },
  index: number,
  context: GenerationContext
): CraftStageInstance {
  // Получаем материал для расчёта модификаторов
  const material = config.material && context.materials[config.material]
    ? getMaterialById(context.materials[config.material].materialId)
    : null
  
  // Рассчитываем длительность
  const baseDuration = stageType.baseDuration
  const calculatedDuration = calculateStageDuration(
    baseDuration,
    stageType,
    material ?? null,
    context
  )
  
  // Выбираем сообщения
  const startMessage = selectMessage(stageType.messages.start)
  const completeMessage = selectMessage(stageType.messages.complete)
  
  return {
    id: `stage_${index}_${Date.now()}`,
    stageTypeId: stageType.id,
    name: stageType.name,
    category: stageType.category,
    materialId: config.material,
    target: config.target,
    baseDuration,
    calculatedDuration,
    status: 'pending',
    progress: 0,
    startMessage,
    completeMessage,
    requirements: stageType.requirements,
    environmentRequired: stageType.environmentRequired,
  }
}

/**
 * Рассчитать длительность этапа с модификаторами
 */
function calculateStageDuration(
  baseDuration: number,
  stageType: StageTypeDefinition,
  material: Material | null,
  context: GenerationContext
): number {
  let duration = baseDuration
  
  // Глобальный множитель
  duration *= context.config.craftSpeedMultiplier
  
  // Модификаторы этапа
  if (stageType.durationModifiers) {
    // Навык кузнеца
    if (stageType.durationModifiers.skill) {
      const reduction = context.blacksmithLevel * 0.03  // -3% за уровень
      duration *= (1 - reduction)
    }
    
    // Уровень кузницы
    if (stageType.durationModifiers.tool) {
      const reduction = context.forgeLevel * 0.05  // -5% за уровень
      duration *= (1 - reduction)
    }
    
    // Материал (обрабатываемость)
    if (stageType.durationModifiers.material && material) {
      const workability = material.crafting.workability
      duration *= (100 / workability)  // Чем ниже workability, тем дольше
    }
  }
  
  // Минимум 5 секунд
  return Math.max(5, Math.round(duration))
}

/**
 * Выбрать случайное сообщение из списка
 */
function selectMessage(messages: string[]): string {
  if (!messages || messages.length === 0) return '...'
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Создать план крафта
 */
export function createCraftPlan(
  recipeId: string,
  materials: MaterialAssignment,
  techniqueIds: string[] = [],
  blacksmithLevel: number = 1,
  forgeLevel: number = 1
): CraftPlan {
  // Загружаем рецепт
  const { getRecipeById } = require('@/data/recipes')
  const recipe = getRecipeById(recipeId)
  if (!recipe) {
    throw new Error(`Recipe not found: ${recipeId}`)
  }
  
  // Загружаем техники
  const { getTechniqueById } = require('@/data/techniques')
  const techniques: Technique[] = techniqueIds
    .map(id => getTechniqueById(id))
    .filter((t): t is Technique => t !== undefined)
  
  // Генерируем этапы
  const stages = generateCraftStages(
    recipe,
    materials,
    techniques,
    blacksmithLevel,
    forgeLevel
  )
  
  // Рассчитываем общее время
  const estimatedTime = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
  
  // Рассчитываем характеристики
  const estimatedStats = calculateWeaponStats(recipe, materials, techniques, blacksmithLevel)
  
  // Оценка качества
  const estimatedQuality = estimateQuality(blacksmithLevel, materials, techniques)
  
  return {
    recipeId,
    materials,
    techniques: techniqueIds,
    estimatedTime,
    estimatedStats,
    estimatedQuality,
  }
}

/**
 * Рассчитать характеристики оружия
 */
function calculateWeaponStats(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[],
  blacksmithLevel: number
): CraftPlan['estimatedStats'] {
  const base = recipe.baseStats
  
  // Начальные значения из базы
  let attack = base.attackBase
  let durability = base.durabilityBase
  let weight = base.weightBase
  let soulCapacity = base.soulCapacityBase
  let balance = 75 // базовый баланс
  let repairPotential = 1.0
  let enchantSlots = 0
  let enchantPower = 1.0
  
  // Применяем бонусы от материалов
  for (const [partId, { materialId }] of Object.entries(materials)) {
    const material = getMaterialById(materialId)
    if (!material) continue
    
    // Бонусы к атаке
    attack += attack * (material.weaponEffects.attackBonus / 100)
    
    // Бонусы к прочности
    durability += durability * (material.weaponEffects.durabilityBonus / 100)
    
    // Вместимость души
    soulCapacity += material.weaponEffects.soulCapacity
    
    // Вес
    weight += material.properties.weight * 0.1
    
    // Дополнительные свойства
    repairPotential = Math.max(repairPotential, material.weaponEffects.repairPotential)
    enchantSlots += material.weaponEffects.enchantSlots
    enchantPower *= material.weaponEffects.enchantPower
  }
  
  // Применяем бонусы от техник
  for (const technique of techniques) {
    if (technique.effects.qualityBonus) {
      attack *= 1 + (technique.effects.qualityBonus / 100)
    }
  }
  
  return {
    attack: Math.round(attack),
    durability: Math.round(durability),
    maxDurability: Math.round(durability),
    weight: Math.round(weight * 10) / 10,
    balance: Math.round(balance),
    soulCapacity: Math.round(soulCapacity),
    repairPotential,
    enchantSlots,
    enchantPower,
  }
}

/**
 * Оценить качество оружия
 */
function estimateQuality(
  blacksmithLevel: number,
  materials: MaterialAssignment,
  techniques: Technique[]
): CraftPlan['estimatedQuality'] {
  // Базовое качество от уровня кузнеца
  let quality = 30 + blacksmithLevel * 2
  
  // Бонус от техник
  for (const technique of techniques) {
    if (technique.effects.qualityBonus) {
      quality += technique.effects.qualityBonus * 0.5
    }
  }
  
  // Ограничение
  quality = Math.min(100, Math.max(0, quality))
  
  // Определяем градацию
  if (quality >= 96) return 'legendary'
  if (quality >= 86) return 'masterpiece'
  if (quality >= 71) return 'excellent'
  if (quality >= 51) return 'good'
  if (quality >= 31) return 'common'
  return 'poor'
}

/**
 * Создать активный процесс крафта
 */
export function createActiveCraft(
  plan: CraftPlan,
  recipe: WeaponRecipe
): ActiveCraftV2 {
  const stages = generateCraftStages(
    recipe,
    plan.materials,
    [], // техники уже применены в плане
    1,  // уровень кузнеца
    1   // уровень кузницы
  )
  
  const totalDuration = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
  
  return {
    id: `craft_${Date.now()}`,
    plan,
    stages,
    currentStageIndex: 0,
    startTime: Date.now(),
    totalDuration,
    elapsedTime: 0,
    status: 'planning',
    log: [],
  }
}

export default {
  generateCraftStages,
  createCraftPlan,
  createActiveCraft,
}

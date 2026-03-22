/**
 * Craft V2 Slice
 * Состояние новой системы крафта
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md
 */

import type { 
  ActiveCraftV2, 
  CraftPlan, 
  CraftStageInstance, 
  CraftedWeaponV2,
  MaterialAssignment 
} from '@/types/craft-v2'

// ================================
// ТИПЫ
// ================================

export interface CraftV2State {
  /** Активный процесс крафта (если идёт) */
  activeCraft: ActiveCraftV2 | null
  
  /** Готовое оружие после завершения крафта */
  completedWeapon: CraftedWeaponV2 | null
  
  /** История созданного оружия */
  craftedWeapons: CraftedWeaponV2[]
  
  /** Разблокированные рецепты */
  unlockedRecipes: string[]
  
  /** Разблокированные техники */
  unlockedTechniques: string[]
  
  /** Доступные материалы (ID) */
  availableMaterials: string[]
  
  /** Статистика крафта */
  stats: {
    totalCrafts: number
    successfulCrafts: number
    masterpieces: number
    legendaryItems: number
  }
}

export interface CraftV2Actions {
  // Планирование
  startCraft: (plan: CraftPlan) => void
  cancelCraft: () => void
  
  // Выполнение
  updateCraftProgress: (elapsedMs: number) => void
  completeStage: (stageId: string) => void
  finishCraft: () => void
  
  // Результаты
  collectWeapon: () => CraftedWeaponV2 | null
  
  // Разблокировка
  unlockRecipe: (recipeId: string) => void
  unlockTechnique: (techniqueId: string) => void
  addAvailableMaterial: (materialId: string) => void
  
  // История
  clearHistory: () => void
}

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialCraftV2State: CraftV2State = {
  activeCraft: null,
  completedWeapon: null,
  craftedWeapons: [],
  unlockedRecipes: ['basic_sword', 'basic_dagger', 'basic_axe'],
  unlockedTechniques: ['basic_forging'],
  availableMaterials: ['basic_metal', 'basic_wood', 'basic_leather', 'basic_stone'],
  stats: {
    totalCrafts: 0,
    successfulCrafts: 0,
    masterpieces: 0,
    legendaryItems: 0,
  },
}

// ================================
// HELPERS
// ================================

/**
 * Создать активный процесс крафта из плана
 */
function createActiveCraftFromPlan(plan: CraftPlan, stages: CraftStageInstance[]): ActiveCraftV2 {
  const totalDuration = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
  
  return {
    id: `craft_${Date.now()}`,
    plan,
    stages,
    currentStageIndex: 0,
    startTime: Date.now(),
    totalDuration,
    elapsedTime: 0,
    status: 'running',
    log: [],
  }
}

/**
 * Рассчитать прогресс этапа
 */
function calculateStageProgress(
  stage: CraftStageInstance, 
  elapsedInStage: number
): number {
  return Math.min(100, (elapsedInStage / stage.calculatedDuration) * 100)
}

// ================================
// SLICE
// ================================

export const craftV2Slice = {
  name: 'craftV2',
  
  initialState: initialCraftV2State,
  
  // Геттеры
  getActiveCraft: (state: CraftV2State) => state.activeCraft,
  getCompletedWeapon: (state: CraftV2State) => state.completedWeapon,
  getCraftedWeapons: (state: CraftV2State) => state.craftedWeapons,
  getUnlockedRecipes: (state: CraftV2State) => state.unlockedRecipes,
  getUnlockedTechniques: (state: CraftV2State) => state.unlockedTechniques,
  getAvailableMaterials: (state: CraftV2State) => state.availableMaterials,
  getCraftStats: (state: CraftV2State) => state.stats,
  
  // Проверки
  isCrafting: (state: CraftV2State) => state.activeCraft !== null,
  canStartCraft: (state: CraftV2State) => state.activeCraft === null,
  
  // Actions
  actions: {
    startCraft: (state: CraftV2State, plan: CraftPlan, stages: CraftStageInstance[]) => {
      if (state.activeCraft) {
        console.warn('Craft already in progress')
        return state
      }
      
      const activeCraft = createActiveCraftFromPlan(plan, stages)
      
      // Лог старта
      activeCraft.log.push({
        timestamp: Date.now(),
        stageId: 'start',
        stageName: 'Начало крафта',
        message: `Начинаю создание ${plan.estimatedStats.attack} ATK оружия`,
        type: 'start',
      })
      
      // Устанавливаем первый этап
      if (activeCraft.stages.length > 0) {
        activeCraft.stages[0].status = 'in_progress'
        activeCraft.stages[0].startTime = Date.now()
      }
      
      return {
        ...state,
        activeCraft,
        completedWeapon: null,
      }
    },
    
    updateCraftProgress: (state: CraftV2State, elapsedMs: number) => {
      if (!state.activeCraft) return state
      
      const craft = { ...state.activeCraft }
      craft.elapsedTime = elapsedMs
      
      // Находим текущий этап
      let accumulatedTime = 0
      for (let i = 0; i < craft.stages.length; i++) {
        const stage = craft.stages[i]
        
        if (accumulatedTime + stage.calculatedDuration * 1000 > elapsedMs) {
          // Это текущий этап
          craft.currentStageIndex = i
          
          // Обновляем прогресс этапа
          const elapsedInStage = elapsedMs - accumulatedTime
          craft.stages = [...craft.stages]
          craft.stages[i] = {
            ...stage,
            progress: calculateStageProgress(stage, elapsedInStage / 1000),
          }
          break
        }
        
        // Отмечаем завершённые этапы
        if (stage.status !== 'completed') {
          craft.stages = [...craft.stages]
          craft.stages[i] = {
            ...stage,
            status: 'completed',
            progress: 100,
          }
        }
        
        accumulatedTime += stage.calculatedDuration * 1000
      }
      
      return {
        ...state,
        activeCraft: craft,
      }
    },
    
    completeStage: (state: CraftV2State, stageId: string) => {
      if (!state.activeCraft) return state
      
      const craft = { ...state.activeCraft }
      const stageIndex = craft.stages.findIndex(s => s.id === stageId)
      
      if (stageIndex === -1) return state
      
      // Завершаем текущий этап
      craft.stages = [...craft.stages]
      craft.stages[stageIndex] = {
        ...craft.stages[stageIndex],
        status: 'completed',
        progress: 100,
        endTime: Date.now(),
      }
      
      // Лог завершения этапа
      const stage = craft.stages[stageIndex]
      craft.log.push({
        timestamp: Date.now(),
        stageId: stage.stageTypeId,
        stageName: stage.name,
        message: stage.completeMessage || `${stage.name} завершён`,
        type: 'complete',
      })
      
      // Начинаем следующий этап
      if (stageIndex + 1 < craft.stages.length) {
        craft.currentStageIndex = stageIndex + 1
        craft.stages[stageIndex + 1] = {
          ...craft.stages[stageIndex + 1],
          status: 'in_progress',
          startTime: Date.now(),
        }
        
        const nextStage = craft.stages[stageIndex + 1]
        craft.log.push({
          timestamp: Date.now(),
          stageId: nextStage.stageTypeId,
          stageName: nextStage.name,
          message: nextStage.startMessage || `Начинаю: ${nextStage.name}`,
          type: 'start',
        })
      }
      
      return {
        ...state,
        activeCraft: craft,
      }
    },
    
    finishCraft: (state: CraftV2State, weapon: CraftedWeaponV2) => {
      if (!state.activeCraft) return state
      
      // Обновляем статистику
      const stats = { ...state.stats }
      stats.totalCrafts++
      stats.successfulCrafts++
      
      if (weapon.qualityGrade === 'masterpiece') {
        stats.masterpieces++
      }
      if (weapon.qualityGrade === 'legendary') {
        stats.legendaryItems++
      }
      
      return {
        ...state,
        activeCraft: null,
        completedWeapon: weapon,
        craftedWeapons: [...state.craftedWeapons, weapon],
        stats,
      }
    },
    
    cancelCraft: (state: CraftV2State) => {
      if (!state.activeCraft) return state
      
      // Частичный возврат материалов (50%)
      // Это будет обработано на уровне game-store
      
      return {
        ...state,
        activeCraft: null,
      }
    },
    
    collectWeapon: (state: CraftV2State) => {
      const weapon = state.completedWeapon
      if (!weapon) return state
      
      return {
        ...state,
        completedWeapon: null,
      }
    },
    
    unlockRecipe: (state: CraftV2State, recipeId: string) => {
      if (state.unlockedRecipes.includes(recipeId)) return state
      
      return {
        ...state,
        unlockedRecipes: [...state.unlockedRecipes, recipeId],
      }
    },
    
    unlockTechnique: (state: CraftV2State, techniqueId: string) => {
      if (state.unlockedTechniques.includes(techniqueId)) return state
      
      return {
        ...state,
        unlockedTechniques: [...state.unlockedTechniques, techniqueId],
      }
    },
    
    addAvailableMaterial: (state: CraftV2State, materialId: string) => {
      if (state.availableMaterials.includes(materialId)) return state
      
      return {
        ...state,
        availableMaterials: [...state.availableMaterials, materialId],
      }
    },
    
    clearHistory: (state: CraftV2State) => {
      return {
        ...state,
        craftedWeapons: [],
      }
    },
  },
}

// ================================
// ЭКСПОРТ ТИПОВ
// ================================

export type CraftV2Slice = typeof craftV2Slice

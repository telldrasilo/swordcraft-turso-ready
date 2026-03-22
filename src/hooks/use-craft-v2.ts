/**
 * Хук для системы крафта v2
 * Управление состоянием крафта с этапами
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { 
  ActiveCraftV2, 
  CraftPlan, 
  CraftStageInstance, 
  CraftedWeaponV2,
  MaterialAssignment 
} from '@/types/craft-v2'
import { generateCraftStages, createCraftPlan } from '@/lib/craft/process-generator'
import { calculateWeapon, type WeaponCalculationResult } from '@/lib/craft/calculator'
import { generateWeaponName, type WeaponNameResult } from '@/lib/craft/name-generator'
import { getRecipeById } from '@/data/recipes'
import { getMaterialById } from '@/data/materials'
import { getTechniqueById } from '@/data/techniques'

// ================================
// ТИПЫ
// ================================

export interface CraftV2State {
  /** Текущий план крафта */
  plan: CraftPlan | null
  
  /** Активный процесс */
  activeCraft: ActiveCraftV2 | null
  
  /** Готовое оружие */
  completedWeapon: CraftedWeaponV2 | null
  
  /** Предварительный расчёт */
  preview: WeaponCalculationResult | null
  
  /** Имя оружия */
  weaponName: WeaponNameResult | null
  
  /** Стадия UI */
  stage: 'planning' | 'crafting' | 'completed'
}

export interface UseCraftV2Return {
  // State
  state: CraftV2State
  
  // Planning actions
  setRecipe: (recipeId: string) => void
  setMaterial: (partId: string, materialId: string, quantity: number) => void
  setTechniques: (techniqueIds: string[]) => void
  calculatePreview: () => void
  
  // Craft actions
  startCraft: () => void
  cancelCraft: () => void
  
  // Result actions
  collectWeapon: () => CraftedWeaponV2 | null
  reset: () => void
}

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

const initialState: CraftV2State = {
  plan: null,
  activeCraft: null,
  completedWeapon: null,
  preview: null,
  weaponName: null,
  stage: 'planning',
}

// ================================
// ХУК
// ================================

export function useCraftV2(
  blacksmithLevel: number = 1,
  forgeLevel: number = 1
): UseCraftV2Return {
  const [state, setState] = useState<CraftV2State>(initialState)
  
  // Refs для отложенных обновлений
  const materialsRef = useRef<MaterialAssignment>({})
  const techniquesRef = useRef<string[]>([])
  const recipeIdRef = useRef<string | null>(null)
  
  // ================================
  // PLANNING ACTIONS
  // ================================
  
  const setRecipe = useCallback((recipeId: string) => {
    recipeIdRef.current = recipeId
    materialsRef.current = {}
    techniquesRef.current = []
    
    const recipe = getRecipeById(recipeId)
    if (!recipe) {
      setState(prev => ({ ...prev, plan: null, preview: null, weaponName: null }))
      return
    }
    
    // Инициализируем пустой план
    const emptyPlan: CraftPlan = {
      recipeId,
      materials: {},
      techniques: [],
      estimatedTime: 0,
      estimatedStats: {
        attack: 0,
        durability: 0,
        maxDurability: 0,
        weight: 0,
        balance: 0,
        soulCapacity: 0,
        repairPotential: 1,
        enchantSlots: 0,
        enchantPower: 1,
      },
      estimatedQuality: 'common',
    }
    
    setState(prev => ({
      ...prev,
      plan: emptyPlan,
      preview: null,
      weaponName: null,
      stage: 'planning',
    }))
  }, [])
  
  const setMaterial = useCallback((partId: string, materialId: string, quantity: number) => {
    materialsRef.current = {
      ...materialsRef.current,
      [partId]: { materialId, quantity },
    }
    
    // Обновляем план если он существует
    setState(prev => {
      if (!prev.plan) return prev
      
      const updatedPlan = {
        ...prev.plan,
        materials: materialsRef.current,
      }
      
      return { ...prev, plan: updatedPlan }
    })
  }, [])
  
  const setTechniques = useCallback((techniqueIds: string[]) => {
    techniquesRef.current = techniqueIds
    
    setState(prev => {
      if (!prev.plan) return prev
      
      const updatedPlan = {
        ...prev.plan,
        techniques: techniqueIds,
      }
      
      return { ...prev, plan: updatedPlan }
    })
  }, [])
  
  const calculatePreview = useCallback(() => {
    const recipeId = recipeIdRef.current
    const materials = materialsRef.current
    const techniqueIds = techniquesRef.current
    
    if (!recipeId || Object.keys(materials).length === 0) {
      setState(prev => ({ ...prev, preview: null, weaponName: null }))
      return
    }
    
    const recipe = getRecipeById(recipeId)
    if (!recipe) return
    
    // Получаем техники
    const techniques = techniqueIds
      .map(id => getTechniqueById(id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
    
    // Получаем материал боевой части для имени
    const combatPart = recipe.combatPart
    const combatMaterialId = materials[combatPart]?.materialId
    const combatMaterial = combatMaterialId ? getMaterialById(combatMaterialId) : null
    
    // Рассчитываем характеристики
    const preview = calculateWeapon(recipe, materials, techniques, blacksmithLevel)
    
    // Генерируем имя
    const weaponName = generateWeaponName(recipe, combatMaterial || null)
    
    // Генерируем этапы для расчёта времени
    const stages = generateCraftStages(recipe, materials, techniques, blacksmithLevel, forgeLevel)
    const estimatedTime = stages.reduce((sum, s) => sum + s.calculatedDuration, 0)
    
    setState(prev => ({
      ...prev,
      preview,
      weaponName,
      plan: prev.plan ? {
        ...prev.plan,
        materials,
        techniques: techniqueIds,
        estimatedTime,
        estimatedStats: preview.stats,
        estimatedQuality: preview.qualityGrade,
      } : null,
    }))
  }, [blacksmithLevel, forgeLevel])
  
  // ================================
  // CRAFT ACTIONS
  // ================================
  
  const startCraft = useCallback(() => {
    const recipeId = recipeIdRef.current
    const materials = materialsRef.current
    const techniqueIds = techniquesRef.current
    
    if (!recipeId || Object.keys(materials).length === 0) {
      console.warn('Cannot start craft: missing recipe or materials')
      return
    }
    
    const recipe = getRecipeById(recipeId)
    if (!recipe) return
    
    const techniques = techniqueIds
      .map(id => getTechniqueById(id))
      .filter((t): t is NonNullable<typeof t> => t !== undefined)
    
    // Генерируем этапы
    const stages = generateCraftStages(recipe, materials, techniques, blacksmithLevel, forgeLevel)
    
    // Создаём план
    const plan = createCraftPlan(recipeId, materials, techniqueIds, blacksmithLevel, forgeLevel)
    
    // Создаём активный крафт
    const activeCraft: ActiveCraftV2 = {
      id: `craft_${Date.now()}`,
      plan,
      stages,
      currentStageIndex: 0,
      startTime: Date.now(),
      totalDuration: stages.reduce((sum, s) => sum + s.calculatedDuration, 0),
      elapsedTime: 0,
      status: 'running',
      log: [{
        timestamp: Date.now(),
        stageId: 'start',
        stageName: 'Начало крафта',
        message: `Начинаю создание ${recipe.name}`,
        type: 'start',
      }],
    }
    
    // Отмечаем первый этап
    if (stages.length > 0) {
      stages[0].status = 'in_progress'
      stages[0].startTime = Date.now()
    }
    
    setState(prev => ({
      ...prev,
      activeCraft,
      stage: 'crafting',
    }))
  }, [blacksmithLevel, forgeLevel])
  
  const cancelCraft = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeCraft: null,
      stage: 'planning',
    }))
  }, [])
  
  // ================================
  // RESULT ACTIONS
  // ================================
  
  const collectWeapon = useCallback(() => {
    const { completedWeapon, preview, weaponName, plan } = state
    
    if (!completedWeapon || !preview || !weaponName || !plan) return null
    
    // Очищаем состояние
    setState(prev => ({
      ...prev,
      completedWeapon: null,
      stage: 'planning',
    }))
    
    return completedWeapon
  }, [state])
  
  const reset = useCallback(() => {
    materialsRef.current = {}
    techniquesRef.current = []
    recipeIdRef.current = null
    setState(initialState)
  }, [])
  
  // ================================
  // GAME LOOP (для прогресса крафта)
  // ================================
  
  useEffect(() => {
    if (state.stage !== 'crafting' || !state.activeCraft) return
    
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev.activeCraft || prev.stage !== 'crafting') return prev
        
        const craft = { ...prev.activeCraft }
        const elapsed = Date.now() - craft.startTime
        craft.elapsedTime = elapsed
        
        // Находим текущий этап
        let accumulatedTime = 0
        let currentStageFound = false
        
        for (let i = 0; i < craft.stages.length; i++) {
          const stage = craft.stages[i]
          const stageDuration = stage.calculatedDuration * 1000
          
          if (accumulatedTime + stageDuration > elapsed) {
            // Это текущий этап
            craft.currentStageIndex = i
            
            // Обновляем прогресс этапа
            const elapsedInStage = elapsed - accumulatedTime
            craft.stages = [...craft.stages]
            craft.stages[i] = {
              ...stage,
              progress: Math.min(100, (elapsedInStage / stageDuration) * 100),
            }
            currentStageFound = true
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
          
          accumulatedTime += stageDuration
        }
        
        // Проверяем завершение
        if (!currentStageFound && craft.stages.length > 0) {
          // Все этапы завершены
          craft.status = 'completed'
          
          // Создаём готовое оружие
          if (prev.preview && prev.weaponName && prev.plan) {
            const recipe = getRecipeById(prev.plan.recipeId)
            
            const completedWeapon: CraftedWeaponV2 = {
              id: `weapon_${Date.now()}`,
              recipeId: prev.plan.recipeId,
              prefix: prev.weaponName.prefix,
              baseName: prev.weaponName.baseName,
              suffix: prev.weaponName.suffix,
              fullName: prev.weaponName.fullName,
              type: recipe?.type || 'sword',
              tier: recipe?.baseStats ? Math.ceil(prev.preview.stats.attack / 20) : 1,
              materials: prev.preview.materials,
              stats: prev.preview.stats,
              quality: prev.preview.quality,
              qualityGrade: prev.preview.qualityGrade,
              warSoul: 0,
              maxWarSoul: prev.preview.stats.soulCapacity,
              createdAt: Date.now(),
              adventureCount: 0,
              sellPrice: prev.preview.sellPrice,
            }
            
            return {
              ...prev,
              activeCraft: null,
              completedWeapon,
              stage: 'completed',
            }
          }
        }
        
        return { ...prev, activeCraft: craft }
      })
    }, 100) // Обновляем каждые 100мс
    
    return () => clearInterval(interval)
  }, [state.stage, state.activeCraft])
  
  // ================================
  // RETURN
  // ================================
  
  return {
    state,
    setRecipe,
    setMaterial,
    setTechniques,
    calculatePreview,
    startCraft,
    cancelCraft,
    collectWeapon,
    reset,
  }
}

export default useCraftV2

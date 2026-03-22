/**
 * Composed Game Store v2
 * Тонкий слой сборки (~300 строк)
 * 
 * Архитектура:
 * - Slices: Инкапсуляция бизнес-логики по доменам
 * - Composed: Координация cross-slice операций
 * - Utils: Чистые функции для расчётов
 */

import { create, StateCreator } from 'zustand'
import { persist } from 'zustand/middleware'

// ================================
// SLICE IMPORTS
// ================================

import { createPlayerSlice } from './slices/player-slice'
import type { PlayerSlice, Player, GameStatistics } from './slices/player-slice'
import { initialPlayer, initialStatistics } from './slices/player-slice'

import { createResourcesSlice } from './slices/resources-slice'
import type { ResourcesSlice, Resources, ResourceKey, CraftingCost } from './slices/resources-slice'
import { initialResources } from './slices/resources-slice'

import { createWorkersSlice } from './slices/workers-slice'
import type { WorkersSlice, Worker, WorkerClass, ProductionBuilding } from './slices/workers-slice'
import { initialBuildings, workerClassData } from './slices/workers-slice'

import { createCraftSlice } from './slices/craft-slice'
import type { CraftSlice, CraftedWeapon, ActiveCraft, ActiveRefining, WeaponInventory, UnlockedRecipes, RecipeSource, WeaponType, WeaponTier, WeaponMaterial, QualityGrade } from './slices/craft-slice'
import { initialActiveCraft, initialActiveRefining, initialWeaponInventory, initialUnlockedRecipes } from './slices/craft-slice'

import type { CraftedWeaponV2 } from '@/types/craft-v2'

// ================================
// DATA IMPORTS
// ================================

import { WeaponRecipe } from '@/data/weapon-recipes'
import { RefiningRecipe, refiningRecipes } from '@/data/refining-recipes'
import {
  Enchantment,
  canAffordEnchantment,
  areEnchantmentsCompatible,
  MAX_ENCHANTMENTS_PER_WEAPON,
} from '@/data/enchantments'
import { expeditionTemplates, ExpeditionTemplate } from '@/data/expedition-templates'
import {
  RepairOption,
  RepairType,
  ExecuteRepairResult,
} from '@/data/repair-system'

// ================================
// UTILITY IMPORTS
// ================================

import { generateId } from '@/lib/store-utils/generators'
import { RESOURCE_SELL_PRICES, PLAYER_TITLES } from '@/lib/store-utils/constants'
import { getTitleByLevel, addExperience as addExperienceUtil } from '@/lib/store-utils/player-utils'
import {
  calculateHireCost,
  getFireRefund,
  calculateAverageQuality,
  WORKER_CLASS_DATA,
} from '@/lib/store-utils/worker-utils'
import {
  getQualityGrade as getQualityGradeUtil,
  calculateCraftQuality as calculateCraftQualityUtil,
  calculateAttack as calculateAttackUtil,
  calculateSellPrice as calculateSellPriceUtil,
  calculateCraftExperience,
} from '@/lib/store-utils/craft-utils'
import {
  calculateSacrificeValue as calculateSacrificeValueUtil,
} from '@/lib/store-utils/enchantment-utils'
import {
  findBestBlacksmith,
  getRepairOptionsForWeapon,
  calculateRepairCost,
  calculateMaxRepairPercent,
  executeRepair as executeRepairUtil,
  getMaterialDeductions,
  type WeaponForRepair,
} from '@/lib/store-utils/repair-utils'
import {
  calculateExpeditionOutcome,
  updateKnownAdventurersAfterMission,
  createRecoveryQuest,
  createHistoryEntry,
  updateGuildStats,
  calculateExpeditionPreview,
  type WeaponForExpedition,
} from '@/lib/store-utils/expedition-utils'

// ================================
// ADDITIONAL TYPE IMPORTS
// ================================

import {
  initialGuildState,
  GuildState,
  Adventurer,
  ActiveExpedition,
  RecoveryQuest,
  getGuildLevel,
  GUILD_LEVELS,
} from '@/types/guild'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { KnownAdventurer, MissionResultForStats } from '@/types/known-adventurer'
import { KNOWN_ADVENTURERS_CONFIG } from '@/types/known-adventurer'
import {
  updateKnownAdventurer,
  getKnownAdventurerInfo,
  getMetInfoText,
  getContractAvailabilityText,
} from '@/lib/known-adventurers-manager'
import {
  calculateExpeditionResult as calculateExpeditionResultV2,
  type ExpeditionCalculation,
} from '@/lib/expedition-calculator-v2'
import {
  generateAdventurerPool,
  isAdventurerExpired,
  ADVENTURER_LIFETIME,
  getAdventurerFullName,
} from '@/lib/adventurer-generator'
import { ExpeditionResult } from './slices/guild-slice'

// ================================
// ДОПОЛНИТЕЛЬНЫЕ SLICE IMPORTS
// ================================

import { createOrdersSlice } from './slices/orders-slice'
import type { OrdersSlice, NPCOrder } from './slices/orders-slice'
import { initialOrdersState } from './slices/orders-slice'

import { createTutorialSlice } from './slices/tutorial-slice'
import type { TutorialSlice, TutorialState, TutorialActions } from './slices/tutorial-slice'
import { initialTutorialState } from './slices/tutorial-slice'

// ================================
// ОСТАВШИЕСЯ ТИПЫ (не в slices)
// ================================

export type GameScreen = 'forge' | 'resources' | 'workers' | 'shop' | 'guild' | 'dungeons' | 'altar'

// ================================
// CROSS-SLICE ACTIONS INTERFACE
// ================================

/**
 * Cross-slice операции требуют координации между несколькими slices
 * Эти функции остаются в composed store
 */
interface CrossSliceActions {
  // Workers + Resources
  hireWorkerWithCost: (workerClass: WorkerClass) => boolean
  fireWorkerWithRefund: (workerId: string) => void
  upgradeBuildingWithCost: (buildingId: string) => boolean

  // Craft + Resources + Player
  startCraftWithResources: (recipe: WeaponRecipe) => boolean
  completeCraftWithExperience: () => CraftedWeapon | null

  // Refining + Resources + Player
  startRefiningWithResources: (recipe: RefiningRecipe, amount: number) => boolean
  completeRefiningWithResources: () => boolean

  // Weapons + Resources + Statistics
  sellWeaponWithGold: (weaponId: string) => boolean
  addWeaponWithStats: (weapon: CraftedWeapon) => void
  addWeaponV2: (weapon: CraftedWeaponV2) => void

  // Enchantments + Resources + Statistics
  sacrificeWeaponForEssence: (weaponId: string) => { soulEssence: number; bonusGold: number } | null
  unlockEnchantmentWithCost: (enchantmentId: string) => boolean

  // Repair + Resources + Workers
  executeWeaponRepair: (weaponId: string, repairType: RepairType) => ExecuteRepairResult
  repairWeaponWithResources: (weaponId: string) => { success: boolean; cost: number; repairedAmount: number }

  // Guild + Resources + Craft + Player
  startExpeditionFull: (expedition: ExpeditionTemplate, adventurer: Adventurer, weapon: CraftedWeapon, extendedAdventurer?: AdventurerExtended) => boolean
  completeExpeditionFull: (expeditionId: string) => ExpeditionResult | null

  // Emergency
  canGetEmergencyHelp: () => boolean
  getEmergencyHelp: () => boolean

  // Orders
  generateOrder: () => NPCOrder | null
  acceptOrder: (orderId: string) => boolean
  completeOrder: (orderId: string, weaponId: string) => boolean
  expireOrder: (orderId: string) => void
  getActiveOrder: () => NPCOrder | undefined

  // Tutorial
  nextTutorialStep: () => void
  skipTutorial: () => void
  completeTutorialStep: (stepId: string) => void
  isTutorialActive: () => boolean

  // Enchantments (simple)
  enchantWeapon: (weaponId: string, enchantmentId: string) => boolean
  removeEnchantment: (weaponId: string, enchantmentId: string) => boolean
  isEnchantmentUnlocked: (enchantmentId: string) => boolean
  addWarSoulToWeapon: (weaponId: string, points: number, durabilityLoss?: number, epicGain?: number) => boolean

  // Recipes
  unlockRecipe: (recipeId: string, source: 'purchase' | 'order' | 'expedition' | 'level') => boolean
  canRefine: (recipe: RefiningRecipe, amount: number) => boolean

  // Guild helpers
  refreshAdventurers: () => void
  initializeAdventurers: () => void
  cancelExpedition: (expeditionId: string) => boolean
  startRecoveryQuest: (questId: string) => boolean
  completeRecoveryQuest: (questId: string) => boolean
  declineRecoveryQuest: (questId: string) => void
  addGlory: (amount: number) => void
  getAdventurerById: (id: string) => Adventurer | undefined
  getActiveExpeditionById: (id: string) => ActiveExpedition | undefined
  isWeaponInExpedition: (weaponId: string) => boolean

  // Known Adventurers
  getKnownAdventurer: (adventurerId: string) => KnownAdventurer | undefined
  getMetBadge: (adventurerId: string) => { isKnown: boolean; text: string; className: string } | null
  calculateExpedition: (adventurer: AdventurerExtended, expedition: ExpeditionTemplate, weapon: CraftedWeapon) => ExpeditionCalculation

  // Repair helpers
  getRepairOptions: (weaponId: string) => RepairOption[]
  getBestBlacksmith: () => Worker | null
  getWeaponRepairCost: (weaponId: string) => number
  getMaxRepairPercent: (weaponId: string) => number

  // Craft helpers
  getWeaponById: (weaponId: string) => CraftedWeapon | undefined
  isRecipeUnlocked: (recipeId: string) => boolean
  getRecipeSource: (recipeId: string) => RecipeSource | undefined
  setCurrentScreen: (screen: GameScreen) => void

  // Craft state checks
  isCrafting: () => boolean
  isRefining: () => boolean
  updateCraftProgress: (progress: number) => void
  updateRefiningProgress: (progress: number) => void
}

// ================================
// ADDITIONAL STATE (не в slices)
// ================================

interface AdditionalState {
  currentScreen: GameScreen
  guild: GuildState
  knownAdventurers: KnownAdventurer[]
  // Tutorial state как вложенный объект (для совместимости с компонентами)
  tutorial: TutorialState
}

const initialAdditionalState: AdditionalState = {
  currentScreen: 'forge',
  guild: initialGuildState,
  knownAdventurers: [],
  tutorial: initialTutorialState,
}

// ================================
// FULL STORE TYPE
// ================================

type GameStore = PlayerSlice & ResourcesSlice & WorkersSlice & CraftSlice & OrdersSlice & TutorialActions & AdditionalState & CrossSliceActions

// ================================
// STORE CREATION
// ================================

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // === SLICE STATES ===
      // Player slice
      ...createPlayerSlice(set as any, get as any, {} as any),
      
      // Resources slice
      ...createResourcesSlice(set as any, get as any, {} as any),
      
      // Workers slice
      ...createWorkersSlice(set as any, get as any, {} as any),
      
      // Craft slice
      ...createCraftSlice(set as any, get as any, {} as any),

      // Orders slice
      ...createOrdersSlice(set as any, get as any, {} as any),

      // Override generateOrder with wrapper that passes player stats
      generateOrder: () => {
        const state = get()
        const playerLevel = state.player.level
        const playerFame = state.player.fame
        
        // Inline order generation logic (to avoid recursion)
        const activeOrders = state.orders.filter(o => o.status === 'available').length
        if (activeOrders >= 3) return null
        
        // Generate client using the generator from slice
        const { generateId, generateClientName } = require('@/lib/store-utils/generators')
        const client = generateClientName()
        const weaponTypes = ['sword', 'dagger', 'axe', 'mace', 'spear', 'hammer']
        const materials = ['iron', 'bronze', 'steel', 'silver', 'gold']
        
        const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)]
        const material = materials[Math.floor(Math.random() * materials.length)]
        const minQuality = 30 + Math.floor(Math.random() * 30) + playerLevel * 2
        const goldReward = 50 + Math.floor(Math.random() * 50) + playerLevel * 20
        const fameReward = 5 + Math.floor(Math.random() * 10) + playerLevel * 2
        const deadline = Date.now() + (300 + Math.floor(Math.random() * 300)) * 1000
        
        const order = {
          id: generateId(),
          clientName: client.name,
          clientTitle: client.title,
          clientIcon: client.icon,
          weaponType,
          material,
          minQuality,
          minAttack: minQuality + 10,
          goldReward,
          fameReward,
          deadline,
          status: 'available' as const,
          requiredLevel: Math.max(1, playerLevel - 2),
          requiredFame: Math.max(0, playerFame - 20),
        }
        
        // Check if client already exists
        if (state.orders.some(o => o.clientName === client.name && o.status === 'available')) {
          return null
        }
        
        set((s: any) => ({
          orders: [...s.orders, order]
        }))
        
        return order
      },

      // Tutorial actions (без state - state в AdditionalState)
      nextTutorialStep: () => set((state) => {
        const nextStep = state.tutorial.currentStep + 1
        return {
          tutorial: {
            ...state.tutorial,
            isActive: nextStep < 6, // TUTORIAL_STEPS.length
            currentStep: nextStep,
          }
        }
      }),
      
      skipTutorial: () => set((state) => ({
        tutorial: { ...state.tutorial, isActive: false, skipped: true }
      })),
      
      completeTutorialStep: (stepId) => set((state) => {
        if (state.tutorial.completedSteps.includes(stepId)) return state
        return {
          tutorial: {
            ...state.tutorial,
            completedSteps: [...state.tutorial.completedSteps, stepId],
          }
        }
      }),
      
      isTutorialActive: () => {
        const state = get()
        return state.tutorial.isActive && !state.tutorial.skipped
      },
      
      resetTutorial: () => set({ tutorial: initialTutorialState }),

      // === ADDITIONAL STATE ===
      ...initialAdditionalState,

      // === CROSS-SLICE ACTIONS ===
      // Будут реализованы в следующей части

      // Workers + Resources
      hireWorkerWithCost: (workerClass) => {
        const state = get()
        if (state.workers.length >= state.maxWorkers) return false

        const cost = calculateHireCost(
          workerClassData[workerClass].baseCost,
          state.workers.filter(w => w.class === workerClass).length
        )

        if (!state.canAfford({ gold: cost })) return false

        // Списываем золото
        state.spendResource('gold', cost)

        // Создаём рабочего через slice action
        const hired = state.hireWorker(workerClass)

        if (hired) {
          // Обновляем статистику
          state.updateStatistics({ totalWorkersHired: state.statistics.totalWorkersHired + 1 })
        }

        return hired
      },

      fireWorkerWithRefund: (workerId) => {
        const state = get()
        const worker = state.workers.find(w => w.id === workerId)
        if (!worker) return

        // Возвращаем часть золота
        const refund = getFireRefund(worker.hireCost)
        state.addResource('gold', refund)

        // Удаляем рабочего
        state.fireWorker(workerId)
      },

      upgradeBuildingWithCost: (buildingId) => {
        const state = get()
        const building = state.buildings.find(b => b.id === buildingId)
        if (!building) return false

        const cost = building.level * 100

        if (!state.canAfford({ gold: cost })) return false

        state.spendResource('gold', cost)
        return state.upgradeBuilding(buildingId)
      },

      // Craft + Resources + Player
      startCraftWithResources: (recipe) => {
        const state = get()

        // Проверки
        if (state.activeCraft.recipeId) return false
        if (!state.isRecipeUnlocked(recipe.id)) return false
        if (state.player.level < recipe.requiredLevel) return false
        if (!state.canAfford(recipe.cost)) return false

        // Списываем ресурсы
        state.spendResources(recipe.cost)

        // Запускаем крафт
        return state.startCraft(recipe)
      },

      completeCraftWithExperience: () => {
        const state = get()
        if (!state.activeCraft.recipeId) return null

        // Получаем рецепт (нужно найти по ID)
        // TODO: импортировать weaponRecipes
        const recipeId = state.activeCraft.recipeId

        // Рассчитываем качество
        const workersQuality = state.getWorkersQuality()
        // TODO: нужна информация о рецепте для расчёта

        // Очищаем активный крафт
        set((s) => ({
          activeCraft: initialActiveCraft
        }))

        // Возвращаем оружие (будет создано в вызывающем коде)
        return null
      },

      // Refining + Resources + Player
      startRefiningWithResources: (recipe, amount) => {
        const state = get()

        if (state.activeRefining.recipeId) return false
        if (state.player.level < recipe.requiredLevel) return false

        // Проверяем и списываем ресурсы
        for (const input of recipe.inputs) {
          if (!state.canAfford({ [input.resource]: input.amount * amount })) return false
        }
        if (recipe.extraCost && !state.canAfford({ coal: recipe.extraCost.coal * amount })) return false

        // Списываем
        for (const input of recipe.inputs) {
          state.spendResource(input.resource as ResourceKey, input.amount * amount)
        }
        if (recipe.extraCost) {
          state.spendResource('coal', recipe.extraCost.coal * amount)
        }

        return state.startRefining(recipe, amount)
      },

      completeRefiningWithResources: () => {
        const state = get()
        if (!state.activeRefining.recipeId) return false

        // Находим рецепт
        const recipe = refiningRecipes.find(r => r.id === state.activeRefining.recipeId)
        if (!recipe) return false

        // Начисляем ресурсы
        const outputAmount = recipe.output.amount * state.activeRefining.amount
        state.addResource(recipe.output.resource as ResourceKey, outputAmount)

        // Обновляем статистику
        state.updateStatistics({ totalRefines: state.statistics.totalRefines + 1 })

        // Даём опыт
        const exp = Math.floor(state.activeRefining.amount * 5)
        state.addExperience(exp)

        // Очищаем
        return state.completeRefining()
      },

      // Weapons + Resources + Statistics
      sellWeaponWithGold: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        // Начисляем золото
        state.addResource('gold', weapon.sellPrice)

        // Удаляем оружие
        state.removeWeapon(weaponId)

        // Статистика
        state.updateStatistics({
          weaponsSold: state.statistics.weaponsSold + 1,
          totalGoldEarned: state.statistics.totalGoldEarned + weapon.sellPrice,
        })

        return true
      },

      addWeaponWithStats: (weapon) => {
        const state = get()
        state.addWeapon(weapon)
        state.updateStatistics({ totalCrafts: state.statistics.totalCrafts + 1 })
      },

      addWeaponV2: (weapon: CraftedWeaponV2) => {
        // Конвертируем в CraftedWeapon если нужно
        const state = get()
        // TODO: реализовать конвертацию
      },

      // Enchantments + Resources + Statistics
      sacrificeWeaponForEssence: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return null

        const result = calculateSacrificeValueUtil(weapon)

        // Начисляем
        state.addResource('soulEssence', result.soulEssence)
        if (result.bonusGold > 0) {
          state.addResource('gold', result.bonusGold)
        }

        // Удаляем оружие
        state.removeWeapon(weaponId)

        // Статистика
        state.updateStatistics({ weaponsSacrificed: state.statistics.weaponsSacrificed + 1 })

        return result
      },

      unlockEnchantmentWithCost: (enchantmentId) => {
        const state = get()

        // TODO: получить данные зачарования
        // const enchantment = enchantments.find(e => e.id === enchantmentId)
        // if (!enchantment) return false

        // if (!canAffordEnchantment(enchantment, state.resources)) return false

        // Списываем ресурсы
        // ...

        return state.unlockEnchantment(enchantmentId)
      },

      // Repair + Resources + Workers
      executeWeaponRepair: (weaponId, repairType) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) {
          return { success: false, cost: 0, repairedAmount: 0, durabilityLeft: 0 }
        }

        const blacksmith = findBestBlacksmith(state.workers)
        if (!blacksmith) {
          return { success: false, cost: 0, repairedAmount: 0, durabilityLeft: 0 }
        }

        const weaponForRepair: WeaponForRepair = {
          id: weapon.id,
          durability: weapon.durability,
          maxDurability: weapon.maxDurability,
          quality: weapon.quality,
        }

        const result = executeRepairUtil(
          weaponForRepair,
          repairType,
          blacksmith,
          state.resources
        )

        if (result.success) {
          // Списываем ресурсы
          for (const [resource, amount] of Object.entries(result.costs)) {
            state.spendResource(resource as ResourceKey, amount)
          }

          // Обновляем оружие
          set((s) => ({
            weaponInventory: {
              ...s.weaponInventory,
              weapons: s.weaponInventory.weapons.map(w =>
                w.id === weaponId
                  ? { ...w, durability: result.durabilityLeft }
                  : w
              ),
            },
          }))
        }

        return result
      },

      repairWeaponWithResources: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return { success: false, cost: 0, repairedAmount: 0 }

        const blacksmith = findBestBlacksmith(state.workers)
        if (!blacksmith) return { success: false, cost: 0, repairedAmount: 0 }

        const cost = calculateRepairCost(weapon.quality, weapon.maxDurability - weapon.durability)
        const maxRepair = calculateMaxRepairPercent(blacksmith)

        if (!state.canAfford({ gold: cost })) return { success: false, cost, repairedAmount: 0 }

        const repairedAmount = Math.floor((weapon.maxDurability - weapon.durability) * maxRepair / 100)

        state.spendResource('gold', cost)

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? { ...w, durability: Math.min(w.maxDurability, w.durability + repairedAmount) }
                : w
            ),
          },
        }))

        return { success: true, cost, repairedAmount }
      },

      // Guild + Resources + Craft + Player
      startExpeditionFull: (expedition, adventurer, weapon, extendedAdventurer) => {
        const state = get()

        // Проверяем ресурсы
        const totalCost = expedition.cost.supplies + expedition.cost.deposit
        if (!state.canAfford({ gold: totalCost })) return false

        // Проверяем оружие
        if (weapon.durability <= 10) return false
        if (weapon.attack < expedition.minWeaponAttack) return false

        // Списываем
        state.spendResource('gold', totalCost)

        // Создаём экспедицию
        const newExpedition: ActiveExpedition = {
          id: generateId(),
          expeditionId: expedition.id,
          expeditionName: expedition.name,
          adventurerId: adventurer.id,
          adventurerName: getAdventurerFullName(adventurer),
          weaponId: weapon.id,
          weaponName: weapon.name,
          startTime: Date.now(),
          endTime: Date.now() + expedition.duration * 1000,
          status: 'active',
          cost: {
            supplies: expedition.cost.supplies,
            deposit: expedition.cost.deposit,
          },
        }

        set((s) => ({
          guild: {
            ...s.guild,
            activeExpeditions: [...s.guild.activeExpeditions, newExpedition],
          },
        }))

        return true
      },

      completeExpeditionFull: (expeditionId) => {
        const state = get()
        const expedition = state.guild.activeExpeditions.find(e => e.id === expeditionId)
        if (!expedition) return null

        const template = expeditionTemplates.find(t => t.id === expedition.expeditionId)
        if (!template) return null

        const weapon = state.weaponInventory.weapons.find(w => w.id === expedition.weaponId)
        if (!weapon) return null

        const adventurer = state.guild.adventurers.find(a => a.id === expedition.adventurerId)

        // Рассчитываем результат
        const result = calculateExpeditionOutcome(
          template,
          adventurer || { id: expedition.adventurerId, name: expedition.adventurerName, skill: 50, requirements: {} },
          weapon,
          state.guild.level,
          state.guild.glory
        )

        // Начисляем награды
        if (result.commission > 0) {
          state.addResource('gold', result.commission)
        }
        if (result.warSoul > 0 && weapon) {
          state.addWarSoulToWeapon(weapon.id, result.warSoul)
        }
        if (result.glory) {
          // Добавляем славу гильдии
          set((s) => ({
            guild: {
              ...s.guild,
              glory: s.guild.glory + result.glory,
            },
          }))
        }
        if (result.bonusResources) {
          for (const bonus of result.bonusResources) {
            state.addResource(bonus.resource as ResourceKey, bonus.amount)
          }
        }

        // Обновляем оружие
        if (!result.weaponLost && weapon) {
          set((s) => ({
            weaponInventory: {
              ...s.weaponInventory,
              weapons: s.weaponInventory.weapons.map(w =>
                w.id === weapon.id
                  ? { ...w, durability: Math.max(0, w.durability - result.weaponWear) }
                  : w
              ),
            },
          }))
        } else if (result.weaponLost) {
          state.removeWeapon(weapon.id)
        }

        // Даём опыт
        state.addExperience(result.success ? 20 : 5)

        // Удаляем экспедицию
        set((s) => ({
          guild: {
            ...s.guild,
            activeExpeditions: s.guild.activeExpeditions.filter(e => e.id !== expeditionId),
            history: [...s.guild.history, {
              id: generateId(),
              expeditionName: expedition.expeditionName,
              adventurerName: expedition.adventurerName,
              weaponName: expedition.weaponName,
              success: result.success,
              timestamp: Date.now(),
            }],
          },
        }))

        return result
      },

      // Emergency
      canGetEmergencyHelp: () => {
        const state = get()
        return state.workers.length === 0 && state.resources.gold < 50
      },

      getEmergencyHelp: () => {
        const state = get()
        if (!state.canGetEmergencyHelp()) return false

        state.addResource('gold', 100)
        state.updateStatistics({ totalWorkersHired: state.statistics.totalWorkersHired + 1 })

        return true
      },

      // Orders - delegating to slice (no wrapper needed, slice methods are available directly)
      acceptOrder: (orderId) => get().acceptOrder(orderId),
      completeOrder: (orderId, weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false
        const result = state.completeOrder(orderId, weaponId, {
          quality: weapon.quality,
          attack: weapon.attack,
          type: weapon.type,
          recipeId: weapon.recipeId,
        })
        return result.success
      },
      expireOrder: (orderId) => get().expireOrder(orderId),
      getActiveOrder: () => get().getActiveOrder(),

      // Enchantments (simple)
      enchantWeapon: (weaponId, enchantmentId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        const enchantment = state.unlockedEnchantments.includes(enchantmentId)
        if (!enchantment) return false

        const currentCount = weapon.enchantments?.length || 0
        if (currentCount >= MAX_ENCHANTMENTS_PER_WEAPON) return false

        // Проверяем совместимость
        if (weapon.enchantments && !areEnchantmentsCompatible(weapon.enchantments.map(e => e.enchantmentId), enchantmentId)) {
          return false
        }

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? {
                    ...w,
                    enchantments: [
                      ...(w.enchantments || []),
                      { id: generateId(), enchantmentId, appliedAt: Date.now() }
                    ],
                  }
                : w
            ),
          },
        }))

        state.updateStatistics({ enchantmentsApplied: state.statistics.enchantmentsApplied + 1 })
        return true
      },

      removeEnchantment: (weaponId, enchantmentId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon || !weapon.enchantments) return false

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? { ...w, enchantments: w.enchantments?.filter(e => e.enchantmentId !== enchantmentId) }
                : w
            ),
          },
        }))

        return true
      },

      isEnchantmentUnlocked: (enchantmentId) => {
        return get().unlockedEnchantments.includes(enchantmentId)
      },

      addWarSoulToWeapon: (weaponId, points, durabilityLoss = 5, epicGain = 0.05) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return false

        const newDurability = Math.max(0, weapon.durability - durabilityLoss)
        const newEpicMultiplier = Math.min(5.0, weapon.epicMultiplier + epicGain)

        set((s) => ({
          weaponInventory: {
            ...s.weaponInventory,
            weapons: s.weaponInventory.weapons.map(w =>
              w.id === weaponId
                ? {
                    ...w,
                    warSoul: w.warSoul + points,
                    durability: newDurability,
                    epicMultiplier: newEpicMultiplier,
                    adventureCount: w.adventureCount + 1,
                  }
                : w
            ),
          },
        }))

        return true
      },

      // Recipes
      unlockRecipe: (recipeId, source) => {
        const state = get()

        // Определяем тип рецепта
        const isWeaponRecipe = recipeId.includes('sword') || recipeId.includes('dagger') ||
                              recipeId.includes('axe') || recipeId.includes('mace') ||
                              recipeId.includes('spear') || recipeId.includes('hammer')

        if (isWeaponRecipe) {
          if (state.unlockedRecipes.weaponRecipes.includes(recipeId)) return false

          set((s) => ({
            unlockedRecipes: {
              ...s.unlockedRecipes,
              weaponRecipes: [...s.unlockedRecipes.weaponRecipes, recipeId],
            },
            recipeSources: [...s.recipeSources, { recipeId, source, obtainedAt: Date.now() }],
          }))
        } else {
          if (state.unlockedRecipes.refiningRecipes.includes(recipeId)) return false

          set((s) => ({
            unlockedRecipes: {
              ...s.unlockedRecipes,
              refiningRecipes: [...s.unlockedRecipes.refiningRecipes, recipeId],
            },
            recipeSources: [...s.recipeSources, { recipeId, source, obtainedAt: Date.now() }],
          }))
        }

        state.updateStatistics({ recipesUnlocked: state.statistics.recipesUnlocked + 1 })
        return true
      },

      canRefine: (recipe, amount) => {
        const state = get()
        if (state.player.level < recipe.requiredLevel) return false

        for (const input of recipe.inputs) {
          if ((state.resources[input.resource as ResourceKey] || 0) < input.amount * amount) {
            return false
          }
        }
        if (recipe.extraCost && state.resources.coal < recipe.extraCost.coal * amount) {
          return false
        }

        return true
      },

      // Guild helpers
      refreshAdventurers: () => {
        const state = get()
        const pool = generateAdventurerPool(state.guild.level)

        set((s) => ({
          guild: {
            ...s.guild,
            adventurers: pool,
            adventurerRefreshAt: Date.now() + ADVENTURER_LIFETIME,
          },
        }))
      },

      initializeAdventurers: () => {
        const state = get()
        if (state.guild.adventurers.length === 0) {
          state.refreshAdventurers()
        }
      },

      cancelExpedition: (expeditionId) => {
        const state = get()
        const expedition = state.guild.activeExpeditions.find(e => e.id === expeditionId)
        if (!expedition) return false

        // Возвращаем часть затрат
        const refund = Math.floor(expedition.cost.supplies * 0.5)
        state.addResource('gold', refund)

        set((s) => ({
          guild: {
            ...s.guild,
            activeExpeditions: s.guild.activeExpeditions.filter(e => e.id !== expeditionId),
          },
        }))

        return true
      },

      startRecoveryQuest: (questId) => {
        const state = get()
        const quest = state.guild.recoveryQuests.find(q => q.id === questId)
        if (!quest || quest.status !== 'available') return false

        if (!state.canAfford({ gold: quest.cost })) return false

        state.spendResource('gold', quest.cost)

        set((s) => ({
          guild: {
            ...s.guild,
            recoveryQuests: s.guild.recoveryQuests.map(q =>
              q.id === questId ? { ...q, status: 'in_progress', startTime: Date.now() } : q
            ),
          },
        }))

        return true
      },

      completeRecoveryQuest: (questId) => {
        const state = get()
        const quest = state.guild.recoveryQuests.find(q => q.id === questId)
        if (!quest || quest.status !== 'in_progress') return false

        // Возвращаем оружие
        if (quest.lostWeaponData) {
          state.addWeapon(quest.lostWeaponData)
        }

        set((s) => ({
          guild: {
            ...s.guild,
            recoveryQuests: s.guild.recoveryQuests.filter(q => q.id !== questId),
          },
        }))

        return true
      },

      declineRecoveryQuest: (questId) => {
        set((s) => ({
          guild: {
            ...s.guild,
            recoveryQuests: s.guild.recoveryQuests.filter(q => q.id !== questId),
          },
        }))
      },

      addGlory: (amount) => {
        set((s) => ({
          guild: {
            ...s.guild,
            glory: s.guild.glory + amount,
          },
        }))
      },

      getAdventurerById: (id) => get().guild.adventurers.find(a => a.id === id),
      getActiveExpeditionById: (id) => get().guild.activeExpeditions.find(e => e.id === id),

      isWeaponInExpedition: (weaponId) => {
        return get().guild.activeExpeditions.some(e => e.weaponId === weaponId)
      },

      // Known Adventurers
      getKnownAdventurer: (adventurerId) => {
        return get().knownAdventurers.find(ka => ka.adventurerId === adventurerId)
      },

      getMetBadge: (adventurerId) => {
        const known = get().knownAdventurers.find(ka => ka.adventurerId === adventurerId)
        if (!known) return null

        const info = getKnownAdventurerInfo(known)
        return {
          isKnown: true,
          text: getMetInfoText(info),
          className: 'badge-known',
        }
      },

      calculateExpedition: (adventurer, expedition, weapon) => {
        return calculateExpeditionResultV2(adventurer, expedition, weapon, get().guild.level, get().guild.glory)
      },

      // Repair helpers
      getRepairOptions: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return []

        return getRepairOptionsForWeapon(weapon, state.workers)
      },

      getBestBlacksmith: () => {
        return findBestBlacksmith(get().workers)
      },

      getWeaponRepairCost: (weaponId) => {
        const state = get()
        const weapon = state.weaponInventory.weapons.find(w => w.id === weaponId)
        if (!weapon) return 0

        return calculateRepairCost(weapon.quality, weapon.maxDurability - weapon.durability)
      },

      getMaxRepairPercent: (weaponId) => {
        const blacksmith = findBestBlacksmith(get().workers)
        return blacksmith ? calculateMaxRepairPercent(blacksmith) : 0
      },

      // Craft helpers
      getWeaponById: (weaponId) => get().weaponInventory.weapons.find(w => w.id === weaponId),

      isRecipeUnlocked: (recipeId) => {
        const state = get()
        return state.unlockedRecipes.weaponRecipes.includes(recipeId) ||
               state.unlockedRecipes.refiningRecipes.includes(recipeId)
      },

      getRecipeSource: (recipeId) => get().recipeSources.find(s => s.recipeId === recipeId),

      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      // Craft state checks
      isCrafting: () => get().activeCraft.recipeId !== null,
      isRefining: () => get().activeRefining.recipeId !== null,
      updateCraftProgress: (progress) => set((s) => ({
        activeCraft: { ...s.activeCraft, progress: Math.min(100, progress) }
      })),
      updateRefiningProgress: (progress) => set((s) => ({
        activeRefining: { ...s.activeRefining, progress: Math.min(100, progress) }
      })),
    }),
    {
      name: 'swordcraft-store',
      version: 2,
    }
  )
)

// ================================
// RE-EXPORTS (для обратной совместимости)
// ================================

export {
  // Player
  Player,
  GameStatistics,
  initialPlayer,
  initialStatistics,

  // Resources
  Resources,
  ResourceKey,
  CraftingCost,
  initialResources,

  // Workers
  Worker,
  WorkerClass,
  ProductionBuilding,
  initialBuildings,
  workerClassData,

  // Craft
  CraftedWeapon,
  ActiveCraft,
  ActiveRefining,
  WeaponInventory,
  UnlockedRecipes,
  RecipeSource,
  WeaponType,
  WeaponTier,
  WeaponMaterial,
  QualityGrade,
  initialActiveCraft,
  initialActiveRefining,
  initialWeaponInventory,
  initialUnlockedRecipes,
}

// ================================
// HELPER HOOKS
// ================================

/**
 * Hook для форматирования ресурсов с сокращениями
 */
export const useFormattedResources = () => {
  const resources = useGameStore((state) => state.resources)

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return Math.floor(num).toString()
  }

  return {
    ...resources,
    formatted: {
      gold: formatNumber(resources.gold),
      soulEssence: formatNumber(resources.soulEssence),
      wood: formatNumber(resources.wood),
      stone: formatNumber(resources.stone),
      iron: formatNumber(resources.iron),
      coal: formatNumber(resources.coal),
      copper: formatNumber(resources.copper),
      tin: formatNumber(resources.tin),
      silver: formatNumber(resources.silver),
      goldOre: formatNumber(resources.goldOre),
      mithril: formatNumber(resources.mithril),
      ironIngot: formatNumber(resources.ironIngot),
      copperIngot: formatNumber(resources.copperIngot),
      tinIngot: formatNumber(resources.tinIngot),
      bronzeIngot: formatNumber(resources.bronzeIngot),
      steelIngot: formatNumber(resources.steelIngot),
      silverIngot: formatNumber(resources.silverIngot),
      goldIngot: formatNumber(resources.goldIngot),
      mithrilIngot: formatNumber(resources.mithrilIngot),
      planks: formatNumber(resources.planks),
      stoneBlocks: formatNumber(resources.stoneBlocks),
    },
  }
}

/**
 * Hook для расчёта стоимости найма рабочего
 */
export const useWorkerHireCost = (workerClass: WorkerClass): number => {
  const workers = useGameStore((state) => state.workers)
  const classData = workerClassData[workerClass]
  const sameClassCount = workers.filter(w => w.class === workerClass).length
  return Math.floor(classData.baseCost * (1 + sameClassCount * 0.5))
}

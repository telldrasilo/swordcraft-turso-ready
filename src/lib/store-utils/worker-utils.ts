/**
 * Worker Utilities
 * Чистые функции для логики рабочих: найм, увольнение, опыт, уровни
 */

import { generateId, generateWorkerName, generateStatBonus, randomInt } from './generators'
import {
  MAX_WORKER_LEVEL,
  BASE_WORKER_EXP_TO_LEVEL,
  WORKER_EXP_PER_LEVEL,
  WORKER_COST_INCREASE_PER_CLASS,
  WORKER_FIRE_REFUND_PERCENT,
} from './constants'
import type { WorkerHireParams, WorkerHireResult, WorkerLevelUpResult } from './types'

// ================================
// ТИПЫ
// ================================

export interface WorkerClassData {
  baseCost: number
  baseStats: {
    speed: number
    quality: number
    stamina_max: number
    intelligence: number
    loyalty: number
  }
}

export interface Worker {
  id: string
  name: string
  class: 'apprentice' | 'blacksmith' | 'miner' | 'woodcutter'
  level: number
  experience: number
  stamina: number
  stats: {
    speed: number
    quality: number
    stamina_max: number
    intelligence: number
    loyalty: number
  }
  assignment: string
  hiredAt: number
  hireCost: number
}

// ================================
// ДАННЫЕ КЛАССОВ РАБОЧИХ
// ================================

export const WORKER_CLASS_DATA: Record<string, WorkerClassData> = {
  apprentice: {
    baseCost: 50,
    baseStats: {
      speed: 30,
      quality: 25,
      stamina_max: 80,
      intelligence: 30,
      loyalty: 50,
    },
  },
  blacksmith: {
    baseCost: 150,
    baseStats: {
      speed: 40,
      quality: 50,
      stamina_max: 100,
      intelligence: 40,
      loyalty: 40,
    },
  },
  miner: {
    baseCost: 100,
    baseStats: {
      speed: 50,
      quality: 30,
      stamina_max: 120,
      intelligence: 25,
      loyalty: 45,
    },
  },
  woodcutter: {
    baseCost: 80,
    baseStats: {
      speed: 45,
      quality: 35,
      stamina_max: 110,
      intelligence: 28,
      loyalty: 48,
    },
  },
}

// ================================
// НАЙМ РАБОЧИХ
// ================================

/**
 * Рассчитать стоимость найма рабочего
 */
export function calculateHireCost(
  workerClass: string,
  currentClassCount: number
): number {
  const baseCost = WORKER_CLASS_DATA[workerClass]?.baseCost ?? 50
  const multiplier = 1 + currentClassCount * WORKER_COST_INCREASE_PER_CLASS
  return Math.floor(baseCost * multiplier)
}

/**
 * Проверить возможность найма рабочего
 */
export function canHireWorker(params: WorkerHireParams): { can: boolean; reason: string; cost: number } {
  const { workerClass, currentWorkerCount, currentClassCount, maxWorkers, availableGold } = params

  if (currentWorkerCount >= maxWorkers) {
    return { can: false, reason: 'Достигнут лимит рабочих', cost: 0 }
  }

  const cost = calculateHireCost(workerClass, currentClassCount)

  if (availableGold < cost) {
    return { can: false, reason: 'Недостаточно золота', cost }
  }

  return { can: true, reason: '', cost }
}

/**
 * Создать нового рабочего
 */
export function createWorker(
  workerClass: 'apprentice' | 'blacksmith' | 'miner' | 'woodcutter',
  hireCost: number
): Worker {
  const classData = WORKER_CLASS_DATA[workerClass]

  return {
    id: generateId(),
    name: generateWorkerName(),
    class: workerClass,
    level: 1,
    experience: 0,
    stamina: classData.baseStats.stamina_max,
    stats: { ...classData.baseStats },
    assignment: 'rest',
    hiredAt: Date.now(),
    hireCost,
  }
}

/**
 * Попытка найма рабочего (полная операция)
 */
export function hireWorker(params: WorkerHireParams): WorkerHireResult {
  const check = canHireWorker(params)

  if (!check.can) {
    return {
      success: false,
      cost: 0,
      error: check.reason,
    }
  }

  const worker = createWorker(
    params.workerClass,
    check.cost
  )

  return {
    success: true,
    cost: check.cost,
    worker: {
      id: worker.id,
      name: worker.name,
      class: worker.class,
      level: worker.level,
      stamina: worker.stamina,
      stats: worker.stats,
    },
  }
}

// ================================
// УВОЛЬНЕНИЕ РАБОЧИХ
// ================================

/**
 * Рассчитать возврат при увольнении
 */
export function calculateFireRefund(hireCost: number): number {
  return Math.floor(hireCost * WORKER_FIRE_REFUND_PERCENT)
}

/**
 * Получить возврат за уволенного рабочего
 */
export function getFireRefund(worker: Worker): number {
  const hireCost = worker.hireCost ?? WORKER_CLASS_DATA[worker.class]?.baseCost ?? 50
  return calculateFireRefund(hireCost)
}

// ================================
// ОПЫТ И УРОВНИ РАБОЧИХ
// ================================

/**
 * Рассчитать опыт для следующего уровня рабочего
 */
export function getWorkerExpToLevel(level: number): number {
  return BASE_WORKER_EXP_TO_LEVEL + level * WORKER_EXP_PER_LEVEL
}

/**
 * Рассчитать множитель опыта от интеллекта
 */
export function calculateExpMultiplier(intelligence: number): number {
  return 1 + (intelligence - 25) / 100
}

/**
 * Рассчитать фактический полученный опыт
 */
export function calculateActualExp(baseExp: number, intelligence: number): number {
  const multiplier = calculateExpMultiplier(intelligence)
  return baseExp * multiplier
}

/**
 * Обработать повышение уровня рабочего
 */
export function processWorkerLevelUp(
  currentLevel: number,
  currentExperience: number,
  currentStats: Worker['stats'],
  expToAdd: number
): WorkerLevelUpResult | null {
  if (currentLevel >= MAX_WORKER_LEVEL) {
    return null
  }

  const actualExp = calculateActualExp(expToAdd, currentStats.intelligence)
  const newExperience = currentExperience + actualExp
  const expToLevel = getWorkerExpToLevel(currentLevel)

  if (newExperience < expToLevel) {
    return null // Нет повышения уровня
  }

  const newLevel = currentLevel + 1
  const leftoverExp = newExperience - expToLevel
  const statBonus = generateStatBonus()

  return {
    newLevel,
    newExperience: leftoverExp,
    statsBonus: {
      speed: Math.min(150, Math.floor(currentStats.speed * statBonus)) - currentStats.speed,
      quality: Math.min(150, Math.floor(currentStats.quality * statBonus)) - currentStats.quality,
      stamina_max: Math.min(200, Math.floor(currentStats.stamina_max * statBonus)) - currentStats.stamina_max,
      intelligence: Math.min(150, Math.floor(currentStats.intelligence * statBonus)) - currentStats.intelligence,
      loyalty: Math.min(100, Math.floor(currentStats.loyalty * statBonus)) - currentStats.loyalty,
    },
  }
}

/**
 * Рассчитать прогресс уровня рабочего
 */
export function getWorkerLevelProgress(experience: number, level: number): number {
  const expToLevel = getWorkerExpToLevel(level)
  return Math.min(100, (experience / expToLevel) * 100)
}

// ================================
// ВЫНОСЛИВОСТЬ
// ================================

/**
 * Рассчитать новую выносливость
 */
export function calculateNewStamina(
  currentStamina: number,
  maxStamina: number,
  delta: number
): number {
  return Math.max(0, Math.min(maxStamina, currentStamina + delta))
}

/**
 * Восстановить выносливость
 */
export function restoreStamina(
  currentStamina: number,
  maxStamina: number,
  amount: number
): number {
  return Math.min(maxStamina, currentStamina + amount)
}

/**
 * Проверить, достаточно ли выносливости
 */
export function hasEnoughStamina(currentStamina: number, required: number): boolean {
  return currentStamina >= required
}

// ================================
// НАЗНАЧЕНИЯ
// ================================

/** Допустимые назначения для классов */
export const VALID_ASSIGNMENTS: Record<string, string[]> = {
  apprentice: ['rest', 'forge', 'warehouse', 'mines', 'forest'],
  blacksmith: ['rest', 'forge', 'warehouse'],
  miner: ['rest', 'mines', 'warehouse'],
  woodcutter: ['rest', 'forest', 'warehouse'],
}

/**
 * Проверить валидность назначения для класса
 */
export function isValidAssignment(workerClass: string, assignment: string): boolean {
  const valid = VALID_ASSIGNMENTS[workerClass] ?? ['rest']
  return valid.includes(assignment)
}

// ================================
// КАЧЕСТВО РАБОТЫ
// ================================

/**
 * Рассчитать среднее качество кузнецов
 */
export function calculateAverageQuality(workers: Worker[]): number {
  const blacksmiths = workers.filter(w => w.class === 'blacksmith' && w.assignment === 'forge')
  if (blacksmiths.length === 0) return 20

  const totalQuality = blacksmiths.reduce((sum, w) => sum + w.stats.quality, 0)
  return totalQuality / blacksmiths.length
}

/**
 * Найти лучшего кузнеца
 */
export function findBestBlacksmith(workers: Worker[]): Worker | null {
  const blacksmiths = workers.filter(w => w.class === 'blacksmith')
  if (blacksmiths.length === 0) return null

  return blacksmiths.sort((a, b) => b.level - a.level)[0]
}

/**
 * Найти лучшего работника определённого класса
 */
export function findBestWorkerOfClass(workers: Worker[], workerClass: string): Worker | null {
  const classWorkers = workers.filter(w => w.class === workerClass)
  if (classWorkers.length === 0) return null

  return classWorkers.sort((a, b) => b.level - a.level)[0]
}

/**
 * Типы рабочих и зданий
 */

// ================================
// КЛАССЫ РАБОЧИХ
// ================================

/** Классы рабочих */
export type WorkerClass = 
  | 'apprentice' 
  | 'blacksmith' 
  | 'miner' 
  | 'merchant' 
  | 'enchanter' 
  | 'loggers' 
  | 'mason' 
  | 'smelter'

/** Данные класса рабочего */
export interface WorkerClassData {
  name: string
  description: string
  baseCost: number
  baseStats: WorkerStats
}

// ================================
// РАБОЧИЙ
// ================================

/** Характеристики рабочего */
export interface WorkerStats {
  speed: number
  quality: number
  stamina_max: number
  intelligence: number
  loyalty: number
}

/** Рабочий */
export interface Worker {
  id: string
  name: string
  class: WorkerClass
  level: number
  experience: number
  stamina: number
  stats: WorkerStats
  assignment: string
  hiredAt: number
  hireCost: number
}

/** Максимальный уровень рабочего */
export const MAX_WORKER_LEVEL = 50

/** Опыт для уровня рабочего */
export function getWorkerExpForLevel(level: number): number {
  return 100 + level * 50
}

// ================================
// ДАННЫЕ КЛАССОВ
// ================================

export const workerClassData: Record<WorkerClass, WorkerClassData> = {
  apprentice: { 
    name: 'Ученик', 
    description: 'Начинающий работник', 
    baseCost: 50, 
    baseStats: { speed: 30, quality: 20, stamina_max: 80, intelligence: 25, loyalty: 50 } 
  },
  blacksmith: { 
    name: 'Кузнец', 
    description: 'Мастер ковки', 
    baseCost: 200, 
    baseStats: { speed: 50, quality: 70, stamina_max: 100, intelligence: 45, loyalty: 60 } 
  },
  miner: { 
    name: 'Шахтёр', 
    description: 'Добыча руды', 
    baseCost: 150, 
    baseStats: { speed: 60, quality: 30, stamina_max: 120, intelligence: 35, loyalty: 55 } 
  },
  merchant: { 
    name: 'Торговец', 
    description: 'Торговля', 
    baseCost: 300, 
    baseStats: { speed: 40, quality: 40, stamina_max: 80, intelligence: 80, loyalty: 40 } 
  },
  enchanter: { 
    name: 'Чародей', 
    description: 'Зачарования', 
    baseCost: 500, 
    baseStats: { speed: 30, quality: 50, stamina_max: 70, intelligence: 90, loyalty: 45 } 
  },
  loggers: { 
    name: 'Дровосек', 
    description: 'Заготовка дерева', 
    baseCost: 100, 
    baseStats: { speed: 70, quality: 25, stamina_max: 110, intelligence: 30, loyalty: 60 } 
  },
  mason: { 
    name: 'Каменщик', 
    description: 'Добыча камня', 
    baseCost: 120, 
    baseStats: { speed: 65, quality: 30, stamina_max: 115, intelligence: 35, loyalty: 58 } 
  },
  smelter: { 
    name: 'Плавильщик', 
    description: 'Обработка металлов', 
    baseCost: 180, 
    baseStats: { speed: 55, quality: 45, stamina_max: 100, intelligence: 50, loyalty: 55 } 
  },
}

// ================================
// ЗДАНИЯ
// ================================

/** Производственное здание */
export interface ProductionBuilding {
  id: string
  name: string
  type: string
  level: number
  produces: string
  baseProduction: number
  requiredWorkers: number
  staminaCost: number
  progress: number
  unlocked: boolean
}

/** Типы зданий */
export type BuildingType = 
  | 'sawmill' 
  | 'quarry' 
  | 'iron_mine' 
  | 'coal_mine' 
  | 'copper_mine' 
  | 'tin_mine' 
  | 'silver_mine' 
  | 'gold_mine' 
  | 'smelter' 
  | 'workshop'

/** Начальные здания */
export const initialBuildings: ProductionBuilding[] = [
  { id: 'sawmill', name: 'Лесопилка', type: 'sawmill', level: 1, produces: 'wood', baseProduction: 0.8, requiredWorkers: 2, staminaCost: 1, progress: 0, unlocked: true },
  { id: 'quarry', name: 'Каменоломня', type: 'quarry', level: 1, produces: 'stone', baseProduction: 0.6, requiredWorkers: 2, staminaCost: 1.5, progress: 0, unlocked: true },
  { id: 'iron_mine', name: 'Железный рудник', type: 'iron_mine', level: 1, produces: 'iron', baseProduction: 0.4, requiredWorkers: 2, staminaCost: 2, progress: 0, unlocked: true },
  { id: 'coal_mine', name: 'Угольная шахта', type: 'coal_mine', level: 1, produces: 'coal', baseProduction: 0.35, requiredWorkers: 2, staminaCost: 2, progress: 0, unlocked: true },
  { id: 'copper_mine', name: 'Медная шахта', type: 'copper_mine', level: 1, produces: 'copper', baseProduction: 0.25, requiredWorkers: 3, staminaCost: 2, progress: 0, unlocked: false },
  { id: 'tin_mine', name: 'Оловянная шахта', type: 'tin_mine', level: 1, produces: 'tin', baseProduction: 0.25, requiredWorkers: 3, staminaCost: 2, progress: 0, unlocked: false },
  { id: 'silver_mine', name: 'Серебряный рудник', type: 'silver_mine', level: 1, produces: 'silver', baseProduction: 0.15, requiredWorkers: 4, staminaCost: 2.5, progress: 0, unlocked: false },
  { id: 'gold_mine', name: 'Золотой рудник', type: 'gold_mine', level: 1, produces: 'goldOre', baseProduction: 0.1, requiredWorkers: 5, staminaCost: 3, progress: 0, unlocked: false },
  { id: 'smelter', name: 'Плавильня', type: 'smelter', level: 1, produces: 'ironIngot', baseProduction: 0.2, requiredWorkers: 1, staminaCost: 1.5, progress: 0, unlocked: true },
  { id: 'workshop', name: 'Столярная мастерская', type: 'workshop', level: 1, produces: 'planks', baseProduction: 0.3, requiredWorkers: 1, staminaCost: 1, progress: 0, unlocked: true },
]

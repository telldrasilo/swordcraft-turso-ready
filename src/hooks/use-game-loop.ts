'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useGameStore, Worker, ProductionBuilding, workerClassData, WorkerClass } from '@/store'
import { refiningRecipes } from '@/data/refining-recipes'
import { weaponRecipes } from '@/data/weapon-recipes'

// Частота обновления игры (в мс)
const TICK_RATE = 100 // 10 тиков в секунду для плавности

// Балансовые константы
const BALANCE = {
  // Базовый расход стамины в секунду (было 0.5)
  BASE_STAMINA_DRAIN: 0.15,
  
  // Множитель расхода от сложности здания
  STAMINA_COST_MULTIPLIER: 0.05,
  
  // Базовое восстановление стамины в секунду при отдыхе (было 2)
  BASE_STAMINA_RECOVERY: 0.5,
  
  // Порог автоперехода на отдых
  AUTO_REST_THRESHOLD: 5,
  
  // Порог предупреждения о низкой выносливости (в процентах)
  LOW_STAMINA_WARNING_PERCENT: 25,
}

// Коэффициенты расхода стамины для разных классов на разных работах
// Классы лучше работают на своих специальностях
const CLASS_STAMINA_MODIFIERS: Partial<Record<WorkerClass, Partial<Record<string, number>>>> = {
  loggers: { sawmill: 0.6 },      // Дровосеки медленнее тратят стамину на лесопилке
  mason: { quarry: 0.6 },          // Каменщики на каменоломне
  miner: {                         // Шахтёры на шахтах
    iron_mine: 0.6, 
    coal_mine: 0.6,
    copper_mine: 0.6,
    tin_mine: 0.6,
    silver_mine: 0.6,
    gold_mine: 0.6,
  },
  smelter: {                       // Плавильщики
    iron_mine: 0.7,
    coal_mine: 0.7,
  },
}

export function useGameLoop() {
  const lastTickRef = useRef<number>(Date.now())
  const offlineProgressCalculatedRef = useRef<boolean>(false)
  
  // Используем индивидуальные селекторы (Zustand оптимизирован для этого)
  const addResource = useGameStore((state) => state.addResource)
  const workers = useGameStore((state) => state.workers)
  const buildings = useGameStore((state) => state.buildings)
  const updateWorkerStamina = useGameStore((state) => state.updateWorkerStamina)
  const addWorkerExperience = useGameStore((state) => state.addWorkerExperience)
  const updateBuildingProgress = useGameStore((state) => state.updateBuildingProgress)
  const assignWorker = useGameStore((state) => state.assignWorker)
  const addExperience = useGameStore((state) => state.addExperience)
  
  // Переработка и крафт
  const activeRefining = useGameStore((state) => state.activeRefining)
  const updateRefiningProgress = useGameStore((state) => state.updateRefiningProgress)
  const completeRefining = useGameStore((state) => state.completeRefining)
  
  const activeCraft = useGameStore((state) => state.activeCraft)
  const updateCraftProgress = useGameStore((state) => state.updateCraftProgress)
  const completeCraft = useGameStore((state) => state.completeCraft)
  
  // Расчёт расхода стамины для рабочего на конкретном здании
  const getStaminaDrain = useCallback((worker: Worker, building: ProductionBuilding): number => {
    const baseDrain = BALANCE.BASE_STAMINA_DRAIN
    const buildingModifier = building.staminaCost * BALANCE.STAMINA_COST_MULTIPLIER
    
    // Классовый бонус/штраф
    const classModifier = CLASS_STAMINA_MODIFIERS[worker.class]?.[building.id] ?? 1.0
    
    // Выносливость рабочего влияет на расход (более выносливые тратят меньше)
    const staminaEfficiency = 1 - (worker.stats.stamina_max - 80) / 200 // -20% для 120 стамины
    
    return (baseDrain + buildingModifier) * classModifier * Math.max(0.7, staminaEfficiency)
  }, [])
  
  // Расчёт производительности здания
  const calculateBuildingProduction = useCallback((building: ProductionBuilding) => {
    // Находим рабочих, назначенных на это здание
    const assignedWorkers = workers.filter(w => w.assignment === building.id && w.stamina > 0)
    
    if (assignedWorkers.length === 0) return { rate: 0, efficiency: 0, workersWithStamina: 0 }
    
    // Базовая производительность здания
    const baseRate = building.baseProduction
    
    // Модификатор от рабочих
    const workerModifier = assignedWorkers.reduce((sum, worker) => {
      // Скорость влияет на производительность
      const speedBonus = worker.stats.speed / 100
      
      // Выносливость влияет на эффективность (линейно от 100% до 20% стамины)
      const staminaFactor = Math.max(0.2, worker.stamina / 100)
      
      // Уровень даёт небольшой бонус
      const levelBonus = 1 + (worker.level - 1) * 0.05
      
      // Классовый бонус на специфических работах
      const classBonus = getClassProductionBonus(worker.class, building.id)
      
      return sum + speedBonus * staminaFactor * levelBonus * classBonus
    }, 0)
    
    // Эффективность (отношение реальных рабочих к требуемым)
    const efficiency = Math.min(1, assignedWorkers.length / building.requiredWorkers)
    
    // Итоговая скорость
    const rate = baseRate * workerModifier * efficiency
    
    return { rate, efficiency, workersWithStamina: assignedWorkers.length }
  }, [workers])
  
  // Основной игровой цикл
  const gameTick = useCallback((deltaMs: number) => {
    const deltaSeconds = deltaMs / 1000
    
    // Обработка каждого здания
    buildings.forEach(building => {
      const { rate, efficiency, workersWithStamina } = calculateBuildingProduction(building)
      
      if (rate > 0 && workersWithStamina > 0) {
        // Добавляем ресурсы
        const amount = rate * deltaSeconds
        addResource(building.produces, amount)
        
        // Обновляем прогресс здания
        updateBuildingProgress(building.id, efficiency)
        
        // Снижаем выносливость рабочих и даём опыт
        const assignedWorkers = workers.filter(w => w.assignment === building.id)
        assignedWorkers.forEach(worker => {
          if (worker.stamina > 0) {
            const drain = getStaminaDrain(worker, building) * deltaSeconds
            const newStamina = worker.stamina - drain
            
            // Даём опыт за работу (медленно, растянуто)
            // 0.01-0.03 опыта за тик в зависимости от сложности работы
            const expGain = 0.01 + (building.staminaCost * 0.005)
            addWorkerExperience(worker.id, expGain * deltaSeconds)
            
            // Автопереход на отдых при низкой выносливости
            if (newStamina < BALANCE.AUTO_REST_THRESHOLD) {
              assignWorker(worker.id, 'rest')
            } else {
              updateWorkerStamina(worker.id, -drain)
            }
          }
        })
        
        // Добавляем опыт игроку (медленнее)
        if (Math.random() < 0.05) { // 5% шанс за тик
          addExperience(0.05)
        }
      }
    })
    
    // Восстановление выносливости для отдыхающих рабочих
    workers
      .filter(w => w.assignment === 'rest' && w.stamina < w.stats.stamina_max)
      .forEach(worker => {
        // Восстановление зависит от максимальной стамины (больше стамины = дольше восстановление)
        const recoveryRate = BALANCE.BASE_STAMINA_RECOVERY * (80 / worker.stats.stamina_max)
        const recovery = recoveryRate * deltaSeconds
        updateWorkerStamina(worker.id, recovery)
      })
    
    // Обработка прогресса переработки
    if (activeRefining.recipeId && activeRefining.endTime) {
      const now = Date.now()
      const totalTime = activeRefining.endTime - (activeRefining.startTime || now)
      const elapsed = now - (activeRefining.startTime || now)
      const progress = Math.min(100, (elapsed / totalTime) * 100)
      
      updateRefiningProgress(progress)
      
      if (progress >= 100) {
        completeRefining()
      }
    }
    
    // Обработка прогресса крафта
    if (activeCraft.recipeId && activeCraft.endTime) {
      const now = Date.now()
      const totalTime = activeCraft.endTime - (activeCraft.startTime || now)
      const elapsed = now - (activeCraft.startTime || now)
      const progress = Math.min(100, (elapsed / totalTime) * 100)
      
      updateCraftProgress(progress)
      
      if (progress >= 100) {
        completeCraft()
      }
    }
    
  }, [buildings, workers, calculateBuildingProduction, addResource, updateWorkerStamina, addWorkerExperience, updateBuildingProgress, addExperience, assignWorker, getStaminaDrain, activeRefining, activeCraft, updateRefiningProgress, completeRefining, updateCraftProgress, completeCraft])
  
  // Запуск игрового цикла
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now()
      const delta = now - lastTickRef.current
      lastTickRef.current = now
      
      // Ограничиваем delta для предотвращения больших скачков
      const clampedDelta = Math.min(delta, 1000)
      
      gameTick(clampedDelta)
    }, TICK_RATE)
    
    return () => clearInterval(intervalId)
  }, [gameTick])
  
  // Обработка офлайн-прогресса при загрузке (только один раз)
  useEffect(() => {
    // Пропускаем, если уже рассчитали
    if (offlineProgressCalculatedRef.current) return
    offlineProgressCalculatedRef.current = true
    
    const lastSession = localStorage.getItem('swordcraft-last-session')
    if (lastSession) {
      const lastTime = parseInt(lastSession, 10)
      const now = Date.now()
      const offlineMs = now - lastTime
      
      // Ограничиваем офлайн-прогресс до 8 часов
      const maxOfflineMs = 8 * 60 * 60 * 1000
      const clampedOfflineMs = Math.min(offlineMs, maxOfflineMs)
      
      if (clampedOfflineMs > 60000) { // Больше минуты
        console.log(`Calculating offline progress: ${Math.round(clampedOfflineMs / 60000)} minutes`)
        gameTick(clampedOfflineMs)
      }
    }
    
    // Сохраняем время сессии при закрытии
    const handleBeforeUnload = () => {
      localStorage.setItem('swordcraft-last-session', Date.now().toString())
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Пустой массив - запускается только один раз при монтировании
  
  return {
    calculateBuildingProduction,
    getStaminaDrain,
  }
}

// Классовые бонусы к производительности на специфических работах
function getClassProductionBonus(workerClass: WorkerClass, buildingId: string): number {
  const bonuses: Partial<Record<WorkerClass, Partial<Record<string, number>>>> = {
    loggers: { sawmill: 1.3 },      // Дровосеки +30% на лесопилке
    mason: { quarry: 1.3 },          // Каменщики +30% на каменоломне
    miner: {                         // Шахтёры +25% на шахтах
      iron_mine: 1.25, 
      coal_mine: 1.25,
      copper_mine: 1.25,
      tin_mine: 1.25,
      silver_mine: 1.25,
      gold_mine: 1.25,
    },
    smelter: {                       // Плавильщики +20% на рудниках
      iron_mine: 1.2,
      coal_mine: 1.2,
    },
    blacksmith: { forge: 1.4 },      // Кузнецы +40% в кузнице
    apprentice: {                    // Ученики везде по чуть-чуть
      sawmill: 1.1,
      quarry: 1.1,
      iron_mine: 1.05,
      coal_mine: 1.05,
    },
  }
  
  return bonuses[workerClass]?.[buildingId] ?? 1.0
}

// Хук для получения текущих скоростей производства
export function useProductionRates() {
  // Используем индивидуальные селекторы
  const workers = useGameStore((state) => state.workers)
  const buildings = useGameStore((state) => state.buildings)
  
  return useMemo(() => {
    const rates: Record<string, number> = {}
    
    buildings.forEach(building => {
      const assignedWorkers = workers.filter(w => w.assignment === building.id && w.stamina > 0)
      
      if (assignedWorkers.length === 0) {
        rates[building.produces] = rates[building.produces] || 0
        return
      }
      
      const baseRate = building.baseProduction
      const workerModifier = assignedWorkers.reduce((sum, worker) => {
        const speedBonus = worker.stats.speed / 100
        const staminaFactor = Math.max(0.2, worker.stamina / 100)
        const levelBonus = 1 + (worker.level - 1) * 0.05
        const classBonus = getClassProductionBonus(worker.class, building.id)
        return sum + speedBonus * staminaFactor * levelBonus * classBonus
      }, 0)
      
      const efficiency = Math.min(1, assignedWorkers.length / building.requiredWorkers)
      const rate = baseRate * workerModifier * efficiency
      
      rates[building.produces] = (rates[building.produces] || 0) + rate
    })
    
    return rates
  }, [workers, buildings])
}

// Хук для расчёта времени до истощения рабочего
export function useWorkerStaminaTime(workerId: string): { workTime: number; restTime: number } {
  // Используем индивидуальные селекторы
  const worker = useGameStore((state) => state.workers.find(w => w.id === workerId))
  const buildings = useGameStore((state) => state.buildings)
  
  return useMemo(() => {
    if (!worker || worker.assignment === 'rest') {
      if (!worker) return { workTime: 0, restTime: 0 }
      
      // Время до полного восстановления
      const missingStamina = worker.stats.stamina_max - worker.stamina
      const recoveryRate = BALANCE.BASE_STAMINA_RECOVERY * (80 / worker.stats.stamina_max)
      return { workTime: 0, restTime: missingStamina / recoveryRate }
    }
    
    const building = buildings.find(b => b.id === worker.assignment)
    if (!building) return { workTime: 0, restTime: 0 }
    
    // Время до истощения
    const drainRate = (BALANCE.BASE_STAMINA_DRAIN + building.staminaCost * BALANCE.STAMINA_COST_MULTIPLIER) * 
      (CLASS_STAMINA_MODIFIERS[worker.class]?.[building.id] ?? 1.0) *
      Math.max(0.7, 1 - (worker.stats.stamina_max - 80) / 200)
    
    const workTime = (worker.stamina - BALANCE.AUTO_REST_THRESHOLD) / drainRate
    const restTime = worker.stats.stamina_max / (BALANCE.BASE_STAMINA_RECOVERY * (80 / worker.stats.stamina_max))
    
    return { workTime: Math.max(0, workTime), restTime }
  }, [worker, buildings])
}

// Экспорт констант баланса для использования в UI
export { BALANCE, CLASS_STAMINA_MODIFIERS }

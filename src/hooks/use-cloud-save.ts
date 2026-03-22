/**
 * Хук для синхронизации игры с сервером
 * Автоматическое сохранение и загрузка
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useGameStore } from '@/store'

interface UseCloudSaveOptions {
  autoSaveInterval?: number
  enableAutoSave?: boolean
  playerId?: string
}

interface CloudSaveResult {
  isLoading: boolean
  isSaving: boolean
  lastSavedAt: Date | null
  error: string | null
  save: () => Promise<boolean>
  load: () => Promise<boolean>
  reset: () => Promise<boolean>
}

// Хелпер для получения титула по уровню
function getTitleByLevel(level: number): string {
  const titles = [
    { min: 1, max: 4, title: 'Новичок' },
    { min: 5, max: 9, title: 'Ученик' },
    { min: 10, max: 14, title: 'Подмастерье' },
    { min: 15, max: 19, title: 'Опытный кузнец' },
    { min: 20, max: 29, title: 'Мастер-кузнец' },
    { min: 30, max: 39, title: 'Великий мастер' },
    { min: 40, max: 49, title: 'Легендарный мастер' },
    { min: 50, max: 999, title: 'Легенда' },
  ]

  for (const t of titles) {
    if (level >= t.min && level <= t.max) {
      return t.title
    }
  }
  return 'Новичок'
}

export function useCloudSave(options: UseCloudSaveOptions = {}): CloudSaveResult {
  const { autoSaveInterval = 60000, enableAutoSave = true, playerId = 'demo-player' } = options

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isLoadingRef = useRef(false)

  // Сбор данных для сохранения
  const collectSaveData = useCallback(() => {
    const state = useGameStore.getState()

    return {
      player: {
        level: state.player?.level || 1,
        experience: state.player?.experience || 0,
        fame: state.player?.fame || 0,
      },
      resources: state.resources || {},
      statistics: state.statistics || {},
      workers: state.workers || [],
      buildings: state.buildings || [],
      maxWorkers: state.maxWorkers || 3,
      activeCraft: state.activeCraft || {},
      activeRefining: state.activeRefining || {},
      weaponInventory: state.weaponInventory || { weapons: [] },
      unlockedRecipes: state.unlockedRecipes || { weaponRecipes: [], refiningRecipes: [] },
      recipeSources: state.recipeSources || [],
      unlockedEnchantments: state.unlockedEnchantments || [],
      guild: state.guild || {},
      knownAdventurers: state.knownAdventurers || [],
      orders: {
        active: (state as any).active || [],
        completed: (state as any).completed || [],
        expired: (state as any).expired || [],
      },
      tutorial: state.tutorial || { isActive: true, currentStep: 0 },
      playTime: state.statistics?.playTime || 0,
      saveVersion: 2,
    }
  }, [])

  // Применение загруженных данных
  const applyLoadedData = useCallback((data: any) => {
    const level = data.level || 1

    useGameStore.setState({
      player: {
        name: 'Кузнец',
        level: level,
        experience: data.experience || 0,
        experienceToNextLevel: Math.floor(100 * Math.pow(1.5, level - 1)),
        fame: data.fame || 0,
        title: getTitleByLevel(level),
      },
      resources: data.resources || {},
      statistics: data.statistics || {},
      workers: data.workers || [],
      buildings: data.buildings || [],
      maxWorkers: data.maxWorkers || 3,
      activeCraft: data.activeCraft || {},
      activeRefining: data.activeRefining || {},
      weaponInventory: data.weaponInventory || { weapons: [] },
      unlockedRecipes: data.unlockedRecipes || { weaponRecipes: [], refiningRecipes: [] },
      recipeSources: data.recipeSources || [],
      unlockedEnchantments: data.unlockedEnchantments || [],
      guild: data.guild || {},
      knownAdventurers: data.knownAdventurers || [],
      tutorial: data.tutorial || { isActive: true, currentStep: 0 },
    })
  }, [])

  // Сохранение
  const save = useCallback(async (): Promise<boolean> => {
    if (isSaving) return false

    setIsSaving(true)
    setError(null)

    try {
      const saveData = collectSaveData()

      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-player-id': playerId,
        },
        body: JSON.stringify(saveData),
      })

      const result = await response.json()

      if (result.success) {
        setLastSavedAt(new Date())
        console.log('[CloudSave] Saved successfully')
        return true
      } else {
        setError(result.error || 'Save failed')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      console.error('[CloudSave] Save error:', err)
      return false
    } finally {
      setIsSaving(false)
    }
  }, [collectSaveData, playerId, isSaving])

  // Загрузка
  const load = useCallback(async (): Promise<boolean> => {
    if (isLoadingRef.current) return false

    isLoadingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/save', {
        method: 'GET',
        headers: {
          'x-player-id': playerId,
        },
      })

      const result = await response.json()

      if (result.success && result.data) {
        applyLoadedData(result.data)
        console.log('[CloudSave] Loaded successfully, isNew:', result.isNew)
        return true
      } else {
        setError(result.error || 'Load failed')
        return false
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      console.error('[CloudSave] Load error:', err)
      return false
    } finally {
      setIsLoading(false)
      isLoadingRef.current = false
    }
  }, [applyLoadedData, playerId])

  // Сброс
  const reset = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/save', {
        method: 'DELETE',
        headers: {
          'x-player-id': playerId,
        },
      })

      const result = await response.json()

      if (result.success) {
        localStorage.removeItem('swordcraft-store')
        window.location.reload()
        return true
      }
      return false
    } catch (err) {
      console.error('[CloudSave] Reset error:', err)
      return false
    }
  }, [playerId])

  // Загрузка при монтировании
  useEffect(() => {
    load()
  }, [load])

  // Автосохранение
  useEffect(() => {
    if (!enableAutoSave) return

    const interval = setInterval(() => {
      save()
    }, autoSaveInterval)

    return () => clearInterval(interval)
  }, [enableAutoSave, autoSaveInterval, save])

  // Сохранение при закрытии страницы
  useEffect(() => {
    const handleBeforeUnload = () => {
      const saveData = collectSaveData()
      const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' })
      navigator.sendBeacon('/api/save', blob)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [collectSaveData])

  return {
    isLoading,
    isSaving,
    lastSavedAt,
    error,
    save,
    load,
    reset,
  }
}

export type { CloudSaveResult, UseCloudSaveOptions }

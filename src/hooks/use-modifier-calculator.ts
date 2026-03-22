/**
 * Хук для расчёта экспедиций с использованием системы модификаторов
 * Интегрирует новую расширяемую архитектуру с существующим store
 */

import { useMemo, useCallback } from 'react'
import { useGameStore } from '@/store'
import type { AdventurerExtended } from '@/types/adventurer-extended'
import type { ExpeditionTemplate } from '@/data/expedition-templates'
import type { CraftedWeapon } from '@/data/weapon-recipes'
import { 
  calculateExpeditionResult as calculateWithModifiers,
  type ExpeditionCalculation,
  type ModifierDetail
} from '@/lib/expedition-calculator-v2'

// Импорт системы модификаторов (автоматически регистрирует провайдеры)
import '@/lib/modifier-system'

/**
 * Результат расчёта с детализацией для UI
 */
export interface ExpeditionPrediction {
  // Основные результаты
  successChance: number
  commission: number
  warSoul: number
  weaponWear: number
  weaponLossChance: number
  critChance: number
  
  // Модификаторы для отображения
  successModifiers: ModifierDetail[]
  goldModifiers: ModifierDetail[]
  warSoulModifiers: ModifierDetail[]
  weaponWearModifiers: ModifierDetail[]
  weaponLossModifiers: ModifierDetail[]
  critModifiers: ModifierDetail[]
  
  // Рекомендация
  recommendation: {
    rating: 'excellent' | 'good' | 'risky' | 'dangerous'
    description: string
  }
  
  // Соответствие уровню
  levelMatch: {
    adventurerLevel: number
    missionTier: number
    missionTierName: string
    match: 'optimal' | 'underlevel' | 'overlevel' | 'dangerous'
    matchDescription: string
  }
}

/**
 * Извлечь тип оружия из crafted weapon
 */
function getWeaponType(weapon: CraftedWeapon): string {
  // Тип оружия хранится в weapon.type
  return weapon.type || 'sword'
}

/**
 * Хук для расчёта прогноза экспедиции
 */
export function useExpeditionPrediction(
  adventurer: AdventurerExtended | null | undefined,
  expedition: ExpeditionTemplate | null | undefined,
  weapon: CraftedWeapon | null | undefined
): ExpeditionPrediction | null {
  const guildLevel = useGameStore((state) => state.guild.level)
  
  return useMemo(() => {
    if (!adventurer || !expedition || !weapon) return null
    
    const weaponType = getWeaponType(weapon)
    
    const result = calculateWithModifiers(
      adventurer,
      expedition,
      guildLevel,
      weapon.attack,
      weapon.quality,
      weaponType,
      weapon.id
    )
    
    return {
      successChance: result.successChance,
      commission: result.commission,
      warSoul: result.warSoul,
      weaponWear: result.weaponWear,
      weaponLossChance: result.weaponLossChance,
      critChance: result.critChance,
      successModifiers: result.successModifiers,
      goldModifiers: result.goldModifiers,
      warSoulModifiers: result.warSoulModifiers,
      weaponWearModifiers: result.weaponWearModifiers,
      weaponLossModifiers: result.weaponLossModifiers,
      critModifiers: result.critModifiers,
      recommendation: result.recommendation,
      levelMatch: result.levelMatch,
    }
  }, [adventurer, expedition, weapon, guildLevel])
}

/**
 * Функция расчёта результата экспедиции с учётом модификаторов
 * Используется при завершении экспедиции
 */
export function calculateExpeditionWithModifiers(
  adventurer: AdventurerExtended,
  expedition: ExpeditionTemplate,
  weapon: CraftedWeapon,
  guildLevel: number
): {
  success: boolean
  isCrit: boolean
  commission: number
  warSoul: number
  glory: number
  weaponWear: number
  weaponLost: boolean
  prediction: ExpeditionPrediction
} {
  const weaponType = getWeaponType(weapon)
  
  // Получаем прогноз
  const result = calculateWithModifiers(
    adventurer,
    expedition,
    guildLevel,
    weapon.attack,
    weapon.quality,
    weaponType,
    weapon.id
  )
  
  // Определяем успех
  const roll = Math.random() * 100
  const success = roll < result.successChance
  
  // Проверяем крит (только при успехе)
  const isCrit = success && Math.random() * 100 < result.critChance
  
  // Потеря оружия (только при провале)
  const weaponLost = !success && Math.random() * 100 < result.weaponLossChance
  
  // Расчёт наград
  let commission = success ? result.commission : 0
  let warSoul = success ? result.warSoul : 0
  
  // Критический успех увеличивает награды
  if (isCrit) {
    commission = Math.floor(commission * 1.5)
    warSoul = Math.floor(warSoul * 2)
  }
  
  // Слава
  const glory = success
    ? (expedition.reward?.baseWarSoul || 5) * 0.1 + 5 + (isCrit ? 5 : 0)
    : 1
  
  return {
    success,
    isCrit,
    commission,
    warSoul,
    glory: Math.floor(glory),
    weaponWear: result.weaponWear,
    weaponLost,
    prediction: {
      successChance: result.successChance,
      commission: result.commission,
      warSoul: result.warSoul,
      weaponWear: result.weaponWear,
      weaponLossChance: result.weaponLossChance,
      critChance: result.critChance,
      successModifiers: result.successModifiers,
      goldModifiers: result.goldModifiers,
      warSoulModifiers: result.warSoulModifiers,
      weaponWearModifiers: result.weaponWearModifiers,
      weaponLossModifiers: result.weaponLossModifiers,
      critModifiers: result.critModifiers,
      recommendation: result.recommendation,
      levelMatch: result.levelMatch,
    },
  }
}

/**
 * Форматирование рейтинга для UI
 */
export function getRatingInfo(rating: string): { color: string; bgColor: string; label: string } {
  switch (rating) {
    case 'excellent':
      return { color: 'text-green-400', bgColor: 'bg-green-900/30', label: 'Отлично' }
    case 'good':
      return { color: 'text-blue-400', bgColor: 'bg-blue-900/30', label: 'Хорошо' }
    case 'risky':
      return { color: 'text-amber-400', bgColor: 'bg-amber-900/30', label: 'Рискованно' }
    case 'dangerous':
      return { color: 'text-red-400', bgColor: 'bg-red-900/30', label: 'Опасно' }
    default:
      return { color: 'text-stone-400', bgColor: 'bg-stone-900/30', label: 'Неизвестно' }
  }
}

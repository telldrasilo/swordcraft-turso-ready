/**
 * Генератор искателей приключений
 */

import {
  generateAdventurerName,
} from '@/data/adventurer-names'
import {
  AdventurerTrait,
  generateTraits,
  calculateTraitsEffect,
} from '@/data/adventurer-traits'
import { WeaponType } from '@/data/weapon-recipes'
import {
  UniqueBonus,
  generateUniqueBonuses,
  calculateBonusEffects,
  getBonusRarityText,
} from '@/data/unique-bonuses'

// ================================
// ТИПЫ
// ================================

export interface WeaponRequirement {
  minAttack: number
  weaponType?: WeaponType
  minQuality?: number
  preferredEnchantment?: string
}

export interface Adventurer {
  id: string
  name: string
  title?: string
  nickname?: string
  skill: number // 0-30 (бонус к War Soul в процентах)
  traits: AdventurerTrait[]
  uniqueBonuses: UniqueBonus[] // Уникальные преимущества (1-3)
  requirements: WeaponRequirement
  portrait: number // ID портрета (для будущей системы портретов)
  expiresAt: number // Timestamp истечения
  createdAt: number
}

// ================================
// КОНСТАНТЫ
// ================================

// Время жизни искателя (4 часа в миллисекундах)
export const ADVENTURER_LIFETIME = 4 * 60 * 60 * 1000

// Количество искателей в пуле
export const ADVENTURER_POOL_SIZE = 4

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

const generateId = (): string => Math.random().toString(36).substring(2, 9)

// Генерация требований к оружию на основе уровня гильдии
function generateWeaponRequirements(guildLevel: number): WeaponRequirement {
  // Базовая атака зависит от уровня гильдии
  const baseAttack = 5 + guildLevel * 8 + Math.floor(Math.random() * 5)

  // Иногда требуем конкретный тип оружия (30% шанс)
  const weaponTypes: WeaponType[] = ['sword', 'axe', 'dagger', 'mace', 'spear', 'hammer']
  const weaponType = Math.random() < 0.3
    ? weaponTypes[Math.floor(Math.random() * weaponTypes.length)]
    : undefined

  // Редко требуем минимальное качество (10% шанс, только для высоких уровней)
  const minQuality = guildLevel >= 3 && Math.random() < 0.1
    ? 30 + guildLevel * 5 + Math.floor(Math.random() * 20)
    : undefined

  return {
    minAttack: baseAttack,
    weaponType,
    minQuality,
    preferredEnchantment: undefined, // TODO: добавить для высоких уровней гильдии
  }
}

// Генерация навыка искателя
function generateSkill(guildLevel: number): number {
  // Базовый навык: 0-30%
  // Уровень гильдии даёт бонус к максимальному навыку
  const maxSkill = 15 + guildLevel * 3 // 18-30 в зависимости от уровня

  // Случайное значение с уклоном к среднему
  const roll = Math.random() + Math.random() // 0-2 с пиком на 1
  const normalized = roll / 2 // 0-1

  return Math.floor(normalized * maxSkill)
}

// ================================
// ОСНОВНЫЕ ФУНКЦИИ
// ================================

/**
 * Генерация одного искателя приключений
 */
export function generateAdventurer(guildLevel: number = 1): Adventurer {
  const skill = generateSkill(guildLevel)
  const nameData = generateAdventurerName(skill)
  const traits = generateTraits(guildLevel)
  const uniqueBonuses = generateUniqueBonuses(guildLevel)
  const requirements = generateWeaponRequirements(guildLevel)

  return {
    id: generateId(),
    name: nameData.name,
    title: nameData.title,
    nickname: nameData.nickname,
    skill,
    traits,
    uniqueBonuses,
    requirements,
    portrait: Math.floor(Math.random() * 20), // 20 возможных портретов
    expiresAt: Date.now() + ADVENTURER_LIFETIME,
    createdAt: Date.now(),
  }
}

/**
 * Генерация пула искателей приключений
 */
export function generateAdventurerPool(guildLevel: number = 1, count: number = ADVENTURER_POOL_SIZE): Adventurer[] {
  const pool: Adventurer[] = []

  for (let i = 0; i < count; i++) {
    pool.push(generateAdventurer(guildLevel))
  }

  // Сортируем по навыку (лучшие сначала)
  pool.sort((a, b) => b.skill - a.skill)

  return pool
}

/**
 * Проверка, истёк ли срок действия искателя
 */
export function isAdventurerExpired(adventurer: Adventurer): boolean {
  return Date.now() >= adventurer.expiresAt
}

/**
 * Получение оставшегося времени в миллисекундах
 */
export function getAdventurerTimeRemaining(adventurer: Adventurer): number {
  return Math.max(0, adventurer.expiresAt - Date.now())
}

/**
 * Форматирование оставшегося времени для отображения
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}ч ${minutes}м`
  }
  if (minutes > 0) {
    return `${minutes}м ${seconds}с`
  }
  return `${seconds}с`
}

/**
 * Получение полного имени искателя (с титулом и прозвищем)
 */
export function getAdventurerFullName(adventurer: { name: string; title?: string; nickname?: string }): string {
  const parts: string[] = []

  if (adventurer.title) {
    parts.push(adventurer.title)
  }

  parts.push(adventurer.name)

  if (adventurer.nickname) {
    parts.push(`"${adventurer.nickname}"`)
  }

  return parts.join(' ')
}

/**
 * Получение строки навыка искателя
 */
export function getAdventurerSkillText(skill: number): { text: string; color: string } {
  if (skill >= 25) {
    return { text: 'Мастер', color: 'text-purple-400' }
  }
  if (skill >= 20) {
    return { text: 'Эксперт', color: 'text-blue-400' }
  }
  if (skill >= 15) {
    return { text: 'Опытный', color: 'text-green-400' }
  }
  if (skill >= 10) {
    return { text: 'Умелый', color: 'text-amber-400' }
  }
  if (skill >= 5) {
    return { text: 'Новичок', color: 'text-stone-400' }
  }
  return { text: 'Ученик', color: 'text-stone-500' }
}

/**
 * Расчёт всех бонусов искателя для экспедиции
 */
export function calculateAdventurerBonuses(adventurer: Adventurer) {
  const traitEffects = calculateTraitsEffect(adventurer.traits)
  const uniqueEffects = calculateBonusEffects(adventurer.uniqueBonuses)

  return {
    // Из черт характера
    successRateBonus: traitEffects.success_rate + uniqueEffects.successBonus,
    bonusChanceBonus: traitEffects.bonus_chance,
    wearModifier: traitEffects.wear - uniqueEffects.wearReduction,
    warSoulBonus: traitEffects.soul_points + adventurer.skill + uniqueEffects.soulBonus,
    durationModifier: traitEffects.duration - uniqueEffects.durationReduction,
    magicBonus: traitEffects.magic,
    weaponLossModifier: traitEffects.weapon_loss - uniqueEffects.lossChanceReduction,
    // Из уникальных бонусов
    goldBonus: uniqueEffects.goldBonus,
    critChance: uniqueEffects.critChance,
    critMultiplier: uniqueEffects.critMultiplier,
    resourceChance: uniqueEffects.resourceChance,
    resourceTypes: uniqueEffects.resourceTypes,
    essenceGuaranteed: uniqueEffects.essenceGuaranteed,
    essenceChance: uniqueEffects.essenceChance,
  }
}

/**
 * Получение текста редкости искателя на основе его бонусов
 */
export function getAdventurerRarityText(adventurer: Adventurer): { text: string; color: string } {
  return getBonusRarityText(adventurer.uniqueBonuses)
}

/**
 * Расчёт предварительных результатов для экспедиции
 */
export function calculateExpeditionPreview(
  adventurer: Adventurer,
  expedition: {
    baseGold: number
    baseWarSoul: number
    duration: number
    successChance: number
    weaponWear: number
    weaponLossChance: number
  }
) {
  const bonuses = calculateAdventurerBonuses(adventurer)

  const estimatedGold = Math.floor(expedition.baseGold * (1 + bonuses.goldBonus / 100))
  const estimatedWarSoul = Math.floor(expedition.baseWarSoul * (1 + bonuses.warSoulBonus / 100))
  const estimatedDuration = Math.max(30, Math.floor(expedition.duration * (1 + bonuses.durationModifier / 100)))
  const estimatedSuccessChance = Math.min(95, Math.max(5, expedition.successChance + bonuses.successRateBonus))
  const estimatedWear = Math.max(0, Math.floor(expedition.weaponWear * (1 + bonuses.wearModifier / 100)))
  const estimatedLossChance = Math.max(0, Math.floor(expedition.weaponLossChance * (1 + bonuses.weaponLossModifier / 100)))

  return {
    gold: estimatedGold,
    warSoul: estimatedWarSoul,
    duration: estimatedDuration,
    successChance: estimatedSuccessChance,
    weaponWear: estimatedWear,
    weaponLossChance: estimatedLossChance,
    // Дополнительные возможности
    hasResourceChance: bonuses.resourceChance > 0,
    resourceChance: bonuses.resourceChance,
    hasEssenceBonus: bonuses.essenceGuaranteed > 0 || bonuses.essenceChance > 0,
    essenceGuaranteed: bonuses.essenceGuaranteed,
    hasCritChance: bonuses.critChance > 0,
    critChance: bonuses.critChance,
    bonuses,
  }
}

/**
 * Проверка соответствия оружия требованиям искателя
 */
export function checkWeaponRequirements(
  adventurer: Adventurer,
  weaponAttack: number,
  weaponType: WeaponType,
  weaponQuality: number
): { meets: boolean; issues: string[] } {
  const issues: string[] = []

  if (weaponAttack < adventurer.requirements.minAttack) {
    issues.push(`Требуется атака ${adventurer.requirements.minAttack}+`)
  }

  if (adventurer.requirements.weaponType && weaponType !== adventurer.requirements.weaponType) {
    issues.push(`Предпочитает ${getWeaponTypeName(adventurer.requirements.weaponType)}`)
  }

  if (adventurer.requirements.minQuality && weaponQuality < adventurer.requirements.minQuality) {
    issues.push(`Требуется качество ${adventurer.requirements.minQuality}+`)
  }

  return {
    meets: issues.length === 0,
    issues,
  }
}

/**
 * Получение названия типа оружия
 */
function getWeaponTypeName(type: WeaponType): string {
  const names: Record<WeaponType, string> = {
    sword: 'меч',
    axe: 'топор',
    dagger: 'кинжал',
    mace: 'булава',
    spear: 'копьё',
    hammer: 'молот',
  }
  return names[type] || type
}

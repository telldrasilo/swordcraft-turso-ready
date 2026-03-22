/**
 * Унифицированная система модификаторов
 * Версия 1.0 — Расширяемая архитектура для всех эффектов
 * 
 * ЦЕЛЬ: Добавление новых параметров и модификаторов БЕЗ изменения calculator
 * 
 * Принципы:
 * 1. Все источники модификаторов реализуют единый интерфейс
 * 2. Реестр собирает модификаторы из всех источников
 * 3. Pipeline обрабатывает модификаторы в едином потоке
 * 4. Условия проверяются через единую систему
 */

import type { ExpeditionDifficulty, ExpeditionType } from '@/data/expedition-templates'
import type { AdventurerExtended, WeaponType } from '@/types/adventurer-extended'

// ================================
// ТИПЫ МОДИФИКАТОРОВ
// ================================

/**
 * Типы значений, на которые могут влиять модификаторы
 */
export type ModifierTarget = 
  | 'successChance'     // Шанс успеха
  | 'gold'              // Золото
  | 'warSoul'           // Души войны
  | 'glory'             // Слава
  | 'weaponWear'        // Износ оружия
  | 'weaponLossChance'  // Шанс потери оружия
  | 'critChance'        // Шанс крита
  | 'commission'        // Комиссия

/**
 * Тип операции модификатора
 */
export type ModifierOperation = 
  | 'add'        // Добавить значение (базовый)
  | 'multiply'   // Умножить (множитель)
  | 'override'   // Переопределить (особые случаи)

/**
 * Условия применения модификатора
 */
export interface ModifierCondition {
  // Условия по сложности миссии
  difficulty?: ExpeditionDifficulty[]
  
  // Условия по типу миссии
  missionType?: ExpeditionType[]
  
  // Условия по типу врага
  enemyType?: string[]
  
  // Условия по уровню искателя
  minLevel?: number
  maxLevel?: number
  
  // Условия по оружию
  weaponType?: WeaponType[]
  preferredWeapon?: boolean
  avoidedWeapon?: boolean
  
  // Условия по редкости
  rarity?: ('common' | 'uncommon' | 'rare' | 'epic' | 'legendary')[]
  
  // Условия по длительности миссии
  minDuration?: number
  maxDuration?: number
  
  // Кастомное условие (функция-предикат)
  customCheck?: string  // Имя функции-проверки
  
  // Случайность (для hot_headed и т.д.)
  random?: {
    min: number
    max: number
  }
}

/**
 * Источник модификатора (для UI и отладки)
 */
export interface ModifierSource {
  type: string          // 'trait' | 'motivation' | 'strength' | 'weakness' | 'combatStyle' | 'socialTag' | 'combatStat' | 'level' | 'rarity' | 'weapon'
  id: string            // ID источника
  name: string          // Название для отображения
  icon: string          // Иконка
  description?: string  // Описание эффекта
}

/**
 * Единый интерфейс модификатора
 */
export interface Modifier {
  // Идентификация
  id: string
  
  // Источник (для UI)
  source: ModifierSource
  
  // Цель (на что влияет)
  target: ModifierTarget
  
  // Операция (как влияет)
  operation: ModifierOperation
  
  // Значение
  value: number
  
  // Условия применения (опционально)
  conditions?: ModifierCondition
  
  // Приоритет (для порядка применения, выше = позже)
  priority?: number
  
  // Флаг отключения
  disabled?: boolean
  
  // Метаданные
  tags?: string[]       // Для фильтрации и группировки
}

/**
 * Контекст для вычисления модификаторов
 */
export interface ModifierContext {
  // Искатель
  adventurer: AdventurerExtended
  
  // Экспедиция
  expedition: {
    id: string
    type: ExpeditionType
    difficulty: ExpeditionDifficulty
    duration: number
    minWeaponAttack: number
    enemyTypes?: string[]
  }
  
  // Оружие
  weapon: {
    id: string
    type: WeaponType
    attack: number
    quality: number
  }
  
  // Гильдия
  guild: {
    level: number
    glory: number
  }
  
  // Контракт (если есть)
  contract?: {
    tier: string
    loyalty: number
  }
  
  // Кэш вычисленных значений
  computed?: Record<string, number>
}

/**
 * Результат применения модификатора
 */
export interface AppliedModifier extends Modifier {
  // Было ли применено
  applied: boolean
  
  // Реальное значение (после условий и вычислений)
  effectiveValue: number
  
  // Причина неприменения (если applied = false)
  skipReason?: string
}

/**
 * Провайдер модификаторов
 * Реализуется каждым источником модификаторов
 */
export interface ModifierProvider {
  // Имя провайдера
  name: string
  
  // Приоритет провайдера
  priority: number
  
  // Получить модификаторы для данного контекста
  getModifiers(context: ModifierContext): Modifier[]
  
  // Проверить, применим ли провайдер
  isApplicable?(context: ModifierContext): boolean
}

/**
 * Результат расчёта всех модификаторов
 */
export interface ModifierCalculationResult {
  // Итоговые значения по целям
  totals: Record<ModifierTarget, number>
  
  // Все применённые модификаторы
  appliedModifiers: AppliedModifier[]
  
  // Детализация по целям
  byTarget: Record<ModifierTarget, AppliedModifier[]>
  
  // Детализация по источникам (для UI)
  bySource: Map<string, AppliedModifier[]>
}

// ================================
// ФАБРИКА МОДИФИКАТОРОВ
// ================================

/**
 * Помощник для создания модификаторов
 */
export class ModifierBuilder {
  private modifier: Partial<Modifier> = {}
  
  static create(id: string): ModifierBuilder {
    const builder = new ModifierBuilder()
    builder.modifier.id = id
    return builder
  }
  
  source(type: string, id: string, name: string, icon: string, description?: string): this {
    this.modifier.source = { type, id, name, icon, description }
    return this
  }
  
  target(target: ModifierTarget): this {
    this.modifier.target = target
    return this
  }
  
  add(value: number): this {
    this.modifier.operation = 'add'
    this.modifier.value = value
    return this
  }
  
  multiply(value: number): this {
    this.modifier.operation = 'multiply'
    this.modifier.value = value
    return this
  }
  
  conditions(conditions: ModifierCondition): this {
    this.modifier.conditions = conditions
    return this
  }
  
  priority(priority: number): this {
    this.modifier.priority = priority
    return this
  }
  
  tags(...tags: string[]): this {
    this.modifier.tags = tags
    return this
  }
  
  build(): Modifier {
    if (!this.modifier.id) throw new Error('Modifier id is required')
    if (!this.modifier.source) throw new Error('Modifier source is required')
    if (!this.modifier.target) throw new Error('Modifier target is required')
    if (!this.modifier.operation) throw new Error('Modifier operation is required')
    if (this.modifier.value === undefined) throw new Error('Modifier value is required')
    
    return {
      id: this.modifier.id,
      source: this.modifier.source,
      target: this.modifier.target,
      operation: this.modifier.operation,
      value: this.modifier.value,
      conditions: this.modifier.conditions,
      priority: this.modifier.priority ?? 0,
      tags: this.modifier.tags,
    }
  }
}

// ================================
// УТИЛИТЫ
// ================================

/**
 * Проверить, выполняются ли условия модификатора
 */
export function checkModifierConditions(
  modifier: Modifier,
  context: ModifierContext
): { passes: boolean; reason?: string } {
  const conditions = modifier.conditions
  if (!conditions) return { passes: true }
  
  const { adventurer, expedition, weapon } = context
  
  // Проверка сложности
  if (conditions.difficulty?.length && !conditions.difficulty.includes(expedition.difficulty)) {
    return { passes: false, reason: `Требуется сложность: ${conditions.difficulty.join(', ')}` }
  }
  
  // Проверка типа миссии
  if (conditions.missionType?.length && !conditions.missionType.includes(expedition.type)) {
    return { passes: false, reason: `Требуется тип миссии: ${conditions.missionType.join(', ')}` }
  }
  
  // Проверка уровня
  const level = adventurer.combat.level
  if (conditions.minLevel !== undefined && level < conditions.minLevel) {
    return { passes: false, reason: `Требуется уровень ${conditions.minLevel}+` }
  }
  if (conditions.maxLevel !== undefined && level > conditions.maxLevel) {
    return { passes: false, reason: `Максимальный уровень ${conditions.maxLevel}` }
  }
  
  // Проверка типа оружия
  if (conditions.weaponType?.length && !conditions.weaponType.includes(weapon.type)) {
    return { passes: false, reason: `Требуется оружие: ${conditions.weaponType.join(', ')}` }
  }
  
  // Проверка предпочитаемого оружия
  if (conditions.preferredWeapon !== undefined) {
    const isPreferred = adventurer.combat.preferredWeapons?.includes(weapon.type)
    if (conditions.preferredWeapon !== isPreferred) {
      return { passes: false, reason: conditions.preferredWeapon ? 'Требуется любимое оружие' : 'Требуется нелюбимое оружие' }
    }
  }
  
  // Проверка избегаемого оружия
  if (conditions.avoidedWeapon !== undefined) {
    const isAvoided = adventurer.combat.avoidedWeapons?.includes(weapon.type)
    if (conditions.avoidedWeapon !== isAvoided) {
      return { passes: false, reason: conditions.avoidedWeapon ? 'Требуется нелюбимое оружие' : 'Оружие в списке избегаемых' }
    }
  }
  
  // Проверка редкости
  if (conditions.rarity?.length && !conditions.rarity.includes(adventurer.combat.rarity)) {
    return { passes: false, reason: `Требуется редкость: ${conditions.rarity.join(', ')}` }
  }
  
  // Проверка длительности
  if (conditions.minDuration !== undefined && expedition.duration < conditions.minDuration) {
    return { passes: false, reason: `Минимальная длительность: ${conditions.minDuration}` }
  }
  if (conditions.maxDuration !== undefined && expedition.duration > conditions.maxDuration) {
    return { passes: false, reason: `Максимальная длительность: ${conditions.maxDuration}` }
  }
  
  // Случайное значение
  if (conditions.random) {
    // Это обрабатывается при вычислении значения
  }
  
  return { passes: true }
}

/**
 * Вычислить эффективное значение модификатора
 */
export function calculateModifierValue(
  modifier: Modifier,
  context: ModifierContext
): number {
  let value = modifier.value
  
  // Обработка случайных значений
  if (modifier.conditions?.random) {
    const { min, max } = modifier.conditions.random
    value = min + Math.random() * (max - min)
  }
  
  return value
}

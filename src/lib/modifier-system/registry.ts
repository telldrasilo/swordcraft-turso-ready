/**
 * Реестр провайдеров модификаторов
 * Центральная точка регистрации всех источников модификаторов
 * 
 * ИСПОЛЬЗОВАНИЕ:
 * 1. Каждый источник модификаторов создаёт свой провайдер
 * 2. Провайдер регистрируется в реестре
 * 3. При расчёте реестр собирает все модификаторы
 */

import type { 
  Modifier, 
  ModifierProvider, 
  ModifierContext, 
  AppliedModifier,
  ModifierCalculationResult,
  ModifierTarget 
} from './types'
import { checkModifierConditions, calculateModifierValue } from './types'

// ================================
// РЕЕСТР ПРОВАЙДЕРОВ
// ================================

class ModifierRegistry {
  private providers: Map<string, ModifierProvider> = new Map()
  private providerOrder: string[] = []
  
  /**
   * Зарегистрировать провайдера модификаторов
   */
  register(provider: ModifierProvider): void {
    if (this.providers.has(provider.name)) {
      console.warn(`Provider "${provider.name}" already registered, replacing`)
    }
    
    this.providers.set(provider.name, provider)
    this.updateProviderOrder()
  }
  
  /**
   * Удалить провайдера
   */
  unregister(providerName: string): void {
    this.providers.delete(providerName)
    this.updateProviderOrder()
  }
  
  /**
   * Получить всех провайдеров в порядке приоритета
   */
  getProviders(): ModifierProvider[] {
    return this.providerOrder.map(name => this.providers.get(name)!).filter(Boolean)
  }
  
  /**
   * Собрать все модификаторы для контекста
   */
  collectModifiers(context: ModifierContext): Modifier[] {
    const allModifiers: Modifier[] = []
    
    for (const provider of this.getProviders()) {
      // Проверка применимости провайдера
      if (provider.isApplicable && !provider.isApplicable(context)) {
        continue
      }
      
      const modifiers = provider.getModifiers(context)
      allModifiers.push(...modifiers)
    }
    
    return allModifiers
  }
  
  /**
   * Вычислить все модификаторы для контекста
   */
  calculate(context: ModifierContext, baseValues: Record<ModifierTarget, number>): ModifierCalculationResult {
    const modifiers = this.collectModifiers(context)
    
    // Сортировка по приоритету
    modifiers.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
    
    // Инициализация результатов
    const totals: Record<ModifierTarget, number> = { ...baseValues }
    const appliedModifiers: AppliedModifier[] = []
    const byTarget: Record<ModifierTarget, AppliedModifier[]> = {
      successChance: [],
      gold: [],
      warSoul: [],
      glory: [],
      weaponWear: [],
      weaponLossChance: [],
      critChance: [],
      commission: [],
    }
    const bySource = new Map<string, AppliedModifier[]>()
    
    // Применение модификаторов
    for (const modifier of modifiers) {
      if (modifier.disabled) continue
      
      // Проверка условий
      const conditionCheck = checkModifierConditions(modifier, context)
      
      if (!conditionCheck.passes) {
        // Сохраняем неприменённый модификатор для информации
        const applied: AppliedModifier = {
          ...modifier,
          applied: false,
          effectiveValue: 0,
          skipReason: conditionCheck.reason,
        }
        appliedModifiers.push(applied)
        continue
      }
      
      // Вычисление значения
      const effectiveValue = calculateModifierValue(modifier, context)
      
      // Применение к итоговому значению
      switch (modifier.operation) {
        case 'add':
          totals[modifier.target] += effectiveValue
          break
        case 'multiply':
          totals[modifier.target] *= effectiveValue
          break
        case 'override':
          totals[modifier.target] = effectiveValue
          break
      }
      
      // Создание записи о применённом модификаторе
      const applied: AppliedModifier = {
        ...modifier,
        applied: true,
        effectiveValue,
      }
      
      appliedModifiers.push(applied)
      byTarget[modifier.target].push(applied)
      
      // Группировка по источнику
      const sourceKey = `${modifier.source.type}:${modifier.source.id}`
      if (!bySource.has(sourceKey)) {
        bySource.set(sourceKey, [])
      }
      bySource.get(sourceKey)!.push(applied)
    }
    
    return {
      totals,
      appliedModifiers,
      byTarget,
      bySource,
    }
  }
  
  private updateProviderOrder(): void {
    const providers = Array.from(this.providers.values())
    providers.sort((a, b) => a.priority - b.priority)
    this.providerOrder = providers.map(p => p.name)
  }
}

// Глобальный экземпляр реестра
export const modifierRegistry = new ModifierRegistry()

// ================================
// ДЕКОРАТОР ДЛЯ РЕГИСТРАЦИИ
// ================================

/**
 * Декоратор для автоматической регистрации провайдера
 */
export function RegisterModifierProvider(constructor: new () => ModifierProvider): void {
  const provider = new constructor()
  modifierRegistry.register(provider)
}

// ================================
// ЭКСПОРТ ФУНКЦИЙ
// ================================

/**
 * Вычислить модификаторы (удобная обёртка)
 */
export function calculateModifiers(
  context: ModifierContext,
  baseValues: Record<ModifierTarget, number>
): ModifierCalculationResult {
  return modifierRegistry.calculate(context, baseValues)
}

/**
 * Получить все модификаторы (для отладки)
 */
export function getAllModifiers(context: ModifierContext): Modifier[] {
  return modifierRegistry.collectModifiers(context)
}

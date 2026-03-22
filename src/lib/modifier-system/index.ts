/**
 * Точка входа системы модификаторов
 * 
 * ИМПОРТ ЭТОГО ФАЙЛА АВТОМАТИЧЕСКИ РЕГИСТРИРУЕТ ВСЕХ ПРОВАЙДЕРОВ
 */

// Типы
export * from './types'

// Реестр
export { modifierRegistry, calculateModifiers, getAllModifiers } from './registry'

// Провайдеры (импорт регистрирует их автоматически)
import './providers/combat-stats-provider'
import './providers/level-rarity-provider'
import './providers/personality-traits-provider'
import './providers/motivations-provider'
import './providers/social-tags-provider'
import './providers/strengths-weaknesses-provider'
import './providers/combat-style-provider'

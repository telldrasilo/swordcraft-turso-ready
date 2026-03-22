/**
 * Индекс модуля тэгов искателей
 */

export * from './personality-traits'
export * from './motivations'
export * from './social-tags'
export * from './combat-styles'
export * from './strengths'
export * from './weaknesses'

// Реэкспорт типов
import type { 
  PersonalityTraitId, MotivationId, SocialTagId, 
  CombatStyleId, StrengthId, WeaknessId 
} from '@/types/adventurer-extended'

/**
 * Система крафта v2.0
 * Типы данных для новой системы крафта
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md
 */

// ================================
// КАТЕГОРИИ И БАЗОВЫЕ ТИПЫ
// ================================

/** Категория материала */
export type MaterialCategory = 'metal' | 'alloy' | 'wood' | 'leather' | 'gem' | 'bone' | 'magical' | string

/** Редкость */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/** Тип доминирующего свойства для суффикса */
export type DominantPropertyType = 'sharpness' | 'durability' | 'balance' | 'conductivity' | 'lightness'

/** Категория этапа */
export type StageCategory = 'preparation' | 'processing' | 'forming' | 'assembly' | 'finishing'

/** Качество оружия */
export type QualityGrade = 'poor' | 'common' | 'good' | 'excellent' | 'masterpiece' | 'legendary'

// ================================
// МАТЕРИАЛ
// ================================

/** Физические свойства материала */
export interface MaterialProperties {
  hardness: number       // 1-100 — твёрдость
  flexibility: number    // 1-100 — гибкость
  weight: number         // относительный вес
  conductivity: number   // 1-100 — проводимость (магия)
}

/** Крафтовые свойства материала */
export interface MaterialCrafting {
  workability: number    // 1-100 — обрабатываемость
  meltingPoint: number   // температура плавления
  requiredHeat: number   // требуемый уровень нагрева
}

/** Эффекты материала на оружие */
export interface MaterialWeaponEffects {
  attackBonus: number       // бонус к атаке (%)
  durabilityBonus: number   // бонус к прочности (%)
  soulCapacity: number      // вместимость Души Войны
  repairPotential: number   // множитель ремонта (0.5-2.0)
  enchantPower: number      // сила зачарований (множитель)
  enchantSlots: number      // дополнительные слоты
}

/** Доминирующее свойство для суффикса */
export interface DominantProperty {
  type: DominantPropertyType
  value: number
}

/** Условия окружения */
export interface EnvironmentConditions {
  required?: string[]    // требуемые условия: 'cold', 'night', 'sacred_ground'...
  forbidden?: string[]   // запрещённые условия: 'heat', 'day'...
}

/** Ограничения на этапы */
export interface StageRestrictions {
  allowed?: string[]                                  // только эти этапы разрешены
  forbidden?: string[]                                // эти этапы запрещены
  replacements?: Record<string, string>               // замена стандартных этапов
}

/** Профиль обработки материала */
export interface ProcessingProfile {
  environment?: EnvironmentConditions
  stages?: StageRestrictions
}

/** Источник материала */
export interface MaterialSource {
  rarity: Rarity
  unlockCondition?: string
}

/** Рецепт создания материала (для сплавов и обработанных материалов) */
export interface MaterialRecipe {
  /** Требуемое сырьё: { id: string, quantity: number } */
  inputs: { resourceId: string; quantity: number; name?: string }[]
  /** Требуемое топливо */
  fuel?: { resourceId: string; quantity: number }
  /** Требуемый уровень кузнеца */
  requiredLevel?: number
}

/** Материал */
export interface Material {
  id: string
  name: string                    // "Сталь", "Железо", "Небесное железо"
  adjective: string               // "Стальной", "Железный", "Небесный" — для префикса оружия
  category: MaterialCategory
  description?: string
  
  properties: MaterialProperties
  crafting: MaterialCrafting
  weaponEffects: MaterialWeaponEffects
  
  // БАЛАНС:
  /** Множитель времени крафта (1.0 = норма, 0.85 = -15%, 1.2 = +20%) */
  craftTimeModifier: number
  /** Риск при крафте (0-100%, шанс снижения качества) */
  craftRisk?: number
  
  dominantProperty?: DominantProperty
  
  source: MaterialSource
  processingProfile?: ProcessingProfile
  
  // РЕЦЕПТ (для создаваемых материалов):
  /** Если материал создаётся из сырья — здесь указывается рецепт */
  recipe?: MaterialRecipe
  
  // Иконка
  icon?: string
}

// ================================
// ЭТАП КРАФТА
// ================================

/** Модификаторы длительности этапа */
export interface DurationModifiers {
  skill?: string      // "blacksmith.level" → -X% за уровень
  tool?: string       // "forge.level" → -X% за уровень
  material?: string   // "material.workability" → обратная зависимость
}

/** Сообщения этапа */
export interface StageMessages {
  start: string[]
  progress?: string[]
  complete: string[]
}

/** Результат этапа */
export interface StageResult {
  type: 'quality_modifier' | 'stat_bonus' | 'part_created'
  value: number
}

/** Требования к ингредиентам для этапа */
export interface StageRequirements {
  ingredients: { id: string; quantity: number }[]
}

/** Определение типа этапа (из библиотеки) */
export interface StageTypeDefinition {
  id: string
  category: StageCategory
  type: string
  name: string
  description: string
  baseDuration: number
  durationModifiers?: DurationModifiers
  messages: StageMessages
  result?: StageResult
  requirements?: StageRequirements
  environmentRequired?: string[]
}

/** Экземпляр этапа в процессе крафта */
export interface CraftStageInstance {
  id: string                      // уникальный ID экземпляра
  stageTypeId: string             // ID из библиотеки
  name: string
  category: StageCategory
  
  // Материал и цель
  materialId?: string             // какой материал обрабатывается
  target?: string                 // 'blade', 'guard', 'grip', 'pommel', 'all'
  
  // Время
  baseDuration: number
  calculatedDuration: number      // с учётом модификаторов
  
  // Состояние
  status: 'pending' | 'in_progress' | 'completed'
  startTime?: number
  endTime?: number
  progress: number                // 0-100
  
  // Сообщения
  startMessage?: string
  completeMessage?: string
  
  // Требования
  requirements?: StageRequirements
  environmentRequired?: string[]
}

// ================================
// ТЕХНИКА
// ================================

/** Эффекты техники */
export interface TechniqueEffects {
  qualityBonus?: number
  durabilityBonus?: number
  conductivityBonus?: number
  appliesTo: string[]   // к каким частям применяется: ['blade'], ['all']
}

/** Модификация процесса техникой */
export interface ProcessMods {
  replaceStage?: Record<string, string>   // замена этапа: { 'fin_hardening': 'fin_celestial_hardening' }
  addStage?: {
    after?: string
    before?: string
    stage: string
  }
}

/** Источник техники */
export interface TechniqueSource {
  type: 'start' | 'guild' | 'dungeon' | string
  condition?: string
}

/** Штрафы техники (цена за бонусы) */
export interface TechniquePenalties {
  /** Множитель времени крафта (1.2 = +20% времени) */
  durationMultiplier?: number
  /** Риск провала/брака (0-100%) */
  riskOfFailure?: number
  /** Штраф к качеству при успехе */
  qualityPenalty?: number
  /** Штраф к прочности */
  durabilityPenalty?: number
  /** Дополнительный расход материала (0.1 = +10% расход) */
  materialWaste?: number
}

/** Совместимость техники с материалами */
export interface TechniqueCompatibility {
  /** Материалы, к которым применяется техника ('*' = все) */
  appliesToMaterials?: string[]
  /** Материалы, с которыми техника НЕ совместима */
  incompatibleMaterials?: string[]
  /** Категории материалов, к которым применяется */
  appliesToCategories?: MaterialCategory[]
  /** Части оружия, к которым применяется */
  appliesToParts?: string[]
}

/** Техника */
export interface Technique {
  id: string
  name: string
  description: string
  
  effects: TechniqueEffects
  penalties?: TechniquePenalties
  compatibility?: TechniqueCompatibility
  processMods?: ProcessMods
  
  source: TechniqueSource
  
  // Требования
  requiredLevel?: number
  requiredMaterials?: string[]
}

// ================================
// РЕЦЕПТ
// ================================

/** Часть оружия в рецепте */
export interface RecipePart {
  id: string                      // 'blade', 'guard', 'grip', 'pommel'
  name: string                    // "Лезвие", "Гарда", "Рукоять", "Навершие"
  materialTypes: MaterialCategory[] // допустимые типы материалов
  minQuantity: number
  maxQuantity: number
  optional?: boolean
}

/** Базовые параметры рецепта */
export interface RecipeBaseStats {
  attackBase: number
  durabilityBase: number
  weightBase: number
  soulCapacityBase: number
}

/** Источник рецепта */
export interface RecipeSource {
  rarity: Rarity
  unlockCondition?: string
}

/** Рецепт оружия */
export interface WeaponRecipe {
  id: string
  name: string                    // "меч", "топор", "кинжал"
  type: string                    // 'sword', 'axe', 'dagger'...
  description?: string
  
  parts: RecipePart[]
  combatPart: string              // какая часть определяет префикс: 'blade'
  
  baseStats: RecipeBaseStats
  stages: RecipeStageConfig[]     // конфигурация этапов
  
  source: RecipeSource
  
  // Требования
  requiredLevel?: number
}

/** Конфигурация этапа в рецепте */
export interface RecipeStageConfig {
  stageType: string               // ID из библиотеки этапов
  material?: string               // какой материал используется
  target?: string                 // над какой частью
}

// ================================
// ПРОЦЕСС КРАФТА
// ================================

/** Выбор материалов для крафта */
export interface MaterialAssignment {
  [partId: string]: {
    materialId: string
    quantity: number
  }
}

/** План крафта (перед запуском) */
export interface CraftPlan {
  recipeId: string
  materials: MaterialAssignment
  techniques: string[]            // ID выбранных техник
  
  // Предварительный расчёт
  estimatedTime: number
  estimatedStats: WeaponStats
  estimatedQuality: QualityGrade
}

/** Характеристики оружия */
export interface WeaponStats {
  attack: number
  durability: number
  maxDurability: number
  weight: number
  balance: number
  soulCapacity: number
  repairPotential: number
  enchantSlots: number
  enchantPower: number
}

/** Активный процесс крафта v2 */
export interface ActiveCraftV2 {
  id: string
  plan: CraftPlan
  
  // Этапы
  stages: CraftStageInstance[]
  currentStageIndex: number
  
  // Время
  startTime: number
  totalDuration: number
  elapsedTime: number
  
  // Состояние
  status: 'planning' | 'running' | 'paused' | 'completed' | 'cancelled'
  
  // Лог
  log: CraftLogEntry[]
  
  // Результат (после завершения)
  result?: CraftedWeaponV2
}

/** Запись в логе крафта */
export interface CraftLogEntry {
  timestamp: number
  stageId: string
  stageName: string
  message: string
  type: 'start' | 'progress' | 'complete' | 'error'
}

// ================================
// ЗАЧАРОВАНИЯ
// ================================

/** Зачарование на оружии */
export interface WeaponEnchantment {
  id: string
  enchantmentId: string
  appliedAt: number
}

// ================================
// ГОТОВОЕ ОРУЖИЕ v2
// ================================

/** Созданное оружие v2 */
export interface CraftedWeaponV2 {
  id: string
  recipeId: string
  
  // Имя
  prefix: string                  // "Стальной"
  baseName: string                // "меч"
  suffix: string                  // "остроты II"
  fullName: string                // "Стальной меч остроты II"
  
  // Тип и тир
  type: string
  tier: number
  
  // Материалы
  materials: {
    partId: string
    materialId: string
    materialName: string
    quantity: number
  }[]
  
  // Характеристики
  stats: WeaponStats
  
  // Качество
  quality: number
  qualityGrade: QualityGrade
  
  // Душа Войны
  warSoul: number
  maxWarSoul: number
  
  // Зачарования
  enchantments?: WeaponEnchantment[]
  
  // История
  createdAt: number
  adventureCount: number
  
  // Цена
  sellPrice: number
}

// ================================
// ГЛОБАЛЬНЫЕ НАСТРОЙКИ
// ================================

/** Глобальные настройки игры */
export interface GameConfig {
  /** Глобальный множитель скорости крафта */
  craftSpeedMultiplier: number
  /** Базовый множитель качества от навыка */
  skillQualityMultiplier: number
  /** Базовый множитель времени от навыка */
  skillTimeMultiplier: number
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  craftSpeedMultiplier: 1.0,
  skillQualityMultiplier: 0.03,  // +3% качества за уровень
  skillTimeMultiplier: 0.03,     // -3% времени за уровень
}

// ================================
// ГРАДАЦИИ КАЧЕСТВА
// ================================

export const QUALITY_GRADES_CONFIG: { 
  min: number
  max: number
  grade: QualityGrade
  multiplier: number
  color: string
  nameRu: string 
}[] = [
  { min: 0, max: 30, grade: 'poor', multiplier: 0.7, color: 'text-red-400', nameRu: 'Плохое' },
  { min: 31, max: 50, grade: 'common', multiplier: 1.0, color: 'text-gray-400', nameRu: 'Обычное' },
  { min: 51, max: 70, grade: 'good', multiplier: 1.1, color: 'text-green-400', nameRu: 'Хорошее' },
  { min: 71, max: 85, grade: 'excellent', multiplier: 1.2, color: 'text-blue-400', nameRu: 'Отличное' },
  { min: 86, max: 95, grade: 'masterpiece', multiplier: 1.35, color: 'text-purple-400', nameRu: 'Шедевр' },
  { min: 96, max: 100, grade: 'legendary', multiplier: 1.5, color: 'text-amber-400', nameRu: 'Легендарное' },
]

/** Получить градацию качества */
export function getQualityGrade(quality: number): QualityGrade {
  const grade = QUALITY_GRADES_CONFIG.find(g => quality >= g.min && quality <= g.max)
  return grade?.grade ?? 'common'
}

/** Получить множитель качества */
export function getQualityMultiplier(quality: number): number {
  const grade = QUALITY_GRADES_CONFIG.find(g => quality >= g.min && quality <= g.max)
  return grade?.multiplier ?? 1.0
}

/** Получить цвет качества */
export function getQualityColor(quality: number): string {
  const grade = QUALITY_GRADES_CONFIG.find(g => quality >= g.min && quality <= g.max)
  return grade?.color ?? 'text-gray-400'
}

/** Получить название качества */
export function getQualityNameRu(quality: number): string {
  const grade = QUALITY_GRADES_CONFIG.find(g => quality >= g.min && quality <= g.max)
  return grade?.nameRu ?? 'Обычное'
}

// ================================
// СУФФИКСЫ ОРУЖИЯ
// ================================

export const SUFFIX_RULES: {
  property: DominantPropertyType
  name: string
  threshold: number
  levelStep: number
}[] = [
  { property: 'sharpness', name: 'остроты', threshold: 60, levelStep: 10 },
  { property: 'durability', name: 'прочности', threshold: 70, levelStep: 10 },
  { property: 'balance', name: 'баланса', threshold: 75, levelStep: 8 },
  { property: 'conductivity', name: 'проводимости', threshold: 50, levelStep: 15 },
  { property: 'lightness', name: 'лёгкости', threshold: 80, levelStep: 5 },
]

/** Римские цифры */
export const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V']

/** Рассчитать уровень суффикса */
export function calculateSuffixLevel(value: number, threshold: number, step: number): number {
  if (value < threshold) return 0
  return Math.min(5, Math.floor((value - threshold) / step) + 1)
}

/**
 * Расширенный генератор искателей приключений
 * Версия 2.0 — Система контрактов и расширенные механики
 */

import {
  AdventurerExtended,
  AdventurerIdentity,
  CombatStats,
  Personality,
  WeaponRequirement,
  Gender,
  Rarity,
  WeaponType,
  AdventurerTrait,
  UniqueBonus,
} from '@/types/adventurer-extended'

// Импорт системы редкости
import {
  generateRarity,
  generateLevel,
  getRarityConfig,
  RARITY_CONFIG,
} from '@/data/adventurer-rarity'

// Импорт тэгов
import {
  generatePersonalityTraits,
  getPersonalityTraitById,
  personalityTraits,
} from '@/data/adventurer-tags/personality-traits'
import {
  generateMotivations,
} from '@/data/adventurer-tags/motivations'
import {
  generateSocialTag,
  getSocialTagById,
} from '@/data/adventurer-tags/social-tags'
import {
  getRandomCombatStyle,
  getCombatStyleById,
} from '@/data/adventurer-tags/combat-styles'
import {
  generateStrengths,
  getStrengthById,
} from '@/data/adventurer-tags/strengths'
import {
  generateWeaknesses,
  getWeaknessById,
} from '@/data/adventurer-tags/weaknesses'

// Импорт существующей системы черт
import {
  generateTraits,
  calculateTraitsEffect,
} from '@/data/adventurer-traits'

// Импорт существующей системы бонусов
import {
  generateUniqueBonuses,
  calculateBonusEffects,
} from '@/data/unique-bonuses'

// ================================
// КОНСТАНТЫ
// ================================

export const ADVENTURER_LIFETIME = 4 * 60 * 60 * 1000 // 4 часа
export const ADVENTURER_POOL_SIZE = 4

// База имён
const MALE_NAMES = [
  'Гордон', 'Торин', 'Бран', 'Рикар', 'Магнус', 'Эдвард', 'Виктор', 'Александр',
  'Дмитрий', 'Николай', 'Сергей', 'Андрей', 'Михаил', 'Артём', 'Максим', 'Пётр',
  'Иван', 'Борис', 'Владимир', 'Ярослав', 'Святослав', 'Мстислав', 'Всеволод',
]

const FEMALE_NAMES = [
  'Мира', 'Эльза', 'Виктория', 'Анастасия', 'Елена', 'Анна', 'Мария', 'София',
  'Дарья', 'Александра', 'Наталья', 'Ольга', 'Татьяна', 'Ирина', 'Екатерина',
  'Варвара', 'Агата', 'Зоя', 'Любовь', 'Надежда', 'Вера', 'Яна',
]

const LAST_NAMES = [
  'Стальной', 'Железнорукий', 'Сокол', 'Волк', 'Медведь', 'Громовой', 'Огненный',
  'Ледяной', 'Ветряный', 'Теневой', 'Серебряный', 'Золотой', 'Бронзовый',
  'Быстрый', 'Сильный', 'Мудрый', 'Храбрый', 'Неуловимый', 'Бесстрашный',
]

const NICKNAMES = {
  male: [
    'Одноглазый', 'Железный', 'Кровавый', 'Тихий', 'Неуловимый', 'Свирепый',
    'Мудрый', 'Быстрый', 'Сильный', 'Старый', 'Молодой', 'Странник',
  ],
  female: [
    'Ночная', 'Тихая', 'Неуловимая', 'Стальная', 'Дикая', 'Свободная',
    'Загадочная', 'Быстрая', 'Хитрая', 'Смелая', 'Странница', 'Теневая',
  ],
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

const generateId = (): string => Math.random().toString(36).substring(2, 9)

// Генерация пола
function generateGender(): Gender {
  return Math.random() < 0.5 ? 'male' : 'female'
}

// Генерация имени
function generateName(gender: Gender): {
  firstName: string
  lastName?: string
  nickname?: string
} {
  const names = gender === 'male' ? MALE_NAMES : FEMALE_NAMES
  const firstName = names[Math.floor(Math.random() * names.length)]
  
  // 60% шанс иметь фамилию
  const hasLastName = Math.random() < 0.6
  const lastName = hasLastName 
    ? LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)] 
    : undefined
  
  // 25% шанс иметь прозвище
  const hasNickname = Math.random() < 0.25
  const nicknames = NICKNAMES[gender]
  const nickname = hasNickname 
    ? nicknames[Math.floor(Math.random() * nicknames.length)] 
    : undefined
  
  return { firstName, lastName, nickname }
}

// Генерация идентичности
function generateIdentity(): AdventurerIdentity {
  const gender = generateGender()
  const nameData = generateName(gender)
  
  return {
    ...nameData,
    gender,
    portraitId: Math.floor(Math.random() * 20),
  }
}

// Генерация боевых характеристик
function generateCombatStats(
  rarity: Rarity,
  guildLevel: number
): CombatStats {
  const config = getRarityConfig(rarity)
  const level = generateLevel(rarity)
  const combatStyle = getRandomCombatStyle()
  
  // Базовые статы (10-25) + бонус от редкости + бонус от уровня
  const baseStat = () => 10 + Math.floor(Math.random() * 16)
  const levelBonus = Math.floor(level / 5)
  
  const baseStats = {
    power: baseStat(),
    precision: baseStat(),
    endurance: baseStat(),
    luck: baseStat(),
  }
  
  // Применяем бонусы от редкости
  const finalStats = {
    power: Math.min(50, baseStats.power + config.statBonus.power + levelBonus),
    precision: Math.min(50, baseStats.precision + config.statBonus.precision + levelBonus),
    endurance: Math.min(50, baseStats.endurance + config.statBonus.endurance + levelBonus),
    luck: Math.min(50, baseStats.luck + config.statBonus.luck),
  }
  
  // Применяем модификаторы стиля боя
  const styleMods = combatStyle.statModifiers
  if (styleMods.power) finalStats.power = Math.max(1, Math.min(50, finalStats.power + styleMods.power))
  if (styleMods.precision) finalStats.precision = Math.max(1, Math.min(50, finalStats.precision + styleMods.precision))
  if (styleMods.endurance) finalStats.endurance = Math.max(1, Math.min(50, finalStats.endurance + styleMods.endurance))
  if (styleMods.luck) finalStats.luck = Math.max(1, Math.min(50, finalStats.luck + styleMods.luck))
  
  return {
    level,
    rarity,
    ...finalStats,
    combatStyle: combatStyle.id,
    preferredWeapons: combatStyle.preferredWeapons,
    avoidedWeapons: combatStyle.avoidedWeapons,
  }
}

// Генерация личности
function generatePersonality(): Personality {
  const { primary, secondary } = generatePersonalityTraits()
  const motivations = generateMotivations()
  const socialTag = generateSocialTag()
  
  // Определение толерантности к риску на основе характера
  let riskTolerance: 'cautious' | 'balanced' | 'reckless' = 'balanced'
  if (primary.id === 'cautious' || primary.id === 'survivor') {
    riskTolerance = 'cautious'
  } else if (primary.id === 'reckless' || primary.id === 'brave') {
    riskTolerance = 'reckless'
  }
  
  return {
    primaryTrait: primary.id,
    secondaryTrait: secondary?.id,
    riskTolerance,
    motivations,
    socialTags: [socialTag],
  }
}

// Генерация требований к оружию
function generateWeaponRequirements(
  combat: CombatStats,
  guildLevel: number
): WeaponRequirement {
  const baseAttack = 5 + combat.level * 2 + Math.floor(Math.random() * 5)
  
  // 30% шанс требования конкретного типа оружия
  const allWeapons: WeaponType[] = ['sword', 'axe', 'dagger', 'mace', 'spear', 'hammer']
  const preferredWeapons = combat.preferredWeapons.length > 0 
    ? combat.preferredWeapons 
    : allWeapons
  const weaponType = Math.random() < 0.3
    ? preferredWeapons[Math.floor(Math.random() * preferredWeapons.length)]
    : undefined
  
  // 10% шанс требования качества для редких+
  const minQuality = combat.rarity !== 'common' && Math.random() < 0.1
    ? 30 + combat.level + Math.floor(Math.random() * 20)
    : undefined
  
  return {
    minAttack: baseAttack,
    weaponType,
    minQuality,
  }
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ФОРМАТИРОВАНИЯ
// ================================

/**
 * Форматирование эффектов силы в строку
 */
function formatStrengthEffects(effects: {
  successBonus: number
  goldBonus: number
  warSoulBonus: number
  weaponLossReduction: number
  weaponWearReduction: number
}): string {
  const parts: string[] = []
  if (effects.successBonus !== 0) parts.push(`Успех: ${effects.successBonus > 0 ? '+' : ''}${effects.successBonus}%`)
  if (effects.goldBonus !== 0) parts.push(`Золото: ${effects.goldBonus > 0 ? '+' : ''}${effects.goldBonus}%`)
  if (effects.warSoulBonus !== 0) parts.push(`Души: ${effects.warSoulBonus > 0 ? '+' : ''}${effects.warSoulBonus}%`)
  if (effects.weaponLossReduction !== 0) parts.push(`Потеря оружия: -${effects.weaponLossReduction}%`)
  if (effects.weaponWearReduction !== 0) parts.push(`Износ оружия: -${effects.weaponWearReduction}%`)
  return parts.join(', ') || 'Нет эффекта'
}

/**
 * Форматирование эффектов слабости в строку
 */
function formatWeaknessEffects(effects: {
  successPenalty: number
  goldPenalty: number
  warSoulPenalty: number
  weaponLossIncrease: number
  weaponWearIncrease: number
  refuseChanceBonus: number
}): string {
  const parts: string[] = []
  if (effects.successPenalty !== 0) parts.push(`Успех: ${effects.successPenalty}%`)
  if (effects.goldPenalty !== 0) parts.push(`Золото: -${effects.goldPenalty}%`)
  if (effects.warSoulPenalty !== 0) parts.push(`Души: -${effects.warSoulPenalty}%`)
  if (effects.weaponLossIncrease !== 0) parts.push(`Потеря оружия: +${effects.weaponLossIncrease}%`)
  if (effects.weaponWearIncrease !== 0) parts.push(`Износ оружия: +${effects.weaponWearIncrease}%`)
  if (effects.refuseChanceBonus !== 0) parts.push(`Отказ: +${effects.refuseChanceBonus}%`)
  return parts.join(', ') || 'Нет эффекта'
}

// ================================
// ОСНОВНЫЕ ФУНКЦИИ
// ================================

/**
 * Генерация одного расширенного искателя
 */
export function generateExtendedAdventurer(guildLevel: number = 1): AdventurerExtended {
  const rarity = generateRarity(guildLevel)
  const config = getRarityConfig(rarity)
  
  // Генерация компонентов
  const identity = generateIdentity()
  const combat = generateCombatStats(rarity, guildLevel)
  const personality = generatePersonality()
  const requirements = generateWeaponRequirements(combat, guildLevel)
  
  // Генерация черт (существующая система)
  const traits = generateTraits(guildLevel)
  
  // Генерация уникальных бонусов (существующая система)
  const uniqueBonuses = generateUniqueBonuses(guildLevel)
  
  // Генерация сильных сторон
  const strengthIds = generateStrengths(config.maxStrengths)
  const strengths = strengthIds.map(id => {
    const data = getStrengthById(id)!
    return {
      id,
      name: data.name,
      description: data.description,
      effect: formatStrengthEffects(data.effects),
    }
  })
  
  // Генерация слабостей
  const weaknessIds = generateWeaknesses(rarity)
  const weaknesses = weaknessIds.map(id => {
    const data = getWeaknessById(id)!
    // Собираем все условия в один массив
    const appliesTo: string[] = []
    if (data.conditions?.difficulty) appliesTo.push(...data.conditions.difficulty)
    if (data.conditions?.missionType) appliesTo.push(...data.conditions.missionType)
    
    return {
      id,
      name: data.name,
      description: data.description,
      penalty: Math.abs(data.effects.successPenalty), // Положительное число для UI
      appliesTo: appliesTo.length > 0 ? appliesTo : undefined,
    }
  })
  
  return {
    id: generateId(),
    identity,
    combat,
    personality,
    traits: traits.map(t => ({
      id: t.id,
      name: t.name,
      icon: t.icon,
      description: t.description,
      effects: { [t.effect.type]: t.effect.value },
    })),
    uniqueBonuses,
    strengths,
    weaknesses,
    requirements,
    createdAt: Date.now(),
    expiresAt: Date.now() + ADVENTURER_LIFETIME,
  }
}

/**
 * Генерация пула искателей
 */
export function generateAdventurerPool(
  guildLevel: number = 1,
  count: number = ADVENTURER_POOL_SIZE
): AdventurerExtended[] {
  const pool: AdventurerExtended[] = []
  
  for (let i = 0; i < count; i++) {
    pool.push(generateExtendedAdventurer(guildLevel))
  }
  
  // Сортировка по уровню и редкости
  pool.sort((a, b) => {
    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 }
    const rarityDiff = rarityOrder[b.combat.rarity] - rarityOrder[a.combat.rarity]
    if (rarityDiff !== 0) return rarityDiff
    return b.combat.level - a.combat.level
  })
  
  return pool
}

// ================================
// СОВМЕСТИМОСТЬ СО СТАРОЙ СИСТЕМОЙ
// ================================

// Старый интерфейс Adventurer для совместимости
export interface AdventurerLegacy {
  id: string
  name: string
  title?: string
  nickname?: string
  skill: number
  traits: AdventurerTrait[]
  uniqueBonuses: UniqueBonus[]
  requirements: WeaponRequirement
  portrait: number
  expiresAt: number
  createdAt: number
}

/**
 * Конвертация расширенного искателя в старый формат
 */
export function toLegacyAdventurer(extended: AdventurerExtended): AdventurerLegacy {
  return {
    id: extended.id,
    name: `${extended.identity.firstName}${extended.identity.lastName ? ' ' + extended.identity.lastName : ''}`,
    title: extended.identity.nickname,
    nickname: extended.identity.nickname,
    skill: extended.combat.power, // Используем силу как навык
    traits: extended.traits,
    uniqueBonuses: extended.uniqueBonuses,
    requirements: extended.requirements,
    portrait: extended.identity.portraitId,
    expiresAt: extended.expiresAt,
    createdAt: extended.createdAt,
  }
}

/**
 * Генерация искателя в старом формате (для совместимости)
 */
export function generateAdventurer(guildLevel: number = 1): AdventurerLegacy {
  return toLegacyAdventurer(generateExtendedAdventurer(guildLevel))
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ UI
// ================================

/**
 * Получение полного имени искателя
 */
export function getAdventurerFullName(adventurer: AdventurerExtended | AdventurerLegacy): string {
  if ('identity' in adventurer) {
    const parts: string[] = []
    if (adventurer.identity.lastName) {
      parts.push(adventurer.identity.lastName)
    }
    parts.push(adventurer.identity.firstName)
    if (adventurer.identity.nickname) {
      parts.push(`"${adventurer.identity.nickname}"`)
    }
    return parts.join(' ')
  }
  
  // Старый формат
  const parts: string[] = []
  if (adventurer.title) parts.push(adventurer.title)
  parts.push(adventurer.name)
  if (adventurer.nickname) parts.push(`"${adventurer.nickname}"`)
  return parts.join(' ')
}

/**
 * Проверка истечения срока
 */
export function isAdventurerExpired(adventurer: { expiresAt: number }): boolean {
  return Date.now() >= adventurer.expiresAt
}

/**
 * Получение оставшегося времени
 */
export function getAdventurerTimeRemaining(adventurer: { expiresAt: number }): number {
  return Math.max(0, adventurer.expiresAt - Date.now())
}

/**
 * Форматирование времени
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) return `${hours}ч ${minutes}м`
  if (minutes > 0) return `${minutes}м ${seconds}с`
  return `${seconds}с`
}

/**
 * Получение текста редкости
 */
export function getAdventurerRarityText(rarity: Rarity): { text: string; color: string } {
  const config = getRarityConfig(rarity)
  return {
    text: config.nameRu,
    color: config.textColor,
  }
}

/**
 * Расчёт бонусов искателя для экспедиции
 */
export function calculateAdventurerBonuses(adventurer: AdventurerExtended | AdventurerLegacy) {
  if ('identity' in adventurer) {
    // Расширенный формат
    const traitEffects = calculateTraitsEffect(
      adventurer.traits.map(t => ({
        ...t,
        effect: { 
          type: Object.keys(t.effects)[0] as any, 
          value: Object.values(t.effects)[0] 
        },
        rarity: 'common' as const,
      }))
    )
    const uniqueEffects = calculateBonusEffects(adventurer.uniqueBonuses)
    
    return {
      successRateBonus: traitEffects.success_rate + uniqueEffects.successBonus,
      bonusChanceBonus: traitEffects.bonus_chance,
      wearModifier: traitEffects.wear - uniqueEffects.wearReduction,
      warSoulBonus: traitEffects.soul_points + uniqueEffects.soulBonus + adventurer.combat.power,
      durationModifier: traitEffects.duration - uniqueEffects.durationReduction,
      weaponLossModifier: traitEffects.weapon_loss - uniqueEffects.lossChanceReduction,
      goldBonus: uniqueEffects.goldBonus,
      critChance: uniqueEffects.critChance,
      critMultiplier: uniqueEffects.critMultiplier,
    }
  }
  
  // Старый формат
  const traitEffects = calculateTraitsEffect(
    adventurer.traits.map(t => ({
      ...t,
      effect: { 
        type: Object.keys(t.effects)[0] as any, 
        value: Object.values(t.effects)[0] 
      },
      rarity: 'common' as const,
    }))
  )
  const uniqueEffects = calculateBonusEffects(adventurer.uniqueBonuses)
  
  return {
    successRateBonus: traitEffects.success_rate + uniqueEffects.successBonus,
    bonusChanceBonus: traitEffects.bonus_chance,
    wearModifier: traitEffects.wear - uniqueEffects.wearReduction,
    warSoulBonus: traitEffects.soul_points + uniqueEffects.soulBonus + adventurer.skill,
    durationModifier: traitEffects.duration - uniqueEffects.durationReduction,
    weaponLossModifier: traitEffects.weapon_loss - uniqueEffects.lossChanceReduction,
    goldBonus: uniqueEffects.goldBonus,
    critChance: uniqueEffects.critChance,
    critMultiplier: uniqueEffects.critMultiplier,
  }
}

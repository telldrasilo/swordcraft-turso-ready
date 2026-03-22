/**
 * Система зачарований для SwordCraft: Idle Forge
 * 
 * Зачарования добавляют оружию магические свойства:
 * - Жертвоприношение оружия → получение эссенции души
 * - Покупка зачарований за эссенцию и золото
 * - Наложение зачарований на оружие в инвентаре
 */

// ================================
// ТИПЫ
// ================================

export type EnchantmentSchool = 'fire' | 'frost' | 'life' | 'protection' | 'power' | 'speed'
export type EnchantmentTier = 1 | 2 | 3

export interface Enchantment {
  id: string
  school: EnchantmentSchool
  tier: EnchantmentTier
  name: string
  description: string
  effect: {
    type: 'damage' | 'defense' | 'speed' | 'regen' | 'lifesteal' | 'burn' | 'slow' | 'crit'
    value: number // Процентный бонус
    duration?: number // Длительность эффектов (секунды)
  }
  cost: {
    soulEssence: number
    gold: number
  }
  requiredLevel: number
  requiredFame: number
  unlocked: boolean
}

export interface WeaponEnchantment {
  enchantmentId: string
  appliedAt: number
}

// ================================
// ДАННЫЕ ШКОЛ ЗАЧАРОВАНИЙ
// ================================

export interface EnchantmentSchoolInfo {
  id: EnchantmentSchool
  name: string
  icon: string
  description: string
  color: string
  bgColor: string
}

export const enchantmentSchools: EnchantmentSchoolInfo[] = [
  {
    id: 'fire',
    name: 'Огонь',
    icon: '🔥',
    description: 'Урон огнём и шанс поджога врага',
    color: 'text-red-400',
    bgColor: 'bg-red-900/30',
  },
  {
    id: 'frost',
    name: 'Лёд',
    icon: '❄️',
    description: 'Морозный урон и замедление врагов',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-900/30',
  },
  {
    id: 'life',
    name: 'Жизнь',
    icon: '💚',
    description: 'Регенерация и вампиризм',
    color: 'text-green-400',
    bgColor: 'bg-green-900/30',
  },
  {
    id: 'protection',
    name: 'Защита',
    icon: '🛡️',
    description: 'Броня и сопротивление урону',
    color: 'text-amber-400',
    bgColor: 'bg-amber-900/30',
  },
  {
    id: 'power',
    name: 'Сила',
    icon: '⚔️',
    description: 'Увеличение физического урона',
    color: 'text-purple-400',
    bgColor: 'bg-purple-900/30',
  },
  {
    id: 'speed',
    name: 'Скорость',
    icon: '⚡',
    description: 'Скорость атаки и движения',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-900/30',
  },
]

export const enchantmentSchoolInfo: Record<EnchantmentSchool, EnchantmentSchoolInfo> = {
  fire: enchantmentSchools[0],
  frost: enchantmentSchools[1],
  life: enchantmentSchools[2],
  protection: enchantmentSchools[3],
  power: enchantmentSchools[4],
  speed: enchantmentSchools[5],
}

// ================================
// ЗАЧАРОВАНИЯ
// ================================

export const enchantments: Enchantment[] = [
  // === ОГОНЬ ===
  {
    id: 'fire_t1',
    school: 'fire',
    tier: 1,
    name: 'Искра',
    description: 'Добавляет 5% урона огнём к атакам',
    effect: { type: 'damage', value: 5 },
    cost: { soulEssence: 30, gold: 100 },
    requiredLevel: 3,
    requiredFame: 0,
    unlocked: true,
  },
  {
    id: 'fire_t2',
    school: 'fire',
    tier: 2,
    name: 'Пламя',
    description: 'Добавляет 12% урона огнём и шанс поджога',
    effect: { type: 'burn', value: 12, duration: 3 },
    cost: { soulEssence: 80, gold: 350 },
    requiredLevel: 8,
    requiredFame: 30,
    unlocked: false,
  },
  {
    id: 'fire_t3',
    school: 'fire',
    tier: 3,
    name: 'Инферно',
    description: 'Добавляет 25% урона огнём и мощный поджог',
    effect: { type: 'burn', value: 25, duration: 5 },
    cost: { soulEssence: 200, gold: 900 },
    requiredLevel: 15,
    requiredFame: 100,
    unlocked: false,
  },
  
  // === ЛЁД ===
  {
    id: 'frost_t1',
    school: 'frost',
    tier: 1,
    name: 'Иней',
    description: 'Добавляет 5% морозного урона',
    effect: { type: 'damage', value: 5 },
    cost: { soulEssence: 30, gold: 100 },
    requiredLevel: 3,
    requiredFame: 0,
    unlocked: true,
  },
  {
    id: 'frost_t2',
    school: 'frost',
    tier: 2,
    name: 'Мороз',
    description: 'Добавляет 12% урона и замедление врага',
    effect: { type: 'slow', value: 12, duration: 2 },
    cost: { soulEssence: 80, gold: 350 },
    requiredLevel: 8,
    requiredFame: 30,
    unlocked: false,
  },
  {
    id: 'frost_t3',
    school: 'frost',
    tier: 3,
    name: 'Вечная зима',
    description: 'Добавляет 25% урона и длительное замедление',
    effect: { type: 'slow', value: 25, duration: 4 },
    cost: { soulEssence: 200, gold: 900 },
    requiredLevel: 15,
    requiredFame: 100,
    unlocked: false,
  },
  
  // === ЖИЗНЬ ===
  {
    id: 'life_t1',
    school: 'life',
    tier: 1,
    name: 'Капля жизни',
    description: 'Восстановление 3% HP после боя',
    effect: { type: 'regen', value: 3 },
    cost: { soulEssence: 35, gold: 120 },
    requiredLevel: 4,
    requiredFame: 0,
    unlocked: true,
  },
  {
    id: 'life_t2',
    school: 'life',
    tier: 2,
    name: 'Поток жизни',
    description: 'Восстановление 8% HP и вампиризм 5%',
    effect: { type: 'lifesteal', value: 8 },
    cost: { soulEssence: 90, gold: 400 },
    requiredLevel: 9,
    requiredFame: 40,
    unlocked: false,
  },
  {
    id: 'life_t3',
    school: 'life',
    tier: 3,
    name: 'Источник',
    description: 'Восстановление 15% HP и вампиризм 12%',
    effect: { type: 'lifesteal', value: 15 },
    cost: { soulEssence: 220, gold: 1000 },
    requiredLevel: 16,
    requiredFame: 120,
    unlocked: false,
  },
  
  // === ЗАЩИТА ===
  {
    id: 'protection_t1',
    school: 'protection',
    tier: 1,
    name: 'Барьер',
    description: 'Увеличивает защиту на 5%',
    effect: { type: 'defense', value: 5 },
    cost: { soulEssence: 25, gold: 80 },
    requiredLevel: 2,
    requiredFame: 0,
    unlocked: true,
  },
  {
    id: 'protection_t2',
    school: 'protection',
    tier: 2,
    name: 'Стена',
    description: 'Увеличивает защиту на 12%',
    effect: { type: 'defense', value: 12 },
    cost: { soulEssence: 70, gold: 300 },
    requiredLevel: 7,
    requiredFame: 25,
    unlocked: false,
  },
  {
    id: 'protection_t3',
    school: 'protection',
    tier: 3,
    name: 'Крепость',
    description: 'Увеличивает защиту на 25%',
    effect: { type: 'defense', value: 25 },
    cost: { soulEssence: 180, gold: 800 },
    requiredLevel: 14,
    requiredFame: 90,
    unlocked: false,
  },
  
  // === СИЛА ===
  {
    id: 'power_t1',
    school: 'power',
    tier: 1,
    name: 'Усиление',
    description: 'Увеличивает урон на 8%',
    effect: { type: 'damage', value: 8 },
    cost: { soulEssence: 40, gold: 150 },
    requiredLevel: 5,
    requiredFame: 10,
    unlocked: true,
  },
  {
    id: 'power_t2',
    school: 'power',
    tier: 2,
    name: 'Мощь',
    description: 'Увеличивает урон на 18%',
    effect: { type: 'damage', value: 18 },
    cost: { soulEssence: 100, gold: 450 },
    requiredLevel: 10,
    requiredFame: 50,
    unlocked: false,
  },
  {
    id: 'power_t3',
    school: 'power',
    tier: 3,
    name: 'Владычество',
    description: 'Увеличивает урон на 35%',
    effect: { type: 'damage', value: 35 },
    cost: { soulEssence: 250, gold: 1100 },
    requiredLevel: 18,
    requiredFame: 150,
    unlocked: false,
  },
  
  // === СКОРОСТЬ ===
  {
    id: 'speed_t1',
    school: 'speed',
    tier: 1,
    name: 'Проворство',
    description: 'Увеличивает скорость атаки на 5%',
    effect: { type: 'speed', value: 5 },
    cost: { soulEssence: 35, gold: 130 },
    requiredLevel: 4,
    requiredFame: 5,
    unlocked: true,
  },
  {
    id: 'speed_t2',
    school: 'speed',
    tier: 2,
    name: 'Стремительность',
    description: 'Увеличивает скорость атаки на 12%',
    effect: { type: 'speed', value: 12 },
    cost: { soulEssence: 85, gold: 380 },
    requiredLevel: 9,
    requiredFame: 45,
    unlocked: false,
  },
  {
    id: 'speed_t3',
    school: 'speed',
    tier: 3,
    name: 'Молния',
    description: 'Увеличивает скорость атаки на 25%',
    effect: { type: 'speed', value: 25 },
    cost: { soulEssence: 210, gold: 950 },
    requiredLevel: 16,
    requiredFame: 130,
    unlocked: false,
  },
]

// ================================
// ЖЕРТВОПРИНОШЕНИЕ ОРУЖИЯ
// ================================

export interface SacrificeResult {
  soulEssence: number
  bonusGold: number
}

// Расчёт эссенции при жертвоприношении
export function calculateSacrificeValue(
  quality: number, 
  tier: string, 
  warSoul: number = 0,
  epicMultiplier: number = 1
): SacrificeResult {
  // Базовое количество эссенции в зависимости от качества
  let baseEssence = 0
  if (quality <= 20) baseEssence = 2
  else if (quality <= 40) baseEssence = 6
  else if (quality <= 60) baseEssence = 14
  else if (quality <= 80) baseEssence = 28
  else if (quality <= 95) baseEssence = 52
  else baseEssence = 100
  
  // Множитель за тир (редкость материала)
  const tierMultiplier: Record<string, number> = {
    common: 1,
    uncommon: 1.2,
    rare: 1.5,
    epic: 2,
    legendary: 3,
    mythic: 4,
  }
  
  // Бонус от очков Души Войны (каждые 10 очков = +5% эссенции)
  const warSoulMultiplier = 1 + (warSoul / 10) * 0.05
  
  // Эпический множитель - умножает итоговое количество эссенции
  // Чем больше приключений пережило оружие, тем больше эссенции
  // Но это также риск - сломанное оружие может не дать ничего
  const epicMult = Math.max(1, epicMultiplier)
  
  // Случайная вариация ±20%
  const variation = 0.8 + Math.random() * 0.4
  
  const soulEssence = Math.round(
    baseEssence * 
    (tierMultiplier[tier] || 1) * 
    variation * 
    warSoulMultiplier *
    epicMult
  )
  
  // Бонус золото (10-30% от цены продажи) + бонус от очков души
  const bonusGold = Math.round(
    (soulEssence * 2 + Math.random() * soulEssence) + 
    (warSoul * 0.5 * epicMult)
  )
  
  return { soulEssence, bonusGold }
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

export function getEnchantment(id: string): Enchantment | undefined {
  return enchantments.find(e => e.id === id)
}

export function getEnchantmentsBySchool(school: EnchantmentSchool): Enchantment[] {
  return enchantments.filter(e => e.school === school)
}

export function getEnchantmentsByTier(tier: EnchantmentTier): Enchantment[] {
  return enchantments.filter(e => e.tier === tier)
}

export function canAffordEnchantment(
  enchantment: Enchantment,
  soulEssence: number,
  gold: number,
  playerLevel: number,
  playerFame: number
): boolean {
  return (
    soulEssence >= enchantment.cost.soulEssence &&
    gold >= enchantment.cost.gold &&
    playerLevel >= enchantment.requiredLevel &&
    playerFame >= enchantment.requiredFame
  )
}

// Максимальное количество зачарований на оружии
export const MAX_ENCHANTMENTS_PER_WEAPON = 2

// Проверка совместимости зачарований
export function areEnchantmentsCompatible(
  existingEnchantments: WeaponEnchantment[],
  newEnchantment: Enchantment
): boolean {
  // Нельзя иметь два зачарования одной школы
  const existingSchools = existingEnchantments.map(e => {
    const ench = getEnchantment(e.enchantmentId)
    return ench?.school
  })
  
  return !existingSchools.includes(newEnchantment.school)
}

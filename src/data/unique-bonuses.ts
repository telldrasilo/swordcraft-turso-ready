/**
 * Система уникальных преимуществ искателей
 * Каждый бонус сбалансирован по математическому ожиданию
 */

// ================================
// ТИПЫ
// ================================

export type UniqueBonusType =
  | 'resource_gatherer'   // Добытчик - приносит ресурсы
  | 'speedster'           // Скоростной - сокращает время
  | 'careful'             // Осторожный - сохраняет оружие
  | 'merchant'            // Торговец - бонус к золоту
  | 'soul_seeker'         // Искатель душ - бонус к душам
  | 'lucky'               // Везунчик - шанс крит. успеха
  | 'precise'             // Точный - бонус к успеху
  | 'mage'                // Маг - приносит эссенцию

export interface UniqueBonus {
  id: UniqueBonusType
  name: string
  icon: string
  description: string
  rarity: 'common' | 'uncommon' | 'rare'
  effect: {
    // Добытчик
    resourceChance?: number           // Шанс принести ресурс (20-35%)
    resourceTypes?: string[]          // Типы ресурсов
    // Скоростной
    durationReduction?: number        // Сокращение времени (15-30%)
    // Осторожный
    wearReduction?: number            // Снижение износа (30-50%)
    lossChanceReduction?: number      // Снижение шанса потери (40-60%)
    // Торговец
    goldBonus?: number                // Бонус к золоту (20-40%)
    // Искатель душ
    soulBonus?: number                // Бонус к душам (25-50%)
    // Везунчик
    critChance?: number               // Шанс крит. успеха (10-20%)
    critMultiplier?: number           // Множитель крита (2x)
    // Точный
    successBonus?: number             // Бонус к успеху (10-25%)
    // Маг
    essenceGuaranteed?: number        // Гарантированная эссенция (1-3)
    essenceChance?: number            // Доп. шанс эссенции
  }
  // Текст для UI
  effectText: string
}

// ================================
// КОНФИГУРАЦИЯ БОНУСОВ
// ================================

export const uniqueBonuses: UniqueBonus[] = [
  {
    id: 'resource_gatherer',
    name: 'Добытчик',
    icon: '🎒',
    description: 'Находит ресурсы в экспедициях',
    rarity: 'common',
    effect: {
      resourceChance: 25,
      resourceTypes: ['iron', 'copper', 'tin', 'coal', 'wood', 'stone']
    },
    effectText: '25% шанс принести ресурс'
  },
  {
    id: 'speedster',
    name: 'Гонщик',
    icon: '⚡',
    description: 'Действует стремительно',
    rarity: 'common',
    effect: {
      durationReduction: 25
    },
    effectText: '-25% времени экспедиции'
  },
  {
    id: 'careful',
    name: 'Бережливый',
    icon: '🛡️',
    description: 'Заботится о своём оружии',
    rarity: 'common',
    effect: {
      wearReduction: 40,
      lossChanceReduction: 50
    },
    effectText: '-40% износа, -50% потери оружия'
  },
  {
    id: 'merchant',
    name: 'Торговец',
    icon: '💰',
    description: 'Умеет торговаться за награду',
    rarity: 'uncommon',
    effect: {
      goldBonus: 30
    },
    effectText: '+30% золота'
  },
  {
    id: 'soul_seeker',
    name: 'Искатель душ',
    icon: '✨',
    description: 'Притягивает души павших врагов',
    rarity: 'uncommon',
    effect: {
      soulBonus: 35
    },
    effectText: '+35% душ Войны'
  },
  {
    id: 'lucky',
    name: 'Везунчик',
    icon: '🍀',
    description: 'Удача сопутствует ему',
    rarity: 'rare',
    effect: {
      critChance: 15,
      critMultiplier: 2
    },
    effectText: '15% шанс удвоить все награды'
  },
  {
    id: 'precise',
    name: 'Точный',
    icon: '🎯',
    description: 'Редко промахивается',
    rarity: 'uncommon',
    effect: {
      successBonus: 20
    },
    effectText: '+20% к успеху экспедиции'
  },
  {
    id: 'mage',
    name: 'Маг',
    icon: '🔮',
    description: 'Владеет магией и собирает эссенцию',
    rarity: 'rare',
    effect: {
      essenceGuaranteed: 1,
      essenceChance: 30
    },
    effectText: 'Гарантированно +1 эссенция'
  }
]

// ================================
// ВЕРОЯТНОСТИ ГЕНЕРАЦИИ
// ================================

// Количество бонусов и их редкость
export const bonusCountChances = {
  one: 0.91,    // 91% - 1 бонус
  two: 0.07,    // 7% - 2 бонуса
  three: 0.02   // 2% - 3 бонуса
}

// Редкость бонусов при генерации
export const bonusRarityChances = {
  common: 0.60,
  uncommon: 0.30,
  rare: 0.10
}

// ================================
// ФУНКЦИИ
// ================================

/**
 * Получить бонус по ID
 */
export function getBonusById(id: UniqueBonusType): UniqueBonus | undefined {
  return uniqueBonuses.find(b => b.id === id)
}

/**
 * Получить бонусы по редкости
 */
export function getBonusesByRarity(rarity: 'common' | 'uncommon' | 'rare'): UniqueBonus[] {
  return uniqueBonuses.filter(b => b.rarity === rarity)
}

/**
 * Случайный выбор бонуса по редкости
 */
export function getRandomBonus(guildLevel: number = 1): UniqueBonus {
  const roll = Math.random()

  // Уровень гильдии увеличивает шанс редких бонусов
  const rareBonus = 0.02 * guildLevel
  const uncommonBonus = 0.03 * guildLevel

  const rareChance = bonusRarityChances.rare + rareBonus
  const uncommonChance = bonusRarityChances.uncommon + uncommonBonus

  if (roll < rareChance) {
    const rareBonuses = getBonusesByRarity('rare')
    return rareBonuses[Math.floor(Math.random() * rareBonuses.length)]
  } else if (roll < rareChance + uncommonChance) {
    const uncommonBonuses = getBonusesByRarity('uncommon')
    return uncommonBonuses[Math.floor(Math.random() * uncommonBonuses.length)]
  } else {
    const commonBonuses = getBonusesByRarity('common')
    return commonBonuses[Math.floor(Math.random() * commonBonuses.length)]
  }
}

/**
 * Генерация списка уникальных бонусов для искателя
 */
export function generateUniqueBonuses(guildLevel: number = 1): UniqueBonus[] {
  const roll = Math.random()

  let count: number
  if (roll < bonusCountChances.three) {
    count = 3
  } else if (roll < bonusCountChances.three + bonusCountChances.two) {
    count = 2
  } else {
    count = 1
  }

  const bonuses: UniqueBonus[] = []
  const usedIds = new Set<UniqueBonusType>()

  for (let i = 0; i < count; i++) {
    let bonus = getRandomBonus(guildLevel)
    let attempts = 0

    // Избегаем дубликатов
    while (usedIds.has(bonus.id) && attempts < 20) {
      bonus = getRandomBonus(guildLevel)
      attempts++
    }

    if (!usedIds.has(bonus.id)) {
      bonuses.push(bonus)
      usedIds.add(bonus.id)
    }
  }

  return bonuses
}

/**
 * Расчёт общих эффектов от всех бонусов
 */
export function calculateBonusEffects(bonuses: UniqueBonus[]) {
  const effects = {
    resourceChance: 0,
    resourceTypes: [] as string[],
    durationReduction: 0,
    wearReduction: 0,
    lossChanceReduction: 0,
    goldBonus: 0,
    soulBonus: 0,
    critChance: 0,
    critMultiplier: 1,
    successBonus: 0,
    essenceGuaranteed: 0,
    essenceChance: 0
  }

  for (const bonus of bonuses) {
    const e = bonus.effect

    if (e.resourceChance) {
      effects.resourceChance = Math.max(effects.resourceChance, e.resourceChance)
      effects.resourceTypes = [...new Set([...effects.resourceTypes, ...(e.resourceTypes || [])])]
    }
    if (e.durationReduction) {
      effects.durationReduction += e.durationReduction
    }
    if (e.wearReduction) {
      effects.wearReduction = Math.max(effects.wearReduction, e.wearReduction)
    }
    if (e.lossChanceReduction) {
      effects.lossChanceReduction = Math.max(effects.lossChanceReduction, e.lossChanceReduction)
    }
    if (e.goldBonus) {
      effects.goldBonus += e.goldBonus
    }
    if (e.soulBonus) {
      effects.soulBonus += e.soulBonus
    }
    if (e.critChance) {
      effects.critChance = Math.max(effects.critChance, e.critChance)
      effects.critMultiplier = e.critMultiplier || 2
    }
    if (e.successBonus) {
      effects.successBonus += e.successBonus
    }
    if (e.essenceGuaranteed) {
      effects.essenceGuaranteed += e.essenceGuaranteed
    }
    if (e.essenceChance) {
      effects.essenceChance = Math.max(effects.essenceChance, e.essenceChance)
    }
  }

  // Ограничения
  effects.durationReduction = Math.min(effects.durationReduction, 50) // Максимум -50% времени
  effects.successBonus = Math.min(effects.successBonus, 40) // Максимум +40% успеха

  return effects
}

/**
 * Получить текстовое описание редкости бонусов
 */
export function getBonusRarityText(bonuses: UniqueBonus[]): { text: string; color: string } {
  if (bonuses.length === 3) {
    return { text: 'Легенда', color: 'text-amber-400' }
  }
  if (bonuses.length === 2) {
    const hasRare = bonuses.some(b => b.rarity === 'rare')
    if (hasRare) {
      return { text: 'Избранный', color: 'text-purple-400' }
    }
    return { text: 'Талант', color: 'text-blue-400' }
  }

  const bonus = bonuses[0]
  if (!bonus) return { text: 'Обычный', color: 'text-stone-400' }

  switch (bonus.rarity) {
    case 'rare':
      return { text: 'Редкий дар', color: 'text-purple-400' }
    case 'uncommon':
      return { text: 'Особый дар', color: 'text-blue-400' }
    default:
      return { text: 'Дар', color: 'text-green-400' }
  }
}

/**
 * Получить цвет фона для бонуса по редкости
 */
export function getBonusBgColor(bonus: UniqueBonus): string {
  switch (bonus.rarity) {
    case 'rare':
      return 'bg-purple-900/40 border-purple-600/50'
    case 'uncommon':
      return 'bg-blue-900/40 border-blue-600/50'
    default:
      return 'bg-green-900/40 border-green-600/50'
  }
}

/**
 * Применить бонусы к результату экспедиции
 */
export function applyBonusesToResult(
  baseResult: {
    gold: number
    warSoul: number
    success: boolean
    weaponWear: number
    weaponLossChance: number
    duration: number
    successChance: number
  },
  bonuses: UniqueBonus[],
  skill: number
): {
  gold: number
  warSoul: number
  success: boolean
  weaponWear: number
  weaponLost: boolean
  duration: number
  successChance: number
  bonusResources: { resource: string; amount: number }[]
  bonusEssence: number
  isCrit: boolean
} {
  const effects = calculateBonusEffects(bonuses)

  // Применяем модификаторы
  let gold = Math.floor(baseResult.gold * (1 + effects.goldBonus / 100))
  let warSoul = Math.floor(baseResult.warSoul * (1 + (effects.soulBonus + skill) / 100))
  const duration = Math.floor(baseResult.duration * (1 - effects.durationReduction / 100))
  let successChance = Math.min(95, baseResult.successChance + effects.successBonus)
  const weaponWear = Math.floor(baseResult.weaponWear * (1 - effects.wearReduction / 100))
  const weaponLossChance = Math.floor(baseResult.weaponLossChance * (1 - effects.lossChanceReduction / 100))

  // Определяем успех
  const roll = Math.random() * 100
  const success = roll < successChance

  // Проверяем критический успех
  const isCrit = Math.random() * 100 < effects.critChance
  if (isCrit) {
    gold = Math.floor(gold * effects.critMultiplier)
    warSoul = Math.floor(warSoul * effects.critMultiplier)
  }

  // Проверяем потерю оружия
  const weaponLost = !success && Math.random() * 100 < weaponLossChance

  // Генерируем бонусные ресурсы
  const bonusResources: { resource: string; amount: number }[] = []
  if (effects.resourceChance > 0 && Math.random() * 100 < effects.resourceChance && success) {
    const types = effects.resourceTypes
    if (types.length > 0) {
      const resource = types[Math.floor(Math.random() * types.length)]
      const amount = 1 + Math.floor(Math.random() * 3) // 1-3 единицы
      bonusResources.push({ resource, amount })
    }
  }

  // Генерируем бонусную эссенцию
  let bonusEssence = effects.essenceGuaranteed
  if (effects.essenceChance > 0 && Math.random() * 100 < effects.essenceChance && success) {
    bonusEssence += 1
  }

  return {
    gold,
    warSoul,
    success,
    weaponWear,
    weaponLost,
    duration,
    successChance,
    bonusResources,
    bonusEssence,
    isCrit
  }
}

/**
 * Калькулятор характеристик оружия
 * Рассчитывает итоговые характеристики на основе материалов и техник
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 7 Характеристики оружия
 */

import type { 
  WeaponRecipe, 
  Material, 
  MaterialAssignment, 
  Technique, 
  WeaponStats,
  QualityGrade 
} from '@/types/craft-v2'
import { getMaterialById } from '@/data/materials'
import { 
  getQualityGrade, 
  getQualityMultiplier, 
  getQualityColor,
  getQualityNameRu,
  QUALITY_GRADES_CONFIG 
} from '@/types/craft-v2'

/**
 * Полный результат расчёта оружия
 */
export interface WeaponCalculationResult {
  stats: WeaponStats
  quality: number
  qualityGrade: QualityGrade
  qualityMultiplier: number
  qualityColor: string
  qualityNameRu: string
  sellPrice: number
  materials: {
    partId: string
    materialId: string
    materialName: string
    quantity: number
  }[]
}

/**
 * Рассчитать характеристики оружия
 */
export function calculateWeapon(
  recipe: WeaponRecipe,
  materials: MaterialAssignment,
  techniques: Technique[],
  blacksmithLevel: number
): WeaponCalculationResult {
  // 1. Базовые значения из рецепта
  const base = recipe.baseStats
  
  // 2. Собираем материалы
  const materialData: { partId: string; material: Material; quantity: number }[] = []
  
  for (const [partId, { materialId, quantity }] of Object.entries(materials)) {
    const material = getMaterialById(materialId)
    if (material) {
      materialData.push({ partId, material, quantity })
    }
  }
  
  // 3. Рассчитываем характеристики
  let attack = base.attackBase
  let durability = base.durabilityBase
  let maxDurability = base.durabilityBase
  let weight = base.weightBase
  let soulCapacity = base.soulCapacityBase
  let balance = 75
  let repairPotential = 1.0
  let enchantSlots = 0
  let enchantPower = 1.0
  
  // Применяем материалы
  for (const { material, quantity } of materialData) {
    const effects = material.weaponEffects
    const props = material.properties
    
    // Атака: база + бонус от материала * вклад части (упрощённо)
    attack += attack * (effects.attackBonus / 100) * (quantity / 2)
    
    // Прочность
    durability += durability * (effects.durabilityBonus / 100) * (quantity / 2)
    
    // Вместимость души
    soulCapacity += effects.soulCapacity * quantity * 0.5
    
    // Вес
    weight += props.weight * quantity * 0.1
    
    // Ремонт
    repairPotential = Math.min(repairPotential, effects.repairPotential)
    
    // Зачарования
    enchantSlots += effects.enchantSlots
    enchantPower *= effects.enchantPower
    
    // Баланс (среднее по гибкости и твёрдости)
    balance += ((props.flexibility + props.hardness) / 2 - 50) * 0.2
  }
  
  // Применяем техники
  for (const technique of techniques) {
    const effects = technique.effects
    
    if (effects.qualityBonus) {
      attack *= 1 + (effects.qualityBonus / 100)
      durability *= 1 + (effects.qualityBonus / 100)
    }
    
    if (effects.durabilityBonus) {
      durability *= 1 + (effects.durabilityBonus / 100)
    }
    
    if (effects.conductivityBonus) {
      enchantPower *= 1 + (effects.conductivityBonus / 100)
    }
  }
  
  // Округляем
  attack = Math.round(attack)
  durability = Math.round(durability)
  maxDurability = Math.round(durability)
  weight = Math.round(weight * 10) / 10
  soulCapacity = Math.round(soulCapacity)
  balance = Math.round(Math.max(50, Math.min(100, balance)))
  enchantPower = Math.round(enchantPower * 100) / 100
  
  // 4. Рассчитываем качество
  const quality = calculateQuality(blacksmithLevel, materialData, techniques)
  const qualityGrade = getQualityGrade(quality)
  const qualityMultiplier = getQualityMultiplier(quality)
  const qualityColor = getQualityColor(quality)
  const qualityNameRu = getQualityNameRu(quality)
  
  // 5. Применяем множитель качества к характеристикам
  attack = Math.round(attack * qualityMultiplier)
  durability = Math.round(durability * qualityMultiplier)
  maxDurability = durability
  soulCapacity = Math.round(soulCapacity * qualityMultiplier)
  
  // 6. Рассчитываем цену
  const sellPrice = calculateSellPrice(
    attack,
    durability,
    quality,
    materialData,
    enchantSlots
  )
  
  return {
    stats: {
      attack,
      durability,
      maxDurability,
      weight,
      balance,
      soulCapacity,
      repairPotential,
      enchantSlots,
      enchantPower,
    },
    quality,
    qualityGrade,
    qualityMultiplier,
    qualityColor,
    qualityNameRu,
    sellPrice,
    materials: materialData.map(({ partId, material, quantity }) => ({
      partId,
      materialId: material.id,
      materialName: material.name,
      quantity,
    })),
  }
}

/**
 * Рассчитать качество оружия
 */
function calculateQuality(
  blacksmithLevel: number,
  materialData: { material: Material; quantity: number }[],
  techniques: Technique[]
): number {
  // Базовое качество от уровня кузнеца
  let quality = 30 + blacksmithLevel * 2
  
  // Бонус от качества материалов
  const avgMaterialQuality = materialData.reduce((sum, { material }) => {
    const matQuality = (material.properties.hardness + material.properties.flexibility) / 2
    return sum + matQuality
  }, 0) / materialData.length || 50
  
  quality += (avgMaterialQuality - 50) * 0.2
  
  // Бонус от техник
  for (const technique of techniques) {
    if (technique.effects.qualityBonus) {
      quality += technique.effects.qualityBonus * 0.5
    }
  }
  
  // Ограничение
  return Math.min(100, Math.max(0, Math.round(quality)))
}

/**
 * Рассчитать цену продажи
 */
function calculateSellPrice(
  attack: number,
  durability: number,
  quality: number,
  materialData: { material: Material; quantity: number }[],
  enchantSlots: number
): number {
  // Базовая цена от характеристик
  let price = attack * 2 + durability * 0.5
  
  // Бонус от качества
  price *= (quality / 50)  // 100 качество = ×2 цены
  
  // Бонус от редкости материалов
  const rarityMultiplier = materialData.reduce((mult, { material }) => {
    switch (material.source.rarity) {
      case 'common': return mult * 1.0
      case 'uncommon': return mult * 1.2
      case 'rare': return mult * 1.5
      case 'epic': return mult * 2.0
      case 'legendary': return mult * 3.0
      default: return mult
    }
  }, 1.0)
  
  price *= rarityMultiplier
  
  // Бонус от слотов зачарований
  price += enchantSlots * 20
  
  return Math.round(price)
}

/**
 * Получить информацию о градации качества
 */
export function getQualityInfo(quality: number): {
  grade: QualityGrade
  multiplier: number
  color: string
  nameRu: string
  nextThreshold: number | null
  prevThreshold: number | null
} {
  const grade = getQualityGrade(quality)
  const config = QUALITY_GRADES_CONFIG.find(g => g.grade === grade)
  const nextConfig = QUALITY_GRADES_CONFIG.find(g => g.min > quality)
  
  return {
    grade,
    multiplier: config?.multiplier ?? 1.0,
    color: config?.color ?? 'text-gray-400',
    nameRu: config?.nameRu ?? 'Обычное',
    nextThreshold: nextConfig?.min ?? null,
    prevThreshold: config?.min ?? 0,
  }
}

export default {
  calculateWeapon,
  getQualityInfo,
}

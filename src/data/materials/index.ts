/**
 * Библиотека материалов
 * Экспорт всех материалов
 */

import type { Material } from '@/types/craft-v2'

import { metalMaterials } from './metals'
import { woodMaterials, leatherMaterials } from './organic'
import { stoneMaterials } from './stone'

// Все материалы в одном массиве
export const allMaterials: Material[] = [
  ...metalMaterials,
  ...woodMaterials,
  ...leatherMaterials,
  ...stoneMaterials,
]

// Карта материалов по ID для быстрого доступа
export const materialById: Map<string, Material> = new Map(
  allMaterials.map(material => [material.id, material])
)

// Группировка по категориям
export const materialsByCategory = {
  metal: metalMaterials.filter(m => m.category === 'metal'),
  alloy: metalMaterials.filter(m => m.category === 'alloy'),
  wood: woodMaterials,
  leather: leatherMaterials,
  stone: stoneMaterials,
}

/**
 * Получить материал по ID
 */
export function getMaterialById(id: string): Material | undefined {
  return materialById.get(id)
}

/**
 * Получить материалы по категории
 */
export function getMaterialsByCategory(category: string): Material[] {
  return materialsByCategory[category as keyof typeof materialsByCategory] || []
}

/**
 * Получить материалы, доступные игроку
 * @param playerLevel Уровень кузнеца
 * @param unlockedMaterials Список разблокированных ID
 */
export function getAvailableMaterials(
  playerLevel: number,
  unlockedMaterials: string[] = []
): Material[] {
  return allMaterials.filter(material => {
    // Если материал в списке разблокированных
    if (unlockedMaterials.includes(material.id)) return true
    
    // Проверяем условие разблокировки
    if (material.source.unlockCondition) {
      const levelMatch = material.source.unlockCondition.match(/Уровень кузнеца (\d+)/)
      if (levelMatch) {
        return playerLevel >= parseInt(levelMatch[1])
      }
      return false
    }
    
    // Материалы без условия доступны по редкости
    return material.source.rarity === 'common'
  })
}

/**
 * Получить материалы, подходящие для части оружия
 */
export function getMaterialsForPart(
  partId: string,
  allowedCategories: string[]
): Material[] {
  return allMaterials.filter(material => 
    allowedCategories.includes(material.category)
  )
}

// Экспорт
export { metalMaterials } from './metals'
export { woodMaterials, leatherMaterials } from './organic'
export { stoneMaterials } from './stone'

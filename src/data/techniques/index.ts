/**
 * Библиотека техник крафта
 * Экспорт всех техник
 */

import type { Technique } from '@/types/craft-v2'

import { basicTechniques } from './basic'
import { advancedTechniques } from './advanced'

// Все техники в одном массиве
export const allTechniques: Technique[] = [
  ...basicTechniques,
  ...advancedTechniques,
]

// Карта техник по ID
export const techniqueById: Map<string, Technique> = new Map(
  allTechniques.map(technique => [technique.id, technique])
)

// Группировка по источнику
export const techniquesBySource = {
  start: allTechniques.filter(t => t.source.type === 'start'),
  guild: allTechniques.filter(t => t.source.type === 'guild'),
  dungeon: allTechniques.filter(t => t.source.type === 'dungeon'),
}

/**
 * Получить технику по ID
 */
export function getTechniqueById(id: string): Technique | undefined {
  return techniqueById.get(id)
}

/**
 * Получить техники по источнику
 */
export function getTechniquesBySource(source: string): Technique[] {
  return techniquesBySource[source as keyof typeof techniquesBySource] || []
}

/**
 * Получить техники, доступные игроку
 * @param playerLevel Уровень кузнеца
 * @param unlockedTechniques Список разблокированных ID
 * @param availableMaterials Доступные материалы (для проверки requiredMaterials)
 */
export function getAvailableTechniques(
  playerLevel: number,
  unlockedTechniques: string[] = [],
  availableMaterials: string[] = []
): Technique[] {
  return allTechniques.filter(technique => {
    // Если техника в списке разблокированных
    if (unlockedTechniques.includes(technique.id)) return true
    
    // Проверяем уровень
    if (technique.requiredLevel && playerLevel < technique.requiredLevel) {
      return false
    }
    
    // Проверяем требуемые материалы
    if (technique.requiredMaterials) {
      const hasAllMaterials = technique.requiredMaterials.every(
        mat => availableMaterials.includes(mat)
      )
      if (!hasAllMaterials) return false
    }
    
    // Проверяем условие разблокировки
    if (technique.source.condition) {
      // Для гильдии - проверяем ранг
      const guildMatch = technique.source.condition.match(/Ранг (\d+)/)
      if (guildMatch) {
        // TODO: проверка ранга гильдии
        return false
      }
      
      // Для данжей - проверяем наличие в разблокированных
      if (technique.source.type === 'dungeon') {
        return unlockedTechniques.includes(technique.id)
      }
    }
    
    // Стартовые техники доступны всем
    return technique.source.type === 'start'
  })
}

/**
 * Получить техники, применимые к части оружия
 */
export function getTechniquesForPart(partId: string): Technique[] {
  return allTechniques.filter(technique => 
    technique.effects.appliesTo.includes(partId) || 
    technique.effects.appliesTo.includes('all')
  )
}

/**
 * Проверить совместимость техники с материалами
 */
export function isTechniqueCompatible(
  techniqueId: string,
  materialIds: string[]
): boolean {
  const technique = techniqueById.get(techniqueId)
  if (!technique) return false
  
  // Если нет требований к материалам - совместима
  if (!technique.requiredMaterials) return true
  
  // Проверяем наличие хотя бы одного требуемого материала
  return technique.requiredMaterials.some(mat => materialIds.includes(mat))
}

// Экспорт категорий
export { basicTechniques } from './basic'
export { advancedTechniques } from './advanced'

/**
 * Dungeons Utils
 * Общие утилиты и типы для компонентов dungeons
 */

// Состояние активного приключения
export interface ActiveAdventure {
  adventureId: string
  weaponId: string
  startTime: number
  endTime: number
  progress: number
  eventsCompleted: number
  currentEvents?: string[]
}

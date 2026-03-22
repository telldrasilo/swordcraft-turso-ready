/**
 * Общие утилиты и константы для компонентов рабочих
 */

import { 
  Users, Hammer, Pickaxe, ShoppingBag, Flame, TreePine, Mountain, CircleDot,
  Battery, BatteryLow, BatteryWarning
} from 'lucide-react'
import type { WorkerClass } from '@/store'

// Иконки для классов рабочих
export const classIcons: Record<WorkerClass, typeof Users> = {
  apprentice: Users,
  blacksmith: Hammer,
  miner: Pickaxe,
  merchant: ShoppingBag,
  enchanter: Flame,
  loggers: TreePine,
  mason: Mountain,
  smelter: Flame,
}

// Карта иконок для зданий
export const buildingIcons: Record<string, typeof TreePine> = {
  sawmill: TreePine,
  quarry: Mountain,
  iron_mine: CircleDot,
  coal_mine: Flame,
  copper_mine: CircleDot,
  tin_mine: CircleDot,
  silver_mine: ShoppingBag,
  gold_mine: ShoppingBag,
  smelter: Flame,
  workshop: TreePine,
}

// Карта цветов для редкости ресурсов
export const rarityColors = {
  common: { text: 'text-stone-300', bg: 'bg-stone-800/50', border: 'border-stone-600/50' },
  uncommon: { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-600/50' },
  rare: { text: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-600/50' },
  epic: { text: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-600/50' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-600/50' }
}

// Форматирование времени
export function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}с`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}м ${Math.round(seconds % 60)}с`
  return `${Math.floor(seconds / 3600)}ч ${Math.floor((seconds % 3600) / 60)}м`
}

// Иконка батареи по уровню стамины
export function StaminaIcon({ percent }: { percent: number }) {
  if (percent > 50) return <Battery className="w-4 h-4 text-green-400" />
  if (percent > 25) return <BatteryWarning className="w-4 h-4 text-amber-400" />
  return <BatteryLow className="w-4 h-4 text-red-400" />
}

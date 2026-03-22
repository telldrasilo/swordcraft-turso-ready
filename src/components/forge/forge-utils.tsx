/**
 * Общие утилиты и константы для компонентов кузницы
 */

// Иконки ресурсов (сырьё и переработанные)
export const resourceIcons: Record<string, string> = {
  // Сырьё
  iron: '⚙️', coal: '🔥', wood: '🌲', stone: '⛰️',
  copper: '🟤', tin: '⚪', silver: '🥈', goldOre: '✨', mithril: '💠',
  // Переработанные
  ironIngot: '🔩', copperIngot: '🟤', tinIngot: '⚪',
  bronzeIngot: '🥉', steelIngot: '⚙️', silverIngot: '🥈',
  goldIngot: '🥇', mithrilIngot: '💠',
  planks: '🪵', stoneBlocks: '🧱',
  // Валюты
  gold: '💰', soulEssence: '💧'
}

// Названия ресурсов для отображения
export const resourceNames: Record<string, string> = {
  iron: 'Железо', coal: 'Уголь', wood: 'Дерево', stone: 'Камень',
  copper: 'Медь', tin: 'Олово', silver: 'Серебро', goldOre: 'Золото', mithril: 'Мифрил',
  ironIngot: 'Жел. слиток', copperIngot: 'Медный слиток', tinIngot: 'Олов. слиток',
  bronzeIngot: 'Бронз. слиток', steelIngot: 'Стальной слиток', silverIngot: 'Серебр. слиток',
  goldIngot: 'Золот. слиток', mithrilIngot: 'Мифр. слиток',
  planks: 'Доски', stoneBlocks: 'Кам. блоки',
  gold: 'Золото', soulEssence: 'Эссенция'
}

// Цвета качества
export const qualityColors: Record<string, { text: string; bg: string; border: string }> = {
  common: { text: 'text-stone-400', bg: 'bg-stone-900/50', border: 'border-stone-600' },
  uncommon: { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-600' },
  rare: { text: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-600' },
  epic: { text: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-600' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-600' },
  mythic: { text: 'text-rose-400', bg: 'bg-rose-900/30', border: 'border-rose-600' },
}

// Иконки оружия
export function WeaponIcon({ type, className }: { type: string; className?: string }) {
  const iconMap: Record<string, string> = {
    sword: '⚔️',
    dagger: '🗡️',
    axe: '🪓',
    mace: '🔨',
    spear: '🔱',
    hammer: '⚒️'
  }
  return <span className={className}>{iconMap[type] || '⚔️'}</span>
}

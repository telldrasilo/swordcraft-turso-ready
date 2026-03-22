'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

// Все ресурсы с путями к иконкам
export const resourceIcons: Record<string, { path: string; name: string; rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' }> = {
  // Валюта
  gold: { path: '/icons/resources/gold.png', name: 'Золото', rarity: 'uncommon' },
  soulEssence: { path: '/icons/resources/soulEssence.png', name: 'Эссенция душ', rarity: 'epic' },
  
  // Сырьё
  wood: { path: '/icons/resources/wood.png', name: 'Дерево', rarity: 'common' },
  stone: { path: '/icons/resources/stone.png', name: 'Камень', rarity: 'common' },
  iron: { path: '/icons/resources/iron.png', name: 'Железо', rarity: 'uncommon' },
  coal: { path: '/icons/resources/coal.png', name: 'Уголь', rarity: 'common' },
  copper: { path: '/icons/resources/copper.png', name: 'Медь', rarity: 'uncommon' },
  tin: { path: '/icons/resources/tin.png', name: 'Олово', rarity: 'uncommon' },
  silver: { path: '/icons/resources/silver.png', name: 'Серебро', rarity: 'rare' },
  goldOre: { path: '/icons/resources/goldOre.png', name: 'Зол. руда', rarity: 'rare' },
  mithril: { path: '/icons/resources/mithril.png', name: 'Мифрил', rarity: 'legendary' },
  
  // Слитки
  ironIngot: { path: '/icons/resources/ironIngot.png', name: 'Жел. слиток', rarity: 'rare' },
  copperIngot: { path: '/icons/resources/copperIngot.png', name: 'Мед. слиток', rarity: 'rare' },
  tinIngot: { path: '/icons/resources/tinIngot.png', name: 'Олов. слиток', rarity: 'rare' },
  bronzeIngot: { path: '/icons/resources/bronzeIngot.png', name: 'Бронза', rarity: 'rare' },
  steelIngot: { path: '/icons/resources/steelIngot.png', name: 'Сталь', rarity: 'epic' },
  silverIngot: { path: '/icons/resources/silverIngot.png', name: 'Сер. слиток', rarity: 'epic' },
  goldIngot: { path: '/icons/resources/goldIngot.png', name: 'Зол. слиток', rarity: 'epic' },
  mithrilIngot: { path: '/icons/resources/mithrilIngot.png', name: 'Мифр. слиток', rarity: 'legendary' },
  
  // Материалы
  planks: { path: '/icons/resources/planks.png', name: 'Доски', rarity: 'uncommon' },
  stoneBlocks: { path: '/icons/resources/stoneBlocks.png', name: 'Блоки камня', rarity: 'uncommon' },
}

// Карта цветов для редкости
export const rarityColors = {
  common: { text: 'text-stone-200', bg: 'bg-stone-700/60', border: 'border-stone-500/40', glow: '' },
  uncommon: { text: 'text-green-300', bg: 'bg-green-900/40', border: 'border-green-500/40', glow: 'shadow-green-500/20' },
  rare: { text: 'text-blue-300', bg: 'bg-blue-900/40', border: 'border-blue-500/40', glow: 'shadow-blue-500/20' },
  epic: { text: 'text-purple-300', bg: 'bg-purple-900/40', border: 'border-purple-500/40', glow: 'shadow-purple-500/20' },
  legendary: { text: 'text-amber-300', bg: 'bg-amber-900/40', border: 'border-amber-500/40', glow: 'shadow-amber-500/20' }
}

interface ResourceIconProps {
  id: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showTooltip?: boolean
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
  xl: 64
}

/**
 * Компонент иконки ресурса с использованием PNG изображений
 */
export function ResourceIcon({ id, size = 'md', className, showTooltip = false }: ResourceIconProps) {
  const resourceInfo = resourceIcons[id]
  
  if (!resourceInfo) {
    // Fallback для неизвестных ресурсов
    return (
      <div 
        className={cn('flex items-center justify-center bg-stone-700/50 rounded', className)}
        style={{ width: sizeMap[size], height: sizeMap[size] }}
      >
        <span className="text-stone-400 text-xs">?</span>
      </div>
    )
  }
  
  return (
    <Image
      src={resourceInfo.path}
      alt={resourceInfo.name}
      width={sizeMap[size]}
      height={sizeMap[size]}
      className={cn('drop-shadow-lg', className)}
      title={showTooltip ? resourceInfo.name : undefined}
    />
  )
}

/**
 * Получить информацию о ресурсе
 */
export function getResourceIconInfo(id: string) {
  return resourceIcons[id] || null
}

/**
 * Получить цвет редкости ресурса
 */
export function getResourceRarity(id: string): keyof typeof rarityColors {
  return resourceIcons[id]?.rarity || 'common'
}

export default ResourceIcon

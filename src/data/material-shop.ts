/**
 * Материалы в магазине
 * Цены и наличие сырья для покупки
 */

import type { ResourceKey } from '@/store/slices/resources-slice'

// ================================
// ТИПЫ
// ================================

export interface MaterialShopItem {
  resourceKey: ResourceKey
  name: string
  icon: string
  basePrice: number      // Базовая цена за единицу
  available: boolean     // Доступно ли в магазине
  description: string
  category: 'metal' | 'fuel' | 'wood' | 'stone' | 'special'
}

// ================================
// ДАННЫЕ МАГАЗИНА
// ================================

/**
 * Материалы, доступные для покупки в магазине
 */
export const materialShopItems: MaterialShopItem[] = [
  // Металлы (сырьё)
  {
    resourceKey: 'iron',
    name: 'Железная руда',
    icon: '�ite',
    basePrice: 4,
    available: true,
    description: 'Базовый металл для крафта. Мягкий, легко обрабатывается.',
    category: 'metal',
  },
  {
    resourceKey: 'copper',
    name: 'Медная руда',
    icon: '🟠',
    basePrice: 5,
    available: true,
    description: 'Мягкий металл, используется в сплавах.',
    category: 'metal',
  },
  {
    resourceKey: 'tin',
    name: 'Оловянная руда',
    icon: '⚪',
    basePrice: 5,
    available: true,
    description: 'Для создания бронзы.',
    category: 'metal',
  },
  {
    resourceKey: 'silver',
    name: 'Серебряная руда',
    icon: '⬜',
    basePrice: 12,
    available: true,
    description: 'Благородный металл. Эффективен против нечисти.',
    category: 'metal',
  },
  
  // Топливо
  {
    resourceKey: 'coal',
    name: 'Уголь',
    icon: '�ite',
    basePrice: 2,
    available: true,
    description: 'Топливо для горна. Необходимо для плавки и закалки.',
    category: 'fuel',
  },
  
  // Дерево
  {
    resourceKey: 'wood',
    name: 'Дерево',
    icon: '🪵',
    basePrice: 1,
    available: true,
    description: 'Сырьё для рукоятей и деревянных частей оружия.',
    category: 'wood',
  },
  {
    resourceKey: 'planks',
    name: 'Доски',
    icon: '🪵',
    basePrice: 2,
    available: true,
    description: 'Обработанное дерево. Готово к использованию.',
    category: 'wood',
  },
  
  // Камень
  {
    resourceKey: 'stone',
    name: 'Камень',
    icon: '🪨',
    basePrice: 1,
    available: true,
    description: 'Базовый камень для инструментов.',
    category: 'stone',
  },
  
  // Особые материалы (редкие)
  {
    resourceKey: 'goldOre',
    name: 'Золотая руда',
    icon: '🟡',
    basePrice: 25,
    available: true,
    description: 'Редкий благородный металл.',
    category: 'special',
  },
  {
    resourceKey: 'mithril',
    name: 'Мифриловая руда',
    icon: '💎',
    basePrice: 100,
    available: false,  // Нельзя купить — только найти
    description: 'Легендарный эльфийский металл. Найти можно только в экспедициях.',
    category: 'special',
  },
]

// ================================
// ФУНКЦИИ
// ================================

/**
 * Получить цену материала
 * @param resourceKey Ключ ресурса
 * @param quantity Количество
 * @param premiumMultiplier Множитель стоимости при покупке из крафта (1.1 = +10%)
 */
export function getMaterialPrice(
  resourceKey: ResourceKey,
  quantity: number,
  premiumMultiplier: number = 1
): number {
  const item = materialShopItems.find(i => i.resourceKey === resourceKey)
  if (!item) return 0
  
  return Math.ceil(item.basePrice * quantity * premiumMultiplier)
}

/**
 * Проверить, можно ли купить материал
 */
export function canBuyMaterial(resourceKey: ResourceKey): boolean {
  const item = materialShopItems.find(i => i.resourceKey === resourceKey)
  return item?.available ?? false
}

/**
 * Получить информацию о материале для магазина
 */
export function getMaterialShopInfo(resourceKey: ResourceKey): MaterialShopItem | undefined {
  return materialShopItems.find(i => i.resourceKey === resourceKey)
}

/**
 * Получить все доступные для покупки материалы
 */
export function getAvailableShopMaterials(): MaterialShopItem[] {
  return materialShopItems.filter(i => i.available)
}

/**
 * Получить материалы по категории
 */
export function getMaterialsByCategory(category: MaterialShopItem['category']): MaterialShopItem[] {
  return materialShopItems.filter(i => i.category === category && i.available)
}

/**
 * Рассчитать общую стоимость покупки материалов
 */
export function calculateTotalPurchaseCost(
  materials: { resourceKey: ResourceKey; quantity: number }[],
  premiumMultiplier: number = 1.1
): { total: number; breakdown: { resourceKey: ResourceKey; quantity: number; price: number }[] } {
  const breakdown = materials.map(({ resourceKey, quantity }) => ({
    resourceKey,
    quantity,
    price: getMaterialPrice(resourceKey, quantity, premiumMultiplier),
  }))
  
  const total = breakdown.reduce((sum, item) => sum + item.price, 0)
  
  return { total, breakdown }
}

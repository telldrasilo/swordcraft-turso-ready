/**
 * Проверка инвентаря для крафта
 * Расчёт требований и проверка наличия материалов
 * 
 * Поддерживает:
 * - Расчёт сырья для сплавов
 * - Покупку недостающих материалов
 * - Детализацию по частям оружия
 */

import type { Material, MaterialAssignment, WeaponRecipe } from '@/types/craft-v2'
import type { Resources, ResourceKey } from '@/store/slices/resources-slice'
import { getMaterialById } from '@/data/materials'
import { canBuyMaterial, getMaterialPrice, getMaterialShopInfo } from '@/data/material-shop'

// ================================
// МАППИНГ МАТЕРИАЛОВ НА РЕСУРСЫ
// ================================

/**
 * Маппинг ID материалов из крафта на ресурсы инвентаря
 * 
 * Материалы в крафте (craft-v2) → Ресурсы в инвентаре (resources-slice)
 */
const MATERIAL_TO_RESOURCE: Record<string, ResourceKey> = {
  // Металлы (сырьё)
  'iron': 'iron',
  'cold_iron': 'iron',  // Вариант железа
  
  // Сплавы (создаются из сырья)
  'steel': 'steelIngot',
  'high_carbon_steel': 'steelIngot',
  'silver_alloy': 'silverIngot',
  'mithril': 'mithrilIngot',
  
  // Дерево
  'birch': 'wood',
  'oak': 'wood',
  'ash': 'wood',
  'ebony': 'wood',
  'ironwood': 'wood',
  
  // Кожа
  'raw_leather': 'leather',      // Нужно добавить leather в ресурсы
  'tanned_leather': 'leather',
  'bull_leather': 'leather',
  'dragon_leather': 'leather',
  
  // Камень
  'basic_stone': 'stone',
  'granite': 'stone',
  'obsidian': 'stone',
}

/**
 * Рецепты сплавов — что нужно для создания 1 ед. материала
 * Используется для расчёта сырья, если игрок выбрал сплав
 */
const ALLOY_RECIPES: Record<string, { 
  inputs: { resource: ResourceKey, amount: number, name: string }[]
  fuel?: { resource: ResourceKey, amount: number }
}> = {
  'steel': {
    inputs: [
      { resource: 'iron', amount: 2, name: 'Железо' },
      { resource: 'coal', amount: 1, name: 'Уголь' },
    ],
    fuel: { resource: 'coal', amount: 1 },
  },
  'high_carbon_steel': {
    inputs: [
      { resource: 'iron', amount: 2, name: 'Железо' },
      { resource: 'coal', amount: 2, name: 'Уголь' },
    ],
    fuel: { resource: 'coal', amount: 2 },
  },
  'silver_alloy': {
    inputs: [
      { resource: 'iron', amount: 1, name: 'Железо' },
      { resource: 'silver', amount: 1, name: 'Серебро' },
    ],
    fuel: { resource: 'coal', amount: 1 },
  },
}

// ================================
// ТИПЫ
// ================================

/** Требование одного ресурса */
export interface ResourceRequirement {
  resourceKey: ResourceKey
  resourceId: string          // ID для отображения (iron, coal, wood...)
  resourceName: string        // Имя для отображения
  quantity: number
  available: number
  sufficient: boolean
}

/** Материал для покупки */
export interface MaterialToBuy {
  resourceKey: ResourceKey
  resourceName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  canBuy: boolean  // Доступен ли в магазине
}

/** Результат проверки */
export interface InventoryCheckResult {
  canCraft: boolean
  requirements: ResourceRequirement[]
  missing: ResourceRequirement[]
  
  // Детализация по частям оружия
  breakdownByPart: {
    partId: string
    partName: string
    materialId: string
    materialName: string
    requirements: ResourceRequirement[]
  }[]
  
  // Общее топливо (уголь для горна)
  fuelRequired?: ResourceRequirement
  
  // НОВОЕ: Материалы для покупки
  materialsToBuy: MaterialToBuy[]
  totalPurchaseCost: number
  canPurchaseMissing: boolean  // Все ли недостающие можно купить
}

// ================================
// ФУНКЦИИ
// ================================

/**
 * Получить ключ ресурса для материала
 */
export function getResourceKeyForMaterial(materialId: string): ResourceKey | null {
  return MATERIAL_TO_RESOURCE[materialId] || null
}

/**
 * Получить отображаемое имя ресурса
 */
function getResourceDisplayName(resourceKey: ResourceKey): string {
  const names: Partial<Record<ResourceKey, string>> = {
    iron: 'Железо',
    coal: 'Уголь',
    wood: 'Дерево',
    stone: 'Камень',
    ironIngot: 'Железный слиток',
    steelIngot: 'Стальной слиток',
    silverIngot: 'Серебряный слиток',
    mithrilIngot: 'Мифриловый слиток',
    planks: 'Доски',
    leather: 'Кожа',
    silver: 'Серебро',
  }
  return names[resourceKey] || resourceKey
}

/**
 * Рассчитать сырьё для материала
 * Если это сплав — раскрывает рецепт
 */
function calculateRawResources(
  materialId: string,
  quantity: number
): { resource: ResourceKey; amount: number; name: string }[] {
  // Проверяем, есть ли рецепт для сплава
  const recipe = ALLOY_RECIPES[materialId]
  if (recipe) {
    // Это сплав — раскрываем рецепт
    return recipe.inputs.map(input => ({
      resource: input.resource,
      amount: input.amount * quantity,
      name: input.name,
    }))
  }
  
  // Это сырьё — прямая запись
  const resourceKey = getResourceKeyForMaterial(materialId)
  const material = getMaterialById(materialId)
  if (resourceKey) {
    return [{ 
      resource: resourceKey, 
      amount: quantity,
      name: material?.name || resourceKey,
    }]
  }
  
  // Неизвестный материал
  console.warn(`Unknown material: ${materialId}`)
  return []
}

/**
 * Рассчитать требования для крафта
 * Возвращает детальную информацию о требуемых ресурсах
 */
export function calculateCraftRequirements(
  recipe: WeaponRecipe,
  materialSelections: MaterialAssignment
): Map<ResourceKey, { amount: number; sources: string[]; names: string[] }> {
  const requirements = new Map<ResourceKey, { amount: number; sources: string[]; names: string[] }>()
  
  for (const [partId, selection] of Object.entries(materialSelections)) {
    const material = getMaterialById(selection.materialId)
    if (!material) continue
    
    // Базовое количество материала для этой части
    const recipePart = recipe.parts.find(p => p.id === partId)
    const baseQuantity = recipePart?.minQuantity || 1
    
    // Получаем список сырья
    const rawResources = calculateRawResources(selection.materialId, baseQuantity)
    
    for (const { resource, amount, name } of rawResources) {
      const existing = requirements.get(resource)
      if (existing) {
        existing.amount += amount
        existing.sources.push(partId)
        existing.names.push(name)
      } else {
        requirements.set(resource, { amount, sources: [partId], names: [name] })
      }
    }
  }
  
  return requirements
}

/**
 * Проверить наличие ресурсов в инвентаре
 */
export function checkInventoryForCraft(
  recipe: WeaponRecipe,
  materialSelections: MaterialAssignment,
  inventory: Resources
): InventoryCheckResult {
  const requirements: ResourceRequirement[] = []
  const missing: ResourceRequirement[] = []
  const breakdownByPart: InventoryCheckResult['breakdownByPart'] = []
  const materialsToBuy: MaterialToBuy[] = []
  
  // Рассчитываем общие требования
  const totalRequirements = calculateCraftRequirements(recipe, materialSelections)
  
  // Формируем список требований
  for (const [resourceKey, { amount, sources }] of totalRequirements) {
    const available = inventory[resourceKey] || 0
    const sufficient = available >= amount
    
    const req: ResourceRequirement = {
      resourceKey,
      resourceId: resourceKey,
      resourceName: getResourceDisplayName(resourceKey),
      quantity: amount,
      available,
      sufficient,
    }
    
    requirements.push(req)
    
    if (!sufficient) {
      missing.push(req)
      
      // Проверяем, можно ли купить
      const buyable = canBuyMaterial(resourceKey)
      const neededQuantity = amount - available
      const shopInfo = getMaterialShopInfo(resourceKey)
      
      if (buyable && shopInfo) {
        materialsToBuy.push({
          resourceKey,
          resourceName: shopInfo.name,
          quantity: neededQuantity,
          unitPrice: shopInfo.basePrice,
          totalPrice: Math.ceil(shopInfo.basePrice * neededQuantity * 1.1), // +10% за покупку из крафта
          canBuy: true,
        })
      }
    }
  }
  
  // Детализация по частям (для UI)
  const partNames: Record<string, string> = {
    blade: 'Лезвие',
    guard: 'Гарда',
    grip: 'Рукоять',
    pommel: 'Навершие',
    wrapping: 'Обмотка',
  }
  
  for (const [partId, selection] of Object.entries(materialSelections)) {
    const material = getMaterialById(selection.materialId)
    if (!material) continue
    
    const recipePart = recipe.parts.find(p => p.id === partId)
    const baseQuantity = recipePart?.minQuantity || 1
    
    const partRequirements: ResourceRequirement[] = []
    const rawResources = calculateRawResources(selection.materialId, baseQuantity)
    
    for (const { resource, amount } of rawResources) {
      const available = inventory[resource] || 0
      partRequirements.push({
        resourceKey: resource,
        resourceId: resource,
        resourceName: getResourceDisplayName(resource),
        quantity: amount,
        available,
        sufficient: available >= amount,
      })
    }
    
    breakdownByPart.push({
      partId,
      partName: partNames[partId] || partId,
      materialId: selection.materialId,
      materialName: material.name,
      requirements: partRequirements,
    })
  }
  
  // Топливо для горна (базовое количество угля)
  const fuelRequired: ResourceRequirement = {
    resourceKey: 'coal',
    resourceId: 'coal',
    resourceName: 'Уголь',
    quantity: 3, // Базовый расход на крафт
    available: inventory.coal || 0,
    sufficient: (inventory.coal || 0) >= 3,
  }
  
  // Если не хватает топлива — добавляем в список покупки
  if (!fuelRequired.sufficient) {
    const neededFuel = fuelRequired.quantity - fuelRequired.available
    const fuelShopInfo = getMaterialShopInfo('coal')
    if (fuelShopInfo) {
      materialsToBuy.push({
        resourceKey: 'coal',
        resourceName: 'Уголь',
        quantity: neededFuel,
        unitPrice: fuelShopInfo.basePrice,
        totalPrice: Math.ceil(fuelShopInfo.basePrice * neededFuel * 1.1),
        canBuy: true,
      })
    }
  }
  
  // Рассчитываем общую стоимость покупки
  const totalPurchaseCost = materialsToBuy.reduce((sum, m) => sum + m.totalPrice, 0)
  
  // Проверяем, можно ли купить все недостающие материалы
  const canPurchaseMissing = missing.length > 0 && 
    materialsToBuy.length === (missing.length + (fuelRequired.sufficient ? 0 : 1)) &&
    materialsToBuy.every(m => m.canBuy)
  
  return {
    canCraft: missing.length === 0 && fuelRequired.sufficient,
    requirements,
    missing,
    breakdownByPart,
    fuelRequired,
    materialsToBuy,
    totalPurchaseCost,
    canPurchaseMissing,
  }
}

/**
 * Получить стоимость для списания
 */
export function getCraftingCost(
  recipe: WeaponRecipe,
  materialSelections: MaterialAssignment
): Partial<Record<ResourceKey, number>> {
  const cost: Partial<Record<ResourceKey, number>> = {}
  
  const totalRequirements = calculateCraftRequirements(recipe, materialSelections)
  
  for (const [resourceKey, { amount }] of totalRequirements) {
    cost[resourceKey] = (cost[resourceKey] || 0) + amount
  }
  
  // Добавляем топливо
  cost.coal = (cost.coal || 0) + 3
  
  return cost
}

/**
 * Проверить, есть ли материал в инвентаре
 */
export function hasMaterialInInventory(
  materialId: string,
  quantity: number,
  inventory: Resources
): boolean {
  const resourceKey = getResourceKeyForMaterial(materialId)
  if (!resourceKey) return false
  
  return (inventory[resourceKey] || 0) >= quantity
}

/**
 * Получить количество материала в инвентаре
 */
export function getMaterialAmountInInventory(
  materialId: string,
  inventory: Resources
): number {
  const resourceKey = getResourceKeyForMaterial(materialId)
  if (!resourceKey) return 0
  
  return inventory[resourceKey] || 0
}

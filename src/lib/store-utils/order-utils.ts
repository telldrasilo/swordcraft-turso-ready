/**
 * Order Utilities
 * Чистые функции для логики заказов (NPC заказы)
 */

import { generateId, generateClientName, randomInt, randomElement } from './generators'
import { ORDER_MIN_QUALITY, ORDER_MAX_QUALITY, ORDER_BASE_GOLD_REWARD, ORDER_BASE_FAME_REWARD } from './constants'
import type { OrderCompletionParams, OrderCompletionResult } from './types'

// ================================
// ТИПЫ
// ================================

export interface NPCOrder {
  id: string
  clientName: string
  clientTitle: string
  clientIcon: string
  weaponType: string
  material?: string
  minQuality: number
  minAttack?: number
  goldReward: number
  fameReward: number
  bonusItems?: { resource: string; amount: number }[]
  deadline: number
  status: 'available' | 'in_progress' | 'completed' | 'expired'
  acceptedAt?: number
  requiredLevel: number
  requiredFame: number
}

export interface OrderGenerationParams {
  playerLevel: number
  playerFame: number
  existingClients: string[]
}

export interface OrderGenerationResult {
  order: NPCOrder | null
  reason?: string
}

// ================================
// КОНСТАНТЫ
// ================================

const WEAPON_TYPES = ['sword', 'dagger', 'axe', 'mace', 'spear', 'hammer']
const MATERIALS = ['iron', 'bronze', 'steel', 'silver', 'gold', 'mithril']

const BONUS_ITEMS: { resource: string; minAmount: number; maxAmount: number }[] = [
  { resource: 'iron', minAmount: 5, maxAmount: 20 },
  { resource: 'coal', minAmount: 3, maxAmount: 15 },
  { resource: 'wood', minAmount: 10, maxAmount: 30 },
  { resource: 'stone', minAmount: 5, maxAmount: 20 },
]

// ================================
// ГЕНЕРАЦИЯ ЗАКАЗОВ
// ================================

/**
 * Рассчитать награду золотом
 */
export function calculateGoldReward(
  minQuality: number,
  weaponType: string,
  material: string | undefined,
  playerLevel: number
): number {
  const baseGold = ORDER_BASE_GOLD_REWARD

  // Множитель за качество
  const qualityMult = minQuality / 50

  // Множитель за тип оружия
  const typeMult: Record<string, number> = {
    sword: 1.2,
    dagger: 0.8,
    axe: 1.1,
    mace: 1.0,
    spear: 1.0,
    hammer: 1.3,
  }

  // Множитель за материал
  const materialMult: Record<string, number> = {
    iron: 1.0,
    bronze: 1.2,
    steel: 1.5,
    silver: 1.8,
    gold: 2.0,
    mithril: 3.0,
  }

  const base = baseGold * qualityMult * (typeMult[weaponType] || 1)
  const matBonus = material ? (materialMult[material] || 1) : 1

  return Math.floor(base * matBonus * (1 + playerLevel * 0.05))
}

/**
 * Рассчитать награду славой
 */
export function calculateFameReward(
  minQuality: number,
  playerFame: number
): number {
  const baseFame = ORDER_BASE_FAME_REWARD
  const qualityBonus = Math.floor(minQuality / 20)
  return baseFame + qualityBonus
}

/**
 * Рассчитать срок выполнения
 */
export function calculateDeadline(weaponType: string, material: string | undefined): number {
  // Базовое время - 5 минут
  let minutes = 5

  // Увеличение за сложность оружия
  const typeExtra: Record<string, number> = {
    sword: 3,
    dagger: 1,
    axe: 2,
    mace: 2,
    spear: 2,
    hammer: 4,
  }
  minutes += typeExtra[weaponType] || 2

  // Увеличение за материал
  if (material) {
    const materialExtra: Record<string, number> = {
      iron: 0,
      bronze: 1,
      steel: 2,
      silver: 3,
      gold: 4,
      mithril: 6,
    }
    minutes += materialExtra[material] || 2
  }

  return Date.now() + minutes * 60 * 1000
}

/**
 * Сгенерировать бонусные предметы
 */
export function generateBonusItems(): { resource: string; amount: number }[] | undefined {
  // 30% шанс бонусных предметов
  if (Math.random() > 0.3) return undefined

  const numItems = randomInt(1, 2)
  const items: { resource: string; amount: number }[] = []

  for (let i = 0; i < numItems; i++) {
    const bonus = randomElement(BONUS_ITEMS)
    items.push({
      resource: bonus.resource,
      amount: randomInt(bonus.minAmount, bonus.maxAmount),
    })
  }

  return items.length > 0 ? items : undefined
}

/**
 * Сгенерировать новый заказ
 */
export function generateOrder(params: OrderGenerationParams): OrderGenerationResult {
  const { playerLevel, playerFame, existingClients } = params

  // Минимальный уровень для заказов
  if (playerLevel < 2) {
    return { order: null, reason: 'Требуется уровень 2' }
  }

  // Генерация клиента
  const client = generateClientName()

  // Проверка на дубликат клиента
  if (existingClients.includes(client.name)) {
    return { order: null, reason: 'Клиент уже заказывает' }
  }

  // Определение типа оружия
  const weaponType = randomElement(WEAPON_TYPES)

  // Определение материала (50% шанс указать)
  const material = Math.random() > 0.5 ? randomElement(MATERIALS) : undefined

  // Определение минимального качества
  const minQuality = randomInt(
    Math.max(ORDER_MIN_QUALITY, playerLevel * 2),
    Math.min(ORDER_MAX_QUALITY, 50 + playerLevel * 2)
  )

  // Минимальная атака (только для высоких требований качества)
  const minAttack = minQuality > 70 ? randomInt(10, 20 + playerLevel) : undefined

  // Награды
  const goldReward = calculateGoldReward(minQuality, weaponType, material, playerLevel)
  const fameReward = calculateFameReward(minQuality, playerFame)
  const bonusItems = generateBonusItems()

  // Дедлайн
  const deadline = calculateDeadline(weaponType, material)

  const order: NPCOrder = {
    id: generateId(),
    clientName: client.name,
    clientTitle: client.title,
    clientIcon: client.icon,
    weaponType,
    material,
    minQuality,
    minAttack,
    goldReward,
    fameReward,
    bonusItems,
    deadline,
    status: 'available',
    requiredLevel: Math.max(1, playerLevel - 2),
    requiredFame: Math.max(0, playerFame - 50),
  }

  return { order }
}

// ================================
// ПРИНЯТИЕ ЗАКАЗА
// ================================

/**
 * Проверить возможность принятия заказа
 */
export function canAcceptOrder(params: {
  orderStatus: string
  hasActiveOrder: boolean
  playerLevel: number
  playerFame: number
  requiredLevel: number
  requiredFame: number
}): { can: boolean; reason: string } {
  if (params.orderStatus !== 'available') {
    return { can: false, reason: 'Заказ недоступен' }
  }

  if (params.hasActiveOrder) {
    return { can: false, reason: 'У вас уже есть активный заказ' }
  }

  if (params.playerLevel < params.requiredLevel) {
    return { can: false, reason: `Требуется уровень ${params.requiredLevel}` }
  }

  if (params.playerFame < params.requiredFame) {
    return { can: false, reason: `Требуется слава ${params.requiredFame}` }
  }

  return { can: true, reason: '' }
}

// ================================
// ВЫПОЛНЕНИЕ ЗАКАЗА
// ================================

/**
 * Проверить соответствие оружия требованиям заказа
 */
export function checkWeaponMatchesOrder(params: {
  weaponQuality: number
  weaponAttack: number
  weaponType: string
  weaponMaterial: string
  orderMinQuality: number
  orderMinAttack?: number
  orderWeaponType: string
  orderMaterial?: string
}): { matches: boolean; reason: string } {
  if (params.weaponType !== params.orderWeaponType) {
    return { matches: false, reason: 'Неподходящий тип оружия' }
  }

  if (params.weaponQuality < params.orderMinQuality) {
    return { matches: false, reason: `Качество должно быть не менее ${params.orderMinQuality}` }
  }

  if (params.orderMinAttack && params.weaponAttack < params.orderMinAttack) {
    return { matches: false, reason: `Атака должна быть не менее ${params.orderMinAttack}` }
  }

  if (params.orderMaterial && params.weaponMaterial !== params.orderMaterial) {
    return { matches: false, reason: `Требуется материал: ${params.orderMaterial}` }
  }

  return { matches: true, reason: '' }
}

/**
 * Выполнить заказ
 */
export function completeOrder(params: OrderCompletionParams): OrderCompletionResult {
  const check = checkWeaponMatchesOrder({
    weaponQuality: params.weaponQuality,
    weaponAttack: params.weaponAttack,
    weaponType: params.weaponType,
    weaponMaterial: params.weaponRecipeId.split('_')[0] || 'iron',
    orderMinQuality: params.orderMinQuality,
    orderMinAttack: params.orderMinAttack,
    orderWeaponType: params.orderWeaponType,
    orderMaterial: params.orderMaterial,
  })

  if (!check.matches) {
    return {
      success: false,
      goldEarned: 0,
      fameEarned: 0,
      error: check.reason,
    }
  }

  return {
    success: true,
    goldEarned: params.orderGoldReward,
    fameEarned: params.orderFameReward,
    bonusItems: params.orderBonusItems,
  }
}

// ================================
// ИСТЕЧЕНИЕ ЗАКАЗА
// ================================

/**
 * Проверить, истёк ли заказ
 */
export function isOrderExpired(deadline: number, currentTime: number = Date.now()): boolean {
  return currentTime > deadline
}

/**
 * Получить оставшееся время заказа в секундах
 */
export function getOrderRemainingTime(deadline: number, currentTime: number = Date.now()): number {
  return Math.max(0, Math.ceil((deadline - currentTime) / 1000))
}

/**
 * Проверить и обновить статус истёкших заказов
 */
export function checkExpiredOrders(orders: NPCOrder[]): NPCOrder[] {
  const now = Date.now()

  return orders.map(order => {
    if (order.status === 'available' && isOrderExpired(order.deadline, now)) {
      return { ...order, status: 'expired' as const }
    }
    return order
  })
}

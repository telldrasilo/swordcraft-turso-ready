/**
 * Orders Slice
 * Управление заказами NPC (рыночные заказы)
 * Использует utils для генерации
 */

import { StateCreator } from 'zustand'
import { ResourceKey } from './resources-slice'

// Импорт утилит
import { generateId, generateClientName } from '@/lib/store-utils/generators'

// ================================
// ТИПЫ
// ================================

/** Статус заказа */
export type OrderStatus = 'available' | 'in_progress' | 'completed' | 'expired'

/** Заказ от NPC */
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
  bonusItems?: OrderBonusItem[]
  deadline: number
  status: OrderStatus
  acceptedAt?: number
  completedAt?: number
  requiredLevel: number
  requiredFame: number
}

/** Бонусный предмет за выполнение заказа */
export interface OrderBonusItem {
  resource: string
  amount: number
}

/** Состояние заказов */
export interface OrdersState {
  orders: NPCOrder[]
  activeOrderId: string | null
}

/** Actions для заказов */
export interface OrdersActions {
  generateOrder: (playerLevel: number, playerFame: number) => NPCOrder | null
  acceptOrder: (orderId: string) => boolean
  completeOrder: (orderId: string, weaponId: string, weapon: { 
    quality: number
    attack: number
    type: string
    recipeId?: string
  }) => { success: boolean; rewards: { gold: number; fame: number; bonusItems?: OrderBonusItem[] } }
  expireOrder: (orderId: string) => void
  getActiveOrder: () => NPCOrder | undefined
  removeWeaponFromInventory: (weaponId: string) => void
  addResources: (resources: Record<string, number>) => void
  addPlayerFame: (fame: number) => void
  addStatisticsValue: (key: string, value: number) => void
}

/** Полный тип slice */
export type OrdersSlice = OrdersState & OrdersActions

// ================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// ================================

export const initialOrdersState: OrdersState = {
  orders: [],
  activeOrderId: null,
}

// ================================
// ДАННЫЕ ДЛЯ ГЕНЕРАЦИИ
// ================================

const weaponTypes = ['sword', 'dagger', 'axe', 'mace', 'spear', 'hammer']

const materials = ['iron', 'bronze', 'steel', 'silver', 'gold']

// ================================
// SLICE
// ================================

export const createOrdersSlice: StateCreator<
  OrdersSlice,
  [],
  [],
  OrdersSlice
> = (set, get) => ({
  // State
  orders: [],
  activeOrderId: null,

  // Actions
  generateOrder: (playerLevel, playerFame) => {
    const state = get()
    
    // Проверяем лимит заказов
    const activeOrders = state.orders.filter(o => o.status === 'available').length
    if (activeOrders >= 3) return null
    
    // Проверяем cooldown (не чаще 1 заказа в 30 секунд)
    const lastOrder = state.orders[state.orders.length - 1]
    if (lastOrder && Date.now() - lastOrder.deadline < -250000) return null

    // Генерируем клиента через утилиту
    const client = generateClientName()
    const weaponType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)]
    const material = materials[Math.floor(Math.random() * materials.length)]

    // Требования и награды масштабируются по уровню
    const minQuality = 30 + Math.floor(Math.random() * 30) + playerLevel * 2
    const goldReward = 50 + Math.floor(Math.random() * 50) + playerLevel * 20
    const fameReward = 5 + Math.floor(Math.random() * 10) + playerLevel * 2
    const deadline = Date.now() + (300 + Math.floor(Math.random() * 300)) * 1000 // 5-10 минут

    const order: NPCOrder = {
      id: generateId(),
      clientName: client.name,
      clientTitle: client.title,
      clientIcon: client.icon,
      weaponType,
      material,
      minQuality,
      minAttack: minQuality + 10,
      goldReward,
      fameReward,
      deadline,
      status: 'available',
      requiredLevel: Math.max(1, playerLevel - 2),
      requiredFame: Math.max(0, playerFame - 20),
    }

    // Проверяем, нет ли уже такого клиента
    if (state.orders.some(o => o.clientName === client.name && o.status === 'available')) {
      return null
    }

    set((state) => ({
      orders: [...state.orders, order]
    }))

    return order
  },

  acceptOrder: (orderId) => {
    const state = get()
    
    const order = state.orders.find(o => o.id === orderId)
    if (!order || order.status !== 'available') return false
    if (state.activeOrderId) return false // Уже есть активный заказ

    set((state) => ({
      orders: state.orders.map(o => 
        o.id === orderId 
          ? { ...o, status: 'in_progress' as const, acceptedAt: Date.now() }
          : o
      ),
      activeOrderId: orderId,
    }))

    return true
  },

  completeOrder: (orderId, weaponId, weapon) => {
    const state = get()
    
    const order = state.orders.find(o => o.id === orderId)
    if (!order || order.status !== 'in_progress') {
      return { success: false, rewards: { gold: 0, fame: 0 } }
    }

    // Проверяем требования
    if (weapon.quality < order.minQuality) {
      return { success: false, rewards: { gold: 0, fame: 0 } }
    }
    if (order.minAttack && weapon.attack < order.minAttack) {
      return { success: false, rewards: { gold: 0, fame: 0 } }
    }
    if (order.material && weapon.recipeId && !weapon.recipeId.includes(order.material)) {
      return { success: false, rewards: { gold: 0, fame: 0 } }
    }
    if (order.weaponType !== weapon.type) {
      return { success: false, rewards: { gold: 0, fame: 0 } }
    }

    // Удаляем оружие
    state.removeWeaponFromInventory(weaponId)

    // Начисляем награды
    const rewards = {
      gold: order.goldReward,
      fame: order.fameReward,
      bonusItems: order.bonusItems,
    }

    // Добавляем золото
    state.addResources({ gold: order.goldReward })

    // Добавляем бонусные предметы
    if (order.bonusItems) {
      const bonusResources: Record<string, number> = {}
      order.bonusItems.forEach(item => {
        bonusResources[item.resource] = item.amount
      })
      state.addResources(bonusResources)
    }

    // Добавляем славу
    state.addPlayerFame(order.fameReward)

    // Обновляем статистику
    state.addStatisticsValue('ordersCompleted', 1)
    state.addStatisticsValue('totalGoldEarned', order.goldReward)

    // Обновляем статус заказа
    set((state) => ({
      orders: state.orders.map(o => 
        o.id === orderId 
          ? { ...o, status: 'completed' as const, completedAt: Date.now() }
          : o
      ),
      activeOrderId: null,
    }))

    return { success: true, rewards }
  },

  expireOrder: (orderId) => {
    const state = get()
    
    set((state) => ({
      orders: state.orders.map(o => 
        o.id === orderId 
          ? { ...o, status: 'expired' as const }
          : o
      ),
      activeOrderId: state.activeOrderId === orderId ? null : state.activeOrderId,
    }))
  },

  getActiveOrder: () => {
    const state = get()
    if (!state.activeOrderId) return undefined
    return state.orders.find(o => o.id === state.activeOrderId)
  },

  // Заглушки для методов, которые будут делегированы в основной store
  removeWeaponFromInventory: () => {},
  addResources: () => {},
  addPlayerFame: () => {},
  addStatisticsValue: () => {},
})

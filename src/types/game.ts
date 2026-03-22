/**
 * Типы для заказов NPC и туториала
 */

// ================================
// ЭКРАНЫ ИГРЫ
// ================================

export type GameScreen = 'forge' | 'resources' | 'workers' | 'shop' | 'guild' | 'dungeons' | 'altar'

// ================================
// ЗАКАЗЫ NPC
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
  requiredLevel: number
  requiredFame: number
}

/** Бонусный предмет заказа */
export interface OrderBonusItem {
  resource: string
  amount: number
}

// ================================
// ТУТОРИАЛ
// ================================

/** Состояние туториала */
export interface TutorialState {
  isActive: boolean
  currentStep: number
  completedSteps: string[]
  skipped: boolean
}

/** Шаг туториала */
export interface TutorialStep {
  id: string
  title: string
  description: string
  targetElement?: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  highlight: boolean
  action?: () => void
}

// ================================
// НАЧАЛЬНЫЕ ЗНАЧЕНИЯ
// ================================

export const initialTutorial: TutorialState = {
  isActive: true,
  currentStep: 0,
  completedSteps: [],
  skipped: false,
}

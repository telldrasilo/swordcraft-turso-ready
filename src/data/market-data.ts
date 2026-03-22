/**
 * Система динамического ценообразования и заказов NPC
 * для SwordCraft: Idle Forge
 */

// ================================
// ТИПЫ
// ================================

export type WeaponType = 'sword' | 'axe' | 'dagger' | 'mace' | 'spear' | 'hammer'
export type MaterialType = 'iron' | 'bronze' | 'steel' | 'silver' | 'gold' | 'mithril'

// Заказ от NPC
export interface NPCOrder {
  id: string
  clientName: string
  clientTitle: string // "Гвардия", "Торговая компания", "Благородный лорд"
  clientIcon: string
  
  // Требования к оружию
  weaponType: WeaponType
  material?: MaterialType // Опционально
  minQuality: number // Минимальное качество (0-100)
  minAttack?: number // Опционально
  
  // Награда
  goldReward: number
  fameReward: number
  bonusItems?: { resource: string; amount: number }[]
  
  // Таймер
  deadline: number // Время в секундах
  
  // Состояние
  status: 'available' | 'in_progress' | 'completed' | 'expired'
  acceptedAt?: number
  completedAt?: number
  
  // Требования для появления
  requiredLevel: number
  requiredFame: number
}

// Рыночные цены
export interface MarketPrice {
  weaponType: WeaponType
  material: MaterialType
  basePrice: number
  currentMultiplier: number // 0.5 - 2.0
  trend: 'up' | 'down' | 'stable'
  lastUpdated: number
  demand: number // 0-100
  supply: number // 0-100
}

// ================================
// ДАННЫЕ ЗАКАЗОВ
// ================================

export const npcOrders: Omit<NPCOrder, 'id' | 'status' | 'acceptedAt' | 'completedAt'>[] = [
  // === Начальные заказы ===
  {
    clientName: 'Капитан городской стражи',
    clientTitle: 'Гвардия',
    clientIcon: '🛡️',
    weaponType: 'sword',
    material: 'iron',
    minQuality: 30,
    goldReward: 40,
    fameReward: 5,
    deadline: 300, // 5 минут
    requiredLevel: 1,
    requiredFame: 0,
  },
  {
    clientName: 'Местный охотник',
    clientTitle: 'Охотники',
    clientIcon: '🏹',
    weaponType: 'dagger',
    material: 'iron',
    minQuality: 25,
    goldReward: 25,
    fameReward: 3,
    deadline: 240,
    requiredLevel: 1,
    requiredFame: 0,
  },
  {
    clientName: 'Лесоруб из посёлка',
    clientTitle: 'Рабочие',
    clientIcon: '🪓',
    weaponType: 'axe',
    material: 'iron',
    minQuality: 20,
    goldReward: 35,
    fameReward: 2,
    deadline: 360,
    requiredLevel: 1,
    requiredFame: 0,
  },
  
  // === Средние заказы ===
  {
    clientName: 'Молодой рыцарь',
    clientTitle: 'Дворянство',
    clientIcon: '⚔️',
    weaponType: 'sword',
    material: 'bronze',
    minQuality: 50,
    goldReward: 100,
    fameReward: 15,
    bonusItems: [{ resource: 'copper', amount: 5 }],
    deadline: 600, // 10 минут
    requiredLevel: 5,
    requiredFame: 30,
  },
  {
    clientName: 'Торговая компания',
    clientTitle: 'Купцы',
    clientIcon: '💰',
    weaponType: 'dagger',
    minQuality: 45,
    goldReward: 80,
    fameReward: 8,
    deadline: 480,
    requiredLevel: 5,
    requiredFame: 20,
  },
  {
    clientName: 'Кузнец из соседнего города',
    clientTitle: 'Ремесленники',
    clientIcon: '🔨',
    weaponType: 'hammer',
    material: 'steel',
    minQuality: 55,
    goldReward: 150,
    fameReward: 12,
    deadline: 900,
    requiredLevel: 8,
    requiredFame: 50,
  },
  
  // === Высокие заказы ===
  {
    clientName: 'Герцог Северных земель',
    clientTitle: 'Знать',
    clientIcon: '👑',
    weaponType: 'sword',
    material: 'silver',
    minQuality: 70,
    minAttack: 25,
    goldReward: 350,
    fameReward: 40,
    bonusItems: [{ resource: 'silver', amount: 3 }],
    deadline: 1200, // 20 минут
    requiredLevel: 10,
    requiredFame: 100,
  },
  {
    clientName: 'Орден Серебряного Клинка',
    clientTitle: 'Рыцарский орден',
    clientIcon: '✨',
    weaponType: 'sword',
    material: 'silver',
    minQuality: 75,
    minAttack: 30,
    goldReward: 500,
    fameReward: 60,
    bonusItems: [{ resource: 'soulEssence', amount: 5 }],
    deadline: 1500,
    requiredLevel: 12,
    requiredFame: 150,
  },
  {
    clientName: 'Тёмный охотник',
    clientTitle: 'Тёмная гильдия',
    clientIcon: '🌑',
    weaponType: 'dagger',
    material: 'silver',
    minQuality: 65,
    goldReward: 400,
    fameReward: 30,
    deadline: 900,
    requiredLevel: 10,
    requiredFame: 80,
  },
  
  // === Элитные заказы ===
  {
    clientName: 'Королевский арсенал',
    clientTitle: 'Корона',
    clientIcon: '🏰',
    weaponType: 'sword',
    material: 'gold',
    minQuality: 80,
    minAttack: 40,
    goldReward: 1000,
    fameReward: 100,
    bonusItems: [
      { resource: 'gold', amount: 5 },
      { resource: 'soulEssence', amount: 10 }
    ],
    deadline: 1800, // 30 минут
    requiredLevel: 15,
    requiredFame: 300,
  },
  {
    clientName: 'Архимаг Академии',
    clientTitle: 'Маги',
    clientIcon: '🔮',
    weaponType: 'spear',
    material: 'mithril',
    minQuality: 85,
    minAttack: 50,
    goldReward: 2000,
    fameReward: 150,
    bonusItems: [
      { resource: 'mithril', amount: 2 },
      { resource: 'soulEssence', amount: 20 }
    ],
    deadline: 2400,
    requiredLevel: 20,
    requiredFame: 500,
  },
]

// ================================
// РЫНОЧНЫЕ ЦЕНЫ
// ================================

export const baseMarketPrices: MarketPrice[] = [
  // Железное оружие
  { weaponType: 'sword', material: 'iron', basePrice: 25, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 50, supply: 50 },
  { weaponType: 'dagger', material: 'iron', basePrice: 15, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 40, supply: 60 },
  { weaponType: 'axe', material: 'iron', basePrice: 30, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 45, supply: 55 },
  { weaponType: 'mace', material: 'iron', basePrice: 35, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 35, supply: 65 },
  { weaponType: 'spear', material: 'iron', basePrice: 45, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 40, supply: 60 },
  { weaponType: 'hammer', material: 'iron', basePrice: 55, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 30, supply: 70 },
  
  // Бронзовое оружие
  { weaponType: 'sword', material: 'bronze', basePrice: 50, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 55, supply: 45 },
  { weaponType: 'axe', material: 'bronze', basePrice: 60, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 50, supply: 50 },
  
  // Стальное оружие
  { weaponType: 'sword', material: 'steel', basePrice: 80, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 60, supply: 40 },
  { weaponType: 'dagger', material: 'steel', basePrice: 45, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 55, supply: 45 },
  { weaponType: 'spear', material: 'steel', basePrice: 95, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 50, supply: 50 },
  
  // Серебряное оружие
  { weaponType: 'sword', material: 'silver', basePrice: 180, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 70, supply: 30 },
  { weaponType: 'dagger', material: 'silver', basePrice: 120, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 65, supply: 35 },
  
  // Золотое оружие
  { weaponType: 'sword', material: 'gold', basePrice: 350, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 80, supply: 20 },
  
  // Мифриловое оружие
  { weaponType: 'sword', material: 'mithril', basePrice: 800, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 90, supply: 10 },
  { weaponType: 'dagger', material: 'mithril', basePrice: 500, currentMultiplier: 1.0, trend: 'stable', lastUpdated: Date.now(), demand: 85, supply: 15 },
]

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

// Генерация имени клиента
export function generateClientName(): string {
  const names = [
    'Грегор', 'Иван', 'Борис', 'Виктор', 'Алексей', 'Дмитрий', 'Николай',
    'Мария', 'Анна', 'Елена', 'Ольга', 'София', 'Наталья',
    'Пётр', 'Сергей', 'Андрей', 'Михаил', 'Артём', 'Максим'
  ]
  return names[Math.floor(Math.random() * names.length)]
}

// Генерация случайного заказа
export function generateRandomOrder(playerLevel: number, playerFame: number): NPCOrder | null {
  const availableOrders = npcOrders.filter(
    o => o.requiredLevel <= playerLevel && o.requiredFame <= playerFame
  )
  
  if (availableOrders.length === 0) return null
  
  const order = availableOrders[Math.floor(Math.random() * availableOrders.length)]
  
  return {
    ...order,
    id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    status: 'available',
  }
}

// Расчёт рыночной цены
export function calculateMarketPrice(
  basePrice: number,
  quality: number,
  marketMultiplier: number
): number {
  // Базовая цена × рыночный множитель × бонус за качество
  const qualityBonus = 1 + (quality - 50) / 100 // От 0.5x до 1.5x
  return Math.round(basePrice * marketMultiplier * qualityBonus)
}

// Обновление рыночной цены
export function updateMarketPrice(price: MarketPrice, sold: boolean): MarketPrice {
  const change = sold ? -1 : 1 // Продажа снижает цену, отсутствие продаж повышает
  
  const newDemand = Math.max(0, Math.min(100, price.demand + (Math.random() * 5 - 2.5)))
  const newSupply = Math.max(0, Math.min(100, price.supply + change * (Math.random() * 3 + 1)))
  
  // Новый множитель на основе спроса/предложения
  const demandSupplyRatio = newDemand / Math.max(1, newSupply)
  const newMultiplier = Math.max(0.5, Math.min(2.0, demandSupplyRatio))
  
  // Определение тренда
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (newMultiplier > price.currentMultiplier + 0.05) trend = 'up'
  else if (newMultiplier < price.currentMultiplier - 0.05) trend = 'down'
  
  return {
    ...price,
    currentMultiplier: newMultiplier,
    trend,
    demand: newDemand,
    supply: newSupply,
    lastUpdated: Date.now(),
  }
}

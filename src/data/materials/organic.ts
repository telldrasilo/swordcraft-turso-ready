/**
 * Органические материалы
 * Дерево и кожа для рукоятей и обмотки
 * 
 * Принцип баланса: У каждого материала есть плюсы И минусы.
 */

import type { Material } from '@/types/craft-v2'

export const woodMaterials: Material[] = [
  // ============================================
  // БАЗОВЫЕ ПОРОДЫ
  // ============================================
  
  {
    id: 'birch',
    name: 'Берёза',
    adjective: 'Берёзовый',
    category: 'wood',
    description: 'Лёгкое и мягкое дерево. Быстро обрабатывается, но менее прочно.',
    
    properties: {
      hardness: 25,
      flexibility: 55,
      weight: 2.5,  // Лёгкое
      conductivity: 10,
    },
    
    crafting: {
      workability: 90,  // Очень легко
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: -3,  // Менее прочно
      soulCapacity: 20,
      repairPotential: 1.4,  // Легко заменить
      enchantPower: 0.8,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 0.75,  // -25% времени — очень быстро
    craftRisk: 0,
    
    source: {
      rarity: 'common',
    },
    
    icon: '/icons/resources/wood.png',
  },
  
  {
    id: 'oak',
    name: 'Дуб',
    adjective: 'Дубовый',
    category: 'wood',
    description: 'Плотное и прочное дерево. Золотая середина для боевого оружия.',
    
    properties: {
      hardness: 40,
      flexibility: 45,
      weight: 3.5,
      conductivity: 12,
    },
    
    crafting: {
      workability: 65,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 8,  // +8% прочности
      soulCapacity: 35,
      repairPotential: 1.0,
      enchantPower: 0.9,
      enchantSlots: 1,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.0,  // Норма
    craftRisk: 2,
    
    dominantProperty: {
      type: 'durability',
      value: 60,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 3',
    },
    
    icon: '/icons/resources/wood.png',
  },
  
  {
    id: 'ash',
    name: 'Ясень',
    adjective: 'Ясеневый',
    category: 'wood',
    description: 'Гибкое и упругое дерево. Идеально для баланса оружия.',
    
    properties: {
      hardness: 35,
      flexibility: 70,  // Высокая гибкость
      weight: 3.2,
      conductivity: 15,
    },
    
    crafting: {
      workability: 70,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 5,
      soulCapacity: 40,
      repairPotential: 1.1,
      enchantPower: 1.0,
      enchantSlots: 1,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.05,  // +5% времени
    craftRisk: 3,
    
    dominantProperty: {
      type: 'balance',
      value: 72,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 5',
    },
    
    icon: '/icons/resources/wood.png',
  },
  
  {
    id: 'ebony',
    name: 'Эбеновое дерево',
    adjective: 'Эбеновый',
    category: 'wood',
    description: 'Редкое тёмное дерево с магическими свойствами. Тяжёлое, но мощное.',
    
    properties: {
      hardness: 55,
      flexibility: 35,
      weight: 4.5,  // Тяжёлое
      conductivity: 45,  // Хорошая проводимость
    },
    
    crafting: {
      workability: 45,  // Сложнее обрабатывать
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 12,
      soulCapacity: 70,
      repairPotential: 0.9,
      enchantPower: 1.4,
      enchantSlots: 2,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.3,  // +30% времени
    craftRisk: 8,
    
    dominantProperty: {
      type: 'conductivity',
      value: 55,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Торговец редкостями',
    },
    
    icon: '/icons/resources/wood.png',
  },
  
  {
    id: 'ironwood',
    name: 'Железное дерево',
    adjective: 'Железнодревесный',
    category: 'wood',
    description: 'Невероятно плотное дерево. Тяжёлое, почти как металл.',
    
    properties: {
      hardness: 70,  // Для дерева — очень высокая
      flexibility: 20,
      weight: 5.5,  // Очень тяжёлое
      conductivity: 8,
    },
    
    crafting: {
      workability: 30,  // Очень трудно
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 5,  // Можно использовать как дробящее
      durabilityBonus: 20,
      soulCapacity: 30,
      repairPotential: 0.7,
      enchantPower: 0.7,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.5,  // +50% времени
    craftRisk: 12,
    
    dominantProperty: {
      type: 'durability',
      value: 78,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Уровень кузнеца 10',
    },
    
    icon: '/icons/resources/wood.png',
  },
]

export const leatherMaterials: Material[] = [
  // ============================================
  // БАЗОВЫЕ КОЖИ
  // ============================================
  
  {
    id: 'raw_leather',
    name: 'Сырая кожа',
    adjective: '',
    category: 'leather',
    description: 'Неприятный запах, но дёшево и сердито. Быстро надевается.',
    
    properties: {
      hardness: 5,
      flexibility: 85,
      weight: 0.8,
      conductivity: 8,
    },
    
    crafting: {
      workability: 95,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: -2,
      soulCapacity: 10,
      repairPotential: 0.6,  // Быстро изнашивается
      enchantPower: 0.6,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 0.7,  // -30% — очень быстро
    craftRisk: 0,
    
    source: {
      rarity: 'common',
    },
    
    icon: '/icons/resources/leather.png',
  },
  
  {
    id: 'tanned_leather',
    name: 'Выделанная кожа',
    adjective: 'Кожаный',
    category: 'leather',
    description: 'Качественно обработанная кожа. Хороший хват, приятная на ощупь.',
    
    properties: {
      hardness: 12,
      flexibility: 75,
      weight: 1.0,
      conductivity: 12,
    },
    
    crafting: {
      workability: 80,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 3,
      soulCapacity: 20,
      repairPotential: 0.9,
      enchantPower: 0.85,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.0,
    craftRisk: 1,
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 2',
    },
    
    icon: '/icons/resources/leather.png',
  },
  
  {
    id: 'bull_leather',
    name: 'Бычья кожа',
    adjective: 'Бычьей выделки',
    category: 'leather',
    description: 'Плотная и толстая кожа. Надёжный хват для тяжёлого оружия.',
    
    properties: {
      hardness: 20,
      flexibility: 60,
      weight: 1.4,
      conductivity: 10,
    },
    
    crafting: {
      workability: 70,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 6,
      soulCapacity: 25,
      repairPotential: 1.0,
      enchantPower: 0.9,
      enchantSlots: 1,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.1,  // +10% времени
    craftRisk: 3,
    
    dominantProperty: {
      type: 'durability',
      value: 55,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 5',
    },
    
    icon: '/icons/resources/leather.png',
  },
  
  {
    id: 'dragon_leather',
    name: 'Драконья кожа',
    adjective: 'Драконьей кожи',
    category: 'leather',
    description: 'Легендарный материал. Огнеупорная, прочная, с магическими свойствами.',
    
    properties: {
      hardness: 35,
      flexibility: 50,
      weight: 1.2,
      conductivity: 60,
    },
    
    crafting: {
      workability: 40,  // Трудно работать
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 3,
      durabilityBonus: 10,
      soulCapacity: 100,
      repairPotential: 1.3,
      enchantPower: 1.6,
      enchantSlots: 2,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.4,  // +40% времени
    craftRisk: 15,
    
    dominantProperty: {
      type: 'conductivity',
      value: 70,
    },
    
    source: {
      rarity: 'legendary',
      unlockCondition: 'Добыть с дракона',
    },
    
    icon: '/icons/resources/leather.png',
  },
]

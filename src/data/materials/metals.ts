/**
 * Металлы и сплавы
 * Сбалансированная система материалов v2
 * 
 * Принцип баланса: У каждого материала есть плюсы И минусы.
 * Нет "лучшего" материала — есть подходящий для ситуации.
 */

import type { Material } from '@/types/craft-v2'

export const metalMaterials: Material[] = [
  // ============================================
  // БАЗОВЫЕ МЕТАЛЛЫ (сырьё)
  // ============================================
  
  {
    id: 'iron',
    name: 'Железо',
    adjective: 'Железный',
    category: 'metal',
    description: 'Надёжный металл для начинающего кузнеца. Мягкий, легко обрабатывается, не ломается.',
    
    properties: {
      hardness: 50,
      flexibility: 45,  // Хорошая — гнётся, не ломается
      weight: 5,
      conductivity: 15,
    },
    
    crafting: {
      workability: 70,  // Легко ковать
      meltingPoint: 1200,
      requiredHeat: 1,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 10,  // +10% — не ломается
      soulCapacity: 50,
      repairPotential: 1.3,  // Легко чинить
      enchantPower: 0.9,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 0.85,  // -15% времени — быстро работать
    craftRisk: 0,             // Без риска
    
    dominantProperty: {
      type: 'durability',
      value: 55,
    },
    
    source: {
      rarity: 'common',
    },
    
    icon: '/icons/resources/iron.png',
  },
  
  // ============================================
  // СПЛАВЫ (создаются из сырья)
  // ============================================
  
  {
    id: 'steel',
    name: 'Сталь',
    adjective: 'Стальной',
    category: 'alloy',
    description: 'Сплав железа с углеродом. Твёрже железа, но требует мастерства и времени.',
    
    properties: {
      hardness: 72,
      flexibility: 30,  // Низкая — может треснуть при ударе
      weight: 4.6,
      conductivity: 20,
    },
    
    crafting: {
      workability: 45,  // Требует мастерства
      meltingPoint: 1400,
      requiredHeat: 2,
    },
    
    weaponEffects: {
      attackBonus: 12,  // +12% урона
      durabilityBonus: 0,
      soulCapacity: 75,
      repairPotential: 0.85,  // Сложнее чинить
      enchantPower: 1.0,
      enchantSlots: 1,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.2,  // +20% времени
    craftRisk: 5,            // 5% риск трещины
    
    dominantProperty: {
      type: 'sharpness',
      value: 72,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 3',
    },
    
    // Рецепт создания
    recipe: {
      inputs: [
        { resourceId: 'iron_ore', quantity: 2, name: 'Железная руда' },
      ],
      fuel: { resourceId: 'coal', quantity: 2 },
      requiredLevel: 3,
    },
    
    icon: '/icons/resources/steelIngot.png',
  },
  
  {
    id: 'high_carbon_steel',
    name: 'Высокоуглеродистая сталь',
    adjective: 'Углеродистый',
    category: 'alloy',
    description: 'Сталь с высоким содержанием углерода. Очень острая, но хрупкая — требует осторожности.',
    
    properties: {
      hardness: 85,
      flexibility: 20,  // Низкая — хрупкая
      weight: 4.7,
      conductivity: 18,
    },
    
    crafting: {
      workability: 35,  // Сложно работать
      meltingPoint: 1450,
      requiredHeat: 2,
    },
    
    weaponEffects: {
      attackBonus: 20,  // +20% урона — очень острая
      durabilityBonus: -5,  // -5% — хрупкая
      soulCapacity: 60,
      repairPotential: 0.6,  // Сложно чинить
      enchantPower: 0.9,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.35,  // +35% времени
    craftRisk: 12,            // 12% риск
    
    dominantProperty: {
      type: 'sharpness',
      value: 85,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Уровень кузнеца 8',
    },
    
    recipe: {
      inputs: [
        { resourceId: 'iron_ore', quantity: 2, name: 'Железная руда' },
        { resourceId: 'coal', quantity: 3, name: 'Уголь' },
      ],
      requiredLevel: 8,
    },
    
    icon: '/icons/resources/steelIngot.png',
  },
  
  {
    id: 'silver_alloy',
    name: 'Серебряный сплав',
    adjective: 'Серебряный',
    category: 'alloy',
    description: 'Сплав с серебром для борьбы с нечистью. Высокая проводимость, но мягче стали.',
    
    properties: {
      hardness: 48,
      flexibility: 50,
      weight: 5.8,
      conductivity: 70,  // Высокая!
    },
    
    crafting: {
      workability: 55,
      meltingPoint: 1000,
      requiredHeat: 1,
    },
    
    weaponEffects: {
      attackBonus: 5,
      durabilityBonus: 0,
      soulCapacity: 120,  // Высокая вместимость души
      repairPotential: 1.0,
      enchantPower: 1.5,  // +50% к зачарованиям
      enchantSlots: 2,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.1,   // +10% времени
    craftRisk: 3,
    
    dominantProperty: {
      type: 'conductivity',
      value: 70,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Уровень кузнеца 6',
    },
    
    recipe: {
      inputs: [
        { resourceId: 'iron_ore', quantity: 1, name: 'Железная руда' },
        { resourceId: 'silver_ore', quantity: 2, name: 'Серебряная руда' },
      ],
      fuel: { resourceId: 'coal', quantity: 1 },
      requiredLevel: 6,
    },
    
    icon: '/icons/resources/silverIngot.png',
  },
  
  {
    id: 'cold_iron',
    name: 'Холодное железо',
    adjective: 'Холодный',
    category: 'metal',
    description: 'Особое железо, эффективное против магических существ. Сложно обрабатывать.',
    
    properties: {
      hardness: 65,
      flexibility: 35,
      weight: 5.2,
      conductivity: 5,  // Почти не проводит магию
    },
    
    crafting: {
      workability: 40,
      meltingPoint: 1350,
      requiredHeat: 2,
    },
    
    weaponEffects: {
      attackBonus: 8,
      durabilityBonus: 15,
      soulCapacity: 30,  // Низкая
      repairPotential: 1.1,
      enchantPower: 0.5,  // Плохо для зачарований
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.25,  // +25% времени
    craftRisk: 8,
    
    dominantProperty: {
      type: 'durability',
      value: 65,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 5',
    },
    
    icon: '/icons/resources/iron.png',
  },
  
  // ============================================
  // ЛЕГЕНДАРНЫЕ МАТЕРИАЛЫ
  // ============================================
  
  {
    id: 'mithril',
    name: 'Мифрил',
    adjective: 'Мифриловый',
    category: 'metal',
    description: 'Легендарный эльфийский металл. Лёгкий, прочный, идеально сбалансированный.',
    
    properties: {
      hardness: 88,
      flexibility: 75,
      weight: 2.5,  // Очень лёгкий!
      conductivity: 90,
    },
    
    crafting: {
      workability: 25,  // Требует великого мастерства
      meltingPoint: 2500,
      requiredHeat: 4,
    },
    
    weaponEffects: {
      attackBonus: 22,
      durabilityBonus: 25,
      soulCapacity: 200,
      repairPotential: 1.5,
      enchantPower: 1.8,
      enchantSlots: 3,
    },
    
    // БАЛАНС (даже легендарный материал имеет цену)
    craftTimeModifier: 1.6,  // +60% времени — очень долго
    craftRisk: 15,           // Высокий риск испортить редкий материал
    
    dominantProperty: {
      type: 'balance',
      value: 90,
    },
    
    source: {
      rarity: 'legendary',
      unlockCondition: 'Найти в эльфийских руинах',
    },
    
    icon: '/icons/resources/mithrilIngot.png',
  },
]

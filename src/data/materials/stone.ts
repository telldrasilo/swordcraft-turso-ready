/**
 * Каменные материалы
 * Для наверший, декоративных элементов и простого оружия
 * 
 * Принцип баланса: У каждого материала есть плюсы И минусы.
 */

import type { Material } from '@/types/craft-v2'

export const stoneMaterials: Material[] = [
  // ============================================
  // БАЗОВЫЕ КАМНИ
  // ============================================
  
  {
    id: 'fieldstone',
    name: 'Полевой камень',
    adjective: '',
    category: 'stone',
    description: 'Обычный камень, найденный повсюду. Тяжёлый, непритязательный.',
    
    properties: {
      hardness: 40,
      flexibility: 5,
      weight: 5.5,
      conductivity: 5,
    },
    
    crafting: {
      workability: 35,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 5,
      soulCapacity: 15,
      repairPotential: 0.4,  // Трудно чинить
      enchantPower: 0.5,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.0,
    craftRisk: 5,
    
    source: {
      rarity: 'common',
    },
    
    icon: '/icons/resources/stone.png',
  },
  
  {
    id: 'flint',
    name: 'Кремень',
    adjective: 'Кремнёвый',
    category: 'stone',
    description: 'Твёрдый камень, способный давать искру. Можно заточить до бритвенной остроты.',
    
    properties: {
      hardness: 72,
      flexibility: 3,  // Очень хрупкий
      weight: 4.5,
      conductivity: 8,
    },
    
    crafting: {
      workability: 25,  // Трудно обрабатывать
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 8,  // Острый
      durabilityBonus: -8,  // Хрупкий
      soulCapacity: 20,
      repairPotential: 0.2,  // Почти невозможно починить
      enchantPower: 0.7,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.2,  // +20% времени
    craftRisk: 15,  // Высокий риск скола
    
    dominantProperty: {
      type: 'sharpness',
      value: 68,
    },
    
    source: {
      rarity: 'common',
    },
    
    icon: '/icons/resources/stone.png',
  },
  
  {
    id: 'granite',
    name: 'Гранит',
    adjective: 'Гранитный',
    category: 'stone',
    description: 'Очень прочный камень с зернистой структурой. Идеален для наверший.',
    
    properties: {
      hardness: 78,
      flexibility: 2,
      weight: 6.2,  // Тяжёлый
      conductivity: 4,
    },
    
    crafting: {
      workability: 20,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 0,
      durabilityBonus: 18,  // Очень прочный
      soulCapacity: 25,
      repairPotential: 0.5,
      enchantPower: 0.4,
      enchantSlots: 0,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.35,  // +35% времени
    craftRisk: 8,
    
    dominantProperty: {
      type: 'durability',
      value: 72,
    },
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 4',
    },
    
    icon: '/icons/resources/stone.png',
  },
  
  {
    id: 'obsidian',
    name: 'Обсидиан',
    adjective: 'Обсидиановый',
    category: 'stone',
    description: 'Вулканическое стекло невероятной остроты. Режет как бритва, но крошится от удара.',
    
    properties: {
      hardness: 85,
      flexibility: 1,  // Крайне хрупкий
      weight: 4.2,
      conductivity: 20,
    },
    
    crafting: {
      workability: 15,  // Требует великого мастерства
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 18,  // Потрясающая острота
      durabilityBonus: -15,  // Крошится
      soulCapacity: 50,
      repairPotential: 0.1,  // Невозможно починить
      enchantPower: 1.3,
      enchantSlots: 1,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.5,  // +50% времени
    craftRisk: 25,  // Очень высокий риск
    
    dominantProperty: {
      type: 'sharpness',
      value: 90,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Вулканические пещеры',
    },
    
    icon: '/icons/resources/stone.png',
  },
  
  {
    id: 'bloodstone',
    name: 'Кровавик',
    adjective: 'Кровавый',
    category: 'stone',
    description: 'Тёмно-красный камень с мистическими свойствами. Проводит магию крови.',
    
    properties: {
      hardness: 55,
      flexibility: 8,
      weight: 5.0,
      conductivity: 50,  // Хорошая проводимость
    },
    
    crafting: {
      workability: 40,
      meltingPoint: 0,
      requiredHeat: 0,
    },
    
    weaponEffects: {
      attackBonus: 5,
      durabilityBonus: 5,
      soulCapacity: 80,
      repairPotential: 0.8,
      enchantPower: 1.4,
      enchantSlots: 2,
    },
    
    // БАЛАНС
    craftTimeModifier: 1.15,
    craftRisk: 10,
    
    dominantProperty: {
      type: 'conductivity',
      value: 58,
    },
    
    source: {
      rarity: 'rare',
      unlockCondition: 'Проклятые шахты',
    },
    
    icon: '/icons/resources/stone.png',
  },
]

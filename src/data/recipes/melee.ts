/**
 * Базовые рецепты оружия
 * Кинжалы и топоры
 */

import type { WeaponRecipe } from '@/types/craft-v2'

export const daggerRecipes: WeaponRecipe[] = [
  {
    id: 'basic_dagger',
    name: 'кинжал',
    type: 'dagger',
    description: 'Короткое колющее оружие для ближнего боя',
    
    parts: [
      {
        id: 'blade',
        name: 'Лезвие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 1,
        maxQuantity: 2,
      },
      {
        id: 'guard',
        name: 'Гарда',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 0.1,
        maxQuantity: 0.3,
        optional: true,
      },
      {
        id: 'grip',
        name: 'Рукоять',
        materialTypes: ['wood', 'leather'],
        minQuantity: 0.2,
        maxQuantity: 0.4,
        optional: false,
      },
      {
        id: 'pommel',
        name: 'Навершие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 0.1,
        maxQuantity: 0.3,
        optional: true,
      },
    ],
    
    combatPart: 'blade',
    
    baseStats: {
      attackBase: 25,
      durabilityBase: 40,
      weightBase: 0.8,
      soulCapacityBase: 30,
    },
    
    stages: [
      // Подготовка
      { stageType: 'prep_heating' },
      { stageType: 'prep_tools' },
      
      // Обработка сырья
      { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
      { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
      { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
      
      // Формовка
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_forging', target: 'blade' },
      { stageType: 'form_carving', target: 'grip' },
      
      // Сборка (проще чем у меча)
      { stageType: 'asmb_fitting' },
      { stageType: 'asmb_joining' },
      { stageType: 'asmb_balancing' },
      
      // Отделка
      { stageType: 'fin_hardening', target: 'blade' },
      { stageType: 'fin_tempering', target: 'blade' },
      { stageType: 'fin_sharpening', target: 'blade' },
      { stageType: 'fin_polishing' },
      { stageType: 'fin_inspection' },
    ],
    
    source: {
      rarity: 'common',
    },
    
    requiredLevel: 1,
  },
]

export const axeRecipes: WeaponRecipe[] = [
  {
    id: 'basic_axe',
    name: 'топор',
    type: 'axe',
    description: 'Рубящее оружие с массивным лезвием',
    
    parts: [
      {
        id: 'blade',
        name: 'Лезвие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 2,
        maxQuantity: 3.5,
      },
      {
        id: 'grip',
        name: 'Рукоять',
        materialTypes: ['wood'],
        minQuantity: 0.5,
        maxQuantity: 1,
        optional: false,
      },
    ],
    
    combatPart: 'blade',
    
    baseStats: {
      attackBase: 55,
      durabilityBase: 70,
      weightBase: 3,
      soulCapacityBase: 40,
    },
    
    stages: [
      // Подготовка
      { stageType: 'prep_heating' },
      { stageType: 'prep_tools' },
      
      // Обработка сырья
      { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
      { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
      { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
      
      // Формовка лезвия топора
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_forging', target: 'blade' },
      { stageType: 'form_upsetting', target: 'blade' },  // утолщение для веса
      { stageType: 'form_punching', target: 'blade' },   // проушина для рукояти
      
      // Формовка рукояти
      { stageType: 'form_carving', target: 'grip' },
      
      // Сборка
      { stageType: 'asmb_fitting' },
      { stageType: 'asmb_joining' },  // насадка топора на рукоять
      { stageType: 'asmb_wrapping', target: 'grip' },
      { stageType: 'asmb_balancing' },
      
      // Отделка
      { stageType: 'fin_hardening', target: 'blade' },
      { stageType: 'fin_tempering', target: 'blade' },
      { stageType: 'fin_grinding', target: 'blade' },
      { stageType: 'fin_sharpening', target: 'blade' },
      { stageType: 'fin_polishing' },
      { stageType: 'fin_inspection' },
    ],
    
    source: {
      rarity: 'common',
    },
    
    requiredLevel: 1,
  },
  
  {
    id: 'battle_axe',
    name: 'боевой топор',
    type: 'axe',
    description: 'Тяжёлый боевой топор с длинной рукоятью',
    
    parts: [
      {
        id: 'blade',
        name: 'Лезвие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 3,
        maxQuantity: 5,
      },
      {
        id: 'grip',
        name: 'Рукоять',
        materialTypes: ['wood'],
        minQuantity: 0.8,
        maxQuantity: 1.5,
        optional: false,
      },
    ],
    
    combatPart: 'blade',
    
    baseStats: {
      attackBase: 75,
      durabilityBase: 80,
      weightBase: 4.5,
      soulCapacityBase: 50,
    },
    
    stages: [
      // Подготовка
      { stageType: 'prep_heating' },
      { stageType: 'prep_tools' },
      
      // Обработка сырья
      { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
      { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
      { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
      
      // Формовка
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_forging', target: 'blade' },
      { stageType: 'form_upsetting', target: 'blade' },
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_shaping', target: 'blade' },
      { stageType: 'form_punching', target: 'blade' },
      { stageType: 'form_carving', target: 'grip' },
      
      // Сборка
      { stageType: 'asmb_fitting' },
      { stageType: 'asmb_joining' },
      { stageType: 'asmb_wrapping', target: 'grip' },
      { stageType: 'asmb_balancing' },
      
      // Отделка
      { stageType: 'fin_hardening', target: 'blade' },
      { stageType: 'fin_tempering', target: 'blade' },
      { stageType: 'fin_grinding', target: 'blade' },
      { stageType: 'fin_sharpening', target: 'blade' },
      { stageType: 'fin_polishing' },
      { stageType: 'fin_inspection' },
    ],
    
    source: {
      rarity: 'uncommon',
      unlockCondition: 'Уровень кузнеца 7',
    },
    
    requiredLevel: 7,
  },
]

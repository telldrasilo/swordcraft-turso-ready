/**
 * Базовые рецепты оружия
 * Мечи
 */

import type { WeaponRecipe } from '@/types/craft-v2'

export const swordRecipes: WeaponRecipe[] = [
  {
    id: 'basic_sword',
    name: 'меч',
    type: 'sword',
    description: 'Стандартный прямой меч с крестовидной гардой',
    
    parts: [
      {
        id: 'blade',
        name: 'Лезвие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 2.5,
        maxQuantity: 4,
      },
      {
        id: 'guard',
        name: 'Гарда',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 0.3,
        maxQuantity: 1,
        optional: false,
      },
      {
        id: 'grip',
        name: 'Рукоять',
        materialTypes: ['wood'],
        minQuantity: 0.3,
        maxQuantity: 0.6,
        optional: false,
      },
      {
        id: 'pommel',
        name: 'Навершие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 0.2,
        maxQuantity: 0.5,
        optional: false,
      },
    ],
    
    combatPart: 'blade',
    
    baseStats: {
      attackBase: 40,
      durabilityBase: 60,
      weightBase: 2.5,
      soulCapacityBase: 50,
    },
    
    stages: [
      // Подготовка
      { stageType: 'prep_heating' },
      { stageType: 'prep_tools' },
      
      // Обработка сырья для лезвия
      { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
      { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
      
      // Обработка сырья для гарды
      { stageType: 'proc_smelting', material: 'guard', target: 'guard' },
      { stageType: 'proc_rolling', material: 'guard', target: 'guard' },
      
      // Обработка дерева для рукояти
      { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
      
      // Обработка для навершия
      { stageType: 'proc_smelting', material: 'pommel', target: 'pommel' },
      
      // Формовка лезвия
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_forging', target: 'blade' },
      
      // Формовка гарды
      { stageType: 'form_heating', target: 'guard' },
      { stageType: 'form_shaping', target: 'guard' },
      
      // Формовка рукояти
      { stageType: 'form_carving', target: 'grip' },
      
      // Формовка навершия
      { stageType: 'form_heating', target: 'pommel' },
      { stageType: 'form_shaping', target: 'pommel' },
      
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
      rarity: 'common',
    },
    
    requiredLevel: 1,
  },
  
  {
    id: 'long_sword',
    name: 'длинный меч',
    type: 'sword',
    description: 'Удлинённый меч для двуручного или полуторного хвата',
    
    parts: [
      {
        id: 'blade',
        name: 'Лезвие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 3.5,
        maxQuantity: 5,
      },
      {
        id: 'guard',
        name: 'Гарда',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 0.4,
        maxQuantity: 1.2,
        optional: false,
      },
      {
        id: 'grip',
        name: 'Рукоять',
        materialTypes: ['wood'],
        minQuantity: 0.5,
        maxQuantity: 0.8,
        optional: false,
      },
      {
        id: 'pommel',
        name: 'Навершие',
        materialTypes: ['metal', 'alloy'],
        minQuantity: 0.3,
        maxQuantity: 0.7,
        optional: false,
      },
    ],
    
    combatPart: 'blade',
    
    baseStats: {
      attackBase: 50,
      durabilityBase: 65,
      weightBase: 3.2,
      soulCapacityBase: 60,
    },
    
    stages: [
      // Подготовка
      { stageType: 'prep_heating' },
      { stageType: 'prep_tools' },
      
      // Обработка сырья
      { stageType: 'proc_smelting', material: 'blade', target: 'blade' },
      { stageType: 'proc_rolling', material: 'blade', target: 'blade' },
      { stageType: 'proc_smelting', material: 'guard', target: 'guard' },
      { stageType: 'proc_rolling', material: 'guard', target: 'guard' },
      { stageType: 'proc_sawing', material: 'grip', target: 'grip' },
      { stageType: 'proc_smelting', material: 'pommel', target: 'pommel' },
      
      // Формовка (больше времени для длинного лезвия)
      { stageType: 'form_heating', target: 'blade' },
      { stageType: 'form_forging', target: 'blade' },
      { stageType: 'form_heating', target: 'blade' },  // повторный нагрев
      { stageType: 'form_drawing_out', target: 'blade' },
      { stageType: 'form_heating', target: 'guard' },
      { stageType: 'form_shaping', target: 'guard' },
      { stageType: 'form_carving', target: 'grip' },
      { stageType: 'form_heating', target: 'pommel' },
      { stageType: 'form_shaping', target: 'pommel' },
      
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
      unlockCondition: 'Уровень кузнеца 5',
    },
    
    requiredLevel: 5,
  },
]

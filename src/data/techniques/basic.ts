/**
 * Базовые техники крафта
 * Доступны с начала игры или открываются на ранних уровнях
 * 
 * Принцип баланса: Каждая техника имеет цену за бонусы.
 */

import type { Technique } from '@/types/craft-v2'

export const basicTechniques: Technique[] = [
  // ============================================
  // БАЗОВАЯ (без бонусов и штрафов)
  // ============================================
  
  {
    id: 'basic_forging',
    name: 'Базовая ковка',
    description: 'Стандартный процесс ковки без особых приёмов. Надёжно и предсказуемо.',
    
    effects: {
      qualityBonus: 0,
      appliesTo: ['all'],
    },
    
    // Нет штрафов — базовая техника
    
    compatibility: {
      appliesToMaterials: ['*'],  // Ко всем материалам
    },
    
    source: {
      type: 'start',
    },
  },
  
  // ============================================
  // СКЛАДЫВАНИЕ (качество за время)
  // ============================================
  
  {
    id: 'folded_steel',
    name: 'Складывание металла',
    description: 'Многократное складывание заготовки для выравнивания структуры. Улучшает качество, но значительно увеличивает время работы.',
    
    effects: {
      qualityBonus: 15,
      durabilityBonus: 5,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.4,    // +40% времени
      materialWaste: 0.05,        // 5% материала теряется
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],  // Только металлы
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 5',
    },
    
    requiredLevel: 5,
  },
  
  // ============================================
  // ДВОЙНАЯ ЗАКАЛКА (прочность за время)
  // ============================================
  
  {
    id: 'double_hardening',
    name: 'Двойная закалка',
    description: 'Повторная закалка для увеличения прочности клинка. Долго, но эффективно.',
    
    effects: {
      durabilityBonus: 12,
      qualityBonus: 3,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.3,    // +30% времени
      riskOfFailure: 3,           // 3% риск трещины
    },
    
    processMods: {
      addStage: {
        after: 'fin_hardening',
        stage: 'fin_hardening',  // Вторая закалка
      },
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 10',
    },
    
    requiredLevel: 10,
  },
  
  // ============================================
  // СБАЛАНСИРОВАННЫЙ ДИЗАЙН (качество за время)
  // ============================================
  
  {
    id: 'balanced_design',
    name: 'Сбалансированный дизайн',
    description: 'Особое внимание к балансу оружия. Улучшает качество, требует дополнительного времени на подгонку.',
    
    effects: {
      qualityBonus: 8,
      appliesTo: ['all'],
    },
    
    penalties: {
      durationMultiplier: 1.15,   // +15% времени
    },
    
    processMods: {
      addStage: {
        after: 'asmb_joining',
        stage: 'asmb_balancing',
      },
    },
    
    compatibility: {
      appliesToMaterials: ['*'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 8',
    },
    
    requiredLevel: 8,
  },
  
  // ============================================
  // МАСТЕРСКАЯ ПОЛИРОВКА (качество за время)
  // ============================================
  
  {
    id: 'masterful_polish',
    name: 'Мастерская полировка',
    description: 'Идеальная полировка для улучшения внешнего вида и снижения трения. Качественно, но долго.',
    
    effects: {
      qualityBonus: 5,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.1,    // +10% времени
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 5',
    },
    
    requiredLevel: 5,
  },
  
  // ============================================
  // ЭЛЬФИЙСКАЯ КОВКА (проводимость за риск)
  // ============================================
  
  {
    id: 'elven_forging',
    name: 'Эльфийская ковка',
    description: 'Древние техники эльфов для улучшения магических свойств. Требует мастерства, есть риск испортить заготовку.',
    
    effects: {
      conductivityBonus: 20,
      qualityBonus: 5,
      appliesTo: ['all'],
    },
    
    penalties: {
      durationMultiplier: 1.25,   // +25% времени
      riskOfFailure: 8,           // 8% риск снижения качества
      qualityPenalty: 10,         // При провале: -10 качества
    },
    
    compatibility: {
      appliesToMaterials: ['*'],
      incompatibleMaterials: ['iron', 'cold_iron'],  // Не работает с обычным железом
    },
    
    source: {
      type: 'dungeon',
      condition: 'Эльфийские руины',
    },
    
    requiredLevel: 20,
  },
]

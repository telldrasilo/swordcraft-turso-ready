/**
 * Продвинутые техники крафта
 * Требуют высокого мастерства или особых условий
 * 
 * Принцип баланса: Сильные бонусы — значительные штрафы.
 */

import type { Technique } from '@/types/craft-v2'

export const advancedTechniques: Technique[] = [
  // ============================================
  // НЕБЕСНАЯ ЗАКАЛКА (для небесного железа)
  // ============================================
  
  {
    id: 'celestial_hardening',
    name: 'Небесная закалка',
    description: 'Закалка в священном составе для небесных металлов. Мощно, но требует редких ингредиентов.',
    
    effects: {
      qualityBonus: 25,
      conductivityBonus: 15,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.5,    // +50% времени
      // Требует ингредиенты — это проверяется отдельно
    },
    
    processMods: {
      replaceStage: {
        'fin_hardening': 'fin_celestial_hardening',
      },
    },
    
    compatibility: {
      appliesToMaterials: ['celestial_iron'],
    },
    
    source: {
      type: 'dungeon',
      condition: 'Храм небесного огня',
    },
    
    requiredLevel: 25,
    requiredMaterials: ['celestial_iron'],
  },
  
  // ============================================
  // БЛАГОСЛОВЕНИЕ ДУХОВ (проводимость за время)
  // ============================================
  
  {
    id: 'spirit_blessing',
    name: 'Благословение духов',
    description: 'Ритуал освящения оружия после сборки. Сильно улучшает магические свойства, но требует времени на ритуал.',
    
    effects: {
      conductivityBonus: 30,
      qualityBonus: 10,
      appliesTo: ['all'],
    },
    
    penalties: {
      durationMultiplier: 1.35,   // +35% времени
    },
    
    processMods: {
      addStage: {
        after: 'fin_polishing',
        stage: 'fin_spirit_blessing',
      },
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      incompatibleMaterials: ['cold_iron'],  // Холодное железо не проводит магию
    },
    
    source: {
      type: 'guild',
      condition: 'Ранг гильдии 5',
    },
    
    requiredLevel: 20,
  },
  
  // ============================================
  // ХОЛОДНАЯ ВЫТЯЖКА (для ледяной стали)
  // ============================================
  
  {
    id: 'cold_drawing',
    name: 'Холодная вытяжка',
    description: 'Медленное вытягивание металла на морозе. Создаёт особую структуру, но требует холодного климата.',
    
    effects: {
      qualityBonus: 20,
      durabilityBonus: 15,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.8,    // +80% времени — очень долго
    },
    
    processMods: {
      replaceStage: {
        'form_forging': 'form_cold_drawing',
      },
    },
    
    compatibility: {
      appliesToMaterials: ['ice_steel'],
    },
    
    // Требует окружения 'cold' — проверяется отдельно
    
    source: {
      type: 'dungeon',
      condition: 'Ледяные пики',
    },
    
    requiredLevel: 22,
    requiredMaterials: ['ice_steel'],
  },
  
  // ============================================
  // ДРАКОНЬЯ ЗАКАЛКА (мощно, но рискованно)
  // ============================================
  
  {
    id: 'dragon_hardening',
    name: 'Драконья закалка',
    description: 'Экстремальная закалка в огне драконьего дыхания. Невероятно мощно, но высокий риск испортить клинок.',
    
    effects: {
      qualityBonus: 35,
      durabilityBonus: 25,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.2,    // +20% времени
      riskOfFailure: 15,          // 15% риск испортить!
      qualityPenalty: 25,         // При провале: -25 качества
    },
    
    processMods: {
      replaceStage: {
        'fin_hardening': 'fin_dragon_hardening',
      },
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'dungeon',
      condition: 'Логово дракона',
    },
    
    requiredLevel: 35,
  },
  
  // ============================================
  // РУНИЧЕСКАЯ ГРАВИРОВКА (проводимость за время)
  // ============================================
  
  {
    id: 'runic_engravement',
    name: 'Руническая гравировка',
    description: 'Нанесение рун на оружие для усиления магии. Долго и требует концентрации.',
    
    effects: {
      conductivityBonus: 40,
      qualityBonus: 5,
      appliesTo: ['all'],
    },
    
    penalties: {
      durationMultiplier: 1.45,   // +45% времени
      riskOfFailure: 5,           // 5% риск ошибки в руне
    },
    
    processMods: {
      addStage: {
        after: 'fin_polishing',
        stage: 'fin_runic_engravement',
      },
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      incompatibleMaterials: ['cold_iron'],
    },
    
    source: {
      type: 'guild',
      condition: 'Ранг гильдии 7',
    },
    
    requiredLevel: 28,
  },
  
  // ============================================
  // МАСТЕР-БАЛАНС (качество за время)
  // ============================================
  
  {
    id: 'master_balance',
    name: 'Мастер-баланс',
    description: 'Идеальная балансировка оружия для максимальной эффективности. Дополнительный этап балансировки.',
    
    effects: {
      qualityBonus: 15,
      appliesTo: ['all'],
    },
    
    penalties: {
      durationMultiplier: 1.2,    // +20% времени
    },
    
    processMods: {
      addStage: {
        after: 'asmb_balancing',
        stage: 'asmb_balancing',  // Дополнительная балансировка
      },
    },
    
    compatibility: {
      appliesToMaterials: ['*'],
    },
    
    source: {
      type: 'guild',
      condition: 'Ранг гильдии 4',
    },
    
    requiredLevel: 18,
  },
  
  // ============================================
  // ХУДОЖЕСТВЕННАЯ РЕЗЬБА (эстетика за время)
  // ============================================
  
  {
    id: 'artistic_carving',
    name: 'Художественная резьба',
    description: 'Узорная резьба на деревянных частях оружия. Улучшает хват и внешний вид.',
    
    effects: {
      qualityBonus: 8,
      aestheticValue: 20,         // +20% к цене/репутации
      appliesTo: ['grip', 'handle'],
    },
    
    penalties: {
      durationMultiplier: 1.25,   // +25% времени
    },
    
    compatibility: {
      appliesToCategories: ['wood', 'bone'],
      appliesToParts: ['grip', 'handle', 'pommel'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 6',
    },
    
    requiredLevel: 6,
  },
  
  // ============================================
  // ДУБЛЕНИЕ КОЖИ (для кожаных частей)
  // ============================================
  
  {
    id: 'leather_tanning',
    name: 'Дополнительное дубление',
    description: 'Повторная обработка кожи для улучшения износостойкости.',
    
    effects: {
      durabilityBonus: 15,
      appliesTo: ['grip', 'wrapping'],
    },
    
    penalties: {
      durationMultiplier: 1.15,   // +15% времени
    },
    
    compatibility: {
      appliesToCategories: ['leather'],
      appliesToParts: ['grip', 'wrapping'],
    },
    
    source: {
      type: 'guild',
      condition: 'Уровень кузнеца 4',
    },
    
    requiredLevel: 4,
  },
  
  // ============================================
  // ДИФФЕРЕНЦИАЛЬНАЯ ЗАКАЛКА (мощно, но рискованно)
  // ============================================
  
  {
    id: 'differential_hardening',
    name: 'Дифференциальная закалка',
    description: 'Разная закалка для разных частей клинка. Остриё твёрдое, обух упругий. Требует мастерства.',
    
    effects: {
      attackBonus: 10,
      durabilityBonus: -5,        // Сложнее сбалансировать
      qualityBonus: 12,
      appliesTo: ['blade'],
    },
    
    penalties: {
      durationMultiplier: 1.3,    // +30% времени
      riskOfFailure: 12,          // 12% риск трещины
      qualityPenalty: 20,         // При провале: -20 качества
    },
    
    compatibility: {
      appliesToCategories: ['metal', 'alloy'],
      appliesToParts: ['blade'],
    },
    
    source: {
      type: 'guild',
      condition: 'Ранг гильдии 6',
    },
    
    requiredLevel: 30,
  },
]

/**
 * Компонент для отображения детализации модификаторов
 * Показывает все применённые модификаторы с источниками
 */

'use client'

import React from 'react'
import type { ModifierDetail } from '@/lib/expedition-calculator-v2'
import { formatModifierValue } from '@/lib/expedition-calculator-v2'

// ================================
// ТИПЫ
// ================================

export interface ModifierBreakdownProps {
  title: string
  icon?: string
  modifiers: ModifierDetail[]
  baseValue?: number
  finalValue?: number
  showEmpty?: boolean
  compact?: boolean
}

// ================================
// КОМПОНЕНТ
// ================================

export function ModifierBreakdown({
  title,
  icon,
  modifiers,
  baseValue,
  finalValue,
  showEmpty = false,
  compact = false,
}: ModifierBreakdownProps) {
  // Фильтруем неприменённые модификаторы
  const activeModifiers = modifiers.filter(m => m.value !== 0)
  
  if (activeModifiers.length === 0 && !showEmpty) return null
  
  const positiveModifiers = activeModifiers.filter(m => m.type === 'positive')
  const negativeModifiers = activeModifiers.filter(m => m.type === 'negative')
  const neutralModifiers = activeModifiers.filter(m => m.type === 'neutral')
  
  return (
    <div className={`bg-stone-900/50 rounded-lg ${compact ? 'p-2' : 'p-3'} border border-stone-700/50`}>
      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-lg">{icon}</span>}
        <span className={`font-medium text-stone-300 ${compact ? 'text-sm' : ''}`}>
          {title}
        </span>
        {finalValue !== undefined && (
          <span className="ml-auto text-lg font-bold text-stone-100">
            {finalValue}
          </span>
        )}
      </div>
      
      {/* Базовое значение */}
      {baseValue !== undefined && (
        <div className="text-sm text-stone-400 mb-1">
          База: {baseValue}
        </div>
      )}
      
      {/* Положительные модификаторы */}
      {positiveModifiers.length > 0 && (
        <div className="space-y-1">
          {positiveModifiers.map((mod, i) => (
            <ModifierLine key={i} modifier={mod} compact={compact} />
          ))}
        </div>
      )}
      
      {/* Отрицательные модификаторы */}
      {negativeModifiers.length > 0 && (
        <div className="space-y-1 mt-1">
          {negativeModifiers.map((mod, i) => (
            <ModifierLine key={i} modifier={mod} compact={compact} />
          ))}
        </div>
      )}
      
      {/* Нейтральные модификаторы */}
      {neutralModifiers.length > 0 && (
        <div className="space-y-1 mt-1">
          {neutralModifiers.map((mod, i) => (
            <ModifierLine key={i} modifier={mod} compact={compact} />
          ))}
        </div>
      )}
      
      {/* Итого */}
      {baseValue !== undefined && finalValue !== undefined && activeModifiers.length > 0 && (
        <div className="mt-2 pt-2 border-t border-stone-700/50 flex justify-between text-sm">
          <span className="text-stone-400">Итого:</span>
          <span className={`font-medium ${finalValue >= baseValue ? 'text-green-400' : 'text-red-400'}`}>
            {formatModifierValue(finalValue - baseValue)}
          </span>
        </div>
      )}
    </div>
  )
}

// ================================
// СТРОКА МОДИФИКАТОРА
// ================================

interface ModifierLineProps {
  modifier: ModifierDetail
  compact?: boolean
}

function ModifierLine({ modifier, compact = false }: ModifierLineProps) {
  const colorClass = 
    modifier.type === 'positive' ? 'text-green-400' :
    modifier.type === 'negative' ? 'text-red-400' :
    'text-stone-400'
  
  return (
    <div className={`flex items-center gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
      {/* Иконка источника */}
      <span className="w-5 text-center">{modifier.sourceIcon}</span>
      
      {/* Название источника */}
      <span className="text-stone-400 flex-1 truncate">
        {modifier.source}
      </span>
      
      {/* Значение */}
      <span className={`font-medium ${colorClass}`}>
        {formatModifierValue(modifier.value)}
      </span>
    </div>
  )
}

// ================================
// КОМПАКТНАЯ ВЕРСИЯ ДЛЯ ТУЛТИПОВ
// ================================

export interface ModifierTooltipProps {
  modifiers: ModifierDetail[]
}

export function ModifierTooltipContent({ modifiers }: ModifierTooltipProps) {
  const activeModifiers = modifiers.filter(m => m.value !== 0)
  
  if (activeModifiers.length === 0) {
    return (
      <div className="text-sm text-stone-400">
        Нет активных модификаторов
      </div>
    )
  }
  
  return (
    <div className="space-y-1">
      {activeModifiers.map((mod, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span>{mod.sourceIcon}</span>
          <span className="text-stone-300">{mod.source}</span>
          <span className={`ml-auto font-medium ${
            mod.type === 'positive' ? 'text-green-400' :
            mod.type === 'negative' ? 'text-red-400' :
            'text-stone-400'
          }`}>
            {formatModifierValue(mod.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ================================
// СВОДКА ВСЕХ МОДИФИКАТОРОВ
// ================================

import type { ExpeditionCalculation } from '@/lib/expedition-calculator-v2'

export interface FullModifierBreakdownProps {
  calculation: ExpeditionCalculation
  compact?: boolean
}

export function FullModifierBreakdown({ calculation, compact = false }: FullModifierBreakdownProps) {
  return (
    <div className="space-y-3">
      {/* Шанс успеха */}
      <ModifierBreakdown
        title="Шанс успеха"
        icon="🎯"
        modifiers={calculation.successModifiers}
        finalValue={calculation.successChance}
        compact={compact}
      />
      
      {/* Золото */}
      {calculation.goldModifiers.length > 0 && (
        <ModifierBreakdown
          title="Множитель золота"
          icon="💰"
          modifiers={calculation.goldModifiers}
          compact={compact}
        />
      )}
      
      {/* Души войны */}
      {calculation.warSoulModifiers.length > 0 && (
        <ModifierBreakdown
          title="Души войны"
          icon="⚔️"
          modifiers={calculation.warSoulModifiers}
          finalValue={calculation.warSoul}
          compact={compact}
        />
      )}
      
      {/* Износ оружия */}
      {calculation.weaponWearModifiers.length > 0 && (
        <ModifierBreakdown
          title="Износ оружия"
          icon="🔧"
          modifiers={calculation.weaponWearModifiers}
          finalValue={calculation.weaponWear}
          compact={compact}
        />
      )}
      
      {/* Шанс потери */}
      {calculation.weaponLossModifiers.length > 0 && (
        <ModifierBreakdown
          title="Шанс потери оружия"
          icon="💔"
          modifiers={calculation.weaponLossModifiers}
          finalValue={calculation.weaponLossChance}
          compact={compact}
        />
      )}
      
      {/* Крит */}
      {calculation.critModifiers.length > 0 && (
        <ModifierBreakdown
          title="Шанс крита"
          icon="💥"
          modifiers={calculation.critModifiers}
          finalValue={calculation.critChance}
          compact={compact}
        />
      )}
    </div>
  )
}

export default ModifierBreakdown

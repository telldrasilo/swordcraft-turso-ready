/**
 * Бейдж "Уже встречали" для карточек искателей
 * Показывает информацию о предыдущих встречах и контрактах
 */

'use client'

import React from 'react'
import { useGameStore } from '@/store/game-store-composed'

// ================================
// ТИПЫ
// ================================

export interface MetBadgeProps {
  adventurerId: string
  compact?: boolean
}

// ================================
// КОМПОНЕНТ
// ================================

export function MetBadge({ adventurerId, compact = false }: MetBadgeProps) {
  const getMetBadge = useGameStore(state => state.getMetBadge)
  const badge = getMetBadge(adventurerId)
  
  if (!badge) return null
  
  if (compact) {
    return (
      <div className={`text-xs px-1.5 py-0.5 rounded ${badge.className} bg-stone-800/50`}>
        ✓
      </div>
    )
  }
  
  return (
    <div className={`text-xs px-2 py-1 rounded ${badge.className} bg-stone-800/50 flex items-center gap-1`}>
      <span>✓</span>
      <span>{badge.text}</span>
    </div>
  )
}

// ================================
// РАСШИРЕННЫЙ БЕЙДЖ С СТАТИСТИКОЙ
// ================================

export interface ExtendedMetBadgeProps {
  adventurerId: string
}

export function ExtendedMetBadge({ adventurerId }: ExtendedMetBadgeProps) {
  const knownAdventurers = useGameStore(state => state.knownAdventurers)
  const known = knownAdventurers.find(k => k.adventurerId === adventurerId)
  
  if (!known) return null
  
  const successRate = known.missionsCompleted > 0 
    ? Math.round((known.missionsSucceeded / known.missionsCompleted) * 100) 
    : 0
  
  return (
    <div className="bg-stone-800/70 rounded-lg p-2 text-xs space-y-1">
      {/* Заголовок */}
      <div className="flex items-center gap-1.5 text-amber-400">
        <span>✓</span>
        <span className="font-medium">Уже встречали</span>
      </div>
      
      {/* Статистика */}
      <div className="text-stone-400 space-y-0.5">
        <div className="flex justify-between">
          <span>Встреч:</span>
          <span className="text-stone-300">{known.metCount} раз(а)</span>
        </div>
        
        {known.missionsCompleted > 0 && (
          <>
            <div className="flex justify-between">
              <span>Миссий:</span>
              <span className="text-stone-300">{known.missionsCompleted}</span>
            </div>
            <div className="flex justify-between">
              <span>Успех:</span>
              <span className={successRate >= 70 ? 'text-green-400' : successRate >= 50 ? 'text-amber-400' : 'text-red-400'}>
                {successRate}%
              </span>
            </div>
          </>
        )}
        
        {known.totalGoldEarned > 0 && (
          <div className="flex justify-between">
            <span>Заработано:</span>
            <span className="text-yellow-400">{known.totalGoldEarned} золота</span>
          </div>
        )}
      </div>
      
      {/* Статус контракта */}
      {known.isAvailableForContract ? (
        <div className="pt-1 border-t border-stone-700/50 text-green-400 font-medium">
          📜 Доступен для контракта!
        </div>
      ) : known.missionsCompleted > 0 && known.missionsCompleted < 3 ? (
        <div className="pt-1 border-t border-stone-700/50 text-amber-400">
          📜 Ещё {3 - known.missionsCompleted} мисс(и/ий) до контракта
        </div>
      ) : null}
      
      {/* Любимое оружие */}
      {known.favoriteWeaponTypes.length > 0 && (
        <div className="pt-1 border-t border-stone-700/50 text-stone-400">
          <span>Любимое оружие: </span>
          <span className="text-stone-300">
            {known.favoriteWeaponTypes.map(w => getWeaponTypeName(w)).join(', ')}
          </span>
        </div>
      )}
    </div>
  )
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

function getWeaponTypeName(type: string): string {
  const names: Record<string, string> = {
    sword: 'Меч',
    axe: 'Топор',
    hammer: 'Молот',
    dagger: 'Кинжал',
    spear: 'Копьё',
    bow: 'Лук',
    crossbow: 'Арбалет',
    staff: 'Посох',
    shield: 'Щит',
  }
  return names[type] || type
}

export default MetBadge

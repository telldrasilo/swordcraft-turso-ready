/**
 * Expedition Forecast Section
 * Секция прогноза миссии для карточки искателя
 */

'use client'

import React from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { TrendingUp, CheckCircle, Skull, Coins, Zap, Swords } from 'lucide-react'
import type { Advice } from '@/lib/adventurer-advice'
import { ModifierBadge } from './ModifierBadge'

// ================================
// ТИПЫ
// ================================

interface ExpeditionData {
  difficulty: 'easy' | 'normal' | 'hard' | 'extreme' | 'legendary'
  type: 'hunt' | 'scout' | 'clear' | 'delivery' | 'magic'
  baseGold: number
  baseWarSoul: number
  successChance: number
  goldReward: number
  warSoulReward: number
  weaponWear: number
  weaponLossChance: number
  successModifiers: Array<{
    source: string
    sourceIcon: string
    value: number
    description: string
    type: string
  }>
  goldModifiers: Array<{
    source: string
    sourceIcon: string
    value: number
    description: string
    type: string
  }>
}

interface ExpeditionForecastProps {
  expedition: ExpeditionData
  advice: Advice | null
}

// ================================
// КОМПОНЕНТ
// ================================

export const ExpeditionForecast: React.FC<ExpeditionForecastProps> = ({
  expedition,
  advice,
}) => {
  // Цвет успеха
  const successColor = React.useMemo(() => {
    if (expedition.successChance >= 75) return 'text-green-400'
    if (expedition.successChance >= 50) return 'text-amber-400'
    return 'text-red-400'
  }, [expedition.successChance])

  return (
    <div className="space-y-3 p-4 rounded-lg bg-stone-950/80 border border-stone-700">
      <div className="flex items-center justify-between">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h4 className="text-sm font-medium text-stone-200 uppercase tracking-wider cursor-help flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                📈 Прогноз миссии
              </h4>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-semibold">Расчёт результатов миссии</p>
              <p className="text-xs text-stone-300">
                Предварительный расчёт на основе всех параметров искателя, оружия и условий миссии.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {advice && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className={`
                  ${advice.type === 'excellent' ? 'bg-green-900/60 text-green-300' : ''}
                  ${advice.type === 'good' ? 'bg-blue-900/60 text-blue-300' : ''}
                  ${advice.type === 'risky' ? 'bg-amber-900/60 text-amber-300' : ''}
                  ${advice.type === 'dangerous' ? 'bg-red-900/60 text-red-300' : ''}
                  ${advice.type === 'warning' ? 'bg-orange-900/60 text-orange-300' : ''}
                  ${advice.type === 'special' ? 'bg-purple-900/60 text-purple-300' : ''}
                  text-xs cursor-help
                `}>
                  {advice.icon} {advice.text}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">{advice.text}</p>
                {advice.detail && <p className="text-xs text-stone-300">{advice.detail}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Основные результаты */}
      <div className="grid grid-cols-2 gap-2">
        {/* Шанс успеха */}
        <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-green-300 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Шанс успеха
                    </span>
                    <span className={`text-xl font-bold ${successColor}`}>
                      {expedition.successChance}%
                    </span>
                  </div>
                  <div className="w-full bg-stone-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${
                        expedition.successChance >= 75 ? 'bg-green-500' :
                        expedition.successChance >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${expedition.successChance}%` }}
                    />
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Шанс успешного выполнения</p>
                <p className="text-xs text-stone-300">
                  Вероятность того, что миссия завершится успешно.
                  При успехе вы получите награду, при провале — потеряете депозит и рискуете потерять оружие.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Риск потери */}
        <div className="p-3 rounded-lg bg-red-900/20 border border-red-800/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-red-300 flex items-center gap-1">
                      <Skull className="w-3 h-3" />
                      Потеря оружия
                    </span>
                    <span className={`text-xl font-bold ${expedition.weaponLossChance > 15 ? 'text-red-400' : 'text-stone-300'}`}>
                      {expedition.weaponLossChance}%
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500">При провале миссии</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Риск потери оружия</p>
                <p className="text-xs text-stone-300">
                  Если миссия провалится, есть шанс потерять оружие навсегда.
                  Потерянное оружие можно восстановить за золото в квесте восстановления.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Награды */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-lg bg-amber-900/20 border border-amber-800/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <span className="text-xs text-amber-300 flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    Комиссия гильдии
                  </span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {expedition.goldReward} 💰
                  </div>
                  <p className="text-[10px] text-stone-500">При успехе миссии</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Заработок гильдии</p>
                <p className="text-xs text-stone-300">
                  Золото, которое гильдия получит при успешном выполнении миссии.
                  Сумма зависит от редкости искателя и его бонусов.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-800/30">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <span className="text-xs text-purple-300 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Души войны
                  </span>
                  <div className="text-2xl font-bold text-purple-400 mt-1">
                    ~{expedition.warSoulReward} ✨
                  </div>
                  <p className="text-[10px] text-stone-500">Для улучшения оружия</p>
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold">Души войны</p>
                <p className="text-xs text-stone-300">
                  Валюта для улучшения и зачарования оружия.
                  Количество зависит от редкости искателя и бонусов к душам.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Износ оружия */}
      <div className="p-3 rounded-lg bg-stone-800/50 border border-stone-700">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help flex items-center justify-between">
                <span className="text-xs text-stone-300 flex items-center gap-1">
                  <Swords className="w-3 h-3" />
                  Износ оружия
                </span>
                <span className="text-sm font-bold text-stone-200">
                  -{expedition.weaponWear}%
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold">Износ оружия</p>
              <p className="text-xs text-stone-300">
                Оружие потеряет эту часть прочности независимо от исхода миссии.
                При достижении 0% оружие сломается и станет непригодным.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Модификаторы успеха */}
      {expedition.successModifiers.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-stone-700">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-stone-400 cursor-help">
                  📊 Модификаторы успеха:
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">Все модификаторы шанса успеха</p>
                <p className="text-xs text-stone-300">
                  Каждый модификатор показывает, какой фактор и насколько влияет на итоговый шанс успеха.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-wrap gap-1.5">
            {expedition.successModifiers.map((mod, i) => (
              <ModifierBadge
                key={i}
                source={mod.source}
                sourceIcon={mod.sourceIcon}
                value={mod.value}
                description={mod.description}
                type={mod.type as 'positive' | 'negative' | 'neutral'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Модификаторы золота */}
      {expedition.goldModifiers.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-stone-700">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-stone-400 cursor-help">
                  💰 Модификаторы золота:
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold">Все модификаторы заработка</p>
                <p className="text-xs text-stone-300">
                  Каждый модификатор показывает, какой фактор и насколько влияет на итоговый заработок золота.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex flex-wrap gap-1.5">
            {expedition.goldModifiers.map((mod, i) => (
              <ModifierBadge
                key={i}
                source={mod.source}
                sourceIcon={mod.sourceIcon}
                value={mod.value}
                description={mod.description}
                type={mod.type as 'positive' | 'negative' | 'neutral'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Детали совета */}
      {advice?.detail && (
        <div className="text-xs text-stone-400 italic pt-2 border-t border-stone-700">
          💡 {advice.detail}
        </div>
      )}
    </div>
  )
}

export default ExpeditionForecast

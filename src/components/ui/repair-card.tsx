/**
 * Компонент карточки ремонта оружия
 * Отображает состояние оружия и доступные опции ремонта.
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wrench, 
  Heart, 
  Star, 
  Sparkles, 
  Coins, 
  Map, 
  Shield, 
  Zap, 
  AlertTriangle,
  Info,
  Clock,
  CheckCircle,
  X,
  ArrowRight,
  Crown,
  Flame,
  Droplet
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/tooltip'
import { InfoTooltip, RichTooltip } from '@/components/ui/game-tooltip'
import { useGameStore } from '@/store'
import { CraftedWeapon, qualityGrades, weaponTypeStats } from '@/data/weapon-recipes'
import { 
  RepairOption,
  RepairType,
  RepairResult,
  getSmithMastery,
  SMITH_MASTERY_LEVELS,
  getRiskDescription,
  type BlacksmithWorker,
} from '@/data/repair-system'
import { cn } from '@/lib/utils'

// Иконки типов оружия
function WeaponIcon({ type, className }: { type: string; className?: string }) {
  const iconMap: Record<string, string> = {
    sword: '⚔️',
    dagger: '🗡️',
    axe: '🪓',
    mace: '🔨',
    spear: '🔱',
    hammer: '⚒️'
  }
  return <span className={className}>{iconMap[type] || '⚔️'}</span>
}

// Цвета качества
const qualityColors: Record<string, { text: string; bg: string; border: string }> = {
  common: { text: 'text-stone-400', bg: 'bg-stone-900/80', border: 'border-stone-600' },
  uncommon: { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-600' },
  rare: { text: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-600' },
  epic: { text: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-600' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-600' },
  mythic: { text: 'text-rose-400', bg: 'bg-rose-900/30', border: 'border-rose-600' },
}

// Имена тиров оружия
const tierNames: Record<string, string> = {
  common: 'Обычное',
  uncommon: 'Необычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное',
  mythic: 'Мифическое'
}

// Карточка ремонта
interface RepairCardProps {
  weapon: CraftedWeapon
  onSelect?: (option: RepairType) => void
  selectedOption: RepairType | null
}

export function RepairCard({ weapon, onSelect, selectedOption }: RepairCardProps) {
  const qualityInfo = qualityGrades[weapon.qualityGrade]
  const durability = weapon.durability ?? 100
  const maxDurability = weapon.maxDurability ?? 100
  
  // Получаем ресурсы из стора
  const resources = useGameStore((state) => state.resources)
  
  // Тир оружия
  const tier = weapon.tier || 'common'
  
  // Прочность для индикатора
  const durabilityPercent = (durability / maxDurability) * 100
  const durabilityColor = durabilityPercent > 75 
    ? 'text-green-400' 
    : durabilityPercent > 50 
      ? 'text-yellow-400' 
      : 'text-red-400'
  
  // Получаем функции из стора (стабильные ссылки)
  const getRepairOptionsFn = useGameStore((state) => state.getRepairOptions)
  const getBestBlacksmithFn = useGameStore((state) => state.getBestBlacksmith)
  
  // Мемоизируем результаты
  const repairOptions = useMemo(() => getRepairOptionsFn(weapon.id), [getRepairOptionsFn, weapon.id])
  const bestBlacksmith = useMemo(() => getBestBlacksmithFn(), [getBestBlacksmithFn])
  
  // Мастерство кузнеца
  const mastery = bestBlacksmith 
    ? getSmithMastery(bestBlacksmith.level)
    : null
  
  // Выбранная опция
  const selectedOptionData = selectedOption 
    ? repairOptions.find(o => o.type === selectedOption)
    : null

  // Проверяем возможность ремонта
  const canRepair = (option: RepairOption): boolean => {
    // Проверяем золото
    if (resources.gold < option.goldCost) return false
    
    // Проверяем материалы
    for (const [mat, amount] of Object.entries(option.materials)) {
      if (amount && amount > 0) {
        const resourceKey = mat as keyof typeof resources
        if ((resources[resourceKey] || 0) < amount) {
          return false
        }
      }
    }
    
    return true
  }

  return (
    <Card className="card-medieval">
      <CardContent className="p-4">
        {/* Заголовок */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Иконка и тип оружия */}
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
              qualityColors[tier]?.bg || 'bg-stone-900/80'
            )}>
              <WeaponIcon type={weapon.type} />
            </div>
            
            {/* Информация */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-200">{weapon.name}</h4>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className={cn(
                  'text-xs', 
                  qualityColors[tier]?.text || 'text-stone-400', 
                  qualityColors[tier]?.border || 'border-stone-600'
                )}>
                  {tierNames[tier] || 'Обычное'}
                </Badge>
                <Badge className={cn('text-xs', qualityInfo?.color || 'text-stone-400')}>
                  {qualityInfo?.name || 'Обычное'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        {/* Прочность */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <Heart className={cn('w-4 h-4', durabilityColor)} />
            <span className={cn('text-sm font-medium', durabilityColor)}>
              {durability}%
            </span>
          </div>
          <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all', 
                durabilityPercent > 75 
                  ? 'bg-green-500' 
                  : durabilityPercent > 50 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
              )}
              style={{ width: `${durabilityPercent}%` }}
            />
          </div>
        </div>
        
        {/* Максимальная прочность */}
        {maxDurability < 100 && (
          <div className="flex items-center gap-1 text-xs text-stone-500 mb-3">
            <Shield className="w-3 h-3 text-stone-400" />
            <span>max: {maxDurability}%</span>
          </div>
        )}
        
        {/* Накопленные свойства (Душа Войны, Эпичность) */}
        <div className="pt-3 border-t border-stone-700/50 mb-3">
          <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Накопленные свойства</span>
          </p>
          
          <div className="flex flex-wrap gap-2">
            {/* Душа Войны */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-help transition-colors',
                  weapon.warSoul > 0 
                    ? 'bg-purple-900/30 border-purple-600/50 text-purple-400'
                    : 'bg-stone-800/80 border-stone-700/50 text-stone-500'
                )}>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-stone-400">Душа:</span>
                  <span className={cn(
                    'text-sm font-semibold', 
                    weapon.warSoul > 0 ? 'text-purple-400' : 'text-stone-500'
                  )}>
                    {weapon.warSoul}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-semibold text-purple-400">Душа Войны: {weapon.warSoul}</p>
                <p className="text-xs text-stone-400 mt-1">
                  {weapon.warSoul > 0 
                    ? 'Накоплена в экспедициях. Используется для зачарований в Алтаре.'
                    : 'При распылении даёт эссенцию душ.'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
            
            {/* Эпический множитель */}
            {(weapon.epicMultiplier ?? 1) > 1 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-help transition-colors',
                    'bg-amber-900/30 border-amber-600/50 text-amber-400'
                  )}>
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs text-stone-400">Эпичность:</span>
                    <span className="text-sm font-semibold text-amber-400">
                      ×{(weapon.epicMultiplier ?? 1).toFixed(2)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold text-amber-400">Эпичность: ×{(weapon.epicMultiplier ?? 1).toFixed(2)}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Растёт с каждым приключении. Чем выше — тем больше эссенции при распылении.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Количество экспедиций */}
            {(weapon.adventureCount ?? 0) > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border bg-stone-800/80 border-stone-700/50 text-stone-400 cursor-help">
                    <Map className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs text-stone-400">Вылазок:</span>
                    <span className="text-sm font-semibold text-stone-300">
                      {weapon.adventureCount ?? 0}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold text-stone-300">Экспедиций: {weapon.adventureCount ?? 0}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Количество завершённых приключений с этим оружием.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        
        {/* Разделитель */}
        <div className="h-px bg-stone-700/50 my-3" />
        
        {/* Опции ремонта */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
            <Wrench className="w-4 h-4 text-stone-400" />
            <span>Выберите тип ремонта:</span>
          </div>
          
          {/* Информация о кузнеце */}
          {bestBlacksmith ? (
            <div className="p-2 rounded-lg bg-stone-800/50 border border-stone-700/50 mb-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-stone-300">{bestBlacksmith.name}</span>
                  {mastery && (
                    <Badge variant="outline" className="text-xs text-amber-400 border-amber-600/50">
                      {mastery.name}
                    </Badge>
                  )}
                </div>
                {mastery && (
                  <span className="text-green-400">+{mastery.successBonus}% к успеху</span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-stone-800/30 border border-stone-700/50 mb-2">
              <div className="flex items-center gap-2 text-xs text-stone-500">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Нет кузнеца — ремонт с базовыми параметрами</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2">
            {repairOptions.map((option) => {
              const affordable = canRepair(option)
              const risks = mastery ? getRiskDescription(option.type, mastery) : []
                
                return (
                  <motion.button
                    key={option.type}
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: affordable ? 1.02 : 1 }}
                    whileTap={{ scale: affordable ? 0.98 : 1 }}
                    onClick={() => affordable && onSelect?.(option.type)}
                    disabled={!affordable}
                    className={cn(
                      'relative p-3 rounded-lg border transition-all',
                      selectedOption === option.type
                        ? 'border-amber-500 bg-amber-800/20'
                        : affordable
                          ? 'border-stone-600 bg-stone-800/50 hover:border-amber-600/50'
                          : 'border-stone-700 bg-stone-900/50 opacity-50 cursor-not-allowed',
                      'flex flex-col items-start gap-2 text-left w-full'
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xl">{option.icon}</span>
                      <span className="font-semibold text-stone-200">{option.name}</span>
                    </div>
                    
                    <p className="text-xs text-stone-400">{option.description}</p>
                    
                    <div className="mt-2 space-y-1.5 w-full">
                      {/* Материалы */}
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(option.materials)
                          .filter(([mat, amount]) => mat && amount && amount > 0)
                          .map(([mat, amount]) => (
                            <Badge key={mat} variant="outline" className="text-xs">
                              {mat}: {amount}
                            </Badge>
                          ))
                        }
                      </div>
                      
                      {/* Золото */}
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className={cn(
                          'font-semibold', 
                          option.goldCost > 0 ? 'text-amber-400' : 'text-stone-500'
                        )}>
                          {option.goldCost}
                        </span>
                      </div>
                      
                      {/* Риски */}
                      {risks.length > 0 && (
                        <div className="space-y-1">
                          {risks.map((risk, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-red-300">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{risk}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Шанс успеха */}
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-stone-300">Шанс успеха:</span>
                        <Badge variant="outline" className="text-xs">
                          {mastery ? option.baseSuccessChance + mastery.successBonus : option.baseSuccessChance}%
                        </Badge>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
        </div>
      </CardContent>
    </Card>
  )
}

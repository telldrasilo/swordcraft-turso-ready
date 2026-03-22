/**
 * WeaponInventoryCard - карточка оружия в инвентаре
 */

'use client'

import { motion } from 'framer-motion'
import { 
  Sword, Heart, Star, Coins, Trash2, Map, Crown, Sparkles, Zap,
  Package, Wrench, Hammer
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { useGameStore } from '@/store'
import { 
  weaponRecipes, 
  weaponTypeStats, 
  qualityGrades,
  type CraftedWeapon
} from '@/data/weapon-recipes'
import type { WeaponMaterialUsed } from '@/store/slices/craft-slice'
import { cn } from '@/lib/utils'
import { WeaponIcon, qualityColors } from './forge-utils'

interface WeaponInventoryCardProps {
  weapon: CraftedWeapon
}

export function WeaponInventoryCard({ weapon }: WeaponInventoryCardProps) {
  const sellWeapon = useGameStore((state) => state.sellWeapon)
  const isWeaponInExpedition = useGameStore((state) => state.isWeaponInExpedition)
  const [isSelling, setIsSelling] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const qualityInfo = qualityGrades[weapon.qualityGrade]
  const typeStats = weaponTypeStats[weapon.type]
  const recipe = weaponRecipes.find(r => r.id === weapon.recipeId)
  
  // Проверяем, в экспедиции ли оружие
  const inExpedition = isWeaponInExpedition(weapon.id)
  
  // Прочность для индикаторов
  const durability = weapon.durability ?? 100
  const durabilityColor = durability > 50 ? 'text-green-400' : durability > 25 ? 'text-yellow-400' : 'text-red-400'
  const durabilityBgColor = durability > 50 ? 'bg-green-500' : durability > 25 ? 'bg-yellow-500' : 'bg-red-500'
  
  // Тир оружия
  const tier = recipe?.tier || 'common'
  const tierColor = qualityColors[tier]
  const tierNames: Record<string, string> = {
    common: 'Обычное', uncommon: 'Необычное', rare: 'Редкое',
    epic: 'Эпическое', legendary: 'Легендарное', mythic: 'Мифическое'
  }
  
  const handleSell = () => {
    setIsSelling(true)
    setTimeout(() => {
      sellWeapon(weapon.id)
      setIsSelling(false)
      setShowConfirm(false)
    }, 500)
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      layout
    >
      <Card className={cn(
        'card-medieval transition-all group relative overflow-hidden',
        'hover:border-amber-600/50',
        inExpedition && 'border-green-600/50 bg-green-900/10'
      )}>
        {/* Фоновое свечение качества */}
        <div className={cn(
          'absolute inset-0 opacity-10 pointer-events-none',
          qualityInfo.color.replace('text-', 'bg-')
        )} />
        
        {/* Индикатор экспедиции */}
        {inExpedition && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
        )}
        
        <CardContent className="p-4 relative">
          {/* Заголовок с иконкой и названием */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
                tierColor.bg
              )}>
                <WeaponIcon type={weapon.type} />
              </div>
              <div>
                <h4 className="font-semibold text-stone-200">{weapon.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-stone-500">{typeStats?.name}</span>
                  {recipe?.material && (
                    <>
                      <span className="text-stone-600">•</span>
                      <span className="text-xs text-stone-500 capitalize">{recipe.material}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Бейджи качества */}
            <div className="flex flex-col items-end gap-1">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <Badge className={cn('font-semibold cursor-help', qualityInfo.color)}>
                    {qualityInfo.name}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Качество: {qualityInfo.name} (×{qualityInfo.multiplier})</p>
                  <p className="text-xs text-stone-400">Влияет на атаку и цену</p>
                </TooltipContent>
              </Tooltip>
              <Badge variant="outline" className={cn('text-xs cursor-help', tierColor.text, tierColor.border)}>
                {tierNames[tier]}
              </Badge>
            </div>
          </div>

          {/* ===== ОСНОВНЫЕ ХАРАКТЕРИСТИКИ ===== */}
          <div className="space-y-3 mb-3">
            
            {/* АТАКА */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-3 cursor-help bg-red-500/10 rounded-lg px-3 py-2">
                  <Sword className="w-5 h-5 text-red-400" />
                  <div className="flex-1">
                    <div className="text-xs text-stone-500 mb-0.5">Атака</div>
                    <div className="text-xl font-bold text-red-400">{weapon.attack}</div>
                  </div>
                  <div className="text-xs text-stone-500">{typeStats?.name}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold text-red-400">Атака: {weapon.attack}</p>
                <p className="text-xs text-stone-400">Определяет урон в бою и эффективность экспедиций</p>
              </TooltipContent>
            </Tooltip>

            {/* ПРОЧНОСТЬ */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Heart className={cn('w-4 h-4', durabilityColor)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Прочность</span>
                      <span className={cn('text-xs font-medium', durabilityColor)}>{durability}%</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all', durabilityBgColor)}
                        style={{ width: `${durability}%` }}
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-semibold">Прочность: {durability}%</p>
                <p className="text-xs text-stone-400">Уменьшается в экспедициях. При 0% оружие непригодно</p>
              </TooltipContent>
            </Tooltip>

            {/* КАЧЕСТВО */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <Star className={cn('w-4 h-4', qualityInfo.color)} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-500">Качество</span>
                      <span className={cn('text-xs font-medium', qualityInfo.color)}>{weapon.quality}%</span>
                    </div>
                    <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full transition-all', qualityInfo.color.replace('text-', 'bg-'))}
                        style={{ width: `${weapon.quality}%` }}
                      />
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className={cn('font-semibold', qualityInfo.color)}>Качество: {weapon.quality}%</p>
                <p className="text-xs text-stone-400">Влияет на атаку и цену. Зависит от навыков кузнецов</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* ===== СПЕЦИАЛЬНЫЕ СВОЙСТВА ===== */}
          <div className="pt-2 border-t border-stone-700/50 mb-3">
            <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Накопленные свойства
            </p>
            <div className="flex flex-wrap gap-2">
              {/* Душа Войны */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <div className={cn(
                    'flex items-center gap-2 px-2.5 py-1.5 rounded-md border cursor-help transition-colors',
                    weapon.warSoul > 0 
                      ? 'bg-purple-900/30 border-purple-600/50 text-purple-400' 
                      : 'bg-stone-800/80 border-stone-700/50 text-stone-500'
                  )}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-xs text-stone-400">Душа:</span>
                    <span className={cn('text-sm font-semibold', weapon.warSoul > 0 ? 'text-purple-400' : 'text-stone-500')}>
                      {weapon.warSoul}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="font-semibold text-purple-400">Душа Войны: {weapon.warSoul}</p>
                  <p className="text-xs text-stone-400 mt-1">
                    {weapon.warSoul > 0 
                      ? 'Накоплена в экспедициях. Используется для зачарований в Алтаре.'
                      : 'Накапливается в экспедициях. Чем больше душ — тем сильнее зачарования!'}
                  </p>
                </TooltipContent>
              </Tooltip>
              
              {/* Эпический множитель */}
              {(weapon.epicMultiplier ?? 1) > 1 && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-amber-900/30 border border-amber-600/50 text-amber-400 cursor-help">
                      <Crown className="w-3.5 h-3.5" />
                      <span className="text-xs text-stone-400">Эпичность:</span>
                      <span className="text-sm font-semibold text-amber-400">×{(weapon.epicMultiplier ?? 1).toFixed(2)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-semibold text-amber-400">Эпичность: ×{(weapon.epicMultiplier ?? 1).toFixed(2)}</p>
                    <p className="text-xs text-stone-400">Увеличивает награды от экспедиций. Растёт с каждым приключением!</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              {/* Количество экспедиций */}
              {(weapon.adventureCount ?? 0) > 0 && (
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-stone-800/80 border border-stone-700/50 text-stone-400 cursor-help">
                      <Map className="w-3.5 h-3.5" />
                      <span className="text-xs text-stone-400">Вылазок:</span>
                      <span className="text-sm font-semibold text-stone-300">{weapon.adventureCount ?? 0}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="font-semibold">Экспедиций: {weapon.adventureCount ?? 0}</p>
                    <p className="text-xs text-stone-400">Количество успешных вылазок с этим оружием</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* ===== МАТЕРИАЛЫ ===== */}
          {weapon.materialsUsed && weapon.materialsUsed.length > 0 && (
            <div className="pt-2 border-t border-stone-700/50 mb-3">
              <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                <Package className="w-3 h-3" />
                Состав оружия
              </p>
              <div className="space-y-1.5">
                {weapon.materialsUsed.map((mat, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between text-xs bg-stone-800/50 rounded px-2 py-1.5"
                  >
                    <span className="text-stone-500">{mat.partName}:</span>
                    <span className="text-stone-300 font-medium">
                      {mat.materialName}
                      {mat.quantity > 1 && <span className="text-stone-500 ml-1">×{mat.quantity}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===== ТЕХНИКИ ===== */}
          {weapon.techniquesUsed && weapon.techniquesUsed.length > 0 && (
            <div className="pt-2 border-t border-stone-700/50 mb-3">
              <p className="text-xs text-stone-500 mb-2 flex items-center gap-1">
                <Hammer className="w-3 h-3" />
                Техники
              </p>
              <div className="flex flex-wrap gap-1.5">
                {weapon.techniquesUsed.map((tech, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline"
                    className="text-xs bg-purple-900/20 border-purple-600/30 text-purple-300"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Цена продажи */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-700/50 mb-3">
            <span className="text-xs text-stone-500">Цена продажи:</span>
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <Coins className="w-4 h-4" />
              <span>{weapon.sellPrice}</span>
            </div>
          </div>
          
          {/* Кнопка продажи */}
          {inExpedition ? (
            <Button 
              size="sm"
              className="w-full"
              disabled
            >
              <Map className="w-4 h-4 mr-2" />
              В экспедиции
            </Button>
          ) : !showConfirm ? (
            <Button 
              size="sm"
              className="w-full bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-green-100"
              onClick={() => setShowConfirm(true)}
            >
              <Coins className="w-4 h-4 mr-2" />
              Продать за {weapon.sellPrice} 💰
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                className="flex-1 border-stone-600 text-stone-400"
                onClick={() => setShowConfirm(false)}
              >
                Отмена
              </Button>
              <Button 
                size="sm"
                className="flex-1 bg-red-800 hover:bg-red-700 text-red-100"
                onClick={handleSell}
                disabled={isSelling}
              >
                {isSelling ? (
                  <Zap className="w-4 h-4 animate-pulse" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Подтвердить
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

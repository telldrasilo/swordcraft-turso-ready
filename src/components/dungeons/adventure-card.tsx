/**
 * Adventure Card
 * Карточка приключения/вылазки
 */

'use client'

import { motion } from 'framer-motion'
import { 
  Star, Compass, ChevronRight, Lock, Timer, Coins, Sparkles, Heart
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { useMemo } from 'react'
import { 
  getDifficultyInfo,
  adventureTagsInfo,
  type Adventure
} from '@/data/adventures'

interface AdventureCardProps {
  adventure: Adventure
  isAvailable: boolean
  isActive: boolean
  onSelect: () => void
}

export function AdventureCard({
  adventure,
  isAvailable,
  isActive,
  onSelect
}: AdventureCardProps) {
  const difficultyInfo = getDifficultyInfo(adventure.difficulty)
  
  // Используем индивидуальные селекторы
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const player = useGameStore((state) => state.player)
  
  // Мемоизированный поиск подходящего оружия
  const suitableWeapons = useMemo(() => 
    weapons.filter(w => 
      w.attack >= adventure.minWeaponLevel * 5 &&
      (w.durability ?? 100) > 10 // Не сломанное
    ),
    [weapons, adventure.minWeaponLevel]
  )
  
  // Мемоизированные проверки
  const hasWeapons = suitableWeapons.length > 0
  const canEmbark = isAvailable && hasWeapons
  const hasAnyWeapon = weapons.length > 0
  const hasBrokenWeapons = weapons.some(w => (w.durability ?? 100) <= 10)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className={cn(
        'card-medieval transition-all',
        canEmbark && 'hover:border-amber-600/50',
        isActive && 'border-green-600/50 bg-green-900/10'
      )}>
        <CardContent className="p-4">
          {/* Заголовок */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
              adventure.bgColor
            )}>
              {adventure.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-stone-200">{adventure.name}</h3>
                <span className={cn('text-sm font-medium', difficultyInfo.color)}>
                  {difficultyInfo.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-3 h-3',
                      star <= difficultyInfo.stars 
                        ? 'text-amber-400 fill-amber-400' 
                        : 'text-stone-600'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-stone-400 mb-3">{adventure.description}</p>
          
          {/* Теги */}
          <div className="flex flex-wrap gap-1 mb-3">
            {adventure.tags.slice(0, 4).map((tag) => {
              const tagInfo = adventureTagsInfo[tag]
              return (
                <Badge 
                  key={tag}
                  variant="outline" 
                  className="text-xs bg-stone-800/50 border-stone-600"
                >
                  {tagInfo?.icon} {tagInfo?.name}
                </Badge>
              )
            })}
          </div>
          
          {/* Информация о наградах */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center gap-1 text-stone-400">
              <Timer className="w-3 h-3" />
              <span>{Math.floor(adventure.duration / 60)} мин</span>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              <Coins className="w-3 h-3" />
              <span>{adventure.baseReward.gold}+ золота</span>
            </div>
            <div className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3 h-3" />
              <span>
                +{adventure.baseReward.warSoulForWeapon?.min ?? 1}-{adventure.baseReward.warSoulForWeapon?.max ?? 5} очков оружию
              </span>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <Heart className="w-3 h-3" />
              <span>~{Math.floor(adventure.duration / 60 * 3)}% износ</span>
            </div>
          </div>
          
          {/* Требования */}
          {!isAvailable && (
            <div className="flex flex-wrap gap-2 mb-3">
              {adventure.requiredLevel > player.level && (
                <Badge variant="outline" className="text-red-400 border-red-600">
                  <Lock className="w-3 h-3 mr-1" />
                  Ур. {adventure.requiredLevel}
                </Badge>
              )}
              {adventure.requiredFame > player.fame && (
                <Badge variant="outline" className="text-red-400 border-red-600">
                  <Star className="w-3 h-3 mr-1" />
                  Слава {adventure.requiredFame}
                </Badge>
              )}
            </div>
          )}
          
          {/* Нет подходящего оружия */}
          {isAvailable && !hasWeapons && (
            <div className="p-2 rounded-lg bg-red-900/20 border border-red-600/30 mb-3">
              <p className="text-xs text-red-400">
                {!hasAnyWeapon 
                  ? 'Нет оружия — создайте в кузнице'
                  : hasBrokenWeapons
                    ? 'Всё оружие сломано — отремонтируйте в кузнице'
                    : `Нет оружия с атакой ${adventure.minWeaponLevel * 5}+`
                }
              </p>
            </div>
          )}
          
          {/* Кнопка */}
          <Button
            size="sm"
            className={cn(
              'w-full',
              isActive
                ? 'bg-green-800 hover:bg-green-700'
                : 'bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800'
            )}
            disabled={!canEmbark || isActive}
            onClick={onSelect}
          >
            {isActive ? (
              <>
                <Compass className="w-4 h-4 mr-2 animate-spin" />
                В процессе...
              </>
            ) : (
              <>
                Отправиться
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

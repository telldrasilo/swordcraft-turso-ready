/**
 * RecipeCard - карточка рецепта оружия
 */

'use client'

import { motion } from 'framer-motion'
import { Clock, Coins, Lock, Hammer, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RichTooltip } from '@/components/ui/game-tooltip'
import { useGameStore } from '@/store'
import { 
  weaponRecipes, 
  weaponTypeStats,
  type WeaponRecipe
} from '@/data/weapon-recipes'
import { cn } from '@/lib/utils'
import { WeaponIcon, resourceIcons, qualityColors } from './forge-utils'

interface RecipeCardProps {
  recipe: WeaponRecipe
  isCrafting: boolean
}

export function RecipeCard({ recipe, isCrafting }: RecipeCardProps) {
  const resources = useGameStore((state) => state.resources)
  const player = useGameStore((state) => state.player)
  const startCraft = useGameStore((state) => state.startCraft)
  const isRecipeUnlocked = useGameStore((state) => state.isRecipeUnlocked)
  
  const isUnlocked = isRecipeUnlocked(recipe.id)
  const canAfford = Object.entries(recipe.cost).every(([res, amount]) => 
    (resources[res as keyof typeof resources] || 0) >= (amount || 0)
  )
  const hasLevel = player.level >= recipe.requiredLevel
  const canCraft = canAfford && hasLevel && !isCrafting && isUnlocked
  
  const typeStats = weaponTypeStats[recipe.type]
  const quality = qualityColors[recipe.tier]
  
  // Названия тиров
  const tierNames: Record<string, string> = {
    common: 'Обычное',
    uncommon: 'Необычное',
    rare: 'Редкое',
    epic: 'Эпическое',
    legendary: 'Легендарное',
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={canCraft ? { scale: 1.02 } : {}}
    >
      <RichTooltip
        title={recipe.name}
        description={recipe.description}
        details={[
          `Тип: ${typeStats.name}`,
          `Время крафта: ${recipe.baseCraftTime} сек.`,
          `Цена продажи: от ${recipe.baseSellPrice} 💰`,
          recipe.requiredLevel > 1 ? `Требуется уровень: ${recipe.requiredLevel}` : ''
        ].filter(Boolean)}
        icon={typeStats.icon}
        side="top"
      >
        <Card className={cn(
          'card-medieval transition-all cursor-help',
          canCraft && 'hover:border-amber-600/50',
          isCrafting && 'opacity-60',
          !isUnlocked && 'opacity-40'
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                quality.bg
              )}>
                <WeaponIcon type={recipe.type} />
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className={cn('text-xs', quality.text, quality.border)}>
                  {tierNames[recipe.tier]}
                </Badge>
                {recipe.requiredLevel > 1 && (
                  <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">
                    Ур. {recipe.requiredLevel}
                  </Badge>
                )}
              </div>
            </div>
            
            <h4 className="font-semibold text-stone-200 mb-2">{recipe.name}</h4>
            
            <div className="space-y-2 mb-4">
              {/* Время крафта */}
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Clock className="w-4 h-4" />
                <span>{recipe.baseCraftTime} сек.</span>
                <span className="text-stone-600">•</span>
                <span className="text-amber-400">{typeStats.name}</span>
              </div>
              
              {/* Материалы - наглядное отображение */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(recipe.cost).map(([material, amount]) => {
                  const hasEnough = (resources[material as keyof typeof resources] || 0) >= (amount || 0)
                  const icon = resourceIcons[material] || '📦'
                  return (
                    <Badge 
                      key={material}
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        hasEnough 
                          ? 'bg-stone-800/50 border-stone-600 text-stone-300' 
                          : 'bg-red-900/30 border-red-600 text-red-400'
                      )}
                    >
                      {icon} {amount}
                    </Badge>
                  )
                })}
              </div>
              
              {/* Цена продажи */}
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                <Coins className="w-3 h-3" />
                <span>~{recipe.baseSellPrice}</span>
              </div>
            </div>
            
            {/* Кнопка крафта */}
            {!isUnlocked ? (
              <Button className="w-full" disabled>
                <Lock className="w-4 h-4 mr-2" />
                {recipe.unlockCondition || 'Рецепт не найден'}
              </Button>
            ) : !hasLevel ? (
              <Button className="w-full" disabled>
                <Lock className="w-4 h-4 mr-2" />
                Уровень {recipe.requiredLevel}
              </Button>
            ) : (
              <Button 
                className="w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100"
                disabled={!canCraft}
                onClick={() => startCraft(recipe)}
              >
                <Hammer className="w-4 h-4 mr-2" />
                {!canAfford ? 'Не хватает материалов' : isCrafting ? 'Уже крафтится' : 'Крафтить'}
                {canCraft && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </CardContent>
        </Card>
      </RichTooltip>
    </motion.div>
  )
}

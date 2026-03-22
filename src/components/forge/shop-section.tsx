/**
 * ShopSection - секция магазина рецептов
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingBag, Scroll, Map, CheckCircle, Lock, Coins, Sword, Trophy, Flame, Zap
} from 'lucide-react'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { cn } from '@/lib/utils'
import { 
  weaponRecipePrices,
  refiningRecipePrices,
  sourceNames,
  rarityColors,
  rarityBgColors,
  rarityBorderColors,
  type RecipePrice
} from '@/data/recipe-shop'

export function ShopSection() {
  const player = useGameStore((state) => state.player)
  const resources = useGameStore((state) => state.resources)
  const unlockedRecipes = useGameStore((state) => state.unlockedRecipes)
  const unlockRecipe = useGameStore((state) => state.unlockRecipe)
  const spendResource = useGameStore((state) => state.spendResource)
  const [shopTab, setShopTab] = useState<'weapons' | 'refining'>('weapons')
  
  // Фильтрация по типу
  const displayRecipes = shopTab === 'weapons' ? weaponRecipePrices : refiningRecipePrices
  
  // Проверка возможности покупки
  const canPurchase = (recipe: RecipePrice): boolean => {
    // Проверяем разблокирован ли уже
    const isUnlocked = shopTab === 'weapons' 
      ? unlockedRecipes.weaponRecipes.includes(recipe.recipeId)
      : unlockedRecipes.refiningRecipes.includes(recipe.recipeId)
    
    if (isUnlocked) return false
    if (recipe.requiredLevel && player.level < recipe.requiredLevel) return false
    if (recipe.requiredFame && player.fame < recipe.requiredFame) return false
    if (recipe.gold && resources.gold < recipe.gold) return false
    return true
  }
  
  // Проверка статуса рецепта
  const getRecipeStatus = (recipe: RecipePrice): 'unlocked' | 'available' | 'locked' => {
    const isUnlocked = shopTab === 'weapons' 
      ? unlockedRecipes.weaponRecipes.includes(recipe.recipeId)
      : unlockedRecipes.refiningRecipes.includes(recipe.recipeId)
    
    if (isUnlocked) return 'unlocked'
    if (recipe.requiredLevel && player.level < recipe.requiredLevel) return 'locked'
    if (recipe.requiredFame && player.fame < recipe.requiredFame) return 'locked'
    return 'available'
  }
  
  // Покупка рецепта
  const handlePurchase = (recipe: RecipePrice) => {
    if (!canPurchase(recipe)) return
    
    // Тратим золото
    if (recipe.gold && !spendResource('gold', recipe.gold)) return
    
    // Разблокируем рецепт
    unlockRecipe(recipe.recipeId, recipe.source)
  }
  
  // Иконка источника получения
  const SourceIcon = ({ source }: { source: string }) => {
    switch (source) {
      case 'purchase': return <ShoppingBag className="w-4 h-4" />
      case 'order': return <Scroll className="w-4 h-4" />
      case 'expedition': return <Map className="w-4 h-4" />
      case 'level': return <Trophy className="w-4 h-4" />
      default: return <Lock className="w-4 h-4" />
    }
  }
  
  // Подсчёт статистики
  const stats = {
    purchase: displayRecipes.filter(r => r.source === 'purchase').length,
    order: displayRecipes.filter(r => r.source === 'order').length,
    expedition: displayRecipes.filter(r => r.source === 'expedition').length,
    unlocked: shopTab === 'weapons' 
      ? unlockedRecipes.weaponRecipes.length 
      : unlockedRecipes.refiningRecipes.length
  }
  
  return (
    <div className="space-y-4">
      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <ShoppingBag className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.purchase}</p>
            <p className="text-xs text-stone-500">Для покупки</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Scroll className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.order}</p>
            <p className="text-xs text-stone-500">За заказы</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Map className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.expedition}</p>
            <p className="text-xs text-stone-500">Экспедиции</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.unlocked}</p>
            <p className="text-xs text-stone-500">Открыто</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Переключатель вкладок */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={shopTab === 'weapons' ? 'default' : 'outline'}
          className={cn(
            shopTab === 'weapons' 
              ? 'bg-amber-800 text-amber-100' 
              : 'border-stone-600 text-stone-400'
          )}
          onClick={() => setShopTab('weapons')}
        >
          <Sword className="w-4 h-4 mr-1" />
          Оружие
        </Button>
        <Button
          size="sm"
          variant={shopTab === 'refining' ? 'default' : 'outline'}
          className={cn(
            shopTab === 'refining' 
              ? 'bg-amber-800 text-amber-100' 
              : 'border-stone-600 text-stone-400'
          )}
          onClick={() => setShopTab('refining')}
        >
          <Flame className="w-4 h-4 mr-1" />
          Переработка
        </Button>
      </div>
      
      {/* Список рецептов */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {displayRecipes.map((recipe, index) => {
            const status = getRecipeStatus(recipe)
            const rarityColor = rarityColors[recipe.rarity]
            const rarityBg = rarityBgColors[recipe.rarity]
            const rarityBorder = rarityBorderColors[recipe.rarity]
            
            return (
              <motion.div
                key={recipe.recipeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  'card-medieval transition-all',
                  rarityBorder,
                  status === 'unlocked' && 'opacity-60',
                  status === 'available' && 'hover:border-amber-600/50'
                )}>
                  <CardContent className="p-4">
                    {/* Заголовок */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          rarityBg
                        )}>
                          <SourceIcon source={recipe.source} />
                        </div>
                        <div>
                          <h4 className={cn('font-semibold', rarityColor)}>
                            {recipe.name}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-stone-500">
                            <span>{sourceNames[recipe.source]}</span>
                          </div>
                        </div>
                      </div>
                      {status === 'unlocked' && (
                        <Badge className="bg-green-800 text-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Открыт
                        </Badge>
                      )}
                    </div>
                    
                    {/* Описание */}
                    <p className="text-xs text-stone-500 mb-3 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    {/* Требования */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.requiredLevel && (
                        <Badge variant="outline" className={cn(
                          'text-xs',
                          player.level >= recipe.requiredLevel 
                            ? 'border-green-600 text-green-400' 
                            : 'border-red-600 text-red-400'
                        )}>
                          Ур. {recipe.requiredLevel}
                        </Badge>
                      )}
                      {recipe.requiredFame && (
                        <Badge variant="outline" className={cn(
                          'text-xs',
                          player.fame >= recipe.requiredFame 
                            ? 'border-green-600 text-green-400' 
                            : 'border-red-600 text-red-400'
                        )}>
                          Слава {recipe.requiredFame}
                        </Badge>
                      )}
                      {recipe.gold && (
                        <Badge variant="outline" className={cn(
                          'text-xs',
                          resources.gold >= recipe.gold 
                            ? 'border-amber-600 text-amber-400' 
                            : 'border-red-600 text-red-400'
                        )}>
                          <Coins className="w-3 h-3 mr-1" />
                          {recipe.gold}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Кнопка действия */}
                    {status === 'unlocked' ? (
                      <Button className="w-full" disabled variant="outline">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Уже открыт
                      </Button>
                    ) : status === 'locked' ? (
                      <Button className="w-full" disabled variant="outline">
                        <Lock className="w-4 h-4 mr-2" />
                        Недоступно
                      </Button>
                    ) : recipe.source === 'purchase' ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100"
                        disabled={!canPurchase(recipe)}
                        onClick={() => handlePurchase(recipe)}
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Купить за {recipe.gold} 💰
                      </Button>
                    ) : recipe.source === 'order' ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-blue-100"
                        disabled
                      >
                        <Scroll className="w-4 h-4 mr-2" />
                        Награда за заказ
                      </Button>
                    ) : recipe.source === 'expedition' ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-green-100"
                        disabled
                      >
                        <Map className="w-4 h-4 mr-2" />
                        Найти в экспедиции
                      </Button>
                    ) : (
                      <Button className="w-full" disabled variant="outline">
                        <Trophy className="w-4 h-4 mr-2" />
                        Уровень {recipe.requiredLevel}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      
      {/* Подсказка */}
      <Card className="card-medieval bg-stone-800/30">
        <CardContent className="p-4">
          <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Как получить рецепты
          </h4>
          <ul className="text-xs text-stone-500 space-y-1">
            <li>• <strong className="text-amber-400">Покупка</strong> — купите рецепт за золото прямо сейчас</li>
            <li>• <strong className="text-blue-400">Заказы</strong> — выполните заказ в Гильдии для получения рецепта</li>
            <li>• <strong className="text-green-400">Экспедиции</strong> — отправьте искателей за редкими рецептами</li>
            <li>• <strong className="text-purple-400">Уровень</strong> — некоторые рецепты открываются автоматически</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

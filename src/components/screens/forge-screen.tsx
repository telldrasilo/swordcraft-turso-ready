/**
 * Forge Screen
 * Главный экран кузницы (контейнер)
 */

'use client'

import { Flame, Hammer, Package, ShoppingBag, Wrench, Lock, Sparkles, Star, Zap, Settings2 } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { InfoTooltip } from '@/components/ui/game-tooltip'
import { useGameStore } from '@/store'
import { weaponRecipes } from '@/data/weapon-recipes'
import { cn } from '@/lib/utils'

// Импорт вынесенных компонентов
import {
  ActiveCraftCard,
  RecipeCard,
  InventorySection,
  ShopSection,
  RepairSection,
} from '@/components/forge'

// Импорт новой системы крафта v2
import { CraftContainerV2 } from '@/components/forge/craft-v2'

// Типы вкладок
type RecipeCategory = 'all' | 'swords' | 'axes' | 'daggers' | 'blunt'
type MainTab = 'craft' | 'craft_v2' | 'inventory' | 'shop' | 'repair'

export function ForgeScreen() {
  // Используем индивидуальные селекторы
  const player = useGameStore((state) => state.player)
  const activeCraft = useGameStore((state) => state.activeCraft)
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  
  const [category, setCategory] = useState<RecipeCategory>('all')
  const [mainTab, setMainTab] = useState<MainTab>('craft')
  
  const isCrafting = activeCraft.recipeId !== null
  
  // Мемоизированная фильтрация рецептов
  const filteredRecipes = useMemo(() => {
    return weaponRecipes.filter(recipe => {
      if (!recipe.unlocked && recipe.requiredLevel > player.level) return false
      if (category === 'all') return true
      if (category === 'swords') return recipe.type === 'sword'
      if (category === 'axes') return recipe.type === 'axe'
      if (category === 'daggers') return recipe.type === 'dagger'
      if (category === 'blunt') return ['mace', 'hammer', 'spear'].includes(recipe.type)
      return true
    })
  }, [player.level, category])
  
  // Мемоизированные доступные рецепты
  const availableRecipes = useMemo(() => 
    weaponRecipes.filter(r => r.requiredLevel <= player.level),
    [player.level]
  )
  
  // Мемоизированное количество оружия для ремонта
  const damagedCount = useMemo(() => 
    weapons.filter(
      w => (w.durability ?? 100) < (w.maxDurability ?? 100)
    ).length,
    [weapons]
  )
  
  // Количество оружия
  const weaponCount = weapons.length
  
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500" />
              Кузница
            </h2>
            <p className="text-stone-500 text-sm">Создавайте легендарное оружие</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-amber-900/30 border-amber-600/50 text-amber-200">
              <Star className="w-3 h-3 mr-1" />
              {availableRecipes.length} рецептов
            </Badge>
            <Badge variant="outline" className="bg-stone-800/50 border-stone-600 text-stone-300">
              <Package className="w-3 h-3 mr-1" />
              {weaponCount} в инвентаре
            </Badge>
          </div>
        </div>
        
        {/* Основные вкладки */}
        <div className="flex gap-2 border-b border-stone-700 pb-2 overflow-x-auto">
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'craft' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('craft')}
          >
            <Hammer className="w-4 h-4 mr-2" />
            Крафт
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'craft_v2' 
                ? 'border-purple-500 text-purple-300 bg-purple-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('craft_v2')}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Расширенный
            <Badge className="ml-2 bg-purple-800 text-purple-100 text-xs">NEW</Badge>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'inventory' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('inventory')}
          >
            <Package className="w-4 h-4 mr-2" />
            Инвентарь
            {weaponCount > 0 && (
              <Badge className="ml-2 bg-amber-800 text-amber-100 text-xs">
                {weaponCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'shop' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('shop')}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Магазин
          </Button>
          <Button
            variant="ghost"
            className={cn(
              'rounded-none border-b-2 transition-all whitespace-nowrap',
              mainTab === 'repair' 
                ? 'border-amber-500 text-amber-300 bg-amber-900/20' 
                : 'border-transparent text-stone-500 hover:text-stone-300'
            )}
            onClick={() => setMainTab('repair')}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Ремонт
            {damagedCount > 0 && (
              <Badge className="ml-2 bg-orange-800 text-orange-100 text-xs">
                {damagedCount}
              </Badge>
            )}
          </Button>
        </div>
        
        {/* Контент вкладок */}
        {mainTab === 'inventory' ? (
          <InventorySection />
        ) : mainTab === 'shop' ? (
          <ShopSection />
        ) : mainTab === 'repair' ? (
          <RepairSection />
        ) : mainTab === 'craft_v2' ? (
          <CraftContainerV2
            playerLevel={player.level}
            forgeLevel={1}
            onWeaponCreated={(weapon) => {
              console.log('Weapon created:', weapon)
              // TODO: Интегрировать с game-store
            }}
          />
        ) : (
          <>
            {/* Активный крафт */}
            <div>
              <h3 className="text-lg font-semibold text-stone-300 mb-3 flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-500" />
                Наковальня
              </h3>
              <ActiveCraftCard />
            </div>
            
            {/* Категории */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Все' },
                { id: 'swords', label: 'Мечи' },
                { id: 'axes', label: 'Топоры' },
                { id: 'daggers', label: 'Кинжалы' },
                { id: 'blunt', label: 'Дробящее' },
              ].map((cat) => (
                <Button
                  key={cat.id}
                  variant={category === cat.id ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    category === cat.id 
                      ? 'bg-amber-800 hover:bg-amber-700 text-amber-100' 
                      : 'border-stone-600 text-stone-400 hover:text-stone-200'
                  )}
                  onClick={() => setCategory(cat.id as RecipeCategory)}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
            
            {/* Рецепты */}
            <div>
              <h3 className="text-lg font-semibold text-stone-300 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Рецепты оружия
                <InfoTooltip
                  title="Рецепты"
                  content="Выберите оружие для крафта. Наведите на карточку для подробной информации. Качество зависит от мастерства ваших кузнецов."
                />
              </h3>
              
              {filteredRecipes.length === 0 ? (
                <Card className="card-medieval">
                  <CardContent className="p-8 text-center">
                    <Lock className="w-12 h-12 mx-auto text-stone-600 mb-3" />
                    <p className="text-stone-500">Нет доступных рецептов в этой категории</p>
                    <p className="text-stone-600 text-sm">Повышайте уровень для разблокировки</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard 
                      key={recipe.id} 
                      recipe={recipe} 
                      isCrafting={isCrafting}
                    />
                  ))}
                </div>
              )}
            </div>
            
            {/* Подсказки */}
            <Card className="card-medieval bg-stone-800/30">
              <CardContent className="p-4">
                <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Советы по крафту
                </h4>
                <ul className="text-xs text-stone-500 space-y-1">
                  <li>• <strong>Качество оружия</strong> зависит от мастерства кузнецов, назначенных в кузницу</li>
                  <li>• Чем выше качество, тем дороже можно продать оружие</li>
                  <li>• При завершении крафта вы получаете <strong>эссенцию души</strong></li>
                  <li>• Наведите на рецепт чтобы увидеть подробную информацию</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}

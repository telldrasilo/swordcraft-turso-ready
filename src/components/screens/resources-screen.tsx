'use client'

import { motion } from 'framer-motion'
import { 
  Package, 
  Flame,
  ArrowRightLeft,
  Lock,
  FlameKindling,
  TreePine,
  Mountain
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  useGameStore, 
  useFormattedResources,
  type ProductionBuilding
} from '@/store'
import { useProductionRates } from '@/hooks/use-game-loop'
import { 
  TooltipProvider,
  InfoTooltip 
} from '@/components/ui/game-tooltip'
import { 
  getResourceInfo,
  getBuildingInfo 
} from '@/data/game-tooltips'
import { 
  refiningRecipes,
  refinedResourcesInfo,
  type RefiningRecipe
} from '@/data/refining-recipes'
import { cn } from '@/lib/utils'
import { 
  ResourceIcon, 
  resourceIcons, 
  rarityColors,
  getResourceIconInfo 
} from '@/components/ui/resource-icon'

// Все ресурсы для отображения
const allResources = [
  // Валюта
  { id: 'gold', name: 'Золото', rarity: 'uncommon' as const, category: 'Валюта' },
  { id: 'soulEssence', name: 'Эссенция душ', rarity: 'epic' as const, category: 'Валюта' },
  // Сырьё
  { id: 'wood', name: 'Дерево', rarity: 'common' as const, category: 'Сырьё' },
  { id: 'stone', name: 'Камень', rarity: 'common' as const, category: 'Сырьё' },
  { id: 'iron', name: 'Железо', rarity: 'uncommon' as const, category: 'Сырьё' },
  { id: 'coal', name: 'Уголь', rarity: 'common' as const, category: 'Сырьё' },
  { id: 'copper', name: 'Медь', rarity: 'uncommon' as const, category: 'Сырьё' },
  { id: 'tin', name: 'Олово', rarity: 'uncommon' as const, category: 'Сырьё' },
  { id: 'silver', name: 'Серебро', rarity: 'rare' as const, category: 'Сырьё' },
  { id: 'goldOre', name: 'Зол. руда', rarity: 'rare' as const, category: 'Сырьё' },
  { id: 'mithril', name: 'Мифрил', rarity: 'legendary' as const, category: 'Сырьё' },
  // Слитки
  { id: 'ironIngot', name: 'Жел. слиток', rarity: 'rare' as const, category: 'Слитки' },
  { id: 'copperIngot', name: 'Мед. слиток', rarity: 'rare' as const, category: 'Слитки' },
  { id: 'tinIngot', name: 'Олов. слиток', rarity: 'rare' as const, category: 'Слитки' },
  { id: 'bronzeIngot', name: 'Бронза', rarity: 'rare' as const, category: 'Слитки' },
  { id: 'steelIngot', name: 'Сталь', rarity: 'epic' as const, category: 'Слитки' },
  { id: 'silverIngot', name: 'Сер. слиток', rarity: 'epic' as const, category: 'Слитки' },
  { id: 'goldIngot', name: 'Зол. слиток', rarity: 'epic' as const, category: 'Слитки' },
  { id: 'mithrilIngot', name: 'Мифр. слиток', rarity: 'legendary' as const, category: 'Слитки' },
  // Материалы
  { id: 'planks', name: 'Доски', rarity: 'uncommon' as const, category: 'Материалы' },
  { id: 'stoneBlocks', name: 'Блоки камня', rarity: 'uncommon' as const, category: 'Материалы' },
]

// Получить форматированное значение ресурса
function getFormattedValue(resources: ReturnType<typeof useFormattedResources>, id: string): string {
  const formatted = resources.formatted as Record<string, string>
  return formatted[id] ?? Math.floor((resources as Record<string, number>)[id] || 0).toString()
}

// Компонент карточки ресурса
function ResourceCard({ res, amount, rate }: { res: typeof allResources[0]; amount: number; rate: number }) {
  const colors = rarityColors[res.rarity]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={cn(
        'relative p-3 rounded-xl border-2 transition-all duration-200',
        colors.bg,
        colors.border,
        amount > 0 && `shadow-lg ${colors.glow}`,
        amount === 0 && 'opacity-40'
      )}
    >
      {/* Иконка */}
      <div className="flex justify-center mb-1">
        <ResourceIcon id={res.id} size="lg" />
      </div>
      
      {/* Количество */}
      <div className={cn(
        'text-center font-bold text-lg',
        colors.text
      )}>
        {amount > 0 ? formatAmount(amount) : '0'}
      </div>
      
      {/* Название */}
      <div className="text-center text-xs text-stone-400 mt-0.5 font-medium">
        {res.name}
      </div>
      
      {/* Скорость производства */}
      {rate > 0 && (
        <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full font-bold shadow-lg">
          +{rate.toFixed(1)}/с
        </div>
      )}
    </motion.div>
  )
}

// Форматирование больших чисел
function formatAmount(num: number): string {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return Math.floor(num).toString()
}

// Компонент карточки переработки
function RefiningRecipeCard({ recipe }: { recipe: RefiningRecipe }) {
  const resources = useGameStore((state) => state.resources)
  const player = useGameStore((state) => state.player)
  const activeRefining = useGameStore((state) => state.activeRefining)
  const startRefining = useGameStore((state) => state.startRefining)
  const isRecipeUnlocked = useGameStore((state) => state.isRecipeUnlocked)
  
  const isUnlocked = isRecipeUnlocked(recipe.id)
  const outputInfo = refinedResourcesInfo[recipe.output.resource]
  const isRefiningThis = activeRefining.recipeId === recipe.id
  const isRefiningOther = activeRefining.recipeId && activeRefining.recipeId !== recipe.id
  
  // Проверяем все входные ресурсы
  const canRefineSingle = recipe.inputs.every(input => 
    (resources[input.resource] || 0) >= input.amount
  ) && (!recipe.extraCost?.coal || resources.coal >= recipe.extraCost.coal) &&
    player.level >= recipe.requiredLevel
  
  // Рассчитываем максимальное количество
  const maxByInputs = recipe.inputs.map(input => 
    Math.floor((resources[input.resource] || 0) / input.amount)
  )
  const maxByCoal = recipe.extraCost?.coal 
    ? Math.floor(resources.coal / recipe.extraCost.coal) 
    : Infinity
  const maxAmount = Math.max(1, Math.min(...maxByInputs, maxByCoal))
  
  // Получаем информацию о входных ресурсах
  const inputsInfo = recipe.inputs.map(input => ({
    ...input,
    info: getResourceIconInfo(input.resource)
  }))
  
  if (!isUnlocked) {
    return (
      <div className="p-3 rounded-lg bg-stone-800/30 border border-stone-700/30 opacity-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-stone-800/50 flex items-center justify-center">
            <Lock className="w-4 h-4 text-stone-500" />
          </div>
          <div>
            <h4 className="font-medium text-stone-400 text-sm">{recipe.name}</h4>
            <p className="text-xs text-stone-600">
              {recipe.requiredLevel > player.level 
                ? `Требуется уровень ${recipe.requiredLevel}`
                : 'Рецепт не найден'}
            </p>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: canRefineSingle && !isRefiningOther ? 1.02 : 1 }}
      className="p-3 rounded-lg bg-stone-800/30 border border-stone-700/30 transition-all"
    >
      {/* Иконки входы → выход */}
      <div className="flex items-center justify-center gap-1 mb-2">
        {inputsInfo.map((input, idx) => (
          <div key={idx} className="flex items-center">
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              input.info ? rarityColors[input.info.rarity].bg : 'bg-stone-700/60'
            )}>
              {input.info ? (
                <ResourceIcon id={input.resource} size="sm" />
              ) : (
                <span className="text-sm">❓</span>
              )}
            </div>
            {idx < inputsInfo.length - 1 && (
              <span className="text-stone-500 mx-0.5 text-xs">+</span>
            )}
          </div>
        ))}
        <ArrowRightLeft className="w-3 h-3 text-stone-500 mx-1" />
        <div className={cn(
          'w-7 h-7 rounded-lg flex items-center justify-center',
          outputInfo ? rarityColors[outputInfo.rarity].bg : 'bg-stone-700/60'
        )}>
          <ResourceIcon id={recipe.output.resource} size="sm" />
        </div>
      </div>
      
      <h4 className="font-medium text-stone-200 text-sm text-center mb-2">{recipe.name}</h4>
      
      {/* Требования */}
      <div className="flex flex-wrap justify-center gap-1 text-xs mb-2">
        {inputsInfo.map((input, idx) => (
          <span key={idx} className={cn(
            'px-1.5 py-0.5 rounded bg-stone-800/50 flex items-center gap-1',
            (resources[input.resource] || 0) >= input.amount 
              ? 'text-green-400' : 'text-red-400'
          )}>
            {input.amount}
            {input.info && <ResourceIcon id={input.resource} size="sm" />}
          </span>
        ))}
        {recipe.extraCost?.coal && (
          <span className={cn(
            'px-1.5 py-0.5 rounded bg-stone-800/50 flex items-center gap-1',
            resources.coal >= recipe.extraCost.coal 
              ? 'text-green-400' : 'text-red-400'
          )}>
            {recipe.extraCost.coal}
            <ResourceIcon id="coal" size="sm" />
          </span>
        )}
        <span className="px-1.5 py-0.5 rounded bg-stone-800/50 text-stone-400">
          {recipe.processTime}с
        </span>
      </div>
      
      {/* Активная переработка */}
      {isRefiningThis && (
        <div className="mb-2">
          <Progress value={activeRefining.progress} className="h-1.5 bg-stone-800" />
          <p className="text-xs text-center text-green-400 mt-1">
            {Math.round(activeRefining.progress)}%
          </p>
        </div>
      )}
      
      <div className="flex gap-1">
        <Button
          size="sm"
          className="flex-1 h-7 text-xs bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100"
          disabled={!canRefineSingle || isRefiningOther || isRefiningThis}
          onClick={() => startRefining(recipe, 1)}
        >
          {isRefiningThis ? 'В процессе...' : 
           isRefiningOther ? 'Занято' :
           !canRefineSingle ? 'Нет ресурсов' : 'Сделать'}
        </Button>
        
        {maxAmount > 1 && canRefineSingle && !isRefiningOther && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs border-amber-600/30 text-amber-400 hover:bg-amber-900/20"
            disabled={isRefiningOther || isRefiningThis}
            onClick={() => startRefining(recipe, Math.min(maxAmount, 10))}
          >
            x{Math.min(maxAmount, 10)}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

// Секция переработки
function RefiningSection() {
  const activeRefining = useGameStore((state) => state.activeRefining)
  const unlockedRecipes = useGameStore((state) => state.unlockedRecipes)
  
  // Фильтруем рецепты переработки
  const availableRecipes = refiningRecipes.filter(r => 
    unlockedRecipes.refiningRecipes.includes(r.id) || r.unlocked
  )
  
  // Группируем по зданию
  const smelterRecipes = availableRecipes.filter(r => r.requiredBuilding === 'smelter')
  const sawmillRecipes = availableRecipes.filter(r => r.requiredBuilding === 'sawmill')
  const quarryRecipes = availableRecipes.filter(r => r.requiredBuilding === 'quarry')
  
  return (
    <Card className="card-medieval">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-amber-200 flex items-center gap-2 text-base">
            <FlameKindling className="w-4 h-4" />
            Переработка
          </CardTitle>
          <InfoTooltip
            title="Переработка"
            content="Превращайте сырьё в материалы для крафта. Требуется уголь для плавки."
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Активная переработка */}
        {activeRefining.recipeId && (
          <div className="mb-3 p-2 rounded-lg bg-green-900/20 border border-green-600/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-green-400 font-medium text-sm">{activeRefining.resourceName}</span>
              <span className="text-xs text-green-500">x{activeRefining.amount}</span>
            </div>
            <Progress value={activeRefining.progress} className="h-2 bg-stone-800" />
          </div>
        )}
        
        {/* Плавильня - слитки */}
        {smelterRecipes.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-stone-400 mb-2 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Плавильня
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {smelterRecipes.map(recipe => (
                <RefiningRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
        
        {/* Лесопилка - доски */}
        {sawmillRecipes.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-medium text-stone-400 mb-2 flex items-center gap-1">
              <TreePine className="w-3 h-3" />
              Лесопилка
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {sawmillRecipes.map(recipe => (
                <RefiningRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
        
        {/* Каменоломня - блоки */}
        {quarryRecipes.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-stone-400 mb-2 flex items-center gap-1">
              <Mountain className="w-3 h-3" />
              Каменоломня
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {quarryRecipes.map(recipe => (
                <RefiningRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ResourcesScreen() {
  const resources = useFormattedResources()
  const productionRates = useProductionRates()
  
  // Общая скорость производства
  const totalProduction = Object.values(productionRates).reduce((sum, rate) => sum + rate, 0)
  
  // Группируем ресурсы по категориям
  const categories = ['Валюта', 'Сырьё', 'Слитки', 'Материалы'] as const
  
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-500" />
              Ресурсы
            </h2>
            <InfoTooltip
              title="Ресурсы"
              content={<p>Обзор всех ваших ресурсов и переработка материалов.</p>}
              icon="help"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-900/30 border border-green-600/30">
            <span className="text-green-400 font-bold">+{totalProduction.toFixed(1)}/сек</span>
          </div>
        </div>
        
        {/* Инвентарь по категориям */}
        {categories.map(category => {
          const categoryResources = allResources.filter(r => r.category === category)
          
          // Для валюты и сырья показываем всегда, для остальных - только если есть ресурсы
          if (category !== 'Валюта' && category !== 'Сырьё') {
            const hasAnyResource = categoryResources.some(res => 
              (resources[res.id as keyof typeof resources] || 0) > 0
            )
            if (!hasAnyResource) return null
          }
          
          return (
            <Card key={category} className="card-medieval">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-200 text-base font-bold">
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {categoryResources.map((res) => {
                    const amount = resources[res.id as keyof typeof resources] || 0
                    const rate = productionRates[res.id as keyof typeof productionRates] || 0
                    
                    // Скрываем пустые ресурсы кроме валюты и сырья
                    if (amount === 0 && category !== 'Валюта' && category !== 'Сырьё') return null
                    
                    return (
                      <ResourceCard
                        key={res.id}
                        res={res}
                        amount={amount}
                        rate={rate}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {/* Переработка ресурсов */}
        <RefiningSection />
        
        {/* Подсказка */}
        <div className="text-center text-sm text-stone-400 p-4 rounded-xl bg-stone-800/30 border border-stone-700/30">
          <strong>Добыча</strong> — вкладка <span className="text-amber-400">Рабочие</span> • 
          <strong> Торговля</strong> — вкладка <span className="text-amber-400">Магазин</span>
        </div>
      </div>
    </TooltipProvider>
  )
}

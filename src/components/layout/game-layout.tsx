'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flame, 
  Package, 
  Users, 
  Sword, 
  Map, 
  Sparkles,
  Coins,
  Droplet,
  TreePine,
  Mountain,
  CircleDot,
  Flame as Coal,
  Cloud,
  CloudOff,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { useGameStore, useFormattedResources, type GameScreen } from '@/store'
import { useGameLoop, useProductionRates } from '@/hooks/use-game-loop'
import { useCloudSave } from '@/hooks/use-cloud-save'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { useState, useEffect, useCallback, useRef } from 'react'

// Навигационные элементы
const navItems: { id: GameScreen; label: string; icon: typeof Flame }[] = [
  { id: 'forge', label: 'Кузница', icon: Flame },
  { id: 'resources', label: 'Ресурсы', icon: Package },
  { id: 'workers', label: 'Рабочие', icon: Users },
  { id: 'shop', label: 'Магазин', icon: Coins },
  { id: 'guild', label: 'Гильдия', icon: Sword },
  { id: 'dungeons', label: 'Подземелья', icon: Map },
  { id: 'altar', label: 'Алтарь', icon: Sparkles },
]

// Ресурсы для отображения в панели
const resourceItems = [
  { key: 'gold' as const, label: 'Золото', icon: Coins, color: 'text-amber-400' },
  { key: 'soulEssence' as const, label: 'Эссенция', icon: Droplet, color: 'text-purple-400' },
  { key: 'wood' as const, label: 'Дерево', icon: TreePine, color: 'text-green-400' },
  { key: 'stone' as const, label: 'Камень', icon: Mountain, color: 'text-stone-400' },
  { key: 'iron' as const, label: 'Железо', icon: CircleDot, color: 'text-slate-400' },
  { key: 'coal' as const, label: 'Уголь', icon: Coal, color: 'text-gray-400' },
]

// Компонент статуса сохранения
function SaveStatusIndicator({ 
  isSaving, 
  lastSavedAt, 
  error 
}: { 
  isSaving: boolean
  lastSavedAt: Date | null
  error: string | null 
}) {
  const [timeAgo, setTimeAgo] = useState('')
  
  useEffect(() => {
    const updateTime = () => {
      if (!lastSavedAt) {
        setTimeAgo('')
        return
      }
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000)
      if (seconds < 60) setTimeAgo('только что')
      else if (seconds < 3600) setTimeAgo(`${Math.floor(seconds / 60)} мин.`)
      else setTimeAgo(`${Math.floor(seconds / 3600)} ч.`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [lastSavedAt])
  
  if (error) {
    return (
      <div className="flex items-center gap-1 text-xs text-red-400" title={error}>
        <CloudOff className="w-3 h-3" />
        <span className="hidden sm:inline">Ошибка</span>
      </div>
    )
  }
  
  if (isSaving) {
    return (
      <div className="flex items-center gap-1 text-xs text-amber-400">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="hidden sm:inline">Сохранение...</span>
      </div>
    )
  }
  
  if (lastSavedAt) {
    return (
      <div className="flex items-center gap-1 text-xs text-green-500">
        <CheckCircle className="w-3 h-3" />
        <span className="hidden sm:inline">{timeAgo}</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center gap-1 text-xs text-stone-500">
      <Cloud className="w-3 h-3" />
    </div>
  )
}

// Панель ресурсов
function ResourceBar({ 
  saveStatus 
}: { 
  saveStatus: { isSaving: boolean; lastSavedAt: Date | null; error: string | null } 
}) {
  const resources = useFormattedResources()
  const player = useGameStore((state) => state.player)
  const productionRates = useProductionRates()
  
  // Форматирование скорости
  const formatRate = (rate: number): string => {
    if (rate === 0) return '+0'
    if (rate >= 1) return `+${rate.toFixed(1)}`
    return `+${rate.toFixed(2)}`
  }
  
  return (
    <div data-tutorial="resources-bar" className="bg-gradient-to-b from-stone-900 to-stone-950 border-b border-stone-700/50 px-4 py-3">
      {/* Верхняя строка - игрок */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="bg-amber-900/30 border-amber-600/50 text-amber-200"
          >
            Lv.{player.level}
          </Badge>
          <span className="text-stone-300 font-medium">{player.name}</span>
          <span className="text-xs text-stone-500 hidden sm:inline">({player.title})</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Статус сохранения */}
          <SaveStatusIndicator {...saveStatus} />
          {/* Прогресс опыта */}
          <div className="flex items-center gap-2">
            <Progress 
              value={(player.experience / player.experienceToNextLevel) * 100} 
              className="w-24 h-2 bg-stone-800"
            />
            <span className="text-xs text-stone-400">
              {Math.floor(player.experience)}/{player.experienceToNextLevel}
            </span>
          </div>
        </div>
      </div>
      
      {/* Панель ресурсов - скролл на мобильных */}
      <div className="flex gap-4 overflow-x-auto scrollbar-medieval pb-1">
        {resourceItems.map(({ key, label, icon: Icon, color }) => (
          <motion.div
            key={key}
            className="flex items-center gap-2 min-w-fit"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <div className="resource-icon">
              <Icon className={cn('w-4 h-4', color)} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-stone-500">{label}</span>
              <div className="flex items-center gap-1">
                <span className={cn('text-sm font-semibold', color)}>
                  {resources.formatted[key]}
                </span>
                {productionRates[key] > 0 && (
                  <span className="text-xs text-green-500">
                    {formatRate(productionRates[key])}/с
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Боковое меню для десктопа
function SideNav({ onSave, isSaving }: { onSave: () => void; isSaving: boolean }) {
  const currentScreen = useGameStore((state) => state.currentScreen)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  
  return (
    <nav className="w-64 bg-gradient-to-b from-stone-900 to-stone-950 border-r border-stone-700/50 p-4 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-amber-200 text-glow">⚔️ SwordCraft</h1>
            <p className="text-xs text-stone-500">Idle Forge</p>
          </div>
          {/* Кнопка сохранения */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="h-8 w-8 p-0 text-stone-400 hover:text-amber-400"
            title="Сохранить игру"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Cloud className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id
          
          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                data-tutorial={item.id === 'workers' ? 'nav-workers' : item.id === 'resources' ? 'nav-resources' : item.id === 'guild' ? 'nav-guild' : undefined}
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isActive 
                    ? 'bg-gradient-to-r from-amber-800 to-amber-900 text-amber-100 shadow-lg glow-gold' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                )}
                onClick={() => setCurrentScreen(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            </motion.div>
          )
        })}
      </div>
      
      {/* Декоративный элемент снизу */}
      <div className="mt-auto pt-4">
        <div className="h-32 bg-gradient-to-t from-amber-900/20 to-transparent rounded-lg border border-amber-800/20 flex items-end justify-center pb-4">
          <div className="text-center">
            <Flame className="w-8 h-8 text-amber-500/50 mx-auto animate-pulse-gold" />
            <p className="text-xs text-stone-600 mt-1">Кузница работает</p>
          </div>
        </div>
      </div>
    </nav>
  )
}



// Нижнее меню для мобильных
function BottomNav() {
  const currentScreen = useGameStore((state) => state.currentScreen)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950 to-stone-900 border-t border-stone-700/50 px-2 py-2 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center gap-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentScreen === item.id
          
          return (
            <motion.button
              key={item.id}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-0 flex-1',
                isActive 
                  ? 'text-amber-400' 
                  : 'text-stone-500'
              )}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentScreen(item.id)}
            >
              <div className={cn(
                'p-2 rounded-xl transition-all',
                isActive && 'bg-amber-900/40 glow-gold'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                'text-xs truncate',
                isActive ? 'font-semibold' : 'font-normal'
              )}>
                {item.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

// Импорт экранов
import { ForgeScreen } from '@/components/screens/forge-screen'
import { ResourcesScreen } from '@/components/screens/resources-screen'
import { WorkersScreen } from '@/components/screens/workers-screen'
import { ShopScreen } from '@/components/screens/shop-screen'
import { GuildScreen } from '@/components/screens/guild-screen'
import { DungeonsScreen } from '@/components/screens/dungeons-screen'
import { AltarScreen } from '@/components/screens/altar-screen'
import { TutorialOverlay } from '@/components/tutorial-overlay'

// Маппинг экранов
const screens: Record<GameScreen, typeof ForgeScreen> = {
  forge: ForgeScreen,
  resources: ResourcesScreen,
  workers: WorkersScreen,
  shop: ShopScreen,
  guild: GuildScreen,
  dungeons: DungeonsScreen,
  altar: AltarScreen,
}

export function GameLayout() {
  // Запуск игрового цикла
  useGameLoop()
  
  // Облачное сохранение
  const {
    isLoading: isLoadingSave,
    isSaving,
    lastSavedAt,
    error: saveError,
    save: saveGame,
    load: loadGame,
  } = useCloudSave({
    autoSaveInterval: 60000, // каждую минуту
    enableAutoSave: true,
  })
  
  const currentScreen = useGameStore((state) => state.currentScreen)
  const isMobile = useIsMobile()
  
  const CurrentScreen = screens[currentScreen]
  
  // Экран загрузки
  if (isLoadingSave) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-400">Загрузка сохранения...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex flex-col md:flex-row">
      {/* Боковое меню только для десктопа */}
      {!isMobile && <SideNav onSave={saveGame} isSaving={isSaving} />}
      
      {/* Основной контент */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Панель ресурсов сверху */}
        <ResourceBar saveStatus={{ isSaving, lastSavedAt, error: saveError }} />
        
        {/* Область контента */}
        <main className={cn(
          'flex-1 overflow-y-auto scrollbar-medieval',
          isMobile && 'pb-20' // Отступ для нижней навигации
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <CurrentScreen />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      
      {/* Нижнее меню только для мобильных */}
      {isMobile && <BottomNav />}
      
      {/* Оверлей туториала */}
      <TutorialOverlay />
    </div>
  )
}

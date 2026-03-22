/**
 * Guild Screen
 * Главный экран гильдии (контейнер)
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sword, 
  Shield, 
  Wand2, 
  Target,
  Users,
  Star,
  Crown,
  Zap,
  Trophy,
  Scroll,
  Clock,
  Coins,
  CheckCircle,
  AlertTriangle,
  Package,
  ArrowRight,
  Lock,
  RefreshCw,
  Map,
  Compass,
  Skull,
  Sparkles,
  Timer,
  XCircle,
  Send,
  Undo2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { 
  npcOrders, 
  type NPCOrder,
  generateRandomOrder 
} from '@/data/market-data'
import { weaponTypeStats, CraftedWeapon } from '@/data/weapon-recipes'
import { 
  TooltipProvider,
  RichTooltip,
  InfoTooltip 
} from '@/components/ui/game-tooltip'
import { useState, useEffect } from 'react'
import { Adventurer, ActiveExpedition, RecoveryQuest, GUILD_LEVELS } from '@/types/guild'
import { ExpeditionTemplate, expeditionTemplates } from '@/data/expedition-templates'
import { getAdventurerFullName, generateAdventurer, calculateExpeditionPreview } from '@/lib/adventurer-generator'
import { ADVENTURER_LIFETIME } from '@/lib/adventurer-generator'
import { ExpeditionResult } from '@/store/slices/guild-slice'
import { AdventurerCard as AdventurerCardNew } from '@/components/ui/adventurer-card'

// Импорт вынесенных компонентов
import { OrderCard } from '@/components/guild/order-card'
import { ActiveExpeditionCard } from '@/components/guild/active-expedition-card'
import { RecoveryQuestCard } from '@/components/guild/recovery-quest-card'
import { ExpeditionsSection } from '@/components/guild/expeditions-section'

// Названия типов оружия
const weaponTypeNames: Record<string, string> = {
  sword: 'Меч',
  dagger: 'Кинжал',
  axe: 'Топор',
  mace: 'Булава',
  spear: 'Копьё',
  hammer: 'Молот'
}

// Названия материалов
const materialNames: Record<string, string> = {
  iron: 'Железный',
  bronze: 'Бронзовый',
  steel: 'Стальной',
  silver: 'Серебряный',
  gold: 'Золотой',
  mithril: 'Мифриловый'
}

// Иконки экспедиций
const expeditionIcons: Record<string, React.ReactNode> = {
  hunt: <Sword className="w-5 h-5" />,
  scout: <Compass className="w-5 h-5" />,
  clear: <Shield className="w-5 h-5" />,
  delivery: <Package className="w-5 h-5" />,
  magic: <Sparkles className="w-5 h-5" />,
}

// Цвета сложности
const difficultyColors: Record<string, string> = {
  easy: 'text-green-400 border-green-600',
  normal: 'text-blue-400 border-blue-600',
  hard: 'text-amber-400 border-amber-600',
  extreme: 'text-red-400 border-red-600',
  legendary: 'text-purple-400 border-purple-600',
}

// === Данные для системы подбора искателей ===
const tempAdventurerNames = [
  'Гордон', 'Тория', 'Брам', 'Эльза', 'Кайл', 'Рогнар', 'Сильвия', 'Дарик',
  'Мира', 'Торин', 'Астрид', 'Гарет', 'Лира', 'Бруно', 'Хельга', 'Олаф'
]

const tempAdventurerTitles = [
  'Охотник', 'Разведчица', 'Воин', 'Следопыт', 'Клинок', 'Щит', 'Тень', 'Странник'
]

const declineReasons = [
  'слишком опасно',
  'плата недостаточна',
  'занят другой работой',
  'не устраивает оружие',
  'нужна передышка',
  'слышал дурные слухи об этом месте',
  'требует больше золота',
  'слишком далеко'
]

// Генератор искателя для поиска (с ограничением требований)
function generateSearchAdventurer(guildLevel: number, maxAttackReq: number): Adventurer {
  const adventurer = generateAdventurer(guildLevel)
  // Ограничиваем требования к атаке выбранным оружием
  adventurer.requirements.minAttack = Math.min(
    adventurer.requirements.minAttack,
    maxAttackReq
  )
  return adventurer
}

// Карточка искателя (обёртка для нового компонента)
function AdventurerCard({ adventurer, onSelect, isSelected, selectedExpedition }: { 
  adventurer: Adventurer
  onSelect: () => void
  isSelected: boolean
  selectedExpedition?: {
    baseGold: number
    baseWarSoul: number
    duration: number
    successChance: number
    weaponWear: number
    weaponLossChance: number
  } | null
}) {
  return (
    <AdventurerCardNew
      adventurer={adventurer}
      onSelect={onSelect}
      isSelected={isSelected}
      selectedExpedition={selectedExpedition}
    />
  )
}

// Секция заказов
function OrdersSection() {
  const player = useGameStore((state) => state.player)
  const orders = useGameStore((state) => state.orders)
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  const generateOrder = useGameStore((state) => state.generateOrder)
  const acceptOrder = useGameStore((state) => state.acceptOrder)
  const completeOrder = useGameStore((state) => state.completeOrder)
  const expireOrder = useGameStore((state) => state.expireOrder)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  
  const [showWeaponSelect, setShowWeaponSelect] = useState<string | null>(null)
  
  useEffect(() => {
    orders.forEach(order => {
      if (order.status === 'in_progress' && order.acceptedAt) {
        const deadline = order.acceptedAt + order.deadline * 1000
        if (Date.now() > deadline) {
          expireOrder(order.id)
        }
      }
    })
  }, [orders, expireOrder])
  
  useEffect(() => {
    if (orders.filter(o => o.status === 'available').length < 3) {
      const availableOrders = npcOrders.filter(
        o => o.requiredLevel <= player.level && o.requiredFame <= player.fame
      )
      const numOrders = Math.min(3 - orders.filter(o => o.status === 'available').length, availableOrders.length)
      for (let i = 0; i < numOrders; i++) {
        generateOrder()
      }
    }
  }, [])
  
  const availableOrders = orders.filter(o => o.status === 'available')
  const activeOrder = orders.find(o => o.id === activeOrderId)
  const completedOrders = orders.filter(o => o.status === 'completed')
  const expiredOrders = orders.filter(o => o.status === 'expired')
  
  const suitableWeapons = showWeaponSelect 
    ? weaponInventory.weapons.filter(w => {
        const order = orders.find(o => o.id === showWeaponSelect)
        if (!order || order.status !== 'in_progress') return false
        if (w.type !== order.weaponType) return false
        if (w.quality < order.minQuality) return false
        if (order.minAttack && w.attack < order.minAttack) return false
        if (order.material && w.recipeId && !w.recipeId.includes(order.material)) return false
        return true
      })
    : []
  
  const handleAcceptOrder = (orderId: string) => {
    acceptOrder(orderId)
  }
  
  const handleCompleteOrder = (weaponId: string) => {
    if (showWeaponSelect) {
      completeOrder(showWeaponSelect, weaponId)
      setShowWeaponSelect(null)
    }
  }
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {activeOrder && (
          <Card className="card-medieval border-green-600/30 bg-green-900/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Активный заказ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderCard 
                order={activeOrder}
                onSelect={() => setShowWeaponSelect(activeOrder.id)}
                isActive={true}
                canAccept={false}
              />
              
              <AnimatePresence>
                {showWeaponSelect === activeOrder.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-4 p-4 rounded-lg bg-stone-800/50 border border-stone-700"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-stone-200">Выберите оружие</h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowWeaponSelect(null)}
                      >
                        Отмена
                      </Button>
                    </div>
                    
                    {suitableWeapons.length === 0 ? (
                      <div className="text-center py-4">
                        <Package className="w-10 h-10 mx-auto text-stone-600 mb-2" />
                        <p className="text-stone-500">Нет подходящего оружия</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                        {suitableWeapons.map(weapon => (
                          <div
                            key={weapon.id}
                            className="flex items-center justify-between p-2 rounded bg-stone-700/50 hover:bg-stone-700 transition-colors cursor-pointer"
                            onClick={() => handleCompleteOrder(weapon.id)}
                          >
                            <div>
                              <p className="font-medium text-stone-200 text-sm">{weapon.name}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-red-400">⚔ {weapon.attack}</span>
                                <span className="text-amber-400">✦ {weapon.quality}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-400 font-semibold">{weapon.sellPrice} 💰</p>
                              <p className="text-xs text-green-400">Завершить</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        )}
        
        <Card className="card-medieval">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-amber-200 flex items-center gap-2">
                  <Scroll className="w-5 h-5" />
                  Доступные заказы
                </CardTitle>
                <CardDescription>
                  Выполните заказ и получите награду
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-600/30 text-amber-400"
                onClick={() => generateOrder()}
                disabled={activeOrderId !== null}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Новый заказ
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {availableOrders.length === 0 ? (
              <div className="text-center py-8">
                <Scroll className="w-12 h-12 mx-auto text-stone-600 mb-3" />
                <p className="text-stone-500">Нет доступных заказов</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {availableOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onSelect={() => handleAcceptOrder(order.id)}
                      isActive={false}
                      canAccept={activeOrderId === null}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="card-medieval bg-stone-800/50">
            <CardContent className="p-3 text-center">
              <Scroll className="w-5 h-5 mx-auto text-amber-500 mb-1" />
              <p className="text-xl font-bold text-stone-200">{availableOrders.length}</p>
              <p className="text-xs text-stone-500">Доступно</p>
            </CardContent>
          </Card>
          <Card className="card-medieval bg-stone-800/50">
            <CardContent className="p-3 text-center">
              <CheckCircle className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-xl font-bold text-stone-200">{completedOrders.length}</p>
              <p className="text-xs text-stone-500">Выполнено</p>
            </CardContent>
          </Card>
          <Card className="card-medieval bg-stone-800/50">
            <CardContent className="p-3 text-center">
              <AlertTriangle className="w-5 h-5 mx-auto text-red-500 mb-1" />
              <p className="text-xl font-bold text-stone-200">{expiredOrders.length}</p>
              <p className="text-xs text-stone-500">Просрочено</p>
            </CardContent>
          </Card>
          <Card className="card-medieval bg-stone-800/50">
            <CardContent className="p-3 text-center">
              <Star className="w-5 h-5 mx-auto text-purple-500 mb-1" />
              <p className="text-xl font-bold text-stone-200">{player.fame ?? 0}</p>
              <p className="text-xs text-stone-500">Слава</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}

// TODO: Экспортировать ExpeditionsSection в отдельный файл (слишком большой)

export function GuildScreen() {
  const guild = useGameStore((state) => state.guild)
  const player = useGameStore((state) => state.player)
  const resources = useGameStore((state) => state.resources)
  const startRecoveryQuest = useGameStore((state) => state.startRecoveryQuest)
  const completeRecoveryQuest = useGameStore((state) => state.completeRecoveryQuest)
  const declineRecoveryQuest = useGameStore((state) => state.declineRecoveryQuest)
  
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  
  const guildLevel = GUILD_LEVELS.find(l => l.level === guild.level) || GUILD_LEVELS[0]
  
  return (
    <TooltipProvider>
    <div className="p-4 md:p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Гильдия искателей
          </h2>
          <InfoTooltip
            title="Гильдия"
            content="Здесь вы можете принимать заказы и отправлять оружие в экспедиции."
            icon="help"
          />
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-amber-900/30 border-amber-600/50">
            <Trophy className="w-3 h-3 mr-1 text-amber-400" />
            Ур. {guild.level}
          </Badge>
          <Badge variant="outline" className="bg-purple-900/30 border-purple-600/50">
            <Star className="w-3 h-3 mr-1 text-purple-400" />
            {guild.glory} славы
          </Badge>
        </div>
      </div>
      
      {/* Статистика гильдии */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <InfoTooltip
          title="Уровень гильдии"
          content={<>
            <p>Уровень гильдии определяет доступные экспедиции и бонус к комиссии.</p>
            <p className="mt-1">• Ур. 1-2: Лёгкие и обычные экспедиции</p>
            <p>• Ур. 3-4: Сложные экспедиции</p>
            <p>• Ур. 5: Легендарные экспедиции</p>
            <p className="mt-1 text-amber-400">Повышается автоматически при наборе славы</p>
          </>}
          side="bottom"
        >
          <Card className="card-medieval bg-stone-800/50 cursor-help h-full">
            <CardContent className="p-3 text-center flex flex-col justify-between h-full min-h-[100px]">
              <div>
                <Trophy className="w-5 h-5 mx-auto text-amber-500 mb-1" />
                <p className="text-xl font-bold text-stone-200">Ур. {guild.level}</p>
                <p className="text-xs text-stone-500 mb-2">Гильдия</p>
              </div>
              {/* Прогресс до следующего уровня */}
              <div className="mt-auto">
                {guild.level < 5 && (() => {
                  const nextLevel = GUILD_LEVELS.find(l => l.level === guild.level + 1)
                  const currentLevelData = GUILD_LEVELS.find(l => l.level === guild.level)
                  if (!nextLevel) return null
                  const currentReq = currentLevelData?.requiredGlory ?? 0
                  const nextReq = nextLevel.requiredGlory
                  const progress = Math.min(100, ((guild.glory - currentReq) / (nextReq - currentReq)) * 100)
                  return (
                    <>
                      <Progress value={progress} className="h-1.5 bg-stone-700" />
                      <p className="text-xs text-stone-500 mt-1">{guild.glory}/{nextReq}</p>
                    </>
                  )
                })()}
                {guild.level >= 5 && (
                  <p className="text-xs text-amber-400">Макс. уровень!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </InfoTooltip>
        
        <InfoTooltip
          title="Слава гильдии"
          content={<>
            <p>Слава — это репутация вашей гильдии среди искателей.</p>
            <p className="mt-1">Влияние:</p>
            <p>• Уровень гильдии (0→500→1500→4000→10000)</p>
            <p>• Бонус к комиссии: 15% → 30%</p>
            <p>• Доступ к лучшим экспедициям</p>
            <p className="mt-1 text-purple-400">+1-5 славы за успешную экспедицию</p>
          </>}
          side="bottom"
        >
          <Card className="card-medieval bg-stone-800/50 cursor-help h-full">
            <CardContent className="p-3 text-center flex flex-col justify-between h-full min-h-[100px]">
              <div>
                <Crown className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-xl font-bold text-stone-200">{guild.glory}</p>
                <p className="text-xs text-stone-500">Слава</p>
              </div>
              <div className="mt-auto pt-2">
                <p className="text-xs text-stone-600">Репутация</p>
              </div>
            </CardContent>
          </Card>
        </InfoTooltip>
        
        <InfoTooltip
          title="Активные экспедиции"
          content={<>
            <p>Количество текущих экспедиций гильдии.</p>
            <p className="mt-1 text-amber-400">Завершённые экспедиции приносят золото, души и славу.</p>
          </>}
          side="bottom"
        >
          <Card className="card-medieval bg-stone-800/50 cursor-help h-full">
            <CardContent className="p-3 text-center flex flex-col justify-between h-full min-h-[100px]">
              <div>
                <Sword className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <p className="text-xl font-bold text-stone-200">{guild.activeExpeditions.length}</p>
                <p className="text-xs text-stone-500">В пути</p>
              </div>
              <div className="mt-auto pt-2">
                <p className="text-xs text-stone-600">Искателей</p>
              </div>
            </CardContent>
          </Card>
        </InfoTooltip>
        
        <InfoTooltip
          title="Квесты восстановления"
          content={<>
            <p className="font-semibold text-amber-400 mb-1">Восстановление потерянного оружия</p>
            <p>Когда экспедиция проваливается, есть шанс потерять оружие.</p>
            <p className="mt-1">Потерянное оружие можно вернуть:</p>
            <p>• Оплатите стоимость восстановления</p>
            <p>• Отправьте искателя на поиски</p>
            <p>• Оружие вернётся в инвентарь</p>
            <p className="mt-1 text-red-400">⚠️ Если отказаться, оружие будет потеряно навсегда!</p>
            <p className="mt-1 text-xs text-stone-500">Нажмите на карточку для быстрого планирования</p>
          </>}
          side="bottom"
        >
          <Card 
            className={cn(
              "card-medieval cursor-help h-full",
              guild.recoveryQuests.length > 0 
                ? "bg-red-900/20 border-red-600/30" 
                : "bg-stone-800/50"
            )}
            onClick={() => guild.recoveryQuests.length > 0 && setShowRecoveryModal(true)}
          >
            <CardContent className="p-3 text-center flex flex-col justify-between h-full min-h-[100px]">
              <div>
                <Skull className={cn("w-5 h-5 mx-auto mb-1", guild.recoveryQuests.length > 0 ? "text-red-500" : "text-stone-600")} />
                <p className="text-xl font-bold text-stone-200">{guild.recoveryQuests.length}</p>
                <p className="text-xs text-stone-500">Квестов</p>
              </div>
              <div className="mt-auto pt-2">
                {guild.recoveryQuests.length > 0 ? (
                  <p className="text-xs text-red-400">Требует внимания!</p>
                ) : (
                  <p className="text-xs text-stone-600">Восстановление</p>
                )}
              </div>
            </CardContent>
          </Card>
        </InfoTooltip>
      </div>
      
      {/* Вкладки */}
      <Tabs defaultValue="orders" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-stone-800/50 h-auto p-1">
          <TabsTrigger 
            value="orders" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-800 data-[state=active]:to-amber-900 data-[state=active]:text-amber-100 data-[state=active]:shadow-lg text-stone-400 hover:text-stone-200 transition-all py-2"
          >
            <Scroll className="w-4 h-4 mr-2" />
            Заказы
          </TabsTrigger>
          <TabsTrigger 
            value="expeditions" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-800 data-[state=active]:to-amber-900 data-[state=active]:text-amber-100 data-[state=active]:shadow-lg text-stone-400 hover:text-stone-200 transition-all py-2"
          >
            <Map className="w-4 h-4 mr-2" />
            Экспедиции
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="mt-6">
          <OrdersSection />
        </TabsContent>
        
        <TabsContent value="expeditions" className="mt-6">
          <ExpeditionsSection />
        </TabsContent>
      </Tabs>
      
      {/* Модальное окно квестов восстановления */}
      <AnimatePresence>
        {showRecoveryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setShowRecoveryModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-stone-900 border border-stone-700 rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <Skull className="w-5 h-5" />
                  Потерянное оружие
                </h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowRecoveryModal(false)}
                  className="text-stone-400 hover:text-stone-200"
                >
                  ✕
                </Button>
              </div>
              
              {guild.recoveryQuests.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-stone-600 mb-3" />
                  <p className="text-stone-500">Нет потерянного оружия</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {guild.recoveryQuests.map(quest => (
                    <RecoveryQuestCard key={quest.id} quest={quest} />
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </TooltipProvider>
  )
}

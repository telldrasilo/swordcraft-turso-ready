/**
 * Expeditions Section
 * Секция экспедиций для гильдии
 * Версия 2.0 — с расширенной системой найма
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import {
  Sword,
  Shield,
  Users,
  Star,
  Trophy,
  Scroll,
  Coins,
  CheckCircle,
  RefreshCw,
  Map,
  Compass,
  Package,
  Skull,
  Sparkles,
  Timer,
  Zap,
  Send,
  Undo2,
  Crown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from '@/components/ui/game-tooltip'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { useState, useEffect, useMemo } from 'react'
import { Adventurer, ActiveExpedition, RecoveryQuest, GUILD_LEVELS } from '@/types/guild'
import { ExpeditionTemplate, expeditionTemplates, difficultyInfo, typeInfo } from '@/data/expedition-templates'
import { getAdventurerFullName } from '@/lib/adventurer-generator'
import type { CraftedWeapon } from '@/store/slices/craft-slice'

// Импорт вынесенных компонентов
import { ActiveExpeditionCard } from './active-expedition-card'
import { RecoveryQuestCard } from './recovery-quest-card'
import { RecruitmentInterface } from './recruitment-interface'
import { ExpeditionHistoryEntryComponent } from './expedition-history-entry'
import { ExpeditionSelectionCard, WeaponSelectionCard } from './expeditions'

// Импорт конвертеров и типов
import type { AdventurerExtended } from '@/types/adventurer-extended'
import { convertToLegacy, convertToExtended, mapExpeditionForRecruitment, mapWeaponForRecruitment } from '@/lib/adventurer-converter'
import type { ContractTier, ContractedAdventurer } from '@/types/contract'
import { getMaxContracts } from '@/lib/contract-manager'

// Импорт системы модификаторов
import { calculateExpeditionResult, type ExpeditionCalculation } from '@/lib/expedition-calculator-v2'
import { FullModifierBreakdown } from '@/components/ui/modifier-breakdown'

// Иконки экспедиций
const expeditionIcons: Record<string, React.ReactNode> = {
  hunt: <Sword className="w-5 h-5" />,
  scout: <Compass className="w-5 h-5" />,
  clear: <Shield className="w-5 h-5" />,
  delivery: <Package className="w-5 h-5" />,
  magic: <Sparkles className="w-5 h-5" />,
}

// Простой компонент для tooltip с children
function InfoTooltip({
  title,
  content,
  side = 'top',
  children
}: {
  title?: string
  content: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  children: React.ReactNode
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <div className="cursor-help">
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-sm z-50">
        {title && (
          <p className="font-semibold text-amber-400 mb-1">{title}</p>
        )}
        <div className="text-stone-300 text-xs leading-relaxed">
          {content}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}

// Карточка искателя
function AdventurerCardItem({
  adventurer,
  isSelected,
  canSelect,
  onSelect
}: {
  adventurer: Adventurer
  isSelected: boolean
  canSelect: boolean
  onSelect: () => void
}) {
  const fullName = getAdventurerFullName(adventurer)
  const minAttack = adventurer.requirements?.minAttack ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card
        className={cn(
          "card-medieval cursor-pointer transition-all",
          isSelected && "border-amber-500 bg-amber-900/20",
          !canSelect && "opacity-50"
        )}
        onClick={canSelect ? onSelect : undefined}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-200 text-sm truncate">{fullName}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs bg-purple-900/50 text-purple-300">
                  +{adventurer.skill}% души
                </Badge>
                {adventurer.traits && adventurer.traits.length > 0 && (
                  <Badge className="text-xs bg-amber-900/50 text-amber-300">
                    {adventurer.traits.length} черт
                  </Badge>
                )}
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Требует атаку: {minAttack}+
              </p>
            </div>
            {isSelected && (
              <CheckCircle className="w-5 h-5 text-amber-400" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ExpeditionCard теперь импортируется как ExpeditionSelectionCard

// WeaponCard теперь импортируется как WeaponSelectionCard

export function ExpeditionsSection() {
  const guild = useGameStore((state) => state.guild)
  const resources = useGameStore((state) => state.resources)
  const player = useGameStore((state) => state.player)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const initializeAdventurers = useGameStore((state) => state.initializeAdventurers)
  const refreshAdventurers = useGameStore((state) => state.refreshAdventurers)
  const startExpedition = useGameStore((state) => state.startExpedition)
  const addResource = useGameStore((state) => state.addResource)

  const [selectedExpedition, setSelectedExpedition] = useState<ExpeditionTemplate | null>(null)
  const [selectedWeapon, setSelectedWeapon] = useState<CraftedWeapon | null>(null)
  const [selectedAdventurer, setSelectedAdventurer] = useState<Adventurer | null>(null)
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<number>(0)

  // Расширенный искатель (из RecruitmentInterface)
  const [selectedExtendedAdventurer, setSelectedExtendedAdventurer] = useState<AdventurerExtended | null>(null)

  // Случайные экспедиции
  const [currentExpeditions, setCurrentExpeditions] = useState<ExpeditionTemplate[]>([])
  
  // Контрактные искатели из расширенного состояния гильдии
  const contractedAdventurers = (guild as any).contractedAdventurers || []
  
  // Подсчёт миссий для каждого искателя из истории
  const getAdventurerStats = (adventurerId: string) => {
    // Ищем в истории по имени (т.к. ID могут отличаться)
    const entries = guild.history.filter(e => 
      e.adventurerData?.id === adventurerId || 
      e.adventurerName === (guild.history.find(h => h.adventurerData?.id === adventurerId)?.adventurerName)
    )
    const missionCount = entries.length
    const successCount = entries.filter(e => e.success).length
    const successRate = missionCount > 0 ? Math.round((successCount / missionCount) * 100) : 0
    return { missionCount, successRate }
  }
  
  // Проверка, есть ли уже контракт с этим искателем
  const isAlreadyContracted = (adventurerId: string) => {
    return contractedAdventurers.some((c: ContractedAdventurer) => c.adventurerId === adventurerId)
  }
  
  // Обработка предложения контракта
  const handleOfferContract = (adventurer: Adventurer, tier: ContractTier) => {
    // Эта функция должна вызывать action из store
    // Пока что просто выводим в консоль
    console.log('Offer contract:', { adventurer: adventurer.name, tier })
    // В реальной реализации здесь будет вызов store action
  }

  // Получение случайных экспедиций
  const getRandomExpeditions = (count: number = 3): ExpeditionTemplate[] => {
    const available = expeditionTemplates.filter(e => e.minGuildLevel <= guild.level)
    const shuffled = [...available].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, Math.min(count, shuffled.length))
  }

  // Инициализация случайных экспедиций
  useEffect(() => {
    if (currentExpeditions.length === 0) {
      setCurrentExpeditions(getRandomExpeditions(3))
    }
  }, [guild.level])

  // Стоимость обновления экспедиций
  const refreshCost = 10 * player.level

  // Обновление списка экспедиций
  const refreshExpeditions = () => {
    if (resources.gold >= refreshCost) {
      addResource('gold', -refreshCost)
      setCurrentExpeditions(getRandomExpeditions(3))
      setSelectedExpedition(null)
      setSelectedWeapon(null)
      setSelectedAdventurer(null)
    }
  }

  // Инициализация искателей
  useEffect(() => {
    initializeAdventurers()
  }, [initializeAdventurers])

  // Таймер до обновления искателей
  useEffect(() => {
    const updateTime = () => {
      const remaining = Math.max(0, guild.adventurerRefreshAt - Date.now())
      setTimeUntilRefresh(remaining)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [guild.adventurerRefreshAt])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const canRefresh = timeUntilRefresh === 0

  // Проверка возможности выбрать экспедицию
  const canSelectExpedition = (expedition: ExpeditionTemplate): { can: boolean; reason: string } => {
    const totalCost = expedition.cost.supplies + expedition.cost.deposit
    if (resources.gold < totalCost) {
      return { can: false, reason: `Нужно ${totalCost} золота` }
    }
    return { can: true, reason: '' }
  }

  // Проверка возможности выбрать оружие
  const canSelectWeapon = (weapon: CraftedWeapon): { can: boolean; reason: string } => {
    if (!selectedExpedition) {
      return { can: false, reason: 'Сначала выберите экспедицию' }
    }
    if (weapon.durability <= 10) {
      return { can: false, reason: 'Оружие слишком повреждено' }
    }
    if (weapon.attack < selectedExpedition.minWeaponAttack) {
      return { can: false, reason: `Требуется атака ${selectedExpedition.minWeaponAttack}+` }
    }
    return { can: true, reason: '' }
  }

  // Проверка возможности выбрать искателя
  const canSelectAdventurer = (adventurer: Adventurer): { can: boolean; reason: string } => {
    if (!selectedWeapon) {
      return { can: false, reason: 'Сначала выберите оружие' }
    }
    const minAttack = adventurer.requirements?.minAttack ?? 0
    if (selectedWeapon.attack < minAttack) {
      return { can: false, reason: `Искатель требует атаку ${minAttack}+` }
    }
    return { can: true, reason: '' }
  }

  // Проверка возможности начать экспедицию
  const canStartExpedition = (): { can: boolean; reason: string } => {
    if (!selectedExpedition) return { can: false, reason: 'Выберите экспедицию' }
    if (!selectedWeapon) return { can: false, reason: 'Выберите оружие' }
    if (!selectedAdventurer) return { can: false, reason: 'Выберите искателя' }
    return { can: true, reason: '' }
  }

  // Доступное оружие (фильтруем по прочности, использованию в экспедиции и требованиям атаки)
  const availableWeapons = weaponInventory.weapons.filter(w => {
    // Базовые проверки
    if (w.durability <= 10) return false
    if (guild.activeExpeditions.some(e => e.weaponId === w.id)) return false
    
    // Если выбрана экспедиция, проверяем требования к атаке
    if (selectedExpedition && w.attack < selectedExpedition.minWeaponAttack) {
      return false
    }
    
    return true
  })

  // Доступные искатели
  const availableAdventurers = guild.adventurers.filter(a =>
    !guild.activeExpeditions.some(e => e.adventurerId === a.id)
  )

  // Запуск экспедиции
  const handleStartExpedition = () => {
    if (!selectedExpedition || !selectedWeapon || !selectedAdventurer) return

    const success = startExpedition(
      selectedExpedition, 
      selectedAdventurer, 
      selectedWeapon,
      selectedExtendedAdventurer || undefined // Передаём Extended данные
    )
    if (success) {
      setSelectedExpedition(null)
      setSelectedWeapon(null)
      setSelectedAdventurer(null)
      setSelectedExtendedAdventurer(null)
    }
  }

  // Обработка выбора расширенного искателя
  const handleExtendedAdventurerSelect = (extended: AdventurerExtended) => {
    setSelectedExtendedAdventurer(extended)
    // Конвертируем в старый формат для совместимости
    const legacyAdventurer = convertToLegacy(extended)
    legacyAdventurer.id = `ext-${extended.id}` // Уникальный ID для расширенного
    setSelectedAdventurer(legacyAdventurer)
  }

  // Расчёт модификаторов экспедиции
  const expeditionCalculation = useMemo<ExpeditionCalculation | null>(() => {
    if (!selectedExpedition || !selectedWeapon || !selectedAdventurer) return null

    // Получаем расширенные данные искателя
    const extendedAdventurer = selectedExtendedAdventurer || convertToExtended(selectedAdventurer)

    return calculateExpeditionResult(
      extendedAdventurer,
      selectedExpedition,
      guild.level,
      selectedWeapon.attack,
      selectedWeapon.durability,
      'sword', // TODO: определить тип оружия
      selectedWeapon.id
    )
  }, [selectedExpedition, selectedWeapon, selectedAdventurer, selectedExtendedAdventurer, guild.level])

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Активные экспедиции */}
        {guild.activeExpeditions.length > 0 && (
          <Card className="card-medieval">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Timer className="w-5 h-5" />
                Активные экспедиции
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {guild.activeExpeditions.map(expedition => (
                    <ActiveExpeditionCard key={expedition.id} expedition={expedition} />
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Квесты восстановления */}
        {guild.recoveryQuests.filter(q => q.status !== 'declined').length > 0 && (
          <Card className="card-medieval border-red-600/30">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <Skull className="w-5 h-5" />
                Потерянное оружие
              </CardTitle>
              <CardDescription>Оружие, потерянное в неудачных экспедициях</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guild.recoveryQuests
                  .filter(q => q.status !== 'declined')
                  .map(quest => (
                    <RecoveryQuestCard key={quest.id} quest={quest} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Выбор экспедиции */}
        <Card className="card-medieval">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Compass className="w-5 h-5" />
                Доступные экспедиции
              </CardTitle>
              <CardDescription>Выберите миссию для искателей</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshExpeditions}
              disabled={resources.gold < refreshCost}
              className="text-amber-400 border-amber-600 hover:bg-amber-900/30"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Обновить ({refreshCost} 💰)
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {currentExpeditions.map(expedition => {
                  const { can, reason } = canSelectExpedition(expedition)
                  return (
                    <ExpeditionSelectionCard
                      key={expedition.id}
                      expedition={expedition}
                      isSelected={selectedExpedition?.id === expedition.id}
                      canSelect={can}
                      reason={reason}
                      onSelect={() => {
                        setSelectedExpedition(expedition)
                        setSelectedWeapon(null)
                        setSelectedAdventurer(null)
                      }}
                    />
                  )
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Выбор оружия */}
        {selectedExpedition && (
          <Card className="card-medieval">
            <CardHeader>
              <CardTitle className="text-amber-200 flex items-center gap-2">
                <Sword className="w-5 h-5" />
                Выберите оружие
              </CardTitle>
              <CardDescription>
                Требуется атака {selectedExpedition.minWeaponAttack}+
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableWeapons.length === 0 ? (
                <p className="text-stone-500 text-center py-4">
                  Нет подходящего оружия. Создайте оружие в кузнице.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence mode="popLayout">
                    {availableWeapons.map(weapon => {
                      const { can, reason } = canSelectWeapon(weapon)
                      return (
                        <WeaponSelectionCard
                          key={weapon.id}
                          weapon={weapon}
                          isSelected={selectedWeapon?.id === weapon.id}
                          canSelect={can}
                          reason={reason}
                          onSelect={() => {
                            setSelectedWeapon(weapon)
                            setSelectedAdventurer(null)
                          }}
                        />
                      )
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Поиск искателей */}
        {selectedWeapon && selectedExpedition && (
          <RecruitmentInterface
            expedition={mapExpeditionForRecruitment({
              id: selectedExpedition.id,
              name: selectedExpedition.name,
              difficulty: selectedExpedition.difficulty,
              reward: selectedExpedition.reward,
              duration: selectedExpedition.duration,
              failureChance: selectedExpedition.failureChance,
              weaponLossChance: selectedExpedition.weaponLossChance,
              minWeaponAttack: selectedExpedition.minWeaponAttack,
            })}
            weapon={mapWeaponForRecruitment({
              id: selectedWeapon.id,
              name: selectedWeapon.name,
              attack: selectedWeapon.attack,
              durability: selectedWeapon.durability,
            })}
            guildLevel={guild.level}
            onSelect={handleExtendedAdventurerSelect}
            onCancel={() => {
              setSelectedExtendedAdventurer(null)
              setSelectedAdventurer(null)
            }}
          />
        )}

        {/* Кнопка начала экспедиции и модификаторы */}
        {selectedExpedition && selectedWeapon && selectedAdventurer && (
          <Card className="card-medieval border-amber-600/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-stone-200">Готово к отправке</h4>
                  <p className="text-sm text-stone-400">
                    {selectedExpedition.name} • {selectedAdventurer.name} • {selectedWeapon.name}
                  </p>
                </div>
                <Button
                  onClick={handleStartExpedition}
                  className="bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Отправить в экспедицию
                </Button>
              </div>

              {/* Детализация модификаторов */}
              {expeditionCalculation && (
                <div className="mt-4 pt-4 border-t border-stone-700/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h5 className="text-sm font-medium text-stone-300">Модификаторы экспедиции</h5>
                  </div>
                  
                  {/* Сводка результатов */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-stone-400">Шанс успеха</div>
                      <div className={`text-lg font-bold ${
                        expeditionCalculation.successChance >= 70 ? 'text-green-400' :
                        expeditionCalculation.successChance >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {expeditionCalculation.successChance}%
                      </div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-stone-400">Награда</div>
                      <div className="text-lg font-bold text-amber-400">
                        💰 {expeditionCalculation.commission}
                      </div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-stone-400">Души войны</div>
                      <div className="text-lg font-bold text-purple-400">
                        ⚔️ {expeditionCalculation.warSoul}
                      </div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <div className="text-xs text-stone-400">Износ оружия</div>
                      <div className="text-lg font-bold text-yellow-400">
                        🔧 -{expeditionCalculation.weaponWear}%
                      </div>
                    </div>
                  </div>

                  {/* Рекомендация */}
                  <div className={`text-sm p-2 rounded-lg mb-3 ${
                    expeditionCalculation.recommendation.rating === 'excellent' ? 'bg-green-900/30 text-green-300' :
                    expeditionCalculation.recommendation.rating === 'good' ? 'bg-blue-900/30 text-blue-300' :
                    expeditionCalculation.recommendation.rating === 'risky' ? 'bg-amber-900/30 text-amber-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {expeditionCalculation.recommendation.description}
                  </div>

                  {/* Полная детализация модификаторов (сворачиваемая) */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1">
                      <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
                      Показать все модификаторы
                    </summary>
                    <div className="mt-3">
                      <FullModifierBreakdown calculation={expeditionCalculation} compact={true} />
                    </div>
                  </details>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* История экспедиций */}
        {guild.history.length > 0 && (
          <Card className="card-medieval">
            <CardHeader>
              <CardTitle className="text-stone-300 flex items-center gap-2">
                <Scroll className="w-5 h-5" />
                История экспедиций
              </CardTitle>
              <CardDescription>
                Нажмите на иконку искателя 👤 для просмотра карточки и предложения контракта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[...guild.history].reverse().slice(0, 20).map(entry => {
                  const adventurerId = entry.adventurerData?.id || ''
                  const stats = getAdventurerStats(adventurerId)
                  
                  return (
                    <ExpeditionHistoryEntryComponent
                      key={entry.id}
                      entry={entry}
                      guildLevel={guild.level}
                      guildGold={resources.gold}
                      guildGlory={guild.glory}
                      currentContractsCount={contractedAdventurers.length}
                      adventurerMissionCount={stats.missionCount}
                      adventurerSuccessRate={stats.successRate}
                      alreadyContracted={isAlreadyContracted(adventurerId)}
                      onOfferContract={handleOfferContract}
                    />
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}

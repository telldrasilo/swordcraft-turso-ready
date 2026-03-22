/**
 * Recruitment Interface
 * Интерфейс подбора искателей с симуляцией поиска
 */

'use client'

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Users, Search, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

import type { AdventurerExtended, SearchState, SearchLogEntry } from '@/types/adventurer-extended'
import { SearchLog } from './search-log'
import { AdventurerCardV2 } from './adventurer-card-v2'
import { AdventurerFullCard } from './adventurer-full-card'
import { generateExtendedAdventurer } from '@/lib/adventurer-generator-extended'
import { generateMessage } from '@/data/adventurer-phrases'

// ================================
// ПРОПСЫ
// ================================

interface RecruitmentInterfaceProps {
  expedition: {
    id: string
    name: string
    difficulty: string
    baseGold: number
    baseWarSoul: number
    duration: number
    successChance: number
    weaponWear: number
    weaponLossChance: number
    minWeaponAttack: number
  }
  weapon: {
    id: string
    name: string
    attack: number
    durability: number
  }
  guildLevel: number
  onSelect: (adventurer: AdventurerExtended) => void
  onCancel?: () => void
}

// ================================
// ХУК СИМУЛЯЦИИ ПОИСКА
// ================================

// Вспомогательная функция для получения всех тэгов
function getAllTags(adventurer: AdventurerExtended): string[] {
  return [
    adventurer.personality.primaryTrait,
    adventurer.personality.secondaryTrait,
    ...adventurer.personality.motivations,
    ...adventurer.personality.socialTags,
    adventurer.personality.riskTolerance,
    adventurer.combat.combatStyle,
    ...adventurer.strengths.map(s => s.id),
    ...adventurer.weaknesses.map(w => w.id),
    'default',
  ].filter(Boolean) as string[]
}

// Расчёт шанса согласия (локальная версия)
function calculateLocalAcceptChance(
  adventurer: AdventurerExtended,
  expedition: {
    difficulty: string
    baseGold: number
    baseWarSoul: number
  }
): number {
  let baseChance = 50

  // Уровень сложности
  const difficultyLevels: Record<string, number> = {
    easy: 5,
    normal: 15,
    hard: 25,
    extreme: 35,
    legendary: 45,
  }
  const diffLevel = difficultyLevels[expedition.difficulty] || 15

  // Разница уровней
  const levelDiff = adventurer.combat.level - diffLevel

  // Высокий уровень на лёгкую миссию
  if (levelDiff > 5) {
    if (adventurer.personality.primaryTrait === 'ambitious') {
      baseChance -= 15
    } else {
      baseChance -= 25
    }
  }
  // Низкий уровень на сложную миссию
  else if (levelDiff < -5) {
    if (adventurer.personality.primaryTrait === 'reckless' ||
        adventurer.personality.primaryTrait === 'brave') {
      baseChance += 15
    } else {
      baseChance -= 35
    }
  }

  // Влияние характера
  if (adventurer.personality.primaryTrait === 'greedy' ||
      adventurer.personality.secondaryTrait === 'greedy') {
    const goldRatio = expedition.baseGold / 50
    if (goldRatio < 1) baseChance -= 20
    else if (goldRatio > 2) baseChance += 15
  }

  // Влияние мотивации
  for (const motivation of adventurer.personality.motivations) {
    switch (motivation) {
      case 'gold':
        baseChance += expedition.baseGold > 100 ? 10 : -5
        break
      case 'glory':
        baseChance += expedition.difficulty === 'legendary' ? 20 : 0
        break
      case 'challenge':
        baseChance += levelDiff < 0 ? 15 : -10
        break
    }
  }

  return Math.max(5, Math.min(95, baseChance))
}

function useSearchSimulation(
  expedition: RecruitmentInterfaceProps['expedition'],
  guildLevel: number,
  weaponAttack: number
) {
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    startTime: 0,
    duration: 0,
    progress: 0,
    logs: [],
    foundAdventurers: [],
    targetCount: 3,
  })
  
  // Храним ID уже найденных искателей для предотвращения дубликатов
  const [existingAdventurerIds, setExistingAdventurerIds] = useState<Set<string>>(new Set())

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const eventsRef = useRef<Array<{
    time: number
    adventurer: AdventurerExtended
    accepted: boolean
    message: string
  }>>([])

  // Остановка поиска
  const stopSearch = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setSearchState(prev => ({
      ...prev,
      isSearching: false,
      progress: 100,
    }))
  }, [])

  // Пропуск анимации
  const skipSearch = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Мгновенно обработать все оставшиеся события
    const remainingEvents = eventsRef.current.filter(e =>
      !searchState.logs.some(l => l.adventurerId === e.adventurer.id)
    )

    const newLogs: SearchLogEntry[] = []
    const newFound: AdventurerExtended[] = [...searchState.foundAdventurers]

    remainingEvents.forEach(event => {
      const logEntry: SearchLogEntry = {
        id: `log-${event.adventurer.id}`,
        timestamp: event.time,
        adventurerId: event.adventurer.id,
        adventurerName: `${event.adventurer.identity.firstName}${event.adventurer.identity.nickname ? ` "${event.adventurer.identity.nickname}"` : ''}`,
        type: event.accepted ? 'accepted' : 'declined',
        message: event.message,
        emoji: event.accepted ? '✅' : '❌',
      }
      newLogs.push(logEntry)

      if (event.accepted && newFound.length < 3) {
        newFound.push(event.adventurer)
      }
    })

    setSearchState(prev => ({
      ...prev,
      isSearching: false,
      progress: 100,
      logs: [...prev.logs, ...newLogs],
      foundAdventurers: newFound,
    }))
  }, [searchState.logs, searchState.foundAdventurers])

  // Начало поиска (с сохранением уже найденных)
  const startSearch = useCallback((keepExisting: boolean = false) => {
    // Генерируем события — продолжаем пока не найдём 3 согласившихся
    const duration = 45000 // 45 секунд базовая длительность
    const maxDuration = 120000 // Максимум 2 минуты
    const TARGET_FOUND = 3

    const events: typeof eventsRef.current = []
    // Используем существующие ID + новые для предотвращения дубликатов
    const usedIds = new Set<string>(keepExisting ? existingAdventurerIds : [])
    let foundCount = keepExisting ? searchState.foundAdventurers.length : 0
    let currentTime = 0
    const eventInterval = 4000 // Каждые 4 секунды подходит новый искатель

    // Генерируем события пока не найдём 3 согласившихся или не достигнем лимита
    while (foundCount < TARGET_FOUND && currentTime < maxDuration) {
      currentTime += eventInterval + Math.random() * 2000 // 4-6 секунд между событиями

      // Генерируем искателя
      const adventurer = generateExtendedAdventurer(guildLevel)
      if (usedIds.has(adventurer.id)) continue
      usedIds.add(adventurer.id)

      // Рассчитываем шанс согласия
      const acceptChance = calculateLocalAcceptChance(adventurer, {
        difficulty: expedition.difficulty,
        baseGold: expedition.baseGold,
        baseWarSoul: expedition.baseWarSoul,
      })

      const roll = Math.random() * 100
      const accepted = roll < acceptChance

      if (accepted) {
        foundCount++
      }

      // Генерируем сообщение
      const allTags = getAllTags(adventurer)
      const message = generateMessage(
        accepted ? 'accepted' : 'declined',
        {
          name: adventurer.identity.firstName,
          title: adventurer.identity.lastName,
          gender: adventurer.identity.gender,
        },
        allTags,
        expedition.name
      )

      events.push({
        time: currentTime,
        adventurer,
        accepted,
        message,
      })
    }

    // Устанавливаем длительность на основе последнего события
    const actualDuration = Math.min(maxDuration, currentTime + 5000)

    events.sort((a, b) => a.time - b.time)
    eventsRef.current = events
    
    // Обновляем набор существующих ID
    setExistingAdventurerIds(usedIds)

    // Если сохраняем существующих, оставляем их и добавляем логи
    const initialLogs = keepExisting ? searchState.logs : []
    const initialFound = keepExisting ? searchState.foundAdventurers : []

    // Сбрасываем состояние
    setSearchState({
      isSearching: true,
      startTime: Date.now(),
      duration: actualDuration,
      progress: 0,
      logs: initialLogs,
      foundAdventurers: initialFound,
      targetCount: TARGET_FOUND,
    })

    // Запускаем таймер
    const startTime = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(100, (elapsed / duration) * 100)

      // Обрабатываем события, время которых наступило
      const newLogs: SearchLogEntry[] = []
      const newFound: AdventurerExtended[] = []

      events.forEach(event => {
        if (event.time <= elapsed) {
          const logEntry: SearchLogEntry = {
            id: `log-${event.adventurer.id}`,
            timestamp: event.time,
            adventurerId: event.adventurer.id,
            adventurerName: `${event.adventurer.identity.firstName}${event.adventurer.identity.nickname ? ` "${event.adventurer.identity.nickname}"` : ''}`,
            type: event.accepted ? 'accepted' : 'declined',
            message: event.message,
            emoji: event.accepted ? '✅' : '❌',
          }
          newLogs.push(logEntry)

          if (event.accepted) {
            newFound.push(event.adventurer)
          }
        }
      })

      setSearchState(prev => {
        const existingIds = new Set(prev.logs.map(l => l.adventurerId))
        const actuallyNewLogs = newLogs.filter(l => !existingIds.has(l.adventurerId))
        const actuallyNewFound = newFound.filter(a => !prev.foundAdventurers.some(f => f.id === a.id))

        return {
          ...prev,
          progress,
          logs: [...prev.logs, ...actuallyNewLogs],
          foundAdventurers: [...prev.foundAdventurers, ...actuallyNewFound].slice(0, 3),
        }
      })

      if (progress >= 100) {
        stopSearch()
      }
    }, 500)
  }, [expedition, guildLevel, stopSearch])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Очистка всех найденных (сброс)
  const resetSearch = useCallback(() => {
    setExistingAdventurerIds(new Set())
    setSearchState({
      isSearching: false,
      startTime: 0,
      duration: 0,
      progress: 0,
      logs: [],
      foundAdventurers: [],
      targetCount: 3,
    })
  }, [])

  return {
    searchState,
    startSearch,
    stopSearch,
    skipSearch,
    resetSearch,
  }
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

export const RecruitmentInterface: React.FC<RecruitmentInterfaceProps> = ({
  expedition,
  weapon,
  guildLevel,
  onSelect,
  onCancel,
}) => {
  // Состояние поиска
  const { searchState, startSearch, stopSearch, skipSearch, resetSearch } = useSearchSimulation(
    expedition,
    guildLevel,
    weapon.attack
  )

  // Выбранный искатель для просмотра деталей
  const [selectedAdventurer, setSelectedAdventurer] = useState<AdventurerExtended | null>(null)
  const [confirmedAdventurer, setConfirmedAdventurer] = useState<AdventurerExtended | null>(null)

  // Экспедиция для карточек
  const expeditionData = useMemo(() => ({
    difficulty: expedition.difficulty,
    baseGold: expedition.baseGold,
    baseWarSoul: expedition.baseWarSoul,
    duration: expedition.duration,
    successChance: expedition.successChance,
    weaponWear: expedition.weaponWear,
    weaponLossChance: expedition.weaponLossChance,
  }), [expedition])

  // Выбор искателя
  const handleSelect = useCallback((adventurer: AdventurerExtended) => {
    setConfirmedAdventurer(adventurer)
    onSelect(adventurer)
  }, [onSelect])

  // Если поиск не начат
  if (!searchState.isSearching && searchState.logs.length === 0) {
    return (
      <Card className="bg-stone-900/50 border-stone-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Подбор искателей
          </CardTitle>
          <div className="text-sm text-stone-400 space-y-1">
            <p>Миссия: <span className="text-stone-200">{expedition.name}</span></p>
            <p>Оружие: <span className="text-stone-200">{weapon.name} (⚔{weapon.attack})</span></p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Информация */}
          <div className="p-3 rounded-lg bg-stone-800/50 border border-stone-700">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div className="text-sm text-stone-400">
                <p className="text-stone-300 font-medium mb-1">Как работает поиск:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Искатели подходят к доске объявлений</li>
                  <li>• Каждый решает, подходит ли ему миссия</li>
                  <li>• Выберите одного из согласившихся</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2">
            <Button
              onClick={startSearch}
              className="flex-1"
            >
              <Search className="w-4 h-4 mr-2" />
              Начать поиск
            </Button>
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Отмена
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Если поиск идёт или завершён
  return (
    <div className="space-y-4">
      {/* Лог поиска */}
      <SearchLog
        searchState={searchState}
        expeditionName={expedition.name}
        onStop={stopSearch}
        onSkip={skipSearch}
      />

      {/* Найденные искатели */}
      {searchState.foundAdventurers.length > 0 && (
        <Card className="bg-stone-900/50 border-stone-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Согласившиеся искатели
            </CardTitle>
            <p className="text-sm text-stone-400">
              Выберите одного для отправки на миссию
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {searchState.foundAdventurers.map((adventurer, index) => (
                  <AdventurerCardV2
                    key={adventurer.id}
                    adventurer={adventurer}
                    expedition={expedition}
                    guildLevel={guildLevel}
                    weaponAttack={weapon.attack}
                    selected={confirmedAdventurer?.id === adventurer.id}
                    onSelect={() => handleSelect(adventurer)}
                    onDetails={() => setSelectedAdventurer(adventurer)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопки управления поиском */}
      {!searchState.isSearching && searchState.foundAdventurers.length > 0 && (
        <Card className="bg-stone-900/50 border-stone-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <div className="text-sm text-stone-400">
                <span className="text-stone-200 font-medium">{searchState.foundAdventurers.length}</span> искателей найдено
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => startSearch(true)}
                        variant="outline"
                        size="sm"
                        className="text-blue-400 border-blue-600 hover:bg-blue-900/30"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        Искать ещё
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Найти дополнительных искателей, не удаляя уже найденных</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={resetSearch}
                        variant="outline"
                        size="sm"
                        className="text-red-400 border-red-600 hover:bg-red-900/30"
                      >
                        Сбросить всех
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Очистить список и начать поиск заново</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Если никто не согласился */}
      {!searchState.isSearching && searchState.foundAdventurers.length === 0 && (
        <Card className="bg-red-900/20 border-red-600/30">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-3" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Никто не согласился
            </h3>
            <p className="text-sm text-stone-400 mb-4">
              Возможно, награда недостаточна или миссия слишком сложная для доступных искателей.
            </p>
            <Button onClick={() => startSearch(false)} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Попробовать ещё раз
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно деталей */}
      <Dialog open={!!selectedAdventurer} onOpenChange={() => setSelectedAdventurer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-900 border-stone-700">
          <DialogHeader>
            <DialogTitle>Детали искателя</DialogTitle>
          </DialogHeader>
          {selectedAdventurer && (
            <AdventurerFullCard
              adventurer={selectedAdventurer}
              expedition={expeditionData}
              selected={confirmedAdventurer?.id === selectedAdventurer.id}
              onSelect={() => {
                handleSelect(selectedAdventurer)
                setSelectedAdventurer(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RecruitmentInterface

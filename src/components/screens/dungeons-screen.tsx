/**
 * Dungeons Screen
 * Главный экран вылазок (контейнер)
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Map, Droplet, Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { 
  adventures, 
  getAdventure, 
  getDifficultyInfo,
  type Adventure
} from '@/data/adventures'
import {
  adventureEvents,
  selectRandomEvent,
  type AdventureEvent,
  type EventChoice
} from '@/data/adventure-events'
import { useGameStore } from '@/store'
import { 
  TooltipProvider,
  InfoTooltip
} from '@/components/ui/game-tooltip'
import { cn } from '@/lib/utils'

// Импорт вынесенных компонентов
import {
  ActiveAdventureCard,
  AdventureCard,
  EventModal,
  WeaponSelectModal,
  WeaponsHistorySection,
  type ActiveAdventure
} from '@/components/dungeons'

export function DungeonsScreen() {
  const player = useGameStore((state) => state.player)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const resources = useGameStore((state) => state.resources)
  const addResource = useGameStore((state) => state.addResource)
  const addFame = useGameStore((state) => state.addFame)
  const addWarSoulToWeapon = useGameStore((state) => state.addWarSoulToWeapon)
  
  // Локальное состояние
  const [activeAdventure, setActiveAdventure] = useState<ActiveAdventure | null>(null)
  const [currentEvent, setCurrentEvent] = useState<AdventureEvent | null>(null)
  const [eventLog, setEventLog] = useState<string[]>([])
  const [selectingWeaponFor, setSelectingWeaponFor] = useState<Adventure | null>(null)
  
  // Завершение приключения - объявляем до useEffect через useCallback
  const completeAdventure = useCallback(() => {
    if (!activeAdventure) return
    
    const adventure = getAdventure(activeAdventure.adventureId)
    const weapon = weaponInventory.weapons.find(w => w.id === activeAdventure.weaponId)
    
    if (!adventure || !weapon) return
    
    // Выдаём награды - ТОЛЬКО золото (аренда оружия)
    const reward = adventure.baseReward
    addResource('gold', reward.gold)
    if (reward.fame) addFame(reward.fame)
    
    // Бонусные предметы
    if (reward.bonusItems) {
      reward.bonusItems.forEach(item => {
        if (Math.random() < item.chance) {
          addResource(item.resource as any, item.amount)
        }
      })
    }
    
    // Рассчитываем очки души для оружия
    const warSoulMin = reward.warSoulForWeapon?.min ?? 1
    const warSoulMax = reward.warSoulForWeapon?.max ?? warSoulMin
    const baseWarSoul = Math.floor(Math.random() * (warSoulMax - warSoulMin + 1)) + warSoulMin
    
    // Бонус за успешные события
    const successCount = eventLog.filter(e => e.includes('Победа') || e.includes('Успех') || e.includes('✅')).length
    const warSoulGained = Math.max(1, Math.floor(baseWarSoul + (successCount * 2)))
    
    // Износ оружия
    const durabilityLoss = Math.floor(adventure.duration / 60 * 3) + Math.floor(Math.random() * 5)
    
    // Множитель эпичности растёт с каждым приключением
    const epicGain = 0.05 + (successCount * 0.02) + (Math.random() * 0.03)
    
    // Добавляем очки души оружию
    addWarSoulToWeapon(activeAdventure.weaponId, warSoulGained, durabilityLoss, epicGain)
    
    // Очищаем состояние
    setActiveAdventure(null)
    setEventLog([])
  }, [activeAdventure, weaponInventory.weapons, addResource, addFame, eventLog, addWarSoulToWeapon])
  
  // Прогресс приключения
  useEffect(() => {
    if (!activeAdventure) return
    
    const interval = setInterval(() => {
      const now = Date.now()
      const progress = Math.min(100, ((now - activeAdventure.startTime) / (activeAdventure.endTime - activeAdventure.startTime)) * 100)
      
      const adventure = getAdventure(activeAdventure.adventureId)
      if (!adventure) return
      
      const progressPerEvent = 100 / (adventure.maxEvents + 1)
      const expectedEvents = Math.floor(progress / progressPerEvent)
      
      if (expectedEvents > activeAdventure.eventsCompleted && !currentEvent) {
        const weapon = weaponInventory.weapons.find(w => w.id === activeAdventure.weaponId)
        const event = selectRandomEvent(
          adventure.tags,
          adventure.difficulty,
          weapon?.warSoul ?? 0
        )
        
        if (event && Math.random() < adventure.eventChance) {
          setCurrentEvent(event)
          setActiveAdventure(prev => prev ? {
            ...prev,
            eventsCompleted: expectedEvents
          } : null)
        } else {
          setActiveAdventure(prev => prev ? {
            ...prev,
            progress,
            eventsCompleted: expectedEvents
          } : null)
        }
      } else {
        setActiveAdventure(prev => prev ? { ...prev, progress } : null)
      }
      
      if (progress >= 100) {
        completeAdventure()
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [activeAdventure, currentEvent, weaponInventory.weapons, completeAdventure])
  
  // Обработка выбора в событии
  const handleEventChoice = (choice: EventChoice) => {
    const success = Math.random() < choice.successChance
    
    // Применяем награды или штрафы
    if (success && choice.reward) {
      if (choice.reward.gold) addResource('gold', choice.reward.gold)
      if (choice.reward.fame) addFame(choice.reward.fame)
      // soulEssence НЕ добавляется - только через распыление
    }
    
    if (!success && choice.penalty) {
      if (choice.penalty.gold) addResource('gold', -choice.penalty.gold)
      if (choice.penalty.stamina) {
        setActiveAdventure(prev => prev ? {
          ...prev,
          progress: Math.max(0, prev.progress - (choice.penalty?.stamina || 0))
        } : null)
      }
    }
    
    // Добавляем в лог
    const resultText = success ? 
      `✅ ${choice.description}` : 
      `❌ ${choice.penalty ? 'Неудача! ' + choice.description : 'Неудача...'}`
    setEventLog(prev => [...prev, resultText])
    
    setCurrentEvent(null)
  }
  
  // Начало приключения
  const startAdventure = (adventure: Adventure, weaponId: string) => {
    const now = Date.now()
    setActiveAdventure({
      adventureId: adventure.id,
      weaponId,
      startTime: now,
      endTime: now + adventure.duration * 1000,
      progress: 0,
      currentEvents: [],
      eventsCompleted: 0
    })
    setEventLog([])
    setSelectingWeaponFor(null)
  }
  
  // Доступные приключения
  const availableAdventures = useMemo(() => {
    const safeLevel = player.level ?? 1
    const safeFame = player.fame ?? 0
    return adventures.filter(a => 
      a.requiredLevel <= safeLevel && 
      a.requiredFame <= safeFame
    )
  }, [player.level, player.fame])
  
  // Группировка по сложности
  const groupedAdventures = useMemo(() => {
    return {
      easy: availableAdventures.filter(a => a.difficulty === 'easy'),
      normal: availableAdventures.filter(a => a.difficulty === 'normal'),
      hard: availableAdventures.filter(a => a.difficulty === 'hard'),
      extreme: availableAdventures.filter(a => a.difficulty === 'extreme'),
      legendary: availableAdventures.filter(a => a.difficulty === 'legendary'),
    }
  }, [availableAdventures])
  
  return (
    <TooltipProvider>
      <div className="p-4 md:p-6 space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
              <Map className="w-6 h-6 text-amber-500" />
              Вылазки
            </h2>
            <InfoTooltip
              title="Приключения"
              content="Отправляйте оружие в приключения. Оружие зарабатывает очки Души Войны, которые увеличивают количество эссенции при распылении в Алтаре."
              icon="help"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-900/30 border border-purple-600/30">
              <Droplet className="w-5 h-5 text-purple-400" />
              <span className="text-lg font-bold text-purple-400">{Math.floor(resources.soulEssence)}</span>
            </div>
          </div>
        </div>
        
        {/* Активное приключение */}
        {activeAdventure && (
          <ActiveAdventureCard 
            activeAdventure={activeAdventure}
            eventLog={eventLog}
          />
        )}
        
        {/* Вылазки по сложности */}
        {(['easy', 'normal', 'hard', 'extreme', 'legendary'] as const).map((difficulty) => {
          const adventuresInGroup = groupedAdventures[difficulty]
          if (adventuresInGroup.length === 0) return null
          
          const diffInfo = getDifficultyInfo(difficulty)
          
          return (
            <div key={difficulty}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className={cn('font-semibold flex items-center gap-2', diffInfo.color)}>
                  {diffInfo.name}
                  <span className="text-sm font-normal text-stone-500">
                    ({adventuresInGroup.length})
                  </span>
                </h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {adventuresInGroup.map((adventure) => (
                  <AdventureCard
                    key={adventure.id}
                    adventure={adventure}
                    isAvailable={
                      player.level >= adventure.requiredLevel && 
                      player.fame >= adventure.requiredFame
                    }
                    isActive={activeAdventure?.adventureId === adventure.id}
                    onSelect={() => setSelectingWeaponFor(adventure)}
                  />
                ))}
              </div>
            </div>
          )
        })}
        
        {/* Оружие с историей */}
        <WeaponsHistorySection />
        
        {/* Подсказки */}
        <Card className="card-medieval bg-stone-800/30">
          <CardContent className="p-4">
            <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Система вылазок
            </h4>
            <ul className="text-xs text-stone-500 space-y-1">
              <li>• <strong className="text-amber-400">Золото</strong> — оплата за аренду вашего оружия искателем</li>
              <li>• <strong className="text-purple-400">Душа Войны</strong> — накапливается на оружии в приключениях</li>
              <li>• <strong className="text-amber-300">Множитель эпичности</strong> — растёт с каждым приключением, увеличивает эссенцию</li>
              <li>• <strong className="text-green-400">Прочность</strong> — оружие изнашивается, отремонтируйте в кузнице</li>
              <li>• <strong className="text-red-400">Поломка</strong> — сломанное оружие нельзя отправить в вылазку</li>
              <li>• <strong className="text-blue-400">Распыление</strong> — в Алтаре превращайте оружие в эссенцию душ</li>
            </ul>
          </CardContent>
        </Card>
        
        {/* Модальное окно выбора оружия */}
        <AnimatePresence>
          {selectingWeaponFor && (
            <WeaponSelectModal
              adventure={selectingWeaponFor}
              onSelect={(weaponId) => startAdventure(selectingWeaponFor, weaponId)}
              onClose={() => setSelectingWeaponFor(null)}
            />
          )}
        </AnimatePresence>
        
        {/* Модальное окно события */}
        <AnimatePresence>
          {currentEvent && activeAdventure && (
            <EventModal
              event={currentEvent}
              weapon={weaponInventory.weapons.find(w => w.id === activeAdventure.weaponId)}
              onChoice={handleEventChoice}
              onClose={() => setCurrentEvent(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, SkipForward, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/store'
import { tutorialSteps, type TutorialStep } from '@/data/tutorial'
import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

// Компонент подсветки элемента
function HighlightOverlay({ target, isActive }: { target?: string; isActive: boolean }) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const updateRef = useRef<number>()
  
  useEffect(() => {
    if (!target || !isActive) {
      setRect(null)
      return
    }
    
    const updateRect = () => {
      const element = document.querySelector(target)
      if (element) {
        setRect(element.getBoundingClientRect())
      }
    }
    
    updateRect()
    
    // Обновляем позицию при скролле/ресайзе
    const handleUpdate = () => {
      cancelAnimationFrame(updateRef.current!)
      updateRef.current = requestAnimationFrame(updateRect)
    }
    
    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)
    
    // Периодически обновляем для анимаций
    const interval = setInterval(updateRect, 100)
    
    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
      clearInterval(interval)
      cancelAnimationFrame(updateRef.current!)
    }
  }, [target, isActive])
  
  if (!rect || !isActive) return null
  
  const padding = 8
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed pointer-events-none z-[60]"
      style={{
        left: rect.left - padding,
        top: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      }}
    >
      {/* Подсветка */}
      <div className="absolute inset-0 rounded-lg ring-4 ring-amber-400 ring-opacity-75 animate-pulse-gold" />
      {/* Затемнение вокруг */}
      <div className="absolute inset-0 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
    </motion.div>
  )
}

// Компонент карточки подсказки
function TutorialTooltip({ 
  step, 
  position,
  onPrev,
  onNext,
  onSkip,
  isFirst,
  isLast,
  stepNumber,
  totalSteps
}: { 
  step: TutorialStep
  position: string
  onPrev: () => void
  onNext: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
  stepNumber: number
  totalSteps: number
}) {
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const tooltipRef = useRef<HTMLDivElement>(null)
  
  // Позиционирование относительно target
  useEffect(() => {
    const updatePosition = () => {
      // На мобильных всегда показываем внизу экрана
      if (typeof window !== 'undefined' && window.innerWidth < 768) {
        setTooltipPosition({
          top: window.innerHeight - 16, // Будет transform: translate(-100%, -100%)
          left: window.innerWidth / 2,
        })
        return
      }
      
      if (!step.target || position === 'center') {
        // Центр экрана
        setTooltipPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        })
        return
      }
      
      const element = document.querySelector(step.target)
      if (!element) {
        setTooltipPosition({
          top: window.innerHeight / 2,
          left: window.innerWidth / 2,
        })
        return
      }
      
      const rect = element.getBoundingClientRect()
      const tooltipWidth = 400
      const tooltipHeight = 200
      const gap = 16
      
      let top = 0
      let left = 0
      
      switch (position) {
        case 'top':
          top = rect.top - tooltipHeight - gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'bottom':
          top = rect.bottom + gap
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case 'left':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - gap
          break
        case 'right':
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + gap
          break
        default:
          top = window.innerHeight / 2
          left = window.innerWidth / 2
      }
      
      // Корректировка чтобы не выходило за экран
      top = Math.max(16, Math.min(window.innerHeight - tooltipHeight - 16, top))
      left = Math.max(16, Math.min(window.innerWidth - tooltipWidth - 16, left))
      
      setTooltipPosition({ top, left })
    }
    
    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [step.target, position])
  
  // На мобильных показываем снизу
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  
  return (
    <motion.div
      ref={tooltipRef}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "fixed z-[70]",
        isMobile 
          ? "bottom-4 left-4 right-4 w-auto" 
          : "w-[350px] md:w-[400px]"
      )}
      style={isMobile ? {
        // На мобильных позиционируем снизу
      } : {
        top: position === 'center' ? '50%' : tooltipPosition.top,
        left: position === 'center' ? '50%' : tooltipPosition.left,
        transform: position === 'center' ? 'translate(-50%, -50%)' : 'none',
      }}
    >
      <Card className="card-medieval border-amber-500/50 bg-gradient-to-br from-stone-900 to-stone-950 shadow-xl shadow-amber-900/20 max-h-[80vh] overflow-y-auto">
        <CardContent className="p-0">
          {/* Заголовок */}
          <div className="flex items-center justify-between p-3 md:p-4 border-b border-stone-700/50 sticky top-0 bg-gradient-to-br from-stone-900 to-stone-950 z-10">
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              {step.icon && (
                <span className="text-xl md:text-2xl shrink-0">{step.icon}</span>
              )}
              <h3 className="text-base md:text-lg font-bold text-amber-200 truncate">{step.title}</h3>
            </div>
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <span className="text-xs text-stone-500 hidden sm:block">
                {stepNumber}/{totalSteps}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-stone-400 hover:text-red-400 hover:bg-red-900/20"
                onClick={onSkip}
                title="Закрыть обучение"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Содержимое */}
          <div className="p-3 md:p-4">
            <p className="text-sm md:text-base text-stone-300 leading-relaxed">{step.description}</p>
          </div>
          
          {/* Навигация */}
          <div className="flex items-center justify-between p-3 md:p-4 border-t border-stone-700/50 bg-stone-800/30 rounded-b-xl sticky bottom-0">
            <Button
              size="sm"
              variant="ghost"
              className="text-stone-400 hover:text-stone-200"
              disabled={isFirst}
              onClick={onPrev}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Назад</span>
            </Button>
            
            {/* Индикатор шагов для мобильных */}
            <div className="flex items-center gap-1 sm:hidden">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    i === stepNumber - 1 ? "bg-amber-400" : "bg-stone-600"
                  )}
                />
              ))}
            </div>
            
            {isLast ? (
              <Button
                size="sm"
                className="bg-gradient-to-r from-green-800 to-green-900 hover:from-green-700 hover:to-green-800 text-green-100"
                onClick={onNext}
              >
                <span className="hidden sm:inline">Завершить</span>
                <span className="sm:hidden">Готово</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100"
                onClick={onNext}
              >
                <span className="hidden sm:inline">Далее</span>
                <span className="sm:hidden">Далее</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Главный компонент туториала
export function TutorialOverlay() {
  const tutorial = useGameStore((state) => state.tutorial)
  const currentScreen = useGameStore((state) => state.currentScreen)
  const setCurrentScreen = useGameStore((state) => state.setCurrentScreen)
  const nextTutorialStep = useGameStore((state) => state.nextTutorialStep)
  const skipTutorial = useGameStore((state) => state.skipTutorial)
  
  const [isVisible, setIsVisible] = useState(false)
  
  // Текущий шаг
  const currentStepData = tutorialSteps[tutorial.currentStep]
  
  // Показывать ли туториал
  useEffect(() => {
    if (!tutorial.isActive || tutorial.skipped) {
      setIsVisible(false)
      return
    }
    
    // Показываем только если шаг относится к текущему экрану
    if (currentStepData && currentStepData.screen === currentScreen) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [tutorial.isActive, tutorial.skipped, tutorial.currentStep, currentScreen, currentStepData])
  
  // Обработчики
  const handleNext = () => {
    if (tutorial.currentStep >= tutorialSteps.length - 1) {
      // Туториал завершён
      skipTutorial()
    } else {
      const nextStep = tutorialSteps[tutorial.currentStep + 1]
      // Если следующий шаг на другом экране, переключаемся
      if (nextStep && nextStep.screen !== currentScreen) {
        setCurrentScreen(nextStep.screen as any)
      }
      nextTutorialStep()
    }
  }
  
  const handlePrev = () => {
    if (tutorial.currentStep > 0) {
      nextTutorialStep() // Используем для уменьшения, нужно будет добавить функцию
    }
  }
  
  const handleSkip = () => {
    skipTutorial()
  }
  
  if (!isVisible || !currentStepData) return null
  
  return (
    <AnimatePresence>
      {/* Подсветка целевого элемента */}
      <HighlightOverlay 
        key="highlight-overlay"
        target={currentStepData.target} 
        isActive={isVisible} 
      />
      
      {/* Карточка подсказки */}
      <TutorialTooltip
        key="tutorial-tooltip"
        step={currentStepData}
        position={currentStepData.position || 'center'}
        onPrev={handlePrev}
        onNext={handleNext}
        onSkip={handleSkip}
        isFirst={tutorial.currentStep === 0}
        isLast={tutorial.currentStep >= tutorialSteps.length - 1}
        stepNumber={tutorial.currentStep + 1}
        totalSteps={tutorialSteps.length}
      />
    </AnimatePresence>
  )
}

// Кнопка помощи для повторного запуска туториала
export function TutorialHelpButton() {
  const tutorial = useGameStore((state) => state.tutorial)
  const skipTutorial = useGameStore((state) => state.skipTutorial)
  
  const handleRestartTutorial = () => {
    // Сбрасываем туториал для повторного прохождения
    // Для этого нужно очистить localStorage и перезагрузить
    localStorage.removeItem('swordcraft-game-storage')
    window.location.reload()
  }
  
  if (!tutorial.skipped) return null
  
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-stone-500 hover:text-stone-300"
      onClick={handleRestartTutorial}
      title="Перезапустить обучение"
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  )
}

/**
 * Event Modal
 * Модальное окно события в приключении
 */

'use client'

import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getEventTypeInfo } from '@/data/adventure-events'
import type { AdventureEvent, EventChoice } from '@/data/adventure-events'
import type { CraftedWeapon } from '@/data/weapon-recipes'

interface EventModalProps {
  event: AdventureEvent
  weapon: CraftedWeapon | undefined
  onChoice: (choice: EventChoice) => void
  onClose: () => void
}

export function EventModal({
  event,
  weapon,
  onChoice,
  onClose
}: EventModalProps) {
  const eventInfo = getEventTypeInfo(event.type)
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-stone-900 border border-stone-700 rounded-xl max-w-lg w-full overflow-hidden"
      >
        {/* Заголовок */}
        <div className={cn(
          'p-4 border-b border-stone-700',
          event.type === 'combat' && 'bg-red-900/20',
          event.type === 'treasure' && 'bg-amber-900/20',
          event.type === 'encounter' && 'bg-blue-900/20',
          event.type === 'trap' && 'bg-orange-900/20'
        )}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{event.icon}</span>
            <div>
              <Badge className={cn('mb-1', eventInfo.color)}>
                {eventInfo.name}
              </Badge>
              <h3 className="text-lg font-bold text-stone-100">{event.title}</h3>
            </div>
          </div>
        </div>
        
        {/* Содержимое */}
        <div className="p-4">
          <p className="text-stone-300 mb-4">{event.description}</p>
          
          {event.isEpic && (
            <div className="flex items-center gap-2 text-purple-400 mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Легендарное событие!</span>
            </div>
          )}
          
          {/* Варианты выбора */}
          {event.choices && event.choices.length > 0 ? (
            <div className="space-y-2">
              {event.choices.map((choice) => {
                const weaponWarSoul = weapon?.warSoul ?? 0
                const canChoose = !choice.requiredWeaponLevel || weaponWarSoul >= choice.requiredWeaponLevel
                const isLocked = !canChoose
                
                return (
                  <button
                    key={choice.id}
                    type="button"
                    disabled={isLocked}
                    className={cn(
                      'w-full p-3 rounded-lg border text-left transition-all',
                      isLocked 
                        ? 'opacity-50 cursor-not-allowed border-stone-700 bg-stone-800/30'
                        : 'border-stone-600 bg-stone-800/50 hover:border-amber-500/50 cursor-pointer'
                    )}
                    onClick={() => canChoose && onChoice(choice)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-stone-200">{choice.text}</span>
                      {isLocked && (
                        <Badge variant="outline" className="text-xs text-stone-500">
                          Нужно {choice.requiredWeaponLevel}+ Души Войны
                        </Badge>
                      )}
                      {!isLocked && (
                        <span className="text-xs text-green-400">
                          {Math.round(choice.successChance * 100)}% успех
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => {
                // Автоматический исход
                const success = Math.random() < 0.6
                onChoice({
                  id: 'auto',
                  text: 'Продолжить',
                  outcome: success ? 'victory' : 'defeat',
                  successChance: 0.6,
                  description: success ? event.victoryText || 'Успех!' : event.defeatText || 'Неудача...'
                })
              }}
            >
              Продолжить
            </Button>
          )}
        </div>
        
        <div className="p-4 border-t border-stone-700 bg-stone-800/30">
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Пропустить событие
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

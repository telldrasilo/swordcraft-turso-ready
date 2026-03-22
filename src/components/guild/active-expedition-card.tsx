/**
 * Active Expedition Card Component
 * Карточка активной экспедиции
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sword, 
  Clock, 
  CheckCircle, 
  Undo2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import type { ActiveExpedition } from '@/types/guild'
import { ExpeditionResult } from '@/store/slices/guild-slice'
import { useState, useEffect } from 'react'

interface ActiveExpeditionCardProps {
  expedition: ActiveExpedition
}

export function ActiveExpeditionCard({ expedition }: ActiveExpeditionCardProps) {
  const completeExpedition = useGameStore((state) => state.completeExpedition)
  const cancelExpedition = useGameStore((state) => state.cancelExpedition)
  
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [showRewards, setShowRewards] = useState(false)
  const [lastResult, setLastResult] = useState<ExpeditionResult | null>(null)
  
  useEffect(() => {
    const totalDuration = expedition.endsAt - expedition.startedAt
    
    const updateTime = () => {
      const now = Date.now()
      const remaining = Math.max(0, expedition.endsAt - now)
      const elapsed = now - expedition.startedAt
      
      setTimeLeft(remaining)
      setProgress(Math.min(100, Math.max(0, (elapsed / totalDuration) * 100)))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [expedition.endsAt, expedition.startedAt])
  
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const isComplete = timeLeft === 0 || Date.now() >= expedition.endsAt
  
  const handleComplete = () => {
    const result = completeExpedition(expedition.id)
    if (result) {
      setLastResult(result)
      setShowRewards(true)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className={cn(
        'card-medieval',
        isComplete ? 'border-green-600/50 bg-green-900/20' : 'border-amber-600/30'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center text-xl">
                {expedition.expeditionIcon}
              </div>
              <div>
                <h4 className="font-semibold text-stone-200">{expedition.expeditionName}</h4>
                <p className="text-xs text-stone-500">{expedition.adventurerName}</p>
              </div>
            </div>
            {isComplete ? (
              <Badge className="bg-green-800 text-green-100 animate-pulse">
                Завершена!
              </Badge>
            ) : (
              <div className="flex items-center gap-1 text-amber-400">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>
          
          <div className="text-sm text-stone-400 mb-2">
            <Sword className="w-4 h-4 inline mr-1" />
            {expedition.weaponName}
          </div>
          
          {!isComplete ? (
            <>
              <Progress value={progress} className="h-2 bg-stone-800" />
              <Button
                size="sm"
                variant="ghost"
                className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={() => cancelExpedition(expedition.id)}
              >
                <Undo2 className="w-4 h-4 mr-1" />
                Отменить (возврат 50% депозита)
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="w-full bg-green-800 hover:bg-green-700 text-green-100"
                onClick={handleComplete}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Получить награду
              </Button>
              
              {/* Модальное окно с наградами */}
              <AnimatePresence>
                {showRewards && lastResult && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                    onClick={() => setShowRewards(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className="bg-stone-900 border border-stone-700 rounded-xl p-6 max-w-sm w-full shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-center mb-4">
                        {lastResult.success ? (
                          <>
                            <div className="text-4xl mb-2">🎉</div>
                            <h3 className="text-xl font-bold text-green-400">Экспедиция успешна!</h3>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl mb-2">💀</div>
                            <h3 className="text-xl font-bold text-red-400">Экспедиция провалена</h3>
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                          <span className="text-stone-400">Золото</span>
                          <span className="text-lg font-bold text-amber-400">
                            💰 +{lastResult.commission}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                          <span className="text-stone-400">Душа Войны</span>
                          <span className="text-lg font-bold text-purple-400">
                            ⚔️ +{lastResult.warSoul}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                          <span className="text-stone-400">Слава гильдии</span>
                          <span className="text-lg font-bold text-blue-400">
                            ⭐ +{lastResult.glory}
                          </span>
                        </div>
                        
                        {!lastResult.weaponLost && (
                          <div className="flex items-center justify-between bg-stone-800/50 rounded-lg p-3">
                            <span className="text-stone-400">Износ оружия</span>
                            <span className="text-lg font-bold text-yellow-400">
                              🔧 -{lastResult.weaponWear}%
                            </span>
                          </div>
                        )}
                        
                        {lastResult.weaponLost && (
                          <div className="flex items-center justify-between bg-red-900/30 rounded-lg p-3 border border-red-600/50">
                            <span className="text-red-400">Оружие потеряно!</span>
                            <span className="text-2xl">💔</span>
                          </div>
                        )}
                      </div>
                      
                      <Button
                        className="w-full bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-600 hover:to-amber-700"
                        onClick={() => setShowRewards(false)}
                      >
                        Продолжить
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

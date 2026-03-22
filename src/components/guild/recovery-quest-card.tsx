/**
 * Recovery Quest Card Component
 * Карточка квеста восстановления потерянного оружия
 */

'use client'

import { motion } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  Coins,
  Skull,
  XCircle
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import type { RecoveryQuest } from '@/types/guild'
import { useState, useEffect } from 'react'

interface RecoveryQuestCardProps {
  quest: RecoveryQuest
}

export function RecoveryQuestCard({ quest }: RecoveryQuestCardProps) {
  const startRecoveryQuest = useGameStore((state) => state.startRecoveryQuest)
  const completeRecoveryQuest = useGameStore((state) => state.completeRecoveryQuest)
  const declineRecoveryQuest = useGameStore((state) => state.declineRecoveryQuest)
  const gold = useGameStore((state) => state.resources.gold)
  
  const [timeLeft, setTimeLeft] = useState<number>(0)
  
  useEffect(() => {
    if (quest.status !== 'active' || !quest.endsAt) return
    
    const updateTime = () => {
      const remaining = Math.max(0, quest.endsAt! - Date.now())
      setTimeLeft(remaining)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [quest.status, quest.endsAt])
  
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const isComplete = quest.status === 'active' && timeLeft === 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={cn(
        'card-medieval border-red-600/30',
        quest.status === 'completed' && 'opacity-50',
        quest.status === 'declined' && 'opacity-30'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-900/30 flex items-center justify-center">
              <Skull className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-semibold text-stone-200">Потеряно: {quest.lostWeaponData.name}</h4>
              <p className="text-xs text-stone-500">Экспедиция: {quest.originalExpeditionName}</p>
            </div>
          </div>
          
          {quest.status === 'available' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Стоимость поиска:</span>
                <span className={cn(
                  'flex items-center gap-1',
                  gold >= quest.cost ? 'text-amber-400' : 'text-red-400'
                )}>
                  <Coins className="w-4 h-4" />
                  {quest.cost}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-amber-800 hover:bg-amber-700"
                  disabled={gold < quest.cost}
                  onClick={() => startRecoveryQuest(quest.id)}
                >
                  🔍 Искать
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-stone-500"
                  onClick={() => declineRecoveryQuest(quest.id)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {quest.status === 'active' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 text-sm">Поиск:</span>
                <span className="text-amber-400 font-mono">{formatTime(timeLeft)}</span>
              </div>
              <Progress 
                value={((quest.endsAt! - timeLeft) / (quest.duration * 1000)) * 100} 
                className="h-2 bg-stone-800" 
              />
              {isComplete && (
                <Button
                  size="sm"
                  className="w-full bg-green-800 hover:bg-green-700"
                  onClick={() => completeRecoveryQuest(quest.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Забрать оружие
                </Button>
              )}
            </div>
          )}
          
          {quest.status === 'completed' && (
            <Badge className="bg-green-800 text-green-100">
              <CheckCircle className="w-3 h-3 mr-1" />
              Восстановлено
            </Badge>
          )}
          
          {quest.status === 'declined' && (
            <Badge className="bg-stone-700 text-stone-400">
              <XCircle className="w-3 h-3 mr-1" />
              Отказано
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

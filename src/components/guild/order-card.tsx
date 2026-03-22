/**
 * Order Card Component
 * Карточка заказа NPC
 */

'use client'

import { motion } from 'framer-motion'
import { 
  Sword, 
  Clock, 
  Coins, 
  CheckCircle, 
  AlertTriangle, 
  Package,
  ArrowRight,
  Star
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import type { NPCOrder } from '@/data/market-data'
import { useState, useEffect } from 'react'

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

interface OrderCardProps {
  order: NPCOrder
  onSelect: () => void
  isActive: boolean
  canAccept: boolean
}

export function OrderCard({ order, onSelect, isActive, canAccept }: OrderCardProps) {
  const player = useGameStore((state) => state.player)
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const activeOrderId = useGameStore((state) => state.activeOrderId)
  
  const weaponTypeName = weaponTypeNames[order.weaponType] || order.weaponType
  const materialName = order.material ? materialNames[order.material] : ''
  const requiredWeapon = `${materialName} ${weaponTypeName}`.trim()
  
  const suitableWeapons = weaponInventory.weapons.filter(w => {
    if (w.type !== order.weaponType) return false
    if (w.quality < order.minQuality) return false
    if (order.minAttack && w.attack < order.minAttack) return false
    if (order.material && w.recipeId && !w.recipeId.includes(order.material)) return false
    return true
  })
  
  const [timeLeft, setTimeLeft] = useState<number>(0)
  
  useEffect(() => {
    if (order.status !== 'in_progress' || !order.acceptedAt) return
    
    const updateTime = () => {
      const deadline = order.acceptedAt! + order.deadline * 1000
      const remaining = Math.max(0, deadline - Date.now())
      setTimeLeft(remaining)
    }
    
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [order.status, order.acceptedAt, order.deadline])
  
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const isExpired = order.status === 'in_progress' && timeLeft === 0
  const timeProgress = order.acceptedAt 
    ? ((order.deadline * 1000 - timeLeft) / (order.deadline * 1000)) * 100 
    : 0
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className={cn(
        'card-medieval transition-all',
        isActive && 'border-green-600/50 bg-green-900/20',
        isExpired && 'border-red-600/50 bg-red-900/20 opacity-60'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-900/30 flex items-center justify-center text-2xl">
                {order.clientIcon}
              </div>
              <div>
                <h4 className="font-semibold text-stone-200">{order.clientName}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-stone-800/50">
                    {order.clientTitle}
                  </Badge>
                </div>
              </div>
            </div>
            {order.status === 'completed' && (
              <Badge className="bg-green-800 text-green-100">
                <CheckCircle className="w-3 h-3 mr-1" />
                Выполнен
              </Badge>
            )}
            {order.status === 'expired' && (
              <Badge className="bg-red-800 text-red-100">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Просрочен
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-sm">
              <Sword className="w-4 h-4 text-amber-400" />
              <span className="text-stone-300">{requiredWeapon}</span>
              {order.minQuality > 0 && (
                <Badge variant="outline" className="text-xs text-amber-400 border-amber-600">
                  Качество {order.minQuality}+
                </Badge>
              )}
              {order.minAttack && (
                <Badge variant="outline" className="text-xs text-red-400 border-red-600">
                  Атака {order.minAttack}+
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-amber-400">
                <Coins className="w-4 h-4" />
                <span className="font-semibold">{order.goldReward}</span>
              </div>
              <div className="flex items-center gap-1 text-purple-400">
                <Star className="w-4 h-4" />
                <span>{order.fameReward} славы</span>
              </div>
            </div>
            
            {order.bonusItems && order.bonusItems.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <Package className="w-3 h-3 text-green-400" />
                <span className="text-green-400">
                  +{order.bonusItems.map(b => `${b.amount} ${b.resource}`).join(', ')}
                </span>
              </div>
            )}
          </div>
          
          {order.status === 'in_progress' && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={cn(
                  'flex items-center gap-1',
                  timeLeft < 60000 ? 'text-red-400' : 'text-stone-400'
                )}>
                  <Clock className="w-3 h-3" />
                  Осталось: {formatTime(timeLeft)}
                </span>
                <span className="text-stone-500">
                  {order.deadline / 60} мин всего
                </span>
              </div>
              <Progress 
                value={timeProgress} 
                className={cn(
                  'h-2 bg-stone-800',
                  timeLeft < 60000 && '[&>div]:bg-red-500'
                )}
              />
              
              {suitableWeapons.length > 0 && (
                <div className="mt-2 p-2 rounded bg-green-900/30 border border-green-600/30">
                  <p className="text-xs text-green-400 mb-1">
                    Найдено {suitableWeapons.length} подходящего оружия
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-green-800 hover:bg-green-700 text-green-100"
                    onClick={onSelect}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Выполнить заказ
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {order.status === 'available' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100"
                disabled={!canAccept || activeOrderId !== null}
                onClick={onSelect}
              >
                {activeOrderId ? 'Другой заказ активен' : 'Принять заказ'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

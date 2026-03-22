/**
 * Active Adventure Card
 * Секция активного приключения
 */

'use client'

import { Compass, Timer, Zap, Sword, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useGameStore } from '@/store'
import { getAdventure } from '@/data/adventures'
import type { ActiveAdventure } from './dungeons-utils'

interface ActiveAdventureCardProps {
  activeAdventure: ActiveAdventure
  eventLog: string[]
}

export function ActiveAdventureCard({ 
  activeAdventure, 
  eventLog 
}: ActiveAdventureCardProps) {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  
  const adventure = getAdventure(activeAdventure.adventureId)
  const weapon = weaponInventory.weapons.find(w => w.id === activeAdventure.weaponId)
  
  if (!adventure || !weapon) return null
  
  return (
    <Card className="card-medieval border-green-600/50 bg-green-900/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-green-400 flex items-center gap-2 text-base">
            <Compass className="w-5 h-5 animate-spin" />
            Активная вылазка
          </CardTitle>
          <Badge variant="outline" className="text-green-400 border-green-600">
            {Math.round(activeAdventure.progress)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center text-xl',
            adventure.bgColor
          )}>
            {adventure.icon}
          </div>
          <div className="flex-1">
            <p className="font-medium text-stone-200">{adventure.name}</p>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sword className="w-3 h-3" />
              <span>{weapon.name}</span>
              <span>•</span>
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-purple-400">{weapon.warSoul || 0} Души Войны</span>
            </div>
          </div>
        </div>
        
        <Progress 
          value={activeAdventure.progress} 
          className="h-3 bg-stone-800 mb-3"
        />
        
        <div className="flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1">
            <Timer className="w-3 h-3" />
            <span>
              Осталось ~{Math.max(0, Math.ceil((activeAdventure.endTime - Date.now()) / 1000))} сек
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>Событий: {activeAdventure.eventsCompleted}</span>
          </div>
        </div>
        
        {/* Лог событий */}
        {eventLog.length > 0 && (
          <div className="mt-3 p-2 rounded-lg bg-stone-800/50 border border-stone-700/50 max-h-32 overflow-y-auto">
            {eventLog.map((log, i) => (
              <p key={i} className="text-xs text-stone-400 mb-1">{log}</p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

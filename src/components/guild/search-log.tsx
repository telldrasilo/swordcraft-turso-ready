/**
 * Компонент лога поиска искателей
 */

'use client'

import React, { useMemo, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { SearchState, SearchLogEntry } from '@/types/adventurer-extended'

// ================================
// ПРОПСЫ
// ================================

interface SearchLogProps {
  searchState: SearchState
  expeditionName: string
  onStop: () => void
  onSkip: () => void
}

// ================================
// КОМПОНЕНТ ЗАПИСИ ЛОГА
// ================================

interface LogEntryProps {
  entry: SearchLogEntry
  isNew?: boolean
}

const LogEntry = React.memo<LogEntryProps>(({ entry, isNew }) => {
  const typeColors = {
    approaching: 'text-stone-400',
    considering: 'text-amber-400',
    accepted: 'text-green-400',
    declined: 'text-red-400',
    thinking: 'text-amber-400',
  }

  const typeLabels = {
    approaching: 'подходит',
    considering: 'думает',
    accepted: 'согласен',
    declined: 'отказался',
    thinking: 'размышляет',
  }

  return (
    <div 
      className={`flex items-start gap-2 py-1.5 px-2 rounded transition-all duration-300 ${
        isNew ? 'bg-stone-800/50 animate-pulse' : ''
      }`}
    >
      <span className="text-lg">{entry.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-stone-200 truncate">
            {entry.adventurerName}
          </span>
          <Badge 
            variant="outline" 
            className={`text-[10px] px-1.5 py-0 ${typeColors[entry.type]}`}
          >
            {typeLabels[entry.type]}
          </Badge>
        </div>
        <p className={`text-sm ${typeColors[entry.type]} mt-0.5`}>
          {entry.message}
        </p>
      </div>
      <span className="text-xs text-stone-500 shrink-0">
        {formatTimestamp(entry.timestamp)}
      </span>
    </div>
  )
})

LogEntry.displayName = 'LogEntry'

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

export const SearchLog: React.FC<SearchLogProps> = ({
  searchState,
  expeditionName,
  onStop,
  onSkip,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  
  // Автоскролл к последней записи
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [searchState.logs])

  // Форматирование прогресса
  const progressPercent = useMemo(() => {
    return Math.round(searchState.progress)
  }, [searchState.progress])

  // Форматирование времени
  const timeRemaining = useMemo(() => {
    if (!searchState.isSearching) return 'Завершён'
    const elapsed = Date.now() - searchState.startTime
    const remaining = Math.max(0, searchState.duration - elapsed)
    return formatDuration(remaining)
  }, [searchState.isSearching, searchState.startTime, searchState.duration])

  // Последние 3 записи для анимации
  const recentLogIds = useMemo(() => {
    return searchState.logs.slice(-3).map(l => l.id)
  }, [searchState.logs])

  return (
    <Card className="bg-stone-900/50 border-stone-700">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              📋 ПОИСК ИСКАТЕЛЕЙ
              {searchState.isSearching && (
                <span className="animate-pulse">...</span>
              )}
            </CardTitle>
            <p className="text-sm text-stone-400 mt-1">
              Миссия: <span className="text-stone-200">{expeditionName}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">
              {searchState.foundAdventurers.length}/{searchState.targetCount}
            </div>
            <div className="text-xs text-stone-500">найдено</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Прогресс бар */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-stone-400">
            <span>Прогресс поиска</span>
            <span>{progressPercent}% • {timeRemaining}</span>
          </div>
          <Progress 
            value={progressPercent} 
            className="h-2 bg-stone-800"
          />
        </div>

        {/* Лог событий */}
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto rounded-lg bg-stone-950/50 border border-stone-800"
        >
          {searchState.logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-stone-500 text-sm">
              Ожидание искателей...
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {searchState.logs.map((entry, index) => (
                <LogEntry 
                  key={entry.id}
                  entry={entry}
                  isNew={recentLogIds.includes(entry.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Кнопки управления */}
        <div className="flex gap-2">
          {searchState.isSearching && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={onStop}
                className="flex-1"
              >
                ⏹ Остановить
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onSkip}
                className="flex-1"
              >
                ⏩ Пропустить
              </Button>
            </>
          )}
          
          {!searchState.isSearching && searchState.foundAdventurers.length > 0 && (
            <div className="w-full text-center py-2 text-green-400">
              ✓ Найдено {searchState.foundAdventurers.length} искателей!
            </div>
          )}
          
          {!searchState.isSearching && searchState.foundAdventurers.length === 0 && (
            <div className="w-full text-center py-2 text-amber-400">
              ⚠ Искатели не найдены. Попробуйте ещё раз.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ================================

function formatTimestamp(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  return `${secs}с`
}

function formatDuration(ms: number): string {
  const seconds = Math.ceil(ms / 1000)
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}м ${secs}с`
  }
  return `${seconds}с`
}

export default SearchLog

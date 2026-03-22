/**
 * InventorySection - секция инвентаря оружия
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Package, Coins, Star, Sword, Filter, SortAsc } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGameStore } from '@/store'
import { cn } from '@/lib/utils'
import { WeaponInventoryCard } from './weapon-inventory-card'

export function InventorySection() {
  const weapons = useGameStore((state) => state.weaponInventory.weapons)
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'quality'>('date')
  const [filterQuality, setFilterQuality] = useState<string>('all')
  
  // Мемоизированная сортировка оружия
  const sortedWeapons = useMemo(() => {
    return [...weapons].sort((a, b) => {
      if (sortBy === 'date') return b.createdAt - a.createdAt
      if (sortBy === 'price') return b.sellPrice - a.sellPrice
      if (sortBy === 'quality') return b.quality - a.quality
      return 0
    })
  }, [weapons, sortBy])
  
  // Мемоизированная фильтрация по качеству
  const filteredWeapons = useMemo(() => {
    return filterQuality === 'all' 
      ? sortedWeapons 
      : sortedWeapons.filter(w => w.qualityGrade === filterQuality)
  }, [sortedWeapons, filterQuality])
  
  // Мемоизированная статистика
  const stats = useMemo(() => {
    const totalValue = weapons.reduce((sum, w) => sum + w.sellPrice, 0)
    const avgAttack = weapons.length > 0
      ? Math.round(weapons.reduce((sum, w) => sum + w.attack, 0) / weapons.length)
      : 0
    const masterpieceCount = weapons.filter(
      w => w.qualityGrade === 'masterwork' || w.qualityGrade === 'legendary'
    ).length
    
    return { totalValue, avgAttack, masterpieceCount, count: weapons.length }
  }, [weapons])
  
  return (
    <div className="space-y-4">
      {/* Статистика инвентаря */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Package className="w-5 h-5 mx-auto text-stone-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.count}</p>
            <p className="text-xs text-stone-500">Предметов</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Coins className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <p className="text-xl font-bold text-amber-400">{stats.totalValue}</p>
            <p className="text-xs text-stone-500">Общая стоимость</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Star className="w-5 h-5 mx-auto text-purple-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.masterpieceCount}</p>
            <p className="text-xs text-stone-500">Шедевров+</p>
          </CardContent>
        </Card>
        <Card className="card-medieval bg-stone-800/50">
          <CardContent className="p-3 text-center">
            <Sword className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <p className="text-xl font-bold text-stone-200">{stats.avgAttack}</p>
            <p className="text-xs text-stone-500">Сред. атака</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Фильтры и сортировка */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-stone-500">
          <Filter className="w-3 h-3" />
          <span>Фильтр:</span>
        </div>
        {[
          { id: 'all', label: 'Все' },
          { id: 'legendary', label: 'Легенда', color: 'text-amber-400' },
          { id: 'masterwork', label: 'Шедевр', color: 'text-purple-400' },
          { id: 'excellent', label: 'Отличное', color: 'text-blue-400' },
          { id: 'good', label: 'Хорошее', color: 'text-green-400' },
        ].map((f) => (
          <Button
            key={f.id}
            variant={filterQuality === f.id ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'h-7 text-xs',
              filterQuality === f.id 
                ? 'bg-amber-800 text-amber-100' 
                : 'border-stone-600 text-stone-400'
            )}
            onClick={() => setFilterQuality(f.id)}
          >
            {f.label}
          </Button>
        ))}
        
        <div className="ml-auto flex items-center gap-1">
          <SortAsc className="w-3 h-3 text-stone-500" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'price' | 'quality')}
            className="bg-stone-800 border border-stone-600 rounded px-2 py-1 text-xs text-stone-300"
          >
            <option value="date">По дате</option>
            <option value="price">По цене</option>
            <option value="quality">По качеству</option>
          </select>
        </div>
      </div>
      
      {/* Список оружия */}
      {filteredWeapons.length === 0 ? (
        <Card className="card-medieval">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 mx-auto text-stone-600 mb-3" />
            <p className="text-stone-500 mb-1">Инвентарь пуст</p>
            <p className="text-stone-600 text-sm">
              {stats.count > 0 
                ? 'Нет предметов с выбранным фильтром' 
                : 'Создайте оружие на вкладке "Крафт"'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredWeapons.map((weapon) => (
              <WeaponInventoryCard key={weapon.id} weapon={weapon} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}

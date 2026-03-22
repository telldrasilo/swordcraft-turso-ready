/**
 * Altar Screen
 * Главный экран алтаря душ (контейнер)
 */

'use client'

import { Sparkles, Droplet, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/store'

// Импорт вынесенных компонентов
import {
  SacrificeSection,
  EnchantmentShopSection,
  EnchantedWeaponsSection
} from '@/components/altar'

export function AltarScreen() {
  const resources = useGameStore((state) => state.resources)
  
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-amber-200 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Алтарь душ
          </h2>
          <p className="text-stone-500 text-sm">Жертвуйте оружие и зачаровывайте</p>
        </div>
        <div className="flex items-center gap-2">
          <Droplet className="w-5 h-5 text-purple-400" />
          <span className="text-lg font-bold text-purple-400">{resources.soulEssence}</span>
          <span className="text-sm text-stone-500">эссенции</span>
        </div>
      </div>
      
      {/* Жертвоприношение */}
      <SacrificeSection />
      
      {/* Магазин зачарований */}
      <EnchantmentShopSection />
      
      {/* Зачарованное оружие */}
      <EnchantedWeaponsSection />
      
      {/* Подсказки */}
      <Card className="card-medieval bg-stone-800/30">
        <CardContent className="p-4">
          <h4 className="font-semibold text-stone-300 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Как работают зачарования
          </h4>
          <ul className="text-xs text-stone-500 space-y-1">
            <li>• <strong className="text-purple-400">Жертвоприношение</strong> — превращайте ненужное оружие в эссенцию души</li>
            <li>• <strong className="text-amber-400">Магазин</strong> — покупайте зачарования за эссенцию и золото</li>
            <li>• <strong className="text-green-400">Наложение</strong> — применяйте зачарования к оружию из инвентаря</li>
            <li>• <strong className="text-red-400">Ограничения</strong> — максимум 2 зачарования на оружии, разных школ</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

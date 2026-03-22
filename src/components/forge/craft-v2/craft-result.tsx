/**
 * Craft Result V2
 * Экран результата крафта
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 8
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Sword, Shield, Star, Zap, Package, CheckCircle2,
  Sparkles, Crown, Coins, Heart, Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'

import type { CraftedWeaponV2, QualityGrade } from '@/types/craft-v2'
import { QUALITY_GRADES_CONFIG } from '@/types/craft-v2'

// ================================
// КОНСТАНТЫ
// ================================

const QUALITY_CONFIG = QUALITY_GRADES_CONFIG

// ================================
// ПОДКОМПОНЕНТЫ
// ================================

/** Звёзды качества */
function QualityStars({ quality }: { quality: number }) {
  const stars = quality >= 96 ? 5 :
                quality >= 86 ? 4 :
                quality >= 71 ? 3 :
                quality >= 51 ? 2 : 1
  
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-5 h-5 transition-all",
            i < stars 
              ? "text-amber-400 fill-amber-400"
              : "text-stone-600"
          )}
        />
      ))}
    </div>
  )
}

/** Карточка характеристики */
function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-stone-800/50 border border-stone-700">
      <div className={cn("p-2 rounded-lg", color)}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-stone-500">{label}</p>
        <p className="font-bold text-stone-200">{value}</p>
      </div>
    </div>
  )
}

/** Список материалов */
function MaterialsList({ materials }: { materials: CraftedWeaponV2['materials'] }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-stone-400">Использованные материалы</h4>
      <div className="grid grid-cols-2 gap-2">
        {materials.map((mat, i) => (
          <div
            key={`${mat.partId}-${i}`}
            className="flex items-center gap-2 p-2 rounded bg-stone-800/50 text-sm"
          >
            <Package className="w-4 h-4 text-stone-500" />
            <div className="min-w-0 flex-1">
              <p className="text-stone-300 truncate">{mat.materialName}</p>
              <p className="text-xs text-stone-500">{mat.quantity.toFixed(1)} ед.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ================================
// ОСНОВНОЙ КОМПОНЕНТ
// ================================

interface CraftResultProps {
  weapon: CraftedWeaponV2
  onCollect: () => void
  onContinue: () => void
}

export function CraftResult({ weapon, onCollect, onContinue }: CraftResultProps) {
  const qualityConfig = QUALITY_CONFIG.find(g => g.grade === weapon.qualityGrade) || QUALITY_CONFIG[1]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Заголовок с именем оружия */}
      <Card className={cn(
        "border-2",
        weapon.qualityGrade === 'legendary' && "border-amber-500 bg-gradient-to-b from-amber-900/20 to-stone-900",
        weapon.qualityGrade === 'masterpiece' && "border-purple-500 bg-gradient-to-b from-purple-900/20 to-stone-900",
        weapon.qualityGrade === 'excellent' && "border-blue-500 bg-gradient-to-b from-blue-900/20 to-stone-900",
        weapon.qualityGrade === 'good' && "border-green-500 bg-gradient-to-b from-green-900/20 to-stone-900",
      )}>
        <CardContent className="p-6 text-center">
          {/* Имя оружия */}
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "text-3xl font-bold mb-2",
              qualityConfig.color
            )}
          >
            {weapon.fullName}
          </motion.h2>
          
          {/* Тип и тир */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <Badge variant="outline" className="bg-stone-800">
              <Sword className="w-3 h-3 mr-1" />
              {weapon.type}
            </Badge>
            <Badge variant="outline" className="bg-stone-800">
              Тир {weapon.tier}
            </Badge>
          </div>
          
          {/* Качество */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <QualityStars quality={weapon.quality} />
            <Badge className={cn("text-lg px-4 py-1", qualityConfig.color, "bg-stone-800")}>
              {qualityConfig.nameRu}
            </Badge>
            <span className="text-sm text-stone-500">
              {weapon.quality} из 100
            </span>
          </div>
          
          {/* Анимация искр для легендарного */}
          {weapon.qualityGrade === 'legendary' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 pointer-events-none overflow-hidden"
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-amber-400 rounded-full"
                  initial={{
                    x: Math.random() * 400 - 200,
                    y: 200,
                    opacity: 1,
                  }}
                  animate={{
                    y: -100,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 1 + Math.random() * 0.5,
                    delay: Math.random() * 0.5,
                    repeat: Infinity,
                    repeatDelay: Math.random() * 2,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      {/* Характеристики */}
      <Card className="bg-stone-900/50 border-stone-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Характеристики</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Sword className="w-4 h-4" />}
            label="Атака"
            value={weapon.stats.attack}
            color="bg-red-600/30 text-red-400"
          />
          <StatCard
            icon={<Shield className="w-4 h-4" />}
            label="Прочность"
            value={`${weapon.stats.durability}/${weapon.stats.maxDurability}`}
            color="bg-blue-600/30 text-blue-400"
          />
          <StatCard
            icon={<Zap className="w-4 h-4" />}
            label="Баланс"
            value={`${weapon.stats.balance}%`}
            color="bg-yellow-600/30 text-yellow-400"
          />
          <StatCard
            icon={<Heart className="w-4 h-4" />}
            label="Вес"
            value={`${weapon.stats.weight} кг`}
            color="bg-green-600/30 text-green-400"
          />
          <StatCard
            icon={<Sparkles className="w-4 h-4" />}
            label="Душа Войны"
            value={`${weapon.warSoul}/${weapon.maxWarSoul}`}
            color="bg-purple-600/30 text-purple-400"
          />
          <StatCard
            icon={<Coins className="w-4 h-4" />}
            label="Цена продажи"
            value={`${weapon.sellPrice} 💰`}
            color="bg-amber-600/30 text-amber-400"
          />
        </CardContent>
      </Card>
      
      {/* Материалы */}
      <Card className="bg-stone-900/50 border-stone-700">
        <CardContent className="p-4">
          <MaterialsList materials={weapon.materials} />
        </CardContent>
      </Card>
      
      {/* Информация */}
      <Card className="bg-stone-800/50 border-stone-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-stone-400">
              <Timer className="w-4 h-4" />
              Создано: {new Date(weapon.createdAt).toLocaleString('ru-RU')}
            </div>
            <Badge variant="outline">
              <CheckCircle2 className="w-3 h-3 mr-1 text-green-400" />
              Готово
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      {/* Действия */}
      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 bg-green-600 hover:bg-green-500"
          onClick={onCollect}
        >
          <Package className="w-5 h-5 mr-2" />
          Забрать оружие
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={onContinue}
        >
          Создать ещё
        </Button>
      </div>
    </motion.div>
  )
}

export default CraftResult

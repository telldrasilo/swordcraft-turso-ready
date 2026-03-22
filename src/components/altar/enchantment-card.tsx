/**
 * Enchantment Card
 * Карточка зачарования в магазине
 */

'use client'

import { motion } from 'framer-motion'
import { Lock, Zap, Droplet, Coins, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { enchantmentSchoolInfo, type Enchantment } from '@/data/enchantments'

interface EnchantmentCardProps {
  enchantment: Enchantment
  isUnlocked: boolean
  canAfford: boolean
  onUnlock: () => void
  unlocking: boolean
}

export function EnchantmentCard({ 
  enchantment,
  isUnlocked,
  canAfford,
  onUnlock,
  unlocking
}: EnchantmentCardProps) {
  const schoolInfo = enchantmentSchoolInfo[enchantment.school]
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className={cn(
        'card-medieval transition-all',
        isUnlocked && 'border-green-600/30 bg-green-900/10',
        !isUnlocked && canAfford && 'hover:border-amber-600/30',
        !isUnlocked && !canAfford && 'opacity-60'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
              schoolInfo.bgColor
            )}>
              {schoolInfo.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className={cn('font-semibold', schoolInfo.color)}>
                  {enchantment.name}
                </h4>
                <Badge variant="outline" className="text-xs">
                  Тир {enchantment.tier}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 mt-1">{schoolInfo.name}</p>
            </div>
            {isUnlocked && (
              <Badge className="bg-green-800 text-green-100">
                <CheckCircle className="w-3 h-3 mr-1" />
                Открыто
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-stone-400 mb-3">{enchantment.description}</p>
          
          {/* Эффект */}
          <div className="flex items-center gap-2 p-2 rounded bg-stone-800/50 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-stone-300">
              +{enchantment.effect.value}% {enchantment.effect.type === 'damage' ? 'урона' : 
                enchantment.effect.type === 'defense' ? 'защиты' :
                enchantment.effect.type === 'speed' ? 'скорости' :
                enchantment.effect.type === 'regen' ? 'регенерации' :
                enchantment.effect.type === 'lifesteal' ? 'вампиризма' :
                enchantment.effect.type === 'burn' ? 'урона огнём' :
                enchantment.effect.type === 'slow' ? 'замедления' : 'эффекта'}
            </span>
          </div>
          
          {/* Требования */}
          {!isUnlocked && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                <div className="flex items-center gap-1 text-xs">
                  <Droplet className="w-3 h-3 text-purple-400" />
                  <span className={canAfford ? 'text-purple-400' : 'text-red-400'}>
                    {enchantment.cost.soulEssence}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span className={canAfford ? 'text-amber-400' : 'text-red-400'}>
                    {enchantment.cost.gold}
                  </span>
                </div>
                {enchantment.requiredLevel > 1 && (
                  <Badge variant="outline" className="text-xs">
                    Ур. {enchantment.requiredLevel}
                  </Badge>
                )}
                {enchantment.requiredFame > 0 && (
                  <Badge variant="outline" className="text-xs">
                    Слава {enchantment.requiredFame}
                  </Badge>
                )}
              </div>
              
              <Button 
                size="sm"
                className="w-full bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-700 hover:to-purple-800 text-purple-100"
                disabled={!canAfford}
                onClick={onUnlock}
              >
                {unlocking ? (
                  <Zap className="w-4 h-4 animate-pulse" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Разблокировать
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

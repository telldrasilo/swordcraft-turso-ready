/**
 * Sacrifice Section
 * Секция жертвоприношения оружия
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Droplet, Coins, Package } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useGameStore } from '@/store'
import { useSound } from '@/lib/sounds'
import { useState } from 'react'
import { SacrificeWeaponCard } from './sacrifice-weapon-card'

export function SacrificeSection() {
  const weaponInventory = useGameStore((state) => state.weaponInventory)
  const sacrificeWeapon = useGameStore((state) => state.sacrificeWeapon)
  const [sacrificingId, setSacrificingId] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<{ soulEssence: number; bonusGold: number } | null>(null)
  const { play } = useSound()
  
  const handleSacrifice = (weaponId: string) => {
    setSacrificingId(weaponId)
    
    setTimeout(() => {
      const result = sacrificeWeapon(weaponId)
      if (result) {
        setLastResult(result)
        play('sell')
        setTimeout(() => setLastResult(null), 2000)
      }
      setSacrificingId(null)
    }, 500)
  }
  
  return (
    <Card className="card-medieval">
      <CardHeader>
        <CardTitle className="text-amber-200 flex items-center gap-2">
          <Flame className="w-5 h-5" />
          Жертвоприношение оружия
        </CardTitle>
        <CardDescription>
          Превратите ненужное оружие в эссенцию души
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Анимация последнего жертвоприношения */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-4 rounded-lg bg-purple-900/30 border border-purple-600/50 text-center"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Droplet className="w-6 h-6 text-purple-400 animate-pulse" />
                  <span className="text-xl font-bold text-purple-400">
                    +{lastResult.soulEssence}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <span className="text-lg text-amber-400">
                    +{lastResult.bonusGold}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {weaponInventory.weapons.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-stone-800/50 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-stone-600" />
            </div>
            <p className="text-stone-500">Нет оружия для жертвоприношения</p>
            <p className="text-stone-600 text-sm">Создайте оружие в кузнице</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {weaponInventory.weapons.map((weapon) => (
                <SacrificeWeaponCard
                  key={weapon.id}
                  weapon={weapon}
                  onSacrifice={() => handleSacrifice(weapon.id)}
                  sacrificing={sacrificingId === weapon.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

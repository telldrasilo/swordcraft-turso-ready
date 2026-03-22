/**
 * Recipe Card Component
 * Карточка рецепта для выбора
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sword, Hammer, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WeaponRecipe } from '@/types/craft-v2'

interface RecipeCardProps {
  recipe: WeaponRecipe
  isSelected: boolean
  isAvailable: boolean
  onSelect: () => void
}

const typeIcons: Record<string, React.ReactNode> = {
  sword: <Sword className="w-5 h-5" />,
  dagger: <Sword className="w-4 h-4" />,
  axe: <Hammer className="w-5 h-5" />,
}

export function RecipeCard({ recipe, isSelected, isAvailable, onSelect }: RecipeCardProps) {
  return (
    <motion.div
      whileHover={isAvailable ? { scale: 1.02 } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      onClick={isAvailable ? onSelect : undefined}
      className={cn(
        "p-3 rounded-lg border-2 transition-all cursor-pointer",
        isSelected 
          ? "border-amber-500 bg-amber-900/30" 
          : isAvailable
            ? "border-stone-700 bg-stone-800/50 hover:border-stone-600"
            : "border-stone-800 bg-stone-900/30 opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isSelected ? "bg-amber-600/30 text-amber-400" : "bg-stone-700 text-stone-400"
        )}>
          {typeIcons[recipe.type] || <Sword className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium truncate",
            isSelected ? "text-amber-200" : "text-stone-200"
          )}>
            {recipe.name}
          </p>
          <p className="text-xs text-stone-500 truncate">
            {recipe.parts.length} частей • ATK {recipe.baseStats.attackBase}
          </p>
        </div>
        {isSelected && (
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
        )}
      </div>
    </motion.div>
  )
}

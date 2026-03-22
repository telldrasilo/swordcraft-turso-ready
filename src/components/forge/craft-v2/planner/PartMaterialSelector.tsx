/**
 * Part Material Selector Component
 * Селектор материала для части оружия
 */

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { allMaterials, getMaterialsForPart } from '@/data/materials'

interface PartMaterialSelectorProps {
  partId: string
  partName: string
  allowedCategories: string[]
  selectedMaterial: string | null
  onSelect: (materialId: string) => void
  availableMaterials: string[]
}

const categoryIcons: Record<string, string> = {
  metal: '⚒️',
  alloy: '🔧',
  wood: '🪵',
  leather: '🟤',
  stone: '🪨',
}

export function PartMaterialSelector({
  partId,
  partName,
  allowedCategories,
  selectedMaterial,
  onSelect,
  availableMaterials,
}: PartMaterialSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  
  const materials = useMemo(() => {
    return getMaterialsForPart(partId, allowedCategories)
      .filter(m => availableMaterials.includes(m.id))
  }, [partId, allowedCategories, availableMaterials])
  
  const selected = useMemo(() => {
    return selectedMaterial ? allMaterials.find(m => m.id === selectedMaterial) : null
  }, [selectedMaterial])
  
  return (
    <div className="border border-stone-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between bg-stone-800/50 hover:bg-stone-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">
            {selected ? categoryIcons[selected.category] : '❓'}
          </span>
          <div className="text-left">
            <p className="font-medium text-stone-200">{partName}</p>
            <p className="text-xs text-stone-500">
              {selected ? selected.name : 'Выберите материал'}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-stone-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-stone-400" />
        )}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 grid grid-cols-2 gap-2 bg-stone-900/50">
              {materials.map(material => (
                <button
                  key={material.id}
                  onClick={() => {
                    onSelect(material.id)
                    setExpanded(false)
                  }}
                  className={cn(
                    "p-2 rounded text-left transition-colors",
                    selectedMaterial === material.id
                      ? "bg-amber-600/30 border border-amber-500"
                      : "bg-stone-800 border border-stone-700 hover:border-stone-600"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{categoryIcons[material.category]}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-stone-200 truncate">
                        {material.name}
                      </p>
                      <p className="text-xs text-stone-500">
                        ATK +{material.weaponEffects.attackBonus}%
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

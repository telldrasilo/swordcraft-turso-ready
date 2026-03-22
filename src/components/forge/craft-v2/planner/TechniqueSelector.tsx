/**
 * Technique Selector Component
 * Селектор техник крафта
 */

'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { allTechniques } from '@/data/techniques'

interface TechniqueSelectorProps {
  selectedTechniques: string[]
  onToggle: (techniqueId: string) => void
  unlockedTechniques: string[]
}

export function TechniqueSelector({
  selectedTechniques,
  onToggle,
  unlockedTechniques,
}: TechniqueSelectorProps) {
  const [expanded, setExpanded] = useState(false)
  
  const techniques = useMemo(() => {
    return allTechniques.filter(t => unlockedTechniques.includes(t.id))
  }, [unlockedTechniques])
  
  const selected = useMemo(() => {
    return techniques.filter(t => selectedTechniques.includes(t.id))
  }, [techniques, selectedTechniques])
  
  return (
    <div className="border border-stone-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between bg-stone-800/50 hover:bg-stone-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <div className="text-left">
            <p className="font-medium text-stone-200">Техники</p>
            <p className="text-xs text-stone-500">
              {selected.length > 0 
                ? selected.map(t => t.name).join(', ')
                : 'Не выбраны'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-stone-700">
            {selected.length}/{3}
          </Badge>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-stone-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-400" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-2 space-y-2 bg-stone-900/50">
              {techniques.map(technique => (
                <label
                  key={technique.id}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded cursor-pointer transition-colors",
                    selectedTechniques.includes(technique.id)
                      ? "bg-purple-600/20 border border-purple-500"
                      : "bg-stone-800 border border-stone-700 hover:border-stone-600"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedTechniques.includes(technique.id)}
                    onChange={() => onToggle(technique.id)}
                    disabled={!selectedTechniques.includes(technique.id) && selectedTechniques.length >= 3}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-200">{technique.name}</p>
                    <p className="text-xs text-stone-500">{technique.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

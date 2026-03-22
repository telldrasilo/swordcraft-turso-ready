/**
 * Craft Planner V2
 * Интерфейс планирования крафта - ИСПОЛЬЗУЕТ МОДУЛЬНЫЕ КОМПОНЕНТЫ
 * 
 * @see docs/CRAFT_SYSTEM_CONCEPT.md - секция 5.1
 * 
 * Размер: ~300 строк (было 788)
 */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Hammer, Wrench, Package, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Модульные компоненты
import { 
  RecipeCard, 
  PartMaterialSelector, 
  TechniqueSelector, 
  MaterialsCheck 
} from './planner'

// Типы и данные
import type { WeaponRecipe } from '@/types/craft-v2'
import type { Resources } from '@/store/slices/resources-slice'
import type { MaterialToBuy } from '@/lib/craft/inventory-check'
import { getAvailableRecipes, getRecipeById } from '@/data/recipes'
import { getResourceKeyForMaterial } from '@/lib/craft/inventory-check'

// ================================
// PROP TYPES
// ================================

interface CraftPlannerProps {
  playerLevel: number
  inventory: Resources
  gold: number
  availableMaterials: string[]
  unlockedRecipes: string[]
  unlockedTechniques: string[]
  onStartCraft: (plan: {
    recipeId: string
    materials: Record<string, { materialId: string; quantity: number }>
    techniques: string[]
  }) => void
  onBuyMaterials?: (materials: MaterialToBuy[], totalCost: number) => void
}

// ================================
// MAIN COMPONENT
// ================================

export function CraftPlanner({
  playerLevel,
  inventory,
  gold,
  availableMaterials,
  unlockedRecipes,
  unlockedTechniques,
  onStartCraft,
  onBuyMaterials,
}: CraftPlannerProps) {
  // === STATE ===
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, string>>({})
  const [selectedTechniques, setSelectedTechniques] = useState<string[]>([])
  
  // === DERIVED DATA ===
  const selectedRecipe = useMemo(() => {
    return selectedRecipeId ? getRecipeById(selectedRecipeId) : null
  }, [selectedRecipeId])
  
  const recipes = useMemo(() => {
    return getAvailableRecipes(playerLevel, unlockedRecipes)
  }, [playerLevel, unlockedRecipes])
  
  // === VALIDATION ===
  const canStartCraft = useMemo(() => {
    if (!selectedRecipe) return false
    
    // Все обязательные части выбраны
    const requiredParts = selectedRecipe.parts.filter(p => !p.optional)
    const hasAllMaterials = requiredParts.every(p => selectedMaterials[p.id])
    if (!hasAllMaterials) return false
    
    // Проверка инвентаря
    for (const part of requiredParts) {
      const materialId = selectedMaterials[part.id]
      if (!materialId) continue
      
      const resourceKey = getResourceKeyForMaterial(materialId)
      if (!resourceKey) continue
      
      const available = inventory[resourceKey] || 0
      if (available < part.minQuantity) return false
    }
    
    // Проверка топлива
    if ((inventory.coal || 0) < 3) return false
    
    return true
  }, [selectedRecipe, selectedMaterials, inventory])
  
  // === HANDLERS ===
  const handleSelectRecipe = useCallback((recipeId: string) => {
    setSelectedRecipeId(recipeId)
    setSelectedMaterials({})
  }, [])
  
  const handleSelectMaterial = useCallback((partId: string, materialId: string) => {
    setSelectedMaterials(prev => ({
      ...prev,
      [partId]: materialId,
    }))
  }, [])
  
  const handleToggleTechnique = useCallback((techniqueId: string) => {
    setSelectedTechniques(prev => 
      prev.includes(techniqueId)
        ? prev.filter(id => id !== techniqueId)
        : prev.length < 3 
          ? [...prev, techniqueId]
          : prev
    )
  }, [])
  
  const handleStartCraft = useCallback(() => {
    if (!selectedRecipeId || !canStartCraft) return
    
    const materials: Record<string, { materialId: string; quantity: number }> = {}
    
    selectedRecipe?.parts.forEach(part => {
      const materialId = selectedMaterials[part.id]
      if (materialId) {
        materials[part.id] = {
          materialId,
          quantity: part.minQuantity,
        }
      }
    })
    
    onStartCraft({
      recipeId: selectedRecipeId,
      materials,
      techniques: selectedTechniques,
    })
  }, [selectedRecipeId, selectedRecipe, selectedMaterials, selectedTechniques, canStartCraft, onStartCraft])
  
  // === RENDER ===
  return (
    <div className="space-y-6">
      {/* Выбор рецепта */}
      <Card className="bg-stone-900/50 border-stone-700">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" />
            Выберите рецепт
          </CardTitle>
          <CardDescription>
            Доступно {recipes.length} рецептов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-4">
              {recipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSelected={selectedRecipeId === recipe.id}
                  isAvailable={true}
                  onSelect={() => handleSelectRecipe(recipe.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Выбор материалов */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-stone-900/50 border-stone-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-400" />
                  Материалы
                </CardTitle>
                <CardDescription>
                  Выберите материал для каждой части
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedRecipe.parts.map(part => (
                  <PartMaterialSelector
                    key={part.id}
                    partId={part.id}
                    partName={part.name}
                    allowedCategories={part.materialTypes}
                    selectedMaterial={selectedMaterials[part.id] || null}
                    onSelect={(materialId) => handleSelectMaterial(part.id, materialId)}
                    availableMaterials={availableMaterials}
                  />
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Проверка материалов */}
      <AnimatePresence>
        {selectedRecipe && Object.keys(selectedMaterials).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <MaterialsCheck
              inventory={inventory}
              selectedMaterials={selectedMaterials}
              recipe={selectedRecipe}
              gold={gold}
              onBuyMaterials={onBuyMaterials}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Выбор техник */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <TechniqueSelector
              selectedTechniques={selectedTechniques}
              onToggle={handleToggleTechnique}
              unlockedTechniques={unlockedTechniques}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Кнопка запуска */}
      <AnimatePresence>
        {selectedRecipe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Button
              size="lg"
              className={cn(
                "w-full text-lg py-6",
                canStartCraft 
                  ? "bg-amber-600 hover:bg-amber-500" 
                  : "bg-stone-700 cursor-not-allowed"
              )}
              disabled={!canStartCraft}
              onClick={handleStartCraft}
            >
              {canStartCraft ? (
                <>
                  <Hammer className="w-5 h-5 mr-2" />
                  Начать крафт
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Недостаточно материалов
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CraftPlanner

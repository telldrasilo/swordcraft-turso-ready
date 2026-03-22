/**
 * Materials Check Component
 * Проверка наличия материалов для крафта
 */

'use client'

import React from 'react'
import { Package, Info, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Resources } from '@/store/slices/resources-slice'
import type { WeaponRecipe } from '@/types/craft-v2'
import { 
  checkInventoryForCraft, 
  type MaterialToBuy,
} from '@/lib/craft/inventory-check'

interface MaterialsCheckProps {
  inventory: Resources
  selectedMaterials: Record<string, string>
  recipe: WeaponRecipe | null
  gold: number
  onBuyMaterials?: (materials: MaterialToBuy[], totalCost: number) => void
}

export function MaterialsCheck({
  inventory,
  selectedMaterials,
  recipe,
  gold,
  onBuyMaterials,
}: MaterialsCheckProps) {
  if (!recipe) return null
  
  // Преобразуем выбранные материалы в формат для проверки
  const materialAssignment: Record<string, { materialId: string; quantity: number }> = {}
  recipe.parts.forEach(part => {
    const materialId = selectedMaterials[part.id]
    if (materialId) {
      materialAssignment[part.id] = {
        materialId,
        quantity: part.minQuantity,
      }
    }
  })
  
  // Используем систему проверки
  const checkResult = checkInventoryForCraft(recipe, materialAssignment, inventory)
  
  if (checkResult.requirements.length === 0) return null
  
  const canAffordPurchase = gold >= checkResult.totalPurchaseCost
  
  return (
    <Card className={cn(
      "bg-stone-900/50 border-stone-700",
      !checkResult.canCraft && "border-red-500/50"
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Package className={cn(
            "w-4 h-4",
            checkResult.canCraft ? "text-green-400" : "text-red-400"
          )} />
          Материалы
          {!checkResult.canCraft && (
            <Badge variant="destructive" className="ml-auto">
              Не хватает
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Общая потребность в сырье */}
        <div className="space-y-1">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Требуется сырья:</p>
          {checkResult.requirements.map(req => (
            <div key={req.resourceKey} className="flex items-center justify-between text-sm">
              <span className="text-stone-400">{req.resourceName}</span>
              <span className={cn(
                "font-mono",
                req.sufficient ? "text-green-400" : "text-red-400"
              )}>
                {req.available}/{req.quantity}
                {!req.sufficient && ' ❌'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Топливо */}
        {checkResult.fuelRequired && (
          <div className="flex items-center justify-between text-sm pt-2 border-t border-stone-700">
            <span className="text-stone-400">Уголь (топливо)</span>
            <span className={cn(
              "font-mono",
              checkResult.fuelRequired.sufficient ? "text-green-400" : "text-red-400"
            )}>
              {checkResult.fuelRequired.available}/{checkResult.fuelRequired.quantity}
              {!checkResult.fuelRequired.sufficient && ' ❌'}
            </span>
          </div>
        )}
        
        {/* Детализация по частям */}
        <details className="text-sm">
          <summary className="cursor-pointer text-stone-500 hover:text-stone-400 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Детализация по частям
          </summary>
          <div className="mt-2 pl-4 space-y-2 border-l-2 border-stone-700">
            {checkResult.breakdownByPart.map(part => (
              <div key={part.partId}>
                <p className="text-stone-300 font-medium">
                  {part.partName}: <span className="text-amber-400">{part.materialName}</span>
                </p>
                {part.requirements.map((req, i) => (
                  <p key={i} className="text-xs text-stone-500 pl-2">
                    → {req.resourceName}: {req.quantity} ед.
                  </p>
                ))}
              </div>
            ))}
          </div>
        </details>
        
        {/* Кнопка покупки */}
        {!checkResult.canCraft && checkResult.canPurchaseMissing && onBuyMaterials && (
          <div className="pt-3 border-t border-stone-700 space-y-2">
            <p className="text-xs text-amber-400">
              💡 Можно купить недостающие материалы
            </p>
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-3">
              <p className="text-xs text-stone-400 mb-2">К покупке:</p>
              {checkResult.materialsToBuy.map(mat => (
                <div key={mat.resourceKey} className="flex justify-between text-sm">
                  <span className="text-stone-300">{mat.resourceName} ×{mat.quantity}</span>
                  <span className="text-amber-400 font-mono">{mat.totalPrice} 💰</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-2 mt-2 border-t border-stone-600 font-bold">
                <span className="text-stone-200">Итого:</span>
                <span className={cn(
                  "font-mono",
                  canAffordPurchase ? "text-amber-400" : "text-red-400"
                )}>
                  {checkResult.totalPurchaseCost} 💰
                </span>
              </div>
            </div>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-500"
              disabled={!canAffordPurchase}
              onClick={() => onBuyMaterials(checkResult.materialsToBuy, checkResult.totalPurchaseCost)}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Купить за {checkResult.totalPurchaseCost} 💰
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

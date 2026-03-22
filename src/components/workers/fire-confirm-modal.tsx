/**
 * FireConfirmModal - модальное окно подтверждения увольнения
 */

'use client'

import { motion } from 'framer-motion'
import { AlertCircle, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { workerClassData } from '@/store'
import type { Worker } from '@/store'

interface FireConfirmModalProps {
  worker: Worker
  refund: number
  onClose: () => void
  onConfirm: () => void
}

export function FireConfirmModal({ 
  worker, 
  refund,
  onClose, 
  onConfirm 
}: FireConfirmModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-stone-900 border border-stone-700 rounded-xl max-w-sm w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4 text-red-400">
          <AlertCircle className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Уволить рабочего?</h3>
        </div>
        
        <p className="text-stone-300 mb-4">
          Вы увольняете <strong>{worker.name}</strong> ({workerClassData[worker.class].name}).
        </p>
        
        {refund > 0 && (
          <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-400">
              <Coins className="w-4 h-4" />
              <span>Возврат: <strong>+{refund}</strong> золота (30%)</span>
            </div>
            <p className="text-xs text-green-500 mt-1">
              Часть стоимости найма вернётся в казну
            </p>
          </div>
        )}
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button 
            className="flex-1 bg-red-800 hover:bg-red-700 text-white"
            onClick={onConfirm}
          >
            Уволить
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

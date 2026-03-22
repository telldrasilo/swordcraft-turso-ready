/**
 * Altar Utils
 * Общие утилиты и константы для компонентов алтаря
 */

// Цвета качества
export const qualityColors: Record<string, { text: string; bg: string; border: string }> = {
  poor: { text: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-600' },
  normal: { text: 'text-stone-400', bg: 'bg-stone-900/50', border: 'border-stone-600' },
  good: { text: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-600' },
  excellent: { text: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-600' },
  masterwork: { text: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-600' },
  legendary: { text: 'text-amber-400', bg: 'bg-amber-900/30', border: 'border-amber-600' },
}

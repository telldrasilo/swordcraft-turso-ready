/**
 * Этапы подготовки к крафту
 * Category: preparation
 */

import type { StageTypeDefinition } from '@/types/craft-v2'

export const preparationStages: StageTypeDefinition[] = [
  {
    id: 'prep_heating',
    category: 'preparation',
    type: 'heating',
    name: 'Разогрев горна',
    description: 'Подготовка рабочего места и разогрев горна до рабочей температуры',
    baseDuration: 20,
    durationModifiers: {
      tool: 'forge.level',
    },
    messages: {
      start: [
        'Разжигаю горн...',
        'Подготавливаю огонь...',
        'Разогреваю горн до рабочей температуры...',
      ],
      complete: [
        'Горн готов к работе.',
        'Огонь разгорелся. Можно начинать.',
        'Рабочая температура достигнута.',
      ],
    },
  },
  {
    id: 'prep_fuel',
    category: 'preparation',
    type: 'fuel_prep',
    name: 'Подготовка топлива',
    description: 'Загрузка угля и подготовка топливной смеси',
    baseDuration: 15,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Подготавливаю топливо...',
        'Загружаю уголь...',
        'Готовлю топливную смесь...',
      ],
      complete: [
        'Топливо готово.',
        'Уголь загружен.',
        'Запас топлива подготовлен.',
      ],
    },
  },
  {
    id: 'prep_tools',
    category: 'preparation',
    type: 'tool_prep',
    name: 'Подготовка инструментов',
    description: 'Подготовка молотов, клещей и других инструментов',
    baseDuration: 10,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Подготавливаю инструменты...',
        'Проверяю молоты и клещи...',
        'Раскладываю инструменты...',
      ],
      complete: [
        'Инструменты готовы.',
        'Молоты и клещи подготовлены.',
        'Рабочее место готово.',
      ],
    },
  },
  {
    id: 'prep_workspace',
    category: 'preparation',
    type: 'workspace',
    name: 'Организация места',
    description: 'Раскладка материалов и организация рабочего пространства',
    baseDuration: 15,
    durationModifiers: {},
    messages: {
      start: [
        'Организую рабочее место...',
        'Раскладываю материалы...',
        'Подготавливаю место для работы...',
      ],
      complete: [
        'Всё готово к работе.',
        'Материалы разложены.',
        'Рабочее место организовано.',
      ],
    },
  },
]

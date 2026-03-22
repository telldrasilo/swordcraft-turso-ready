/**
 * Этапы обработки сырья
 * Category: processing
 */

import type { StageTypeDefinition } from '@/types/craft-v2'

export const processingStages: StageTypeDefinition[] = [
  {
    id: 'proc_smelting',
    category: 'processing',
    type: 'smelting',
    name: 'Плавка',
    description: 'Превращение руды в слиток в тигле',
    baseDuration: 45,
    durationModifiers: {
      skill: 'blacksmith.level',
      tool: 'forge.level',
    },
    messages: {
      start: [
        'Плавлю руду в тигле...',
        'Загружаю руду для плавки...',
        'Растапливаю металл...',
      ],
      complete: [
        'Слиток готов.',
        'Металл расплавлен и отлит в форму.',
        'Чистый слиток извлечён из формы.',
      ],
    },
  },
  {
    id: 'proc_alloying',
    category: 'processing',
    type: 'alloying',
    name: 'Сплавление',
    description: 'Смешивание металлов для создания сплава',
    baseDuration: 60,
    durationModifiers: {
      skill: 'blacksmith.level',
      tool: 'forge.level',
    },
    messages: {
      start: [
        'Смешиваю металлы...',
        'Готовлю сплав...',
        'Соединяю компоненты...',
      ],
      complete: [
        'Сплав готов.',
        'Компоненты соединились в единый сплав.',
        'Однородный сплав получен.',
      ],
    },
  },
  {
    id: 'proc_rolling',
    category: 'processing',
    type: 'rolling',
    name: 'Прокат',
    description: 'Формирование заготовки прокаткой',
    baseDuration: 30,
    durationModifiers: {
      skill: 'blacksmith.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Прокатываю слиток...',
        'Формую заготовку...',
        'Расплющиваю металл...',
      ],
      complete: [
        'Заготовка готова.',
        'Форма заготовки получена.',
        'Металл прокатан до нужной толщины.',
      ],
    },
  },
  {
    id: 'proc_drawing',
    category: 'processing',
    type: 'drawing',
    name: 'Волочение',
    description: 'Создание проволоки или прутков',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Волочу металл...',
        'Тяну проволоку...',
        'Формую пруток...',
      ],
      complete: [
        'Проволока готова.',
        'Пруток нужного диаметра получен.',
        'Ровная проволока изготовлена.',
      ],
    },
  },
  {
    id: 'proc_cutting',
    category: 'processing',
    type: 'cutting_raw',
    name: 'Резка сырья',
    description: 'Раскрой материала на части',
    baseDuration: 20,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Режу материал...',
        'Раскрапляю заготовку...',
        'Делю на части...',
      ],
      complete: [
        'Материал разделён.',
        'Части подготовлены.',
        'Нужные куски отрезаны.',
      ],
    },
  },
  {
    id: 'proc_drying',
    category: 'processing',
    type: 'drying',
    name: 'Сушка',
    description: 'Сушка материала (дерево, кожа)',
    baseDuration: 15,
    durationModifiers: {},
    messages: {
      start: [
        'Сушу материал...',
        'Подсушиваю древесину...',
        'Высушиваю кожу...',
      ],
      complete: [
        'Материал высушен.',
        'Влага удалена.',
        'Готово к обработке.',
      ],
    },
  },
  {
    id: 'proc_tanning',
    category: 'processing',
    type: 'tanning',
    name: 'Дубление',
    description: 'Обработка кожи для придания прочности',
    baseDuration: 30,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Дублю кожу...',
        'Обрабатываю кожу...',
        'Пропитываю дубильным раствором...',
      ],
      complete: [
        'Кожа готова.',
        'Дубление завершено.',
        'Прочная кожа получена.',
      ],
    },
  },
  {
    id: 'proc_sawing',
    category: 'processing',
    type: 'sawing',
    name: 'Распил',
    description: 'Обработка дерева, создание досок',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Распиливаю бревно...',
        'Пилю доски...',
        'Обрабатываю дерево...',
      ],
      complete: [
        'Доски готовы.',
        'Дерево обработано.',
        'Нужные куски выпилены.',
      ],
    },
  },
]

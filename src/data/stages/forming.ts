/**
 * Этапы формовки деталей
 * Category: forming
 */

import type { StageTypeDefinition } from '@/types/craft-v2'

export const formingStages: StageTypeDefinition[] = [
  {
    id: 'form_heating',
    category: 'forming',
    type: 'heating_part',
    name: 'Нагрев детали',
    description: 'Разогрев заготовки перед обработкой',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Нагреваю заготовку...',
        'Разогреваю металл...',
        'Помещаю в горн...',
      ],
      complete: [
        'Заготовка готова к обработке.',
        'Металл раскалён.',
        'Рабочая температура достигнута.',
      ],
    },
  },
  {
    id: 'form_forging',
    category: 'forming',
    type: 'forging',
    name: 'Ковка',
    description: 'Основная формовка металла молотом',
    baseDuration: 60,
    durationModifiers: {
      skill: 'blacksmith.level',
      tool: 'forge.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Кую деталь...',
        'Формую металл молотом...',
        'Придаю нужную форму...',
      ],
      complete: [
        'Деталь готова.',
        'Форма выкована.',
        'Образ принял очертания.',
      ],
    },
  },
  {
    id: 'form_drawing_out',
    category: 'forming',
    type: 'drawing_out',
    name: 'Вытяжка',
    description: 'Удлинение заготовки для создания клинка',
    baseDuration: 45,
    durationModifiers: {
      skill: 'blacksmith.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Вытягиваю заготовку...',
        'Удлиняю металл...',
        'Формую клинок...',
      ],
      complete: [
        'Заготовка вытянута.',
        'Длина достигнута.',
        'Основа клинка готова.',
      ],
    },
  },
  {
    id: 'form_upsetting',
    category: 'forming',
    type: 'upsetting',
    name: 'Осадка',
    description: 'Утолщение металла в нужных местах',
    baseDuration: 40,
    durationModifiers: {
      skill: 'blacksmith.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Утолщаю металл...',
        'Делаю осадку...',
        'Уплотняю заготовку...',
      ],
      complete: [
        'Толщина достигнута.',
        'Металл уплотнён.',
        'Осадка выполнена.',
      ],
    },
  },
  {
    id: 'form_bending',
    category: 'forming',
    type: 'bending',
    name: 'Гибка',
    description: 'Придание изогнутой формы',
    baseDuration: 30,
    durationModifiers: {
      skill: 'blacksmith.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Сгибаю заготовку...',
        'Придаю изгиб...',
        'Формую изгиб...',
      ],
      complete: [
        'Изгиб готов.',
        'Нужная форма достигнута.',
        'Гибка завершена.',
      ],
    },
  },
  {
    id: 'form_punching',
    category: 'forming',
    type: 'punching',
    name: 'Пробивка',
    description: 'Создание отверстий в металле',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Пробиваю отверстие...',
        'Делаю проушину...',
        'Создаю отверстие...',
      ],
      complete: [
        'Отверстие готово.',
        'Проушина пробита.',
        'Можно вставлять рукоять.',
      ],
    },
  },
  {
    id: 'form_carving',
    category: 'forming',
    type: 'carving',
    name: 'Резьба',
    description: 'Обработка дерева или кости резцом',
    baseDuration: 35,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Вырезаю форму...',
        'Обрабатываю резцом...',
        'Придаю детали форму...',
      ],
      complete: [
        'Деталь вырезана.',
        'Форма готова.',
        'Резьба завершена.',
      ],
    },
  },
  {
    id: 'form_shaping',
    category: 'forming',
    type: 'shaping',
    name: 'Формовка',
    description: 'Общая формовка детали',
    baseDuration: 40,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Формую деталь...',
        'Придаю окончательную форму...',
        'Довожу до нужного вида...',
      ],
      complete: [
        'Форма готова.',
        'Деталь сформирована.',
        'Очертания готовы.',
      ],
    },
  },
  {
    id: 'form_grinding',
    category: 'forming',
    type: 'grinding_raw',
    name: 'Черновая обработка',
    description: 'Снятие лишнего материала',
    baseDuration: 30,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Снимаю лишнее...',
        'Обрабатываю грубо...',
        'Убираю излишки...',
      ],
      complete: [
        'Лишнее удалено.',
        'Грубая обработка завершена.',
        'Приступаю к следующему этапу.',
      ],
    },
  },
  // Особые этапы для нестандартных материалов
  {
    id: 'form_cold_drawing',
    category: 'forming',
    type: 'cold_drawing',
    name: 'Холодная вытяжка',
    description: 'Медленное вытягивание металла на морозе',
    baseDuration: 120,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    environmentRequired: ['cold'],
    messages: {
      start: [
        'Медленно вытягиваю металл на морозе...',
        'Холод делает металл податливым...',
        'Тяну заготовку в холоде...',
      ],
      complete: [
        'Металл вытянут, сохранив ледяную структуру.',
        'Форма готова. Холод закрепил её.',
        'Холодная вытяжка завершена.',
      ],
    },
  },
]

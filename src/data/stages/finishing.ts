/**
 * Этапы отделки
 * Category: finishing
 */

import type { StageTypeDefinition } from '@/types/craft-v2'

export const finishingStages: StageTypeDefinition[] = [
  {
    id: 'fin_hardening',
    category: 'finishing',
    type: 'hardening',
    name: 'Закалка',
    description: 'Упрочнение металла резким охлаждением',
    baseDuration: 30,
    durationModifiers: {
      skill: 'blacksmith.level',
      material: 'material.workability',
    },
    messages: {
      start: [
        'Закалка в масле...',
        'Опускаю раскалённый клинок...',
        'Закаливаю металл...',
      ],
      complete: [
        'Закалка завершена. Металл звонкий.',
        'Закалка прошла успешно.',
        'Структура упрочнена.',
      ],
    },
  },
  {
    id: 'fin_tempering',
    category: 'finishing',
    type: 'tempering_fin',
    name: 'Отпуск финальный',
    description: 'Стабилизация структуры после закалки',
    baseDuration: 20,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Делаю отпуск...',
        'Стабилизирую структуру...',
        'Нагреваю до нужной температуры...',
      ],
      complete: [
        'Отпуск завершён.',
        'Напряжения сняты.',
        'Металл стабилен.',
      ],
    },
  },
  {
    id: 'fin_annealing',
    category: 'finishing',
    type: 'annealing',
    name: 'Отжиг',
    description: 'Мягкая закалка для снятия хрупкости',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Делаю отжиг...',
        'Размягчаю металл...',
        'Снимаю хрупкость...',
      ],
      complete: [
        'Отжиг завершён.',
        'Металл стал пластичнее.',
        'Хрупкость снята.',
      ],
    },
  },
  {
    id: 'fin_grinding',
    category: 'finishing',
    type: 'grinding_fin',
    name: 'Шлифовка',
    description: 'Черновая заточка и выравнивание поверхности',
    baseDuration: 35,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Шлифую поверхность...',
        'Выравниваю клинок...',
        'Снимаю неровности...',
      ],
      complete: [
        'Поверхность выровнена.',
        'Шлифовка завершена.',
        'Гладкая поверхность готова.',
      ],
    },
  },
  {
    id: 'fin_sharpening',
    category: 'finishing',
    type: 'sharpening',
    name: 'Заточка',
    description: 'Финальная заточка лезвия',
    baseDuration: 30,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Затачиваю лезвие...',
        'Навожу остроту...',
        'Точу клинок...',
      ],
      complete: [
        'Лезвие острое.',
        'Бритвенная острота.',
        'Заточка завершена.',
      ],
    },
  },
  {
    id: 'fin_polishing',
    category: 'finishing',
    type: 'polishing',
    name: 'Полировка',
    description: 'Глянцевая отделка поверхности',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Полирую поверхность...',
        'Навожу блеск...',
        'Довожу до зеркала...',
      ],
      complete: [
        'Поверхность блестит.',
        'Зеркальный блеск.',
        'Полировка завершена.',
      ],
    },
  },
  {
    id: 'fin_etching',
    category: 'finishing',
    type: 'etching',
    name: 'Травление',
    description: 'Нанесение узора или декора',
    baseDuration: 40,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Травлю узор...',
        'Наношу декор...',
        'Вытравливаю орнамент...',
      ],
      complete: [
        'Узор нанесён.',
        'Декор готов.',
        'Травление завершено.',
      ],
    },
  },
  {
    id: 'fin_coating',
    category: 'finishing',
    type: 'coating',
    name: 'Покрытие',
    description: 'Нанесение защитного слоя',
    baseDuration: 20,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Наношу покрытие...',
        'Покрываю защитным слоем...',
        'Обрабатываю поверхность...',
      ],
      complete: [
        'Защитный слой нанесён.',
        'Покрытие готово.',
        'Оружие защищено от ржавчины.',
      ],
    },
  },
  {
    id: 'fin_inspection',
    category: 'finishing',
    type: 'inspection',
    name: 'Контроль качества',
    description: 'Финальная проверка готового оружия',
    baseDuration: 15,
    durationModifiers: {
      skill: 'blacksmith.level',  // дольше = тщательнее
    },
    messages: {
      start: [
        'Осматриваю результат...',
        'Проверяю качество...',
        'Контролирую готовое оружие...',
      ],
      complete: [
        'Готово!',
        'Оружие прошло проверку.',
        'Можно использовать.',
      ],
    },
  },
  // Особые этапы для нестандартных материалов
  {
    id: 'fin_celestial_hardening',
    category: 'finishing',
    type: 'celestial_hardening',
    name: 'Небесная закалка',
    description: 'Закалка в священном составе из эссенции души и небесных компонентов',
    baseDuration: 90,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    requirements: {
      ingredients: [
        { id: 'soul_essence', quantity: 3 },
        { id: 'celestial_ash', quantity: 1 },
        { id: 'spirit_water', quantity: 2 },
      ],
    },
    messages: {
      start: [
        'Готовлю священный состав...',
        'Смешиваю эссенцию души и прах небесных трупов...',
        'Начинаю небесную закалку...',
      ],
      complete: [
        'Оружие впитало силу небес.',
        'Небесная закалка завершена.',
        'Священный клинок готов.',
      ],
    },
  },
  {
    id: 'fin_freezing',
    category: 'finishing',
    type: 'freezing',
    name: 'Заморозка',
    description: 'Закрепление структуры в ледяной воде',
    baseDuration: 60,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    environmentRequired: ['cold'],
    messages: {
      start: [
        'Погружаю в ледяную воду...',
        'Замораживаю структуру...',
        'Закрепляю кристаллическую решётку...',
      ],
      complete: [
        'Металл застыл. Кристаллическая структура закреплена.',
        'Заморозка завершена.',
        'Ледяной клинок готов.',
      ],
    },
  },
  {
    id: 'fin_spirit_blessing',
    category: 'finishing',
    type: 'spirit_blessing',
    name: 'Благословение духов',
    description: 'Ритуал освящения оружия',
    baseDuration: 80,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Начинаю ритуал благословения...',
        'Призываю духов...',
        'Освящаю оружие...',
      ],
      complete: [
        'Духи благословили оружие.',
        'Освящение завершено.',
        'Оружие обрело духовную силу.',
      ],
    },
  },
  {
    id: 'fin_enchanting',
    category: 'finishing',
    type: 'enchanting',
    name: 'Зачарование',
    description: 'Наложение магического эффекта',
    baseDuration: 120,
    durationModifiers: {
      skill: 'enchanting.level',
      tool: 'altar.level',
    },
    messages: {
      start: [
        'Начинаю ритуал зачарования...',
        'Произношу формулу заклинания...',
        'Вплетаю магию в металл...',
      ],
      complete: [
        'Магия впиталась в оружие.',
        'Зачарование завершено.',
        'Оружие обрело магические свойства.',
      ],
    },
  },
]

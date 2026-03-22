/**
 * Этапы сборки
 * Category: assembly
 */

import type { StageTypeDefinition } from '@/types/craft-v2'

export const assemblyStages: StageTypeDefinition[] = [
  {
    id: 'asmb_fitting',
    category: 'assembly',
    type: 'fitting',
    name: 'Подгонка',
    description: 'Согласование деталей друг с другом',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Подгоняю детали...',
        'Согласую размеры...',
        'Проверяю совместимость...',
      ],
      complete: [
        'Детали подогнаны.',
        'Всё совпадает.',
        'Можно собирать.',
      ],
    },
  },
  {
    id: 'asmb_joining',
    category: 'assembly',
    type: 'joining',
    name: 'Соединение',
    description: 'Сборка частей в единое целое',
    baseDuration: 40,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Собираю части...',
        'Соединяю детали...',
        'Собираю оружие...',
      ],
      complete: [
        'Части соединены.',
        'Оружие собрано.',
        'Основная сборка завершена.',
      ],
    },
  },
  {
    id: 'asmb_riveting',
    category: 'assembly',
    type: 'riveting',
    name: 'Клёпка',
    description: 'Закрепление деталей заклёпками',
    baseDuration: 30,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Клепаю детали...',
        'Устанавливаю заклёпки...',
        'Скрепляю части...',
      ],
      complete: [
        'Заклёпки установлены.',
        'Детали надёжно скреплены.',
        'Клёпка завершена.',
      ],
    },
  },
  {
    id: 'asmb_welding',
    category: 'assembly',
    type: 'welding',
    name: 'Кузнечная сварка',
    description: 'Соединение металлов в горне',
    baseDuration: 45,
    durationModifiers: {
      skill: 'blacksmith.level',
      tool: 'forge.level',
    },
    messages: {
      start: [
        'Свариваю металлы...',
        'Соединяю в горне...',
        'Сплавляю части...',
      ],
      complete: [
        'Металлы сварены.',
        'Монолитное соединение.',
        'Сварка завершена.',
      ],
    },
  },
  {
    id: 'asmb_wrapping',
    category: 'assembly',
    type: 'wrapping',
    name: 'Обмотка',
    description: 'Обмотка рукояти кожей',
    baseDuration: 20,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Обматываю рукоять...',
        'Накладываю кожу...',
        'Делаю обмотку...',
      ],
      complete: [
        'Рукоять обмотана.',
        'Кожа закреплена.',
        'Удобный хват готов.',
      ],
    },
  },
  {
    id: 'asmb_balancing',
    category: 'assembly',
    type: 'balancing',
    name: 'Балансировка',
    description: 'Выравнивание веса и центра тяжести',
    baseDuration: 25,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Выравниваю баланс...',
        'Настриваю центр тяжести...',
        'Балансирую оружие...',
      ],
      complete: [
        'Баланс идеальный.',
        'Центр тяжести в нужном месте.',
        'Оружие лежит в руке.',
      ],
    },
  },
  {
    id: 'asmb_tempering_asm',
    category: 'assembly',
    type: 'tempering',
    name: 'Отпуск',
    description: 'Снятие напряжений после сборки',
    baseDuration: 20,
    durationModifiers: {
      skill: 'blacksmith.level',
    },
    messages: {
      start: [
        'Делаю отпуск...',
        'Снимаю напряжения...',
        'Нагреваю для стабилизации...',
      ],
      complete: [
        'Напряжения сняты.',
        'Металл стабилизирован.',
        'Отпуск завершён.',
      ],
    },
  },
]

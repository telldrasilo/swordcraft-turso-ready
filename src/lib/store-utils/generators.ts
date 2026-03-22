/**
 * Store Utilities - Generators
 * Функции генерации ID, имён и других данных
 */

// ================================
// ГЕНЕРАЦИЯ ID
// ================================

/**
 * Генерация уникального ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

/**
 * Генерация ID с префиксом
 */
export function generateIdWithPrefix(prefix: string): string {
  return `${prefix}_${generateId()}`
}

// ================================
// ГЕНЕРАЦИЯ ИМЁН
// ================================

/** Мужские имена для рабочих */
const MALE_NAMES = [
  'Грегор', 'Иван', 'Борис', 'Виктор', 'Алексей',
  'Дмитрий', 'Николай', 'Пётр', 'Сергей', 'Андрей',
  'Михаил', 'Артём', 'Максим', 'Владимир', 'Павел'
]

/** Женские имена для рабочих */
const FEMALE_NAMES = [
  'Мария', 'Анна', 'Елена', 'Ольга', 'Наталья',
  'Екатерина', 'Татьяна', 'Ирина', 'Светлана', 'Юлия'
]

/**
 * Генерация случайного имени рабочего
 */
export function generateWorkerName(): string {
  const allNames = [...MALE_NAMES, ...FEMALE_NAMES]
  return allNames[Math.floor(Math.random() * allNames.length)]
}

/**
 * Генерация случайного мужского имени
 */
export function generateMaleName(): string {
  return MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]
}

/**
 * Генерация случайного женского имени
 */
export function generateFemaleName(): string {
  return FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
}

// ================================
// ГЕНЕРАЦИЯ КЛИЕНТОВ ДЛЯ ЗАКАЗОВ
// ================================

/** Имена клиентов для заказов */
const CLIENT_FIRST_NAMES = [
  'Генрих', 'Вильгельм', 'Фридрих', 'Карл', 'Отто',
  'Людвиг', 'Ганс', 'Эрих', 'Вернер', 'Клаус',
  'Марта', 'Хильда', 'Герта', 'Эльза', 'Ирма'
]

const CLIENT_TITLES = [
  'купец', 'рыцарь', 'барон', 'граф', 'герцог',
  'воевода', 'капитан', 'командор', 'магистр', 'лорд',
  'горожанин', 'ремесленник', 'алхимик', 'охотник', 'странник'
]

const CLIENT_ICONS = ['👤', '🧔', '👨‍🦰', '🧙‍♂️', '🧝‍♂️', '👨‍🦳', '🤴', '💂‍♂️']

/**
 * Генерация случайного клиента для заказа
 */
export function generateClientName(): { name: string; title: string; icon: string } {
  const name = CLIENT_FIRST_NAMES[Math.floor(Math.random() * CLIENT_FIRST_NAMES.length)]
  const title = CLIENT_TITLES[Math.floor(Math.random() * CLIENT_TITLES.length)]
  const icon = CLIENT_ICONS[Math.floor(Math.random() * CLIENT_ICONS.length)]
  return { name, title, icon }
}

// ================================
// ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЗНАЧЕНИЙ
// ================================

/**
 * Случайное число в диапазоне (включая границы)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Случайное число с плавающей точкой в диапазоне
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Случайный элемент из массива
 */
export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Случайный булев с вероятностью (0-100)
 */
export function randomChance(probability: number): boolean {
  return Math.random() * 100 < probability
}

// ================================
// ГЕНЕРАЦИЯ СТАТИСТИКИ
// ================================

/**
 * Генерация случайного бонуса к статистике при повышении уровня
 * @returns множитель от 1.02 до 1.05
 */
export function generateStatBonus(): number {
  return 1 + (0.02 + Math.random() * 0.03)
}

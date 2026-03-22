/**
 * Данные для генерации имён искателей приключений
 */

// Префиксы имён (начальные слоги/части)
export const namePrefixes = [
  'Ал', 'Бел', 'Вор', 'Гар', 'Дар', 'Жал', 'Зар', 'Кал', 'Лар', 'Мар',
  'Нар', 'Ор', 'Рал', 'Сар', 'Тор', 'Ул', 'Фар', 'Хал', 'Шар', 'Эл',
  'Гор', 'Дор', 'Кор', 'Мор', 'Нор', 'Рор', 'Сор', 'Вар', 'Кар', 'Тар',
  'Бар', 'Вел', 'Гел', 'Дел', 'Зел', 'Кел', 'Мел', 'Нел', 'Рел', 'Сел',
]

// Суффиксы имён (конечные слоги/части)
export const nameSuffixes = [
  'рик', 'вин', 'гард', 'стан', 'мир', 'слав', 'волк', 'медведь', 'орёл',
  'гар', 'дар', 'мар', 'нар', 'сар', 'тар', 'хан', 'ван', 'лан', 'ран',
  'рик', 'лик', 'мик', 'ник', 'сик', 'тик', 'вик', 'зик', 'кик',
  'ия', 'ея', 'ая', 'оя', 'уя', 'ыя', 'ия', 'ла', 'на', 'ра',
]

// Женские префиксы
export const femalePrefixes = [
  'Ана', 'Бел', 'Вес', 'Гел', 'Дар', 'Ела', 'Жан', 'Зар', 'Ина', 'Кар',
  'Лил', 'Май', 'Нар', 'Оль', 'Роз', 'Сел', 'Тар', 'Урс', 'Фей', 'Эла',
]

// Женские суффиксы
export const femaleSuffixes = [
  'на', 'ра', 'та', 'яна', 'ина', 'еля', 'алия', 'иса', 'ея', 'ора',
]

// Титулы для искателей
export const titles = {
  common: [
    'Смельчак', 'Странник', 'Бродяга', 'Охотник', 'Следопыт',
    'Скиталец', 'Путник', 'Искатель', 'Стрелок', 'Воин',
  ],
  uncommon: [
    'Удачливый', 'Отважный', 'Стальной', 'Быстрый', 'Меткий',
    'Хитрый', 'Сильный', 'Ловкий', 'Мудрый', 'Стойкий',
  ],
  rare: [
    'Драконобоец', 'Титаноборец', 'Герой', 'Легенда', 'Чемпион',
    'Покоритель', 'Победитель', 'Завоеватель', 'Властелин', 'Мастер',
    'Теневой', 'Призрачный', 'Бесстрашный', 'Неустрашимый', 'Бессмертный',
  ],
  legendary: [
    'Богатырь', 'Избранный', 'Спаситель', 'Великий', 'Непобедимый',
    'Легендарный', 'Святой', 'Проклятый', 'Вечный', 'Божественный',
  ],
}

// Прозвища (персональные особенности)
export const nicknames = [
  'Одноглазый', 'Хромой', 'Шрам', 'Седой', 'Рыжий',
  'Чёрный', 'Белый', 'Молчаливый', 'Громкий', 'Дикий',
  'Железнорукий', 'Сердитый', 'Весёлый', 'Грустный', 'Храбрый',
  'Ночной', 'Дневной', 'Утренний', 'Вечерний', 'Полуночный',
]

// Полные имена известных искателей (для особых случаев)
export const legendaryNames = [
  'Александр Великий',
  'Елена Прекрасная',
  'Дмитрий Драконоборец',
  'Анна Ночь',
  'Сергей Стальной',
  'Мария Смертоносная',
  'Николай Непобедимый',
]

// Функция генерации случайного имени
export function generateRandomName(gender?: 'male' | 'female'): string {
  const isFemale = gender ?? (Math.random() > 0.6 ? false : true) // 60% мужских имён

  if (isFemale) {
    const prefix = femalePrefixes[Math.floor(Math.random() * femalePrefixes.length)]
    const suffix = femaleSuffixes[Math.floor(Math.random() * femaleSuffixes.length)]
    return prefix + suffix
  } else {
    const prefix = namePrefixes[Math.floor(Math.random() * namePrefixes.length)]
    const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]
    return prefix + suffix
  }
}

// Функция генерации титула
export function generateTitle(skillLevel: number): string | undefined {
  // Чем выше навык, тем выше шанс крутого титула
  const roll = Math.random()

  if (skillLevel >= 25 && roll < 0.1) {
    return titles.legendary[Math.floor(Math.random() * titles.legendary.length)]
  }

  if (skillLevel >= 20 && roll < 0.25) {
    return titles.rare[Math.floor(Math.random() * titles.rare.length)]
  }

  if (skillLevel >= 10 && roll < 0.4) {
    return titles.uncommon[Math.floor(Math.random() * titles.uncommon.length)]
  }

  if (roll < 0.5) {
    return titles.common[Math.floor(Math.random() * titles.common.length)]
  }

  // Без титула
  return undefined
}

// Функция генерации прозвища
export function generateNickname(): string | undefined {
  // 20% шанс прозвища
  if (Math.random() < 0.2) {
    return nicknames[Math.floor(Math.random() * nicknames.length)]
  }
  return undefined
}

// Полная генерация имени искателя
export function generateAdventurerName(skillLevel: number): { name: string; title?: string; nickname?: string } {
  const gender: 'male' | 'female' = Math.random() > 0.4 ? 'male' : 'female'
  const name = generateRandomName(gender)
  const title = generateTitle(skillLevel)
  const nickname = generateNickname()

  return { name, title, nickname }
}

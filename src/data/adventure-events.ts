/**
 * Система случайных событий для вылазок в SwordCraft: Idle Forge
 * 
 * События собираются из частей на основе тегов приключения,
 * уровня оружия и уровня искателя приключений.
 */

import { AdventureTag, AdventureDifficulty } from './adventures'

// ================================
// ТИПЫ
// ================================

export type EventType = 
  | 'combat'      // Бой
  | 'treasure'    // Сокровище
  | 'encounter'   // Встреча
  | 'choice'      // Выбор
  | 'trap'        // Ловушка
  | 'discovery'   // Открытие
  | 'ambush'      // Засада
  | 'puzzle'      // Головоломка
  | 'rescue'      // Спасение

export type EventOutcome = 
  | 'victory'     // Победа
  | 'defeat'      // Поражение
  | 'escape'      // Побег
  | 'negotiate'   // Переговоры
  | 'treasure'    // Сокровище найдено
  | 'trap'        // Попадание в ловушку
  | 'discovery'   // Открытие

export interface EventReward {
  gold?: number
  soulEssence?: number
  bonusItems?: { resource: string; amount: number }[]
  fame?: number
}

export interface EventPenalty {
  gold?: number
  soulEssence?: number
  stamina?: number
  weaponDurability?: number
}

export interface EventChoice {
  id: string
  text: string
  requiredWeaponLevel?: number
  requiredWeaponType?: string
  outcome: EventOutcome
  reward?: EventReward
  penalty?: EventPenalty
  successChance: number // 0-1
  description: string
}

export interface AdventureEvent {
  id: string
  type: EventType
  title: string
  description: string
  // Теги, которые делают событие более вероятным
  preferredTags: AdventureTag[]
  // Теги, которые делают событие невозможным
  excludedTags?: AdventureTag[]
  // Требования к сложности приключения
  minDifficulty?: AdventureDifficulty
  maxDifficulty?: AdventureDifficulty
  // Требования к оружию
  minWeaponLevel: number
  maxWeaponLevel?: number
  // Вес события (влияет на вероятность)
  weight: number
  // Является ли событие "эпическим"
  isEpic?: boolean
  // Варианты выбора (для типа 'choice')
  choices?: EventChoice[]
  // Награда по умолчанию
  defaultReward?: EventReward
  // Штраф по умолчанию
  defaultPenalty?: EventPenalty
  // Текст результатов
  victoryText?: string
  defeatText?: string
  // Иконка
  icon: string
}

// ================================
// ЧАСТИ СОБЫТИЙ (Конструктор)
// ================================

// Враги
const enemies = {
  // Обычные
  goblin: { name: 'Гоблин', power: 1, icon: '👺' },
  wolf: { name: 'Волк', power: 2, icon: '🐺' },
  bandit: { name: 'Разбойник', power: 2, icon: '🗡️' },
  spider: { name: 'Паук', power: 3, icon: '🕷️' },
  skeleton: { name: 'Скелет', power: 3, icon: '💀' },
  zombie: { name: 'Зомби', power: 4, icon: '🧟' },
  // Сильные
  orc: { name: 'Орк', power: 5, icon: '👹' },
  wraith: { name: 'Призрак', power: 6, icon: '👻' },
  troll: { name: 'Тролль', power: 7, icon: '🧌' },
  ogre: { name: 'Огр', power: 8, icon: '👾' },
  vampire: { name: 'Вампир', power: 9, icon: '🧛' },
  // Боссы
  dragon: { name: 'Дракон', power: 15, icon: '🐉' },
  lich: { name: 'Лич', power: 12, icon: '💀' },
  demon: { name: 'Демон', power: 14, icon: '😈' },
  titan: { name: 'Страж титана', power: 18, icon: '🗿' },
}

// ================================
// СПИСОК СОБЫТИЙ
// ================================

export const adventureEvents: AdventureEvent[] = [
  // === БОЕВЫЕ СОБЫТИЯ ===
  {
    id: 'goblin_ambush',
    type: 'combat',
    title: 'Засада гоблинов!',
    description: 'Гоблины выпрыгнули из темноты! Они хотят вашё оружие!',
    preferredTags: ['cave', 'forest', 'underground'],
    minWeaponLevel: 1,
    weight: 10,
    defaultReward: { gold: 20 },
    defaultPenalty: { stamina: 10 },
    victoryText: 'Вы легко расправились с гоблинами!',
    defeatText: 'Гоблины оказались хитрее и сбежали с частью добычи.',
    icon: '👺',
  },
  {
    id: 'wolf_pack',
    type: 'combat',
    title: 'Стая волков',
    description: 'Светящиеся глаза в темноте... Стая волков окружает вас!',
    preferredTags: ['forest', 'night', 'mountain'],
    minWeaponLevel: 1,
    weight: 8,
    defaultReward: { gold: 15 },
    defaultPenalty: { stamina: 15 },
    victoryText: 'Волки отступили, признав вашу силу.',
    defeatText: 'Волки загнали вас в угол, но вы смогли сбежать.',
    icon: '🐺',
  },
  {
    id: 'skeleton_warrior',
    type: 'combat',
    title: 'Скелет-воин',
    description: 'Древний воин восстал из мёртвых! Его меч всё ещё остр.',
    preferredTags: ['undead', 'graveyard', 'dungeon', 'ruins'],
    minWeaponLevel: 3,
    weight: 6,
    defaultReward: { gold: 50, bonusItems: [{ resource: 'iron', amount: 3 }] },
    defaultPenalty: { stamina: 20, gold: 10 },
    victoryText: 'Скелет рассыпался, оставив после себя лишь кости и старый меч.',
    defeatText: 'Удар скелета отбросил вас назад, но вы устояли.',
    icon: '💀',
  },
  {
    id: 'bandit_leader',
    type: 'combat',
    title: 'Главарь разбойников',
    description: 'Главарь разбойников преграждает путь. "Золото или жизнь!"',
    preferredTags: ['bandits', 'forest', 'village'],
    excludedTags: ['undead'],
    minWeaponLevel: 4,
    weight: 5,
    choices: [
      {
        id: 'fight',
        text: 'Сразиться!',
        outcome: 'victory',
        successChance: 0.7,
        reward: { gold: 100, fame: 5 },
        penalty: { stamina: 30 },
        description: 'Вы победили главаря!',
      },
      {
        id: 'negotiate',
        text: 'Договориться',
        outcome: 'negotiate',
        successChance: 0.5,
        reward: { fame: 2 },
        penalty: { gold: 30 },
        description: 'Вы откупились от разбойников.',
      },
    ],
    icon: '🗡️',
  },
  {
    id: 'giant_spider',
    type: 'combat',
    title: 'Гигантский паук',
    description: 'Огромный паук спустился с потолка! Его яд смертелен.',
    preferredTags: ['cave', 'forest', 'haunted'],
    minWeaponLevel: 5,
    weight: 5,
    defaultReward: { gold: 80 },
    defaultPenalty: { stamina: 35, weaponDurability: 5 },
    victoryText: 'Вы пронзили паука прямо в центр его тела!',
    defeatText: 'Яд паука ослабил вас, но вы смогли вырваться.',
    icon: '🕷️',
  },
  {
    id: 'wraith_encounter',
    type: 'combat',
    title: 'Страж-призрак',
    description: 'Прозрачная фигура преграждает путь. Её прикосновение — лёд.',
    preferredTags: ['haunted', 'undead', 'castle', 'graveyard'],
    minWeaponLevel: 7,
    weight: 4,
    isEpic: true,
    defaultReward: { gold: 150, fame: 10 },
    defaultPenalty: { stamina: 50 },
    victoryText: 'Призрак рассеялся, оставив холодный след.',
    defeatText: 'Хватка призрака едва не стоила вам жизни.',
    icon: '👻',
  },
  {
    id: 'orc_raider',
    type: 'combat',
    title: 'Налётчик-орк',
    description: 'Массивный орк с огромной палицей! Он жаждет боя.',
    preferredTags: ['mountain', 'forest', 'bandits'],
    excludedTags: ['undead'],
    minWeaponLevel: 6,
    weight: 4,
    defaultReward: { gold: 120, bonusItems: [{ resource: 'iron', amount: 5 }] },
    defaultPenalty: { stamina: 40, weaponDurability: 10 },
    victoryText: 'Орк пал! Его сокровища ваши.',
    defeatText: 'Удар орка выбил оружие из рук, но вы успели подхватить его.',
    icon: '👹',
  },
  {
    id: 'vampire_lord',
    type: 'combat',
    title: 'Владыка вампиров',
    description: 'Благородный на вид... Но клыки выдают его суть.',
    preferredTags: ['castle', 'haunted', 'night', 'undead'],
    minWeaponLevel: 9,
    weight: 3,
    isEpic: true,
    defaultReward: { gold: 300, fame: 20 },
    defaultPenalty: { stamina: 60 },
    victoryText: 'Вампир обратился в пыль на рассвете... Ну, почти.',
    defeatText: 'Вампир выпил вашу кровь, но солнце заставило его отступить.',
    icon: '🧛',
  },
  {
    id: 'dragon_encounter',
    type: 'combat',
    title: 'Древний дракон',
    description: 'Его чешуя блестит как металл. Его глаза — как раскалённые угли.',
    preferredTags: ['cave', 'mountain', 'ancient', 'treasure_hunt'],
    minWeaponLevel: 12,
    weight: 2,
    isEpic: true,
    choices: [
      {
        id: 'fight',
        text: 'Напасть!',
        minWeaponLevel: 15,
        outcome: 'victory',
        successChance: 0.3,
        reward: { gold: 1000, fame: 50, bonusItems: [{ resource: 'mithril', amount: 5 }] },
        penalty: { stamina: 100, weaponDurability: 30 },
        description: 'Невероятная победа над драконом!',
      },
      {
        id: 'steal',
        text: 'Украсть сокровище',
        outcome: 'escape',
        successChance: 0.5,
        reward: { gold: 300 },
        penalty: { stamina: 40 },
        description: 'Вы украли часть сокровищ, пока дракон спал.',
      },
      {
        id: 'negotiate',
        text: 'Попробовать договориться',
        outcome: 'negotiate',
        successChance: 0.2,
        reward: { gold: 200 },
        penalty: { gold: 50 },
        description: 'Дракон согласился на... дань.',
      },
    ],
    icon: '🐉',
  },
  {
    id: 'demon_prince',
    type: 'combat',
    title: 'Принц демонов',
    description: 'Существо из другого мира. Его форма постоянно меняется.',
    preferredTags: ['magic', 'ancient', 'haunted'],
    minWeaponLevel: 15,
    weight: 1,
    isEpic: true,
    defaultReward: { gold: 800, fame: 100 },
    defaultPenalty: { stamina: 100 },
    victoryText: 'Демон изгнан! Портал закрыт.',
    defeatText: 'Демон почти поглотил вашу душу, но вы вырвались.',
    icon: '😈',
  },

  // === СОКРОВИЩА ===
  {
    id: 'hidden_chest',
    type: 'treasure',
    title: 'Спрятанный сундук',
    description: 'Вы заметили выступающий из земли угол сундука.',
    preferredTags: ['exploration', 'treasure_hunt', 'ruins', 'cave'],
    minWeaponLevel: 1,
    weight: 8,
    defaultReward: { gold: 50, bonusItems: [{ resource: 'iron', amount: 5 }] },
    icon: '📦',
  },
  {
    id: 'ancient_vault',
    type: 'treasure',
    title: 'Древнее хранилище',
    description: 'Дверь с древними рунами... Она открывается вашим оружием!',
    preferredTags: ['ancient', 'ruins', 'treasure_hunt', 'dungeon'],
    minWeaponLevel: 6,
    weight: 4,
    isEpic: true,
    defaultReward: { 
      gold: 200, 
      
      bonusItems: [
        { resource: 'silver', amount: 10 },
        { resource: 'goldOre', amount: 3 },
      ],
      fame: 5,
    },
    icon: '🗝️',
  },
  {
    id: 'dragon_hoard',
    type: 'treasure',
    title: 'Клад дракона',
    description: 'Гора золота! Это легендарный клад древнего дракона.',
    preferredTags: ['ancient', 'treasure_hunt', 'dragon'],
    minWeaponLevel: 10,
    weight: 2,
    isEpic: true,
    defaultReward: { 
      gold: 500, 
      
      bonusItems: [
        { resource: 'goldOre', amount: 10 },
        { resource: 'mithril', amount: 2 },
      ],
      fame: 15,
    },
    icon: '💎',
  },

  // === ВСТРЕЧИ ===
  {
    id: 'wounded_adventurer',
    type: 'encounter',
    title: 'Раненый искатель',
    description: 'Израненный искатель приключений лежит у стены. "Помоги..."',
    preferredTags: ['dungeon', 'cave', 'forest', 'exploration'],
    excludedTags: ['undead'],
    minWeaponLevel: 1,
    weight: 6,
    choices: [
      {
        id: 'help',
        text: 'Помочь',
        outcome: 'victory',
        successChance: 0.8,
        reward: { fame: 10 },
        description: 'Вы перевязали раны. В благодарность он отдал вам свою карту сокровищ.',
      },
      {
        id: 'ignore',
        text: 'Пройти мимо',
        outcome: 'escape',
        successChance: 1,
        description: 'Вы оставили его умирать... Но это его выбор.',
      },
      {
        id: 'rob',
        text: 'Обокрасть',
        outcome: 'treasure',
        successChance: 0.9,
        reward: { gold: 50 },
        penalty: { fame: 5 },
        description: 'Вы взяли его вещи. Он был слишком слаб, чтобы сопротивляться.',
      },
    ],
    icon: '🧑‍🦯',
  },
  {
    id: 'mysterious_merchant',
    type: 'encounter',
    title: 'Таинственный торговец',
    description: '"Пссст! Искал хорошие цены? У меня есть то, что тебе нужно..."',
    preferredTags: ['exploration', 'trading', 'village'],
    excludedTags: ['undead'],
    minWeaponLevel: 3,
    weight: 5,
    choices: [
      {
        id: 'buy',
        text: 'Купить что-нибудь',
        outcome: 'treasure',
        successChance: 0.7,
        reward: { bonusItems: [{ resource: 'iron', amount: 10 }] },
        penalty: { gold: 50 },
        description: 'Вы купили странный мешочек. Внутри оказались редкие материалы!',
      },
      {
        id: 'decline',
        text: 'Отказаться',
        outcome: 'escape',
        successChance: 1,
        description: 'Торговец исчез в тенях.',
      },
    ],
    icon: '🧙',
  },
  {
    id: 'ghost_maiden',
    type: 'encounter',
    title: 'Призрачная дева',
    description: 'Прекрасная женщина в старинном платье... Полупрозрачная.',
    preferredTags: ['haunted', 'castle', 'graveyard', 'night'],
    minWeaponLevel: 5,
    weight: 4,
    choices: [
      {
        id: 'listen',
        text: 'Выслушать',
        outcome: 'discovery',
        successChance: 0.9,
        reward: { fame: 5 },
        description: 'Она рассказала историю своей смерти и указала на тайник.',
      },
      {
        id: 'attack',
        text: 'Атаковать!',
        outcome: 'victory',
        successChance: 0.5,
        reward: {  },
        penalty: { stamina: 30 },
        description: 'Призрак рассеялся, но его последним взглядом вы поняли — это было ошибкой.',
      },
    ],
    icon: '👰',
  },

  // === ЛОВУШКИ ===
  {
    id: 'pressure_plate',
    type: 'trap',
    title: 'Нажимная плита',
    description: '*ЩЁЛК!* Вы услышали звук механизма...',
    preferredTags: ['dungeon', 'cave', 'ruins', 'ancient'],
    minWeaponLevel: 1,
    weight: 8,
    defaultPenalty: { stamina: 20, gold: 10 },
    choices: [
      {
        id: 'dodge',
        text: 'Увернуться!',
        outcome: 'escape',
        successChance: 0.6,
        description: 'Вы отпрыгнули в последний момент!',
      },
      {
        id: 'block',
        text: 'Заблокировать оружием',
        minWeaponLevel: 3,
        outcome: 'victory',
        successChance: 0.7,
        penalty: { weaponDurability: 10 },
        description: 'Ваше оружие приняло удар!',
      },
    ],
    icon: '⚡',
  },
  {
    id: 'poison_needles',
    type: 'trap',
    title: 'Ядовитые иглы',
    description: 'Стены начали двигаться! Из щелей вылетают иглы!',
    preferredTags: ['dungeon', 'haunted', 'ancient'],
    minWeaponLevel: 4,
    weight: 5,
    defaultPenalty: { stamina: 40 },
    victoryText: 'Вы отразили все иглы!',
    defeatText: 'Несколько игл попали в вас. Яд ослабляет.',
    icon: '💉',
  },
  {
    id: 'collapsing_bridge',
    type: 'trap',
    title: 'Обрушающийся мост',
    description: 'Мост под ногами начал трескаться!',
    preferredTags: ['underground', 'cave', 'dungeon', 'water'],
    minWeaponLevel: 3,
    weight: 6,
    defaultPenalty: { stamina: 30, gold: 20 },
    victoryText: 'Вы успели перебежать!',
    defeatText: 'Вы упали в воду и потеряли часть вещей.',
    icon: '🌉',
  },

  // === ОТКРЫТИЯ ===
  {
    id: 'ancient_inscription',
    type: 'discovery',
    title: 'Древняя надпись',
    description: 'Странные символы на стене... Они начинают светиться!',
    preferredTags: ['ancient', 'ruins', 'magic', 'exploration'],
    minWeaponLevel: 5,
    weight: 4,
    defaultReward: { fame: 5 },
    victoryText: 'Надпись открыла вам секреты древних!',
    icon: '📜',
  },
  {
    id: 'hidden_passage',
    type: 'discovery',
    title: 'Скрытый проход',
    description: 'Книга на полке оказалась рычагом! Стена отодвинулась.',
    preferredTags: ['castle', 'dungeon', 'ruins', 'exploration'],
    minWeaponLevel: 4,
    weight: 5,
    defaultReward: { 
      gold: 100, 
      
      bonusItems: [{ resource: 'iron', amount: 8 }] 
    },
    icon: '🚪',
  },

  // === ЗАСАДЫ ===
  {
    id: 'night_ambush',
    type: 'ambush',
    title: 'Ночная засада',
    description: 'Фигуры в чёрном окружили вас со всех сторон!',
    preferredTags: ['night', 'bandits', 'forest'],
    excludedTags: ['undead'],
    minWeaponLevel: 3,
    weight: 6,
    defaultPenalty: { gold: 50, stamina: 30 },
    choices: [
      {
        id: 'fight',
        text: 'Прорываться с боем!',
        outcome: 'victory',
        successChance: 0.5,
        reward: { gold: 100 },
        penalty: { stamina: 40 },
        description: 'Вы прорвались сквозь засаду!',
      },
      {
        id: 'surrender',
        text: 'Сдаться',
        outcome: 'defeat',
        successChance: 1,
        penalty: { gold: 100 },
        description: 'Они взяли ваши деньги и ушли.',
      },
    ],
    icon: '🌙',
  },
  {
    id: 'undead_rise',
    type: 'ambush',
    title: 'Восстание мёртвых',
    description: 'Земля задрожала... Руки мертвецов пробиваются сквозь землю!',
    preferredTags: ['graveyard', 'haunted', 'undead', 'night'],
    minWeaponLevel: 6,
    weight: 4,
    defaultPenalty: { stamina: 50 },
    victoryText: 'Вы уничтожили восставших мертвецов!',
    defeatText: 'Волна мертвецов отбросила вас назад.',
    icon: '🧟',
  },

  // === ГОЛОВОЛОМКИ ===
  {
    id: 'riddle_statue',
    type: 'puzzle',
    title: 'Загадка статуи',
    description: 'Статуя говорит: "Ответь правильно или погибни!"',
    preferredTags: ['ancient', 'dungeon', 'ruins', 'magic'],
    minWeaponLevel: 4,
    weight: 4,
    defaultReward: { gold: 80 },
    defaultPenalty: { stamina: 30 },
    victoryText: 'Вы разгадали загадку! Статуя открыла тайник.',
    defeatText: 'Неверный ответ... Статуя ударила вас магией.',
    icon: '🗿',
  },
  {
    id: 'lock_puzzle',
    type: 'puzzle',
    title: 'Магический замок',
    description: 'Замок с четырьмя рунами. Нужно найти правильную комбинацию.',
    preferredTags: ['magic', 'ancient', 'treasure_hunt'],
    minWeaponLevel: 6,
    weight: 3,
    defaultReward: { gold: 150 },
    defaultPenalty: { stamina: 25 },
    victoryText: 'Замок открылся с громким щелчком!',
    defeatText: 'Замок заискрил и ударил вас током.',
    icon: '🔐',
  },

  // === СПАСЕНИЕ ===
  {
    id: 'trapped_princess',
    type: 'rescue',
    title: 'Пленённая принцесса',
    description: 'В клетке сидит молодая женщина в богатом платье.',
    preferredTags: ['castle', 'bandits', 'dungeon'],
    excludedTags: ['undead'],
    minWeaponLevel: 5,
    weight: 3,
    isEpic: true,
    choices: [
      {
        id: 'rescue',
        text: 'Спассти!',
        outcome: 'victory',
        successChance: 0.6,
        reward: { gold: 300, fame: 30 },
        penalty: { stamina: 40 },
        description: 'Принцесса благодарна! Её отец король богато наградит вас.',
      },
      {
        id: 'ignore',
        text: 'Оставить',
        outcome: 'escape',
        successChance: 1,
        penalty: { fame: 10 },
        description: 'Это не ваши проблемы.',
      },
    ],
    icon: '👸',
  },
]

// ================================
// ФУНКЦИИ
// ================================

export function getEvent(id: string): AdventureEvent | undefined {
  return adventureEvents.find(e => e.id === id)
}

// Получить возможные события для приключения
export function getPossibleEvents(
  tags: AdventureTag[],
  difficulty: AdventureDifficulty,
  weaponLevel: number
): AdventureEvent[] {
  return adventureEvents.filter(event => {
    // Проверка уровня оружия
    if (event.minWeaponLevel > weaponLevel) return false
    if (event.maxWeaponLevel && event.maxWeaponLevel < weaponLevel) return false
    
    // Проверка сложности
    if (event.minDifficulty) {
      const difficulties: AdventureDifficulty[] = ['easy', 'normal', 'hard', 'extreme', 'legendary']
      if (difficulties.indexOf(event.minDifficulty) > difficulties.indexOf(difficulty)) return false
    }
    if (event.excludedTags?.some(tag => tags.includes(tag))) return false
    
    return true
  })
}

// Взвешенный случайный выбор события
export function selectRandomEvent(
  tags: AdventureTag[],
  difficulty: AdventureDifficulty,
  weaponLevel: number
): AdventureEvent | null {
  const possible = getPossibleEvents(tags, difficulty, weaponLevel)
  if (possible.length === 0) return null
  
  // Увеличиваем вес для событий с совпадающими тегами
  const weighted = possible.map(event => {
    let weight = event.weight
    const matchingTags = event.preferredTags.filter(tag => tags.includes(tag))
    weight += matchingTags.length * 3 // Бонус за каждый совпадающий тег
    
    // Эпические события реже
    if (event.isEpic) weight *= 0.5
    
    return { event, weight }
  })
  
  const totalWeight = weighted.reduce((sum, { weight }) => sum + weight, 0)
  let random = Math.random() * totalWeight
  
  for (const { event, weight } of weighted) {
    random -= weight
    if (random <= 0) return event
  }
  
  return possible[0]
}

// Получить информацию о типе события
export function getEventTypeInfo(type: EventType): { name: string; color: string; icon: string } {
  const info = {
    combat: { name: 'Бой', color: 'text-red-400', icon: '⚔️' },
    treasure: { name: 'Сокровище', color: 'text-amber-400', icon: '💎' },
    encounter: { name: 'Встреча', color: 'text-blue-400', icon: '🤝' },
    choice: { name: 'Выбор', color: 'text-purple-400', icon: '❓' },
    trap: { name: 'Ловушка', color: 'text-orange-400', icon: '⚡' },
    discovery: { name: 'Открытие', color: 'text-green-400', icon: '🔍' },
    ambush: { name: 'Засада', color: 'text-red-400', icon: '💥' },
    puzzle: { name: 'Головоломка', color: 'text-cyan-400', icon: '🧩' },
    rescue: { name: 'Спасение', color: 'text-yellow-400', icon: '🆘' },
  }
  return info[type]
}

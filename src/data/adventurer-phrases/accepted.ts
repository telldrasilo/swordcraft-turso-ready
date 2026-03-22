/**
 * Фразы согласия искателей
 */

import type { PhraseTemplate } from '@/types/adventurer-extended'

export const acceptedPhrases: PhraseTemplate[] = [
  // === ОБЩИЕ ===
  {
    id: 'accept_default',
    tags: ['default'],
    type: 'accepted',
    template: 'Отлично! Это как раз для меня.'
  },
  {
    id: 'accept_simple',
    tags: ['default'],
    type: 'accepted',
    template: 'Выглядит неплохо. Я берусь.'
  },
  {
    id: 'accept_okay',
    tags: ['default'],
    type: 'accepted',
    template: 'Почему бы и нет? Я в деле.'
  },
  
  // === ПО ПОЛУ ===
  {
    id: 'accept_male_simple',
    tags: ['default'],
    gender: 'male',
    type: 'accepted',
    template: 'Дело сделано. Я согласен.'
  },
  {
    id: 'accept_female_simple',
    tags: ['default'],
    gender: 'female',
    type: 'accepted',
    template: 'Дело сделано. Я согласна.'
  },
  
  // === ХРАБРЫЙ ===
  {
    id: 'accept_brave_1',
    tags: ['brave'],
    type: 'accepted',
    template: 'Вызов принят! Я готов к делу.'
  },
  {
    id: 'accept_brave_2',
    tags: ['brave'],
    type: 'accepted',
    template: 'Опасность? Прекрасно! Это то, что мне нужно.'
  },
  {
    id: 'accept_brave_hard',
    tags: ['brave'],
    type: 'accepted',
    template: 'Чем сложнее миссия, тем славнее победа!'
  },
  
  // === АЛЧНЫЙ ===
  {
    id: 'accept_greedy_1',
    tags: ['greedy'],
    type: 'accepted',
    template: 'Золото звучит заманчиво! Я в деле.'
  },
  {
    id: 'accept_greedy_2',
    tags: ['greedy'],
    type: 'accepted',
    template: 'Хм, плата достойная. Согласен.'
  },
  {
    id: 'accept_greedy_3',
    tags: ['greedy', 'mercenary'],
    type: 'accepted',
    template: 'За такую цену я сделаю всё в лучшем виде.'
  },
  
  // === ВЕТЕРАН ===
  {
    id: 'accept_veteran_1',
    tags: ['veteran'],
    type: 'accepted',
    template: 'Я видел и не такое. Справимся.'
  },
  {
    id: 'accept_veteran_2',
    tags: ['veteran'],
    type: 'accepted',
    template: 'За годы службы я научился справляться с подобным.'
  },
  {
    id: 'accept_veteran_3',
    tags: ['veteran', 'veteran_guild'],
    type: 'accepted',
    template: 'Старая школа ещё умеет удивлять. Берусь.'
  },
  
  // === АМБИЦИОЗНЫЙ ===
  {
    id: 'accept_ambitious_hard',
    tags: ['ambitious'],
    type: 'accepted',
    template: 'Наконец-то что-то достойное моих талантов!'
  },
  {
    id: 'accept_ambitious_challenge',
    tags: ['ambitious', 'challenge'],
    type: 'accepted',
    template: 'Именно такой вызов я искал!'
  },
  
  // === ИСКАТЕЛЬ СЛАВЫ ===
  {
    id: 'accept_glory_1',
    tags: ['glory_seeker'],
    type: 'accepted',
    template: 'Эта миссия принесёт мне славу! Согласен.'
  },
  {
    id: 'accept_glory_legendary',
    tags: ['glory_seeker'],
    type: 'accepted',
    template: 'Легендарная миссия?! Это мой шанс войти в историю!'
  },
  
  // === БЕЗРАССУДНЫЙ ===
  {
    id: 'accept_reckless_1',
    tags: ['reckless'],
    type: 'accepted',
    template: 'Риск? Пф! Обожаю опасность!'
  },
  {
    id: 'accept_reckless_2',
    tags: ['reckless'],
    type: 'accepted',
    template: 'Звучит безумно! Я как раз такой.'
  },
  {
    id: 'accept_reckless_3',
    tags: ['reckless'],
    type: 'accepted',
    template: 'Чем безумнее, тем лучше! Поехали!'
  },
  
  // === ОСТОРОЖНЫЙ (на лёгкие миссии) ===
  {
    id: 'accept_cautious_easy',
    tags: ['cautious'],
    type: 'accepted',
    template: 'Выглядит достаточно безопасно. Я берусь.'
  },
  {
    id: 'accept_cautious_1',
    tags: ['cautious', 'safety'],
    type: 'accepted',
    template: 'Небольшой риск, хорошая награда. Годится.'
  },
  
  // === НАЁМНИК ===
  {
    id: 'accept_mercenary_1',
    tags: ['mercenary'],
    type: 'accepted',
    template: 'Плата устраивает. Договорились.'
  },
  {
    id: 'accept_mercenary_2',
    tags: ['mercenary'],
    type: 'accepted',
    template: 'Золото на стол — работа сделана.'
  },
  
  // === БЛАГОРОДНЫЙ ===
  {
    id: 'accept_honourable_1',
    tags: ['honourable'],
    type: 'accepted',
    template: 'Благородное дело. Я помогу.'
  },
  {
    id: 'accept_honourable_2',
    tags: ['honourable', 'duty'],
    type: 'accepted',
    template: 'Это правильный поступок. Считайте, что уже сделано.'
  },
  {
    id: 'accept_honourable_protect',
    tags: ['honourable'],
    type: 'accepted',
    template: 'Защитить невинных? Это мой долг.'
  },
  
  // === ЛЕНИВЫЙ (на короткие миссии) ===
  {
    id: 'accept_lazy_short',
    tags: ['lazy'],
    type: 'accepted',
    template: 'Быстро и просто? Подходит.'
  },
  {
    id: 'accept_lazy_easy',
    tags: ['lazy'],
    type: 'accepted',
    template: 'Хм, недалеко и несложно... Ладно, согласен.'
  },
  
  // === НОВИЧОК ===
  {
    id: 'accept_newcomer_1',
    tags: ['newcomer'],
    type: 'accepted',
    template: 'Это отличная возможность проявить себя!'
  },
  {
    id: 'accept_newcomer_2',
    tags: ['newcomer'],
    type: 'accepted',
    template: 'Мой шанс показать, на что я способен!'
  },
  
  // === ИЗГНАННИК ===
  {
    id: 'accept_outcast_1',
    tags: ['outcast'],
    type: 'accepted',
    template: 'Работа есть работа. Согласен.'
  },
  {
    id: 'accept_outcast_2',
    tags: ['outcast'],
    type: 'accepted',
    template: 'Не многие дали бы мне шанс. Я сделаю это.'
  },
  
  // === ПРОСТОЛЮДИН ===
  {
    id: 'accept_peasant_1',
    tags: ['peasant'],
    type: 'accepted',
    template: 'Работа как работа. Берусь.'
  },
  {
    id: 'accept_peasant_2',
    tags: ['peasant'],
    type: 'accepted',
    template: 'Честная работа за честную плату. Годится.'
  },
  
  // === ДВОРЯНИН ===
  {
    id: 'accept_noble_1',
    tags: ['noble'],
    type: 'accepted',
    template: 'Это соответствует моему статусу. Согласен.'
  },
  {
    id: 'accept_noble_2',
    tags: ['noble'],
    type: 'accepted',
    template: 'Достойное поручение для человека моего положения.'
  },
  
  // === ЗАГАДОЧНЫЙ ===
  {
    id: 'accept_mysterious_1',
    tags: ['mysterious'],
    type: 'accepted',
    template: 'Интересно... Я берусь.'
  },
  {
    id: 'accept_mysterious_2',
    tags: ['mysterious'],
    type: 'accepted',
    template: 'Судьба привела меня сюда. Согласен.'
  }
]

// Функция получения фраз согласия по тэгам
export function getAcceptedPhrasesByTags(tags: string[]): PhraseTemplate[] {
  const matching = acceptedPhrases.filter(p => 
    p.tags.some(tag => tags.includes(tag))
  )
  return matching.length > 0 ? matching : acceptedPhrases.filter(p => p.tags.includes('default'))
}

// Функция получения случайной фразы согласия
export function getRandomAcceptedPhrase(allTags: string[], gender?: 'male' | 'female'): PhraseTemplate {
  let phrases = getAcceptedPhrasesByTags(allTags)
  
  // Фильтрация по полу
  if (gender) {
    const genderSpecific = phrases.filter(p => p.gender === gender || p.gender === 'any' || !p.gender)
    if (genderSpecific.length > 0) {
      phrases = genderSpecific
    }
  }
  
  return phrases[Math.floor(Math.random() * phrases.length)]
}

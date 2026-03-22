/**
 * Фразы подхода и размышления искателей
 */

import type { PhraseTemplate } from '@/types/adventurer-extended'

// === ФРАЗЫ ПОДХОДА ===
export const approachingPhrases: PhraseTemplate[] = [
  // Общие
  {
    id: 'approach_default',
    tags: ['default'],
    type: 'approaching',
    template: '{name} подходит к доске объявлений...'
  },
  {
    id: 'approach_notice',
    tags: ['default'],
    type: 'approaching',
    template: '{name} замечает ваше предложение...'
  },
  {
    id: 'approach_see',
    tags: ['default'],
    type: 'approaching',
    template: '{name} видит объявление о миссии...'
  },
  
  // Интерес
  {
    id: 'approach_interested',
    tags: ['curious', 'newcomer'],
    type: 'approaching',
    template: '{name} с интересом изучает предложение...'
  },
  {
    id: 'approach_curious',
    tags: ['curious'],
    type: 'approaching',
    template: '{name} заинтригован объявлением...'
  },
  
  // Внимательность
  {
    id: 'approach_thoughtful',
    tags: ['veteran', 'cautious'],
    type: 'approaching',
    template: '{name} внимательно читает условия миссии...'
  },
  {
    id: 'approach_careful',
    tags: ['cautious', 'survivor'],
    type: 'approaching',
    template: '{name} тщательно изучает детали...'
  },
  
  // Азарт
  {
    id: 'approach_excited',
    tags: ['reckless', 'brave'],
    type: 'approaching',
    template: '{name} загорается при виде задания...'
  },
  {
    id: 'approach_eager',
    tags: ['ambitious', 'glory_seeker'],
    type: 'approaching',
    template: '{name} спешит к доске объявлений...'
  },
  
  // Расчёт
  {
    id: 'approach_calculating',
    tags: ['mercenary', 'greedy'],
    type: 'approaching',
    template: '{name} оценивает выгоду предложения...'
  },
  
  // Скука
  {
    id: 'approach_bored',
    tags: ['lazy'],
    type: 'approaching',
    template: '{name} лениво просматривает объявления...'
  },
  
  // Презрение
  {
    id: 'approach_arrogant',
    tags: ['arrogant', 'noble', 'famous'],
    type: 'approaching',
    template: '{name} надменно смотрит на предложение...'
  },
  
  // Загадочность
  {
    id: 'approach_mysterious',
    tags: ['mysterious'],
    type: 'approaching',
    template: '{name} таинственно появляется из тени...'
  }
]

// === ФРАЗЫ РАЗМЫШЛЕНИЯ ===
export const thinkingPhrases: PhraseTemplate[] = [
  // Общие
  {
    id: 'think_default',
    tags: ['default'],
    type: 'considering',
    template: '{name} размышляет...'
  },
  {
    id: 'think_decide',
    tags: ['default'],
    type: 'considering',
    template: '{name} принимает решение...'
  },
  {
    id: 'think_thinking',
    tags: ['default'],
    type: 'considering',
    template: '{name} думает...'
  },
  
  // Расчёт
  {
    id: 'think_calculating',
    tags: ['mercenary', 'greedy'],
    type: 'considering',
    template: '{name} подсчитывает выгоду...'
  },
  {
    id: 'think_gold',
    tags: ['greedy'],
    type: 'considering',
    template: '{name} прикидывает, сколько заработает...'
  },
  
  // Колебания
  {
    id: 'think_hesitant',
    tags: ['cautious', 'survivor', 'coward'],
    type: 'considering',
    template: '{name} колеблется...'
  },
  {
    id: 'think_uncertain',
    tags: ['cautious', 'newcomer'],
    type: 'considering',
    template: '{name} не уверен{na}...'
  },
  {
    id: 'think_afraid',
    tags: ['coward', 'superstitious'],
    type: 'considering',
    template: '{name} выглядит испуганно{na}...'
  },
  
  // Интерес
  {
    id: 'think_interested',
    tags: ['curious', 'ambitious'],
    type: 'considering',
    template: '{name} обдумывает возможности...'
  },
  {
    id: 'think_excited',
    tags: ['brave', 'reckless'],
    type: 'considering',
    template: '{name} едва сдерживает энтузиазм...'
  },
  
  // Скука
  {
    id: 'think_bored',
    tags: ['lazy'],
    type: 'considering',
    template: '{name} зевает, размышляя...'
  },
  
  // Опыт
  {
    id: 'think_veteran',
    tags: ['veteran', 'veteran_guild'],
    type: 'considering',
    template: '{name} вспоминает прошлый опыт...'
  },
  
  // Благородство
  {
    id: 'think_honourable',
    tags: ['honourable', 'duty'],
    type: 'considering',
    template: '{name} взвешивает моральные аспекты...'
  }
]

// Функция получения случайной фразы подхода
export function getRandomApproachingPhrase(allTags: string[]): PhraseTemplate {
  const matching = approachingPhrases.filter(p => 
    p.tags.some(tag => allTags.includes(tag))
  )
  const phrases = matching.length > 0 ? matching : approachingPhrases.filter(p => p.tags.includes('default'))
  return phrases[Math.floor(Math.random() * phrases.length)]
}

// Функция получения случайной фразы размышления
export function getRandomThinkingPhrase(allTags: string[], gender?: 'male' | 'female'): PhraseTemplate {
  const matching = thinkingPhrases.filter(p => 
    p.tags.some(tag => allTags.includes(tag))
  )
  let phrases = matching.length > 0 ? matching : thinkingPhrases.filter(p => p.tags.includes('default'))
  
  if (gender) {
    const genderSpecific = phrases.filter(p => p.gender === gender || p.gender === 'any' || !p.gender)
    if (genderSpecific.length > 0) {
      phrases = genderSpecific
    }
  }
  
  return phrases[Math.floor(Math.random() * phrases.length)]
}

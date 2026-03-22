/**
 * Индекс модуля фраз искателей
 */

export * from './accepted'
export * from './declined'
export * from './approaching'

// Реэкспорт типов
import type { PhraseTemplate, PhraseType, Gender } from '@/types/adventurer-extended'

// Объединённая функция получения фразы
export function getPhrase(
  type: PhraseType,
  allTags: string[],
  gender?: Gender
): PhraseTemplate {
  switch (type) {
    case 'accepted':
      const { getRandomAcceptedPhrase } = require('./accepted')
      return getRandomAcceptedPhrase(allTags, gender)
    case 'declined':
      const { getRandomDeclinedPhrase } = require('./declined')
      return getRandomDeclinedPhrase(allTags, gender)
    case 'approaching':
      const { getRandomApproachingPhrase } = require('./approaching')
      return getRandomApproachingPhrase(allTags)
    case 'considering':
      const { getRandomThinkingPhrase } = require('./approaching')
      return getRandomThinkingPhrase(allTags, gender)
    default:
      return {
        id: 'default',
        tags: ['default'],
        type,
        template: '...'
      }
  }
}

// Функция применения плейсхолдеров
export function applyPlaceholders(
  template: string,
  data: {
    name: string
    title?: string
    gender: Gender
    mission?: string
  }
): string {
  const genderForms = data.gender === 'female' 
    ? { 
        he: 'она', she: 'она', his: 'её', her: 'её', 
        himself: 'себя', herself: 'себя', 
        na: 'а', s: 'ла', was: 'была', is: 'она'
      }
    : { 
        he: 'он', she: 'он', his: 'его', her: 'его', 
        himself: 'себя', herself: 'себя', 
        na: '', s: '', was: 'был', is: 'он'
      }
  
  return template
    .replace(/{name}/g, data.name)
    .replace(/{title}/g, data.title || '')
    .replace(/{mission}/g, data.mission || '')
    .replace(/{he\/she}/g, genderForms.he)
    .replace(/{his\/her}/g, genderForms.his)
    .replace(/{himself\/herself}/g, genderForms.himself)
    .replace(/{na}/g, genderForms.na)
    .replace(/{was}/g, genderForms.was)
    .replace(/{is}/g, genderForms.is)
}

// Генерация полного сообщения
export function generateMessage(
  type: PhraseType,
  adventurer: {
    name: string
    title?: string
    gender: Gender
  },
  allTags: string[],
  mission?: string
): string {
  const phrase = getPhrase(type, allTags, adventurer.gender)
  return applyPlaceholders(phrase.template, {
    name: adventurer.name,
    title: adventurer.title,
    gender: adventurer.gender,
    mission
  })
}

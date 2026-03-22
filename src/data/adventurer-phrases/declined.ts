/**
 * Фразы отказа искателей
 */

import type { PhraseTemplate } from '@/types/adventurer-extended'

export const declinedPhrases: PhraseTemplate[] = [
  // === ОБЩИЕ ===
  {
    id: 'decline_default',
    tags: ['default'],
    type: 'declined',
    template: 'Извините, но я не заинтересован.'
  },
  {
    id: 'decline_simple',
    tags: ['default'],
    type: 'declined',
    template: 'Не сейчас, спасибо.'
  },
  {
    id: 'decline_busy',
    tags: ['default'],
    type: 'declined',
    template: 'У меня уже есть дела. Возможно, в другой раз.'
  },
  {
    id: 'decline_thinking',
    tags: ['default'],
    type: 'declined',
    template: 'Хм... Нет, это не для меня.'
  },
  
  // === ПО ПОЛУ ===
  {
    id: 'decline_male',
    tags: ['default'],
    gender: 'male',
    type: 'declined',
    template: 'Это не подходит для меня. Извините.'
  },
  {
    id: 'decline_female',
    tags: ['default'],
    gender: 'female',
    type: 'declined',
    template: 'Это не подходит для меня. Извините.'
  },
  
  // === ВЫСОКИЙ УРОВЕНЬ НА ЛЁГКУЮ МИССИЮ ===
  {
    id: 'decline_overqualified_1',
    tags: ['veteran', 'ambitious', 'veteran_guild'],
    type: 'declined',
    template: 'Слишком простая работёнка для меня. Найдите кого-нибудь другого.'
  },
  {
    id: 'decline_overqualified_2',
    tags: ['veteran', 'ambitious'],
    type: 'declined',
    template: 'Я заслуживаю большего вызова.'
  },
  {
    id: 'decline_overqualified_3',
    tags: ['famous', 'legendary'],
    type: 'declined',
    template: 'Это задание ниже моего достоинства.'
  },
  
  // === НИЗКИЙ УРОВЕНЬ НА СЛОЖНУЮ МИССИЮ ===
  {
    id: 'decline_underqualified_1',
    tags: ['cautious', 'survivor', 'newcomer'],
    type: 'declined',
    template: 'Я не готов к такому риску. Извините.'
  },
  {
    id: 'decline_underqualified_2',
    tags: ['cautious', 'survivor'],
    type: 'declined',
    template: 'Это слишком опасно даже для меня.'
  },
  {
    id: 'decline_underqualified_3',
    tags: ['newcomer'],
    type: 'declined',
    template: 'Мне нужно больше опыта для такой миссии.'
  },
  
  // === АЛЧНЫЙ ПРИ НИЗКОЙ НАГРАДЕ ===
  {
    id: 'decline_low_pay_1',
    tags: ['greedy', 'mercenary'],
    type: 'declined',
    template: 'Плата недостаточна. Я не работаю за копейки.'
  },
  {
    id: 'decline_low_pay_2',
    tags: ['greedy'],
    type: 'declined',
    template: 'За такие деньги? Даже не думайте.'
  },
  {
    id: 'decline_low_pay_3',
    tags: ['mercenary'],
    type: 'declined',
    template: 'Мои услуги стоят дороже.'
  },
  
  // === ЛЕНИВЫЙ ===
  {
    id: 'decline_lazy_long',
    tags: ['lazy'],
    type: 'declined',
    template: 'Слишком долго... Я пас.'
  },
  {
    id: 'decline_lazy_hard',
    tags: ['lazy'],
    type: 'declined',
    template: 'Слишком много усилий. Найдите кого-то другого.'
  },
  {
    id: 'decline_lazy_simple',
    tags: ['lazy'],
    type: 'declined',
    template: 'Звучит как работа... Не сегодня.'
  },
  
  // === ТРУС НА СЛОЖНУЮ МИССИЮ ===
  {
    id: 'decline_coward_1',
    tags: ['coward', 'cautious'],
    type: 'declined',
    template: 'Я ценю свою жизнь больше этой награды.'
  },
  {
    id: 'decline_coward_2',
    tags: ['coward', 'survivor'],
    type: 'declined',
    template: 'Это... это слишком опасно. Нет.'
  },
  {
    id: 'decline_coward_3',
    tags: ['coward'],
    type: 'declined',
    template: 'Вы хотите, чтобы я умер? Нет спасибо.'
  },
  
  // === СУЕВЕРНЫЙ НА МАГИЧЕСКУЮ МИССИЮ ===
  {
    id: 'decline_superstitious_1',
    tags: ['superstitious'],
    type: 'declined',
    template: 'Магия... Я не связываюсь с этим.'
  },
  {
    id: 'decline_superstitious_2',
    tags: ['superstitious'],
    type: 'declined',
    template: 'Это приносит несчастье. Я пас.'
  },
  {
    id: 'decline_superstitious_3',
    tags: ['superstitious'],
    type: 'declined',
    template: 'Плохое предзнаменование. Не пойду.'
  },
  
  // === ВЫСОКОМЕРНЫЙ ===
  {
    id: 'decline_arrogant_1',
    tags: ['arrogant', 'noble'],
    type: 'declined',
    template: 'Это задание ниже моего достоинства.'
  },
  {
    id: 'decline_arrogant_2',
    tags: ['arrogant', 'famous'],
    type: 'declined',
    template: 'Вы знаете, кто я? Такое задание — оскорбление.'
  },
  
  // === ОСТОРОЖНЫЙ НА СЛОЖНУЮ ===
  {
    id: 'decline_cautious_risk',
    tags: ['cautious', 'safety'],
    type: 'declined',
    template: 'Риск слишком велик. Мне жаль.'
  },
  {
    id: 'decline_cautious_1',
    tags: ['cautious'],
    type: 'declined',
    template: 'Я не люблю необоснованный риск. Отказ.'
  },
  
  // === БЛАГОРОДНЫЙ (на тёмные миссии) ===
  {
    id: 'decline_honourable_dark',
    tags: ['honourable'],
    type: 'declined',
    template: 'Это не соответствует моим принципам.'
  },
  {
    id: 'decline_honourable_assassin',
    tags: ['honourable', 'duty'],
    type: 'declined',
    template: 'Я не убийца. Найдите кого-то другого.'
  },
  
  // === ИСКАТЕЛЬ СЛАВЫ (на скучные миссии) ===
  {
    id: 'decline_glory_boring',
    tags: ['glory_seeker'],
    type: 'declined',
    template: 'Никакой славы в этом нет. Не интересно.'
  },
  {
    id: 'decline_glory_easy',
    tags: ['glory_seeker'],
    type: 'declined',
    template: 'Это не принесёт мне известности. Отказ.'
  },
  
  // === ДВОРЯНИН ===
  {
    id: 'decline_noble_1',
    tags: ['noble'],
    type: 'declined',
    template: 'Это недостойно человека моего положения.'
  },
  {
    id: 'decline_noble_2',
    tags: ['noble'],
    type: 'declined',
    template: 'У меня есть репутация, которую нужно беречь.'
  },
  
  // === Фобии ===
  {
    id: 'decline_phobia',
    tags: ['phobia'],
    type: 'declined',
    template: 'Я... я не могу. Мои страхи сильнее меня.'
  }
]

// Функция получения фраз отказа по тэгам
export function getDeclinedPhrasesByTags(tags: string[]): PhraseTemplate[] {
  const matching = declinedPhrases.filter(p => 
    p.tags.some(tag => tags.includes(tag))
  )
  return matching.length > 0 ? matching : declinedPhrases.filter(p => p.tags.includes('default'))
}

// Функция получения случайной фразы отказа
export function getRandomDeclinedPhrase(allTags: string[], gender?: 'male' | 'female'): PhraseTemplate {
  let phrases = getDeclinedPhrasesByTags(allTags)
  
  if (gender) {
    const genderSpecific = phrases.filter(p => p.gender === gender || p.gender === 'any' || !p.gender)
    if (genderSpecific.length > 0) {
      phrases = genderSpecific
    }
  }
  
  return phrases[Math.floor(Math.random() * phrases.length)]
}

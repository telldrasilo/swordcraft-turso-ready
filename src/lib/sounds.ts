// Система звуковых эффектов для игры
// Использует Web Audio API для генерации простых звуков

type SoundType = 
  | 'craft_start'
  | 'craft_complete'
  | 'sell'
  | 'hire'
  | 'fire'
  | 'level_up'
  | 'coin'
  | 'error'
  | 'click'
  | 'refine_start'
  | 'refine_complete'
  | 'order_accept'
  | 'order_complete'
  | 'tutorial_next'
  | 'notification'

// Контекст аудио
let audioContext: AudioContext | null = null

// Инициализация контекста
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

// Создание осциллятора с огибающей
function createTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
): void {
  try {
    const ctx = getAudioContext()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    // Огибающая ADSR
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch (e) {
    // Игнорируем ошибки аудио
  }
}

// Создание мелодии из нескольких нот
function createMelody(notes: { freq: number; dur: number; delay: number; type?: OscillatorType }[], volume: number = 0.2): void {
  notes.forEach(({ freq, dur, delay, type = 'sine' }) => {
    setTimeout(() => createTone(freq, dur, type, volume), delay)
  })
}

// Карта звуков
const soundDefinitions: Record<SoundType, () => void> = {
  // Начало крафта - низкий гул
  craft_start: () => {
    createTone(150, 0.3, 'sawtooth', 0.15)
    setTimeout(() => createTone(180, 0.2, 'sawtooth', 0.1), 100)
  },
  
  // Завершение крафта - торжественный звук
  craft_complete: () => {
    createMelody([
      { freq: 440, dur: 0.15, delay: 0 },
      { freq: 554, dur: 0.15, delay: 100 },
      { freq: 659, dur: 0.25, delay: 200 },
    ], 0.25)
  },
  
  // Продажа - звон монет
  sell: () => {
    createMelody([
      { freq: 1200, dur: 0.08, delay: 0, type: 'sine' },
      { freq: 1400, dur: 0.08, delay: 60, type: 'sine' },
      { freq: 1600, dur: 0.12, delay: 120, type: 'sine' },
    ], 0.15)
  },
  
  // Найм рабочего - позитивный звук
  hire: () => {
    createMelody([
      { freq: 392, dur: 0.12, delay: 0 },
      { freq: 494, dur: 0.12, delay: 80 },
      { freq: 587, dur: 0.18, delay: 160 },
    ], 0.2)
  },
  
  // Увольнение - грустный звук
  fire: () => {
    createMelody([
      { freq: 392, dur: 0.2, delay: 0 },
      { freq: 330, dur: 0.25, delay: 150 },
    ], 0.15)
  },
  
  // Уровень вверх - победная мелодия
  level_up: () => {
    createMelody([
      { freq: 523, dur: 0.15, delay: 0 },
      { freq: 659, dur: 0.15, delay: 100 },
      { freq: 784, dur: 0.15, delay: 200 },
      { freq: 1047, dur: 0.3, delay: 300 },
    ], 0.3)
  },
  
  // Монеты - короткий звон
  coin: () => {
    createTone(1400, 0.1, 'sine', 0.15)
  },
  
  // Ошибка - низкий гудок
  error: () => {
    createTone(200, 0.3, 'square', 0.15)
    setTimeout(() => createTone(150, 0.2, 'square', 0.1), 150)
  },
  
  // Клик по кнопке
  click: () => {
    createTone(800, 0.05, 'sine', 0.1)
  },
  
  // Начало переработки
  refine_start: () => {
    createTone(250, 0.2, 'triangle', 0.15)
    setTimeout(() => createTone(300, 0.15, 'triangle', 0.1), 100)
  },
  
  // Завершение переработки
  refine_complete: () => {
    createMelody([
      { freq: 330, dur: 0.1, delay: 0 },
      { freq: 415, dur: 0.1, delay: 80 },
      { freq: 494, dur: 0.15, delay: 160 },
    ], 0.2)
  },
  
  // Принятие заказа
  order_accept: () => {
    createMelody([
      { freq: 440, dur: 0.1, delay: 0 },
      { freq: 523, dur: 0.15, delay: 100 },
    ], 0.2)
  },
  
  // Выполнение заказа
  order_complete: () => {
    createMelody([
      { freq: 523, dur: 0.1, delay: 0 },
      { freq: 659, dur: 0.1, delay: 80 },
      { freq: 784, dur: 0.15, delay: 160 },
      { freq: 1047, dur: 0.2, delay: 240 },
    ], 0.25)
  },
  
  // Следующий шаг туториала
  tutorial_next: () => {
    createTone(600, 0.08, 'sine', 0.12)
  },
  
  // Уведомление
  notification: () => {
    createMelody([
      { freq: 880, dur: 0.1, delay: 0 },
      { freq: 880, dur: 0.1, delay: 150 },
    ], 0.15)
  },
}

// Главный экспорт - функция воспроизведения звука
export function playSound(type: SoundType): void {
  // Восстанавливаем контекст если он был приостановлен
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
  
  const sound = soundDefinitions[type]
  if (sound) {
    sound()
  }
}

// Настройки звука (сохраняются в localStorage)
export interface SoundSettings {
  enabled: boolean
  volume: number // 0-1
}

const SOUND_SETTINGS_KEY = 'swordcraft-sound-settings'

export function getSoundSettings(): SoundSettings {
  try {
    const saved = localStorage.getItem(SOUND_SETTINGS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    // Игнорируем ошибки
  }
  return { enabled: true, volume: 0.5 }
}

export function saveSoundSettings(settings: SoundSettings): void {
  try {
    localStorage.setItem(SOUND_SETTINGS_KEY, JSON.stringify(settings))
  } catch (e) {
    // Игнорируем ошибки
  }
}

// Хук для использования звуков в компонентах
import { useCallback, useEffect, useState } from 'react'

export function useSound() {
  const [settings, setSettings] = useState<SoundSettings>(getSoundSettings())
  
  useEffect(() => {
    saveSoundSettings(settings)
  }, [settings])
  
  const play = useCallback((type: SoundType) => {
    if (settings.enabled && settings.volume > 0) {
      playSound(type)
    }
  }, [settings])
  
  const toggleSound = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }))
  }, [])
  
  const setVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, volume }))
  }, [])
  
  return {
    play,
    isEnabled: settings.enabled,
    volume: settings.volume,
    toggleSound,
    setVolume,
  }
}

# Концепция системы искателей приключений
## Версия 5.0 — Расширяемая архитектура модификаторов

---

## Статус реализации

| Этап | Статус | Описание |
|------|--------|----------|
| 1. Генерация искателей | ✅ Готово | Генератор с тегами, редкостью, сильными/слабыми сторонами |
| 2. Система фраз и поиска | ✅ Готово | Лог поиска, фразы согласия/отказа по характеру |
| 3. UI карточек | ✅ Готово | Карточки с traits, tooltips, прогноз миссии, модификаторы |
| 3.5. Система советов | ✅ Готово | Вариативные советы по комбинациям черт |
| 4. Контракты — Базовая | ✅ Готово | Типы контрактов, лояльность, contract-manager |
| 5. Контракты — UI | ✅ Готово | Секция контрактов, карточки, модальное окно |
| 6. Туториалы | ⬜ Не начато | Обучение системе |
| 7. Боевые характеристики | ✅ Готово | Power/Precision/Endurance/Luck → combat-stats-provider |
| 7.5. Характер | ✅ Готово | 12 черт → personality-traits-provider |
| 7.6. Мотивация | ✅ Готово | 8 мотиваций → motivations-provider |
| 7.7. Социальные теги | ✅ Готово | 8 тегов → social-tags-provider |
| 7.8. Уровень | ✅ Готово | level-rarity-provider |
| 8. База искателей | ✅ Готово | knownAdventurers, known-adventurers-manager |
| 9. UI модификаторов | 🔄 В процессе | modifier-breakdown, met-badge (созданы, нужна интеграция) |

---

## Архитектура данных

### Типы искателей

```typescript
interface AdventurerExtended {
  id: string
  identity: { firstName, lastName?, nickname?, gender, portraitId }
  combat: { level, rarity, power, precision, endurance, luck, combatStyle }
  personality: { primaryTrait, secondaryTrait?, riskTolerance, motivations[], socialTags[] }
  traits: AdventurerTrait[]      // Черты с эффектами
  strengths: Strength[]          // Сильные стороны
  weaknesses: Weakness[]         // Слабости
  requirements: { minAttack, weaponType?, minQuality? }
}
```

### Редкость

| Редкость | Шанс | Уровень | Черты | Бонус к золоту | Бонус к душам |
|----------|------|---------|-------|----------------|---------------|
| Обычный | 50% | 1-10 | 0-1 | 0% | 0% |
| Необычный | 30% | 5-20 | 1-2 | +10% | +15% |
| Редкий | 15% | 15-30 | 2 | +20% | +30% |
| Эпический | 4% | 25-40 | 2-3 | +35% | +50% |
| Легендарный | 1% | 35-50 | 3 | +50% | +100% |

---

## Система тегов (реализовано)

### Характер (PersonalityTrait)
Влияет на фразы и шанс согласия.

| ID | Название | Влияние |
|----|----------|---------|
| brave | Храбрый | +согласие на сложные |
| cautious | Осторожный | +согласие на лёгкие, -на сложные |
| greedy | Алчный | требует высокую награду |
| reckless | Безрассудный | +согласие на любые |
| ambitious | Амбициозный | -согласие на лёгкие |
| veteran | Ветеран | сбалансированный |

### Стиль боя (CombatStyle)
Бонусы к типам миссий.

| ID | +Бонус | -Штраф |
|----|--------|--------|
| berserker | Охота +15%, Зачистка +10% | Доставка -10% |
| tank | Доставка +20%, Зачистка +10% | Охота -10% |
| assassin | Разведка +20%, Магия +15% | Зачистка -10% |
| hunter | Охота +25%, Разведка +10% | — |
| scout | Разведка +30%, Доставка +15% | Зачистка -10% |
| paladin | Магия +25%, Зачистка +15% | — |
| battle_mage | Магия +30%, Разведка +15% | — |
| weapon_master | Все +10% | — |

### Сильные стороны (Strength)

| ID | Успех | Золото | Души | Потеря оружия | Износ | Условия |
|----|-------|--------|------|---------------|-------|---------|
| iron_will | +10% | — | — | — | — | Сложные |
| keen_eye | — | +15% | — | — | — | Всегда |
| quick_reflexes | +3% | — | — | -25% | — | Всегда |
| tough | +5% | — | — | -10% | — | Всегда |
| lucky_star | +5% | +8% | +5% | -10% | — | Всегда |
| sturdy | — | — | — | — | -30% | Всегда |

### Слабости (Weakness)

| ID | Успех | Золото | Потеря оружия | Шанс отказа | Условия |
|----|-------|--------|---------------|-------------|---------|
| arrogant | -12% | — | +5% | — | Лёгкие |
| coward | -20% | — | — | +25% | Сложные |
| superstitious | -15% | — | — | +30% | Магические |
| old_wound | -5% | — | — | — | Всегда |

---

## Формулы расчёта

### Шанс успеха

```
baseSuccess = 100 - difficultyFailureChance

// Модификаторы:
+ уровень (optimal: +5%, underlevel: -penalty, overlevel: -boredom)
+ оружие выше требуемого (+attack * 0.5, max +15%)
+ стиль боя (bonus по типу миссии)
+ сильные стороны (successBonus)
+ слабости (successPenalty)
+ характер (traitBonus по сложности)

final = clamp(5, 95, baseSuccess + sum(modifiers))
```

### Золото

```
baseGold = expedition.baseGold
totalMult = rarityMult + sum(goldModifiers) / 100
total = floor(baseGold * totalMult)
commission = floor(total * commissionPercent / 100)
```

### Души войны

```
baseWarSoul = expedition.baseWarSoul
totalMult = rarityMult + sum(warSoulModifiers) / 100
total = max(1, floor(baseWarSoul * totalMult))
```

---

## Система контрактов (не реализовано)

### Типы контрактов

| Тиер | Стоимость | Комиссия | Отказ | Особенности |
|------|-----------|----------|-------|-------------|
| Бронзовый | 100 🪙 | -5% | -10% | Базовый |
| Серебряный | 500 🪙 | -10% | -20% | +Приоритет |
| Золотой | 2000 🪙 | -15% | -35% | +Прямое назначение |
| Платиновый | 10000 🪙 | -25% | -50% | +Эксклюзив |

### Лояльность

| Уровень | Диапазон | Бонусы |
|---------|----------|--------|
| Недовольный | <20 | +20% отказ, +10% комиссия |
| Нейтральный | 20-50 | — |
| Удовлетворённый | 50-80 | -5% отказ, -3% комиссия |
| Лояльный | >80 | -10% отказ, -5% комиссия, +5% крит |

### Условия заключения

| Тиер | Миссий | Успех% | Уровень гильдии |
|------|--------|--------|-----------------|
| Бронзовый | 3 | 60% | 1 |
| Серебряный | 5 | 70% | 2 |
| Золотой | 10 | 75% | 3 |
| Платиновый | 20 | 85% | 5 |

---

## План оставшихся работ

### Этап 4: Контракты — Базовая (3-4 дня)

**Файлы:**
- `src/types/contract.ts` — типы контрактов
- `src/lib/contract-manager.ts` — логика контрактов
- `src/lib/loyalty-system.ts` — система лояльности
- Обновить `src/store/slices/guild-slice.ts`

**Задачи:**
- [ ] Типы ContractTier, ContractTerms, ContractedAdventurer
- [ ] offerContract(), acceptContract(), terminateContract()
- [ ] Расчёт лояльности (изменения после миссий)
- [ ] Штрафы за простой (-5/неделю без миссий)
- [ ] Store: contractedAdventurers, actions

### Этап 5: Контракты — UI (2-3 дня)

**Файлы:**
- `src/components/guild/contracts-section.tsx`
- `src/components/guild/contract-card.tsx`
- `src/components/guild/contract-offer-modal.tsx`

**Задачи:**
- [ ] Секция контрактов в гильдии
- [ ] Карточка контрактного искателя (лояльность, история)
- [ ] Прямое назначение (вкладка "Контрактники")
- [ ] Модальное окно предложения контракта
- [ ] История миссий с отметкой контрактников

### Этап 6: Туториалы (1-2 дня)

**Задачи:**
- [ ] Туториал системы контрактов
- [ ] Туториал системы поиска
- [ ] Контекстные подсказки

---

## Ключевые файлы (реализовано)

```
src/
├── types/
│   ├── adventurer-extended.ts    # Типы данных искателей
│   └── contract.ts               # Типы контрактов, лояльность
├── data/adventurer-tags/
│   ├── personality-traits.ts     # Характер
│   ├── combat-styles.ts          # Стили боя
│   ├── strengths.ts              # Сильные стороны
│   ├── weaknesses.ts             # Слабости
│   ├── social-tags.ts            # Социальные теги
│   └── adventurer-phrases.ts     # Фразы
├── lib/
│   ├── adventurer-generator-extended.ts  # Генератор
│   ├── expedition-calculator.ts  # Расчёты миссии
│   ├── adventurer-advice.ts      # Система советов
│   └── contract-manager.ts       # Логика контрактов
├── components/guild/
│   ├── adventurer-card-v2.tsx    # Карточка искателя
│   ├── adventurer-full-card.tsx  # Полная карточка
│   ├── recruitment-interface.tsx # Интерфейс поиска
│   ├── search-log.tsx            # Лог поиска
│   ├── contracts-section.tsx     # Секция контрактов
│   ├── contract-card.tsx         # Карточка контрактника
│   └── contract-offer-modal.tsx  # Модальное окно контракта
└── data/
    └── adventurer-rarity.ts      # Конфиг редкости
```

---

## Оценка времени

| Этап | Статус | Время |
|------|--------|-------|
| 1-3. Генерация + UI | ✅ Готово | — |
| 3.5. Советы | ✅ Готово | — |
| 4. Контракты — Базовая | ✅ Готово | — |
| 5. Контракты — UI | ✅ Готово | — |
| 6. Туториалы | ⬜ Не начато | 1-2 дня |
| 7. Боевые характеристики | ⬜ Запланировано | 4-5 часов |
| 7.5. Характер | ⬜ Запланировано | 3-4 часа |
| 7.6. Мотивация | ⬜ Запланировано | 2-3 часа |
| 7.7. Социальные теги | ⬜ Запланировано | 1-2 часа |
| 7.8. Уровень | ⬜ Запланировано | 1 час |
| 8. База искателей | ⬜ Запланировано | 4-5 часов |
| **Итого осталось** | | **18-24 часа (~3-4 дня)** |

---

# ПЛАН ДОРАБОТОК (Версия 4.0)

> **КРИТИЧЕСКИ ВАЖНО:** Все новые параметры и теги ОБЯЗАТЕЛЬНО связываются с существующими механиками. НЕЛЬЗЯ добавлять просто пустые цифры или описания без gameplay-эффекта.

---

## Анализ текущего состояния связей

### ✅ УЖЕ ВЛИЯЕТ на механики экспедиций

| Характеристика | Влияет на | Где реализовано |
|----------------|-----------|-----------------|
| **Сильные стороны** | successBonus, goldBonus, warSoulBonus, weaponLoss/Wear | strengths.ts → calculator |
| **Слабости** | successPenalty, goldPenalty, weaponLoss/Wear | weaknesses.ts → calculator |
| **Стиль боя** | missionBonuses по типам миссий | combat-styles.ts → calculator |
| **Социальные теги** | goldModifier (частично) | social-tags.ts → calculator |
| **Уровень** | levelMatch (+5% optimal, -penalty underlevel) | calculator |
| **Редкость** | goldMult, warSoulMult | calculator |

### ⚠️ ЧАСТИЧНО влияет (только на согласие, НЕ на экспедицию)

| Характеристика | Текущее влияние | Проблема |
|----------------|-----------------|----------|
| **Характер** | acceptModifiers → только согласие | brave/reckless влияют на успех, остальные НЕТ |
| **Мотивация** | triggers → только согласие | НЕ влияет на награды/успех |
| **Социальные теги** | refuseChance → только согласие | НЕ влияет на успех |

### ❌ НЕ ВЛИЯЕТ на механики (просто цифры)

| Характеристика | Текущее состояние |
|----------------|-------------------|
| **Power** | 1-50, не используется |
| **Precision** | 1-50, не используется |
| **Endurance** | 1-50, не используется |
| **Luck** | 1-50, не используется |

---

## Этап 7: Боевые характеристики — связывание с механиками

### Проблема
Боевые характеристики (power, precision, endurance, luck) — это просто цифры без влияния на игру. Стили боя и предпочтения оружия показываются на английском.

### Решение: Связать ВСЁ с механиками экспедиций

#### 7.1. Power (Сила) → Души войны

**Текущее состояние:** power = 1-50, не используется.

**Предлагаемая механика:**
```
baseWarSoul = expedition.baseWarSoul
powerBonus = (power - 25) * 0.5%  // Нормализация вокруг 25
// power=10 → -7.5% | power=25 → 0% | power=40 → +7.5% | power=50 → +12.5%

totalWarSoul = floor(baseWarSoul * (rarityMult + powerBonus/100 + sum(otherModifiers)))
```

**Визуализация в UI:**
- Tooltip: "Сила: 40 → +7.5% к Душам войны"
- В карточке: иконка 💪 с числом и эффектом

#### 7.2. Precision (Точность) → Шанс успеха

**Текущее состояние:** precision = 1-50, не используется.

**Предлагаемая механика:**
```
precisionBonus = (precision - 25) * 0.3%  // Мягче, чем power
// precision=10 → -4.5% | precision=25 → 0% | precision=40 → +4.5%

successChance += precisionBonus
```

**Визуализация в UI:**
- Tooltip: "Точность: 40 → +4.5% к успеху"
- В прогнозе миссии: отдельный модификатор "Меткость"

#### 7.3. Endurance (Выносливость) → Износ оружия

**Текущее состояние:** endurance = 1-50, не используется.

**Предлагаемая механика:**
```
wearReduction = (endurance - 25) * 0.4%
// endurance=10 → +6% износа | endurance=25 → 0% | endurance=40 → -6% износа

weaponWear = baseWeaponWear * (1 - wearReduction/100)
```

**Визуализация в UI:**
- Tooltip: "Выносливость: 40 → -6% к износу оружия"
- Защита оружия — важно для долгих миссий

#### 7.4. Luck (Удача) → Критический успех

**Текущее состояние:** luck = 1-50, не используется.

**Предлагаемая механика:**
```
critChance = (luck - 25) * 0.2%
// luck=10 → -3% крита | luck=25 → 0% | luck=40 → +3% крита | luck=50 → +5% крита

// Критический успех = x1.5 золота, x2 душ войны, +50% славы
```

**Визуализация в UI:**
- Tooltip: "Удача: 40 → +3% шанс критического успеха"
- Звёздочка ⭐ в карточке

#### 7.5. Интеграция в expedition-calculator.ts

**Файл:** `src/lib/expedition-calculator.ts`

**Изменения:**
```typescript
// Добавить после раздела 3 (Влияние редкости)

// ===== 3.5. ВЛИЯНИЕ БОЕВЫХ ХАРАКТЕРИСТИК =====
const { power, precision, endurance, luck } = adventurer.combat

// Power → War Soul
const powerBonus = (power - 25) * 0.5
if (powerBonus !== 0) {
  warSoulModifiers.push({
    source: 'Сила',
    sourceIcon: '💪',
    value: powerBonus,
    description: powerBonus > 0
      ? `Мощь искателя увеличивает добычу душ`
      : `Слабость искателя снижает добычу душ`,
    type: powerBonus > 0 ? 'positive' : 'negative'
  })
}

// Precision → Success
const precisionBonus = (precision - 25) * 0.3
if (precisionBonus !== 0) {
  baseSuccess += precisionBonus
  successModifiers.push({
    source: 'Меткость',
    sourceIcon: '🎯',
    value: precisionBonus,
    description: precisionBonus > 0
      ? `Точность ударов повышает успех`
      : `Неточность снижает шансы`,
    type: precisionBonus > 0 ? 'positive' : 'negative'
  })
}

// Endurance → Weapon Wear
const wearReduction = (endurance - 25) * 0.4
if (wearReduction !== 0) {
  weaponWearModifiers.push({
    source: 'Выносливость',
    sourceIcon: '🛡️',
    value: -wearReduction, // Отрицательное = меньше износа
    description: wearReduction > 0
      ? `Стойкость защищает оружие от износа`
      : `Слабая выносливость увеличивает износ`,
    type: wearReduction > 0 ? 'positive' : 'negative'
  })
}

// Luck → Crit Chance (сохранить для применения при завершении)
const critChance = Math.max(0, 5 + (luck - 25) * 0.2) // Базовый 5% + модификатор
```

#### 7.6. Перевод типов оружия на русский

**Файл:** `src/data/adventurer-tags/combat-styles.ts`

**Изменения:**
```typescript
export const WEAPON_TYPE_NAMES: Record<WeaponType, string> = {
  sword: 'Меч',
  axe: 'Топор',
  dagger: 'Кинжал',
  mace: 'Булава',
  spear: 'Копьё',
  hammer: 'Молот'
}
```

#### 7.7. Бонус за предпочитаемое оружие

**Механика:** Если искатель использует предпочитаемое оружие → бонус к успеху.

**Файл:** `src/lib/expedition-calculator.ts`

**Добавить в расчёт:**
```typescript
// ===== 3.6. БОНУС ЗА ПРЕДПОЧИТАЕМОЕ ОРУЖИЕ =====
const weaponType = getWeaponTypeFromWeapon(weapon) // Извлечь тип из оружия
const isPreferred = combatStyle?.preferredWeapons.includes(weaponType)
const isAvoided = combatStyle?.avoidedWeapons.includes(weaponType)

if (isPreferred) {
  const preferredBonus = 5 // +5% к успеху
  baseSuccess += preferredBonus
  successModifiers.push({
    source: 'Любимое оружие',
    sourceIcon: '⚔️',
    value: preferredBonus,
    description: `${WEAPON_TYPE_NAMES[weaponType]} — излюбленное оружие искателя`,
    type: 'positive'
  })
} else if (isAvoided) {
  const avoidedPenalty = -5 // -5% к успеху
  baseSuccess += avoidedPenalty
  successModifiers.push({
    source: 'Нелюбимое оружие',
    sourceIcon: '⚠️',
    value: avoidedPenalty,
    description: `${WEAPON_TYPE_NAMES[weaponType]} — неудобное для искателя`,
    type: 'negative'
  })
}
```

#### 7.8. Перевод всех tooltips на русский

**Файлы для обновления:**
- `src/data/adventurer-tags/personality-traits.ts` — описания характера
- `src/data/adventurer-tags/strengths.ts` — описания сильных сторон
- `src/data/adventurer-tags/weaknesses.ts` — описания слабостей
- `src/data/adventurer-tags/social-tags.ts` — описания социальных тегов

**Принцип:** Все description должны быть на русском языке.

---

## Этап 8: База искателей и система контрактов

### Проблема
1. Для контракта нужно минимум 3 миссии с искателем
2. Искатели не сохраняются между появлениями
3. Нет информации о предыдущих встречах

### Решение: База известных искателей

#### 8.1. Архитектура хранения

**Принципы:**
- Ограниченное количество для оптимизации
- Текучка: старые/неактивные удаляются
- Сохранение истории для контрактов

**Новый тип в `src/types/guild.ts`:**

```typescript
export interface KnownAdventurer {
  adventurerId: string
  adventurer: AdventurerExtended  // Полные данные
  metCount: number                // Количество встреч
  missionsCompleted: number       // Завершённых миссий
  missionsSucceeded: number       // Успешных миссий
  totalGoldEarned: number         // Всего заработано золота
  totalWarSoulEarned: number      // Всего заработано душ
  firstMetAt: number              // Первая встреча
  lastMetAt: number               // Последняя встреча
  lastMissionAt?: number          // Последняя миссия
  isAvailableForContract: boolean // Доступен для контракта
  contractTier?: ContractTier     // Если уже в контракте
}
```

**Обновление GuildState:**
```typescript
export interface GuildState {
  // ... существующие поля
  knownAdventurers: KnownAdventurer[]  // База известных искателей
  maxKnownAdventurers: number          // Лимит базы (20-30)
}
```

#### 8.2. Логика базы искателей

**Файл:** `src/lib/known-adventurers-manager.ts`

```typescript
const MAX_KNOWN_ADVENTURERS = 25
const INACTIVE_THRESHOLD_DAYS = 7

// Добавить/обновить искателя в базе
export function updateKnownAdventurer(
  known: KnownAdventurer[],
  adventurer: AdventurerExtended,
  missionResult?: { success: boolean; gold: number; warSoul: number }
): KnownAdventurer[] {
  const existing = known.find(k => k.adventurerId === adventurer.id)

  if (existing) {
    // Обновить существующего
    return known.map(k =>
      k.adventurerId === adventurer.id
        ? {
            ...k,
            metCount: k.metCount + 1,
            missionsCompleted: missionResult ? k.missionsCompleted + 1 : k.missionsCompleted,
            missionsSucceeded: missionResult?.success ? k.missionsSucceeded + 1 : k.missionsSucceeded,
            totalGoldEarned: k.totalGoldEarned + (missionResult?.gold ?? 0),
            totalWarSoulEarned: k.totalWarSoulEarned + (missionResult?.warSoul ?? 0),
            lastMetAt: Date.now(),
            lastMissionAt: missionResult ? Date.now() : k.lastMissionAt,
            isAvailableForContract: k.missionsCompleted + 1 >= 3
          }
        : k
    )
  } else {
    // Добавить нового (с проверкой лимита)
    if (known.length >= MAX_KNOWN_ADVENTURERS) {
      // Удалить самого старого неактивного
      const sorted = [...known].sort((a, b) => a.lastMetAt - b.lastMetAt)
      known = known.filter(k => k.adventurerId !== sorted[0].adventurerId)
    }

    return [...known, {
      adventurerId: adventurer.id,
      adventurer,
      metCount: 1,
      missionsCompleted: missionResult ? 1 : 0,
      missionsSucceeded: missionResult?.success ? 1 : 0,
      totalGoldEarned: missionResult?.gold ?? 0,
      totalWarSoulEarned: missionResult?.warSoul ?? 0,
      firstMetAt: Date.now(),
      lastMetAt: Date.now(),
      lastMissionAt: missionResult ? Date.now() : undefined,
      isAvailableForContract: false
    }]
  }
}

// Очистка неактивных (вызывать при refresh)
export function cleanInactiveAdventurers(known: KnownAdventurer[]): KnownAdventurer[] {
  const threshold = Date.now() - INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000
  return known.filter(k =>
    k.contractTier || // Контрактных не удаляем
    k.lastMetAt > threshold // Или активных
  )
}
```

#### 8.3. Повторное появление искателей

**Файл:** `src/lib/adventurer-generator-extended.ts`

**Изменение логики генерации:**
```typescript
// При генерации пула искателей:
// 1. 30% шанс что известный искатель появится снова
// 2. Шанс выше для тех, кто давно не появлялся

export function generateAdventurerPool(
  count: number,
  knownAdventurers: KnownAdventurer[],
  guildLevel: number
): AdventurerExtended[] {
  const result: AdventurerExtended[] = []
  const now = Date.now()

  // Попытка добавить известных искателей
  const candidates = knownAdventurers
    .filter(k => !k.contractTier) // Не контрактные
    .filter(k => k.isAvailableForContract || k.metCount < 3) // Доступные для встреч
    .sort((a, b) => a.lastMetAt - b.lastMetAt) // Давно не виделись — приоритет

  for (const known of candidates) {
    if (result.length >= count) break

    // Шанс появления: 30% + 5% за каждый день отсутствия (макс 60%)
    const daysSinceLastMet = (now - known.lastMetAt) / (24 * 60 * 60 * 1000)
    const chance = Math.min(0.6, 0.3 + daysSinceLastMet * 0.05)

    if (Math.random() < chance) {
      result.push(known.adventurer)
    }
  }

  // Заполнить оставшиеся слоты новыми
  while (result.length < count) {
    result.push(generateNewAdventurer(guildLevel))
  }

  return result
}
```

#### 8.4. UI: Бейдж "Уже участвовал"

**Файл:** `src/components/guild/adventurer-card-v2.tsx`

**Добавить в карточку:**
```tsx
{knownInfo && (
  <div className="flex items-center gap-1 text-xs text-amber-400">
    <span>👤</span>
    <span>Встречали {knownInfo.metCount} раз(а)</span>
    {knownInfo.missionsCompleted > 0 && (
      <span className="text-green-400">
        • {knownInfo.missionsSucceeded}/{knownInfo.missionsCompleted} успех
      </span>
    )}
    {knownInfo.isAvailableForContract && (
      <span className="text-purple-400 font-semibold">
        • Доступен для контракта!
      </span>
    )}
  </div>
)}
```

#### 8.5. Условия для контракта

**Обновить логику:**
```typescript
// В contract-manager.ts
export function canOfferContract(
  known: KnownAdventurer,
  tier: ContractTier,
  guildLevel: number
): { canOffer: boolean; reason?: string } {
  // Проверка количества миссий
  if (known.missionsCompleted < CONTRACT_REQUIREMENTS[tier].minMissions) {
    return {
      canOffer: false,
      reason: `Нужно минимум ${CONTRACT_REQUIREMENTS[tier].minMissions} миссий (выполнено: ${known.missionsCompleted})`
    }
  }

  // Проверка процента успеха
  const successRate = known.missionsSucceeded / known.missionsCompleted * 100
  if (successRate < CONTRACT_REQUIREMENTS[tier].minSuccessRate) {
    return {
      canOffer: false,
      reason: `Нужно минимум ${CONTRACT_REQUIREMENTS[tier].minSuccessRate}% успеха (у вас: ${successRate.toFixed(0)}%)`
    }
  }

  // Проверка уровня гильдии
  if (guildLevel < CONTRACT_REQUIREMENTS[tier].minGuildLevel) {
    return {
      canOffer: false,
      reason: `Нужен уровень гильдии ${CONTRACT_REQUIREMENTS[tier].minGuildLevel}`
    }
  }

  return { canOffer: true }
}

const CONTRACT_REQUIREMENTS: Record<ContractTier, ContractRequirements> = {
  bronze: { minMissions: 3, minSuccessRate: 50, minGuildLevel: 1 },
  silver: { minMissions: 5, minSuccessRate: 60, minGuildLevel: 2 },
  gold: { minMissions: 10, minSuccessRate: 70, minGuildLevel: 3 },
  platinum: { minMissions: 20, minSuccessRate: 80, minGuildLevel: 5 }
}
```

#### 8.6. Интеграция в store

**Обновить `game-store-composed.ts`:**
```typescript
// В completeExpedition():
// 1. После завершения миссии обновить knownAdventurers
// 2. Проверить доступность контракта

// В refreshAdventurers():
// 1. Вызвать cleanInactiveAdventurers
// 2. При генерации учитывать knownAdventurers
```

---

## Этап 7.5: Характер (PersonalityTrait) — расширение влияния

### Проблема
12 черт характера влияют только на согласие. В calculator влияют только brave, cautious, reckless, veteran, lazy. Остальные 7 черт НЕ влияют на экспедицию!

### Текущее влияние (calculateTraitBonus):
- `brave` → +10% на hard/extreme/legendary ✅
- `cautious` → +5% на easy ✅
- `reckless` → +8% всегда (но риск!) ✅
- `veteran` → +5% всегда ✅
- `lazy` → -5% на долгих ✅

### НЕ влияют на успех (проблема!):
- `greedy`, `honourable`, `mercenary`, `glory_seeker`, `survivor`, `ambitious`, `hot_headed`

### Решение: Добавить экспедиционные эффекты

#### Обновить personality-traits.ts:

```typescript
export interface PersonalityTraitData {
  // ... существующие поля
  
  // НОВОЕ: Влияние на экспедицию
  expeditionEffects?: {
    successBonus?: number      // Бонус к успеху
    goldBonus?: number         // Бонус к золоту
    warSoulBonus?: number      // Бонус к душам
    weaponLossMod?: number     // Модификатор потери оружия
    weaponWearMod?: number     // Модификатор износа
    critBonus?: number         // Бонус к криту
    
    // Условия применения
    conditions?: {
      difficulty?: ExpeditionDifficulty[]
      missionType?: ExpeditionType[]
    }
  }
}
```

#### Добавить эффекты для каждой черты:

| Черта | Экспедиционный эффект | Обоснование |
|-------|----------------------|-------------|
| `greedy` | +10% gold, но +5% weaponLoss | Жадность = больше находит, но рискует |
| `honourable` | +8% success на защите/эскорте | Благородство = лучше защищает |
| `mercenary` | +5% gold, -3% success | Профессионал, но без героизма |
| `glory_seeker` | +15% success на legendary, -10% на easy | Героизм на сложных |
| `survivor` | -15% weaponLoss, -10% weaponWear | Осторожность = сохраняет оружие |
| `ambitious` | +10% warSoul | Амбиции = больше опыта |
| `hot_headed` | ±10% random на всё | Непредсказуемость |

#### Интеграция в calculator:

```typescript
// ===== 7. ВЛИЯНИЕ ХАРАКТЕРА (расширенное) =====
const primaryTrait = getPersonalityTraitById(adventurer.personality.primaryTrait)
const secondaryTrait = adventurer.personality.secondaryTrait 
  ? getPersonalityTraitById(adventurer.personality.secondaryTrait) 
  : null

for (const trait of [primaryTrait, secondaryTrait]) {
  if (!trait?.expeditionEffects) continue
  
  const effects = trait.expeditionEffects
  const conditions = effects.conditions
  
  // Проверка условий
  if (conditions?.difficulty && !conditions.difficulty.includes(difficulty)) continue
  if (conditions?.missionType && !conditions.missionType.includes(missionType)) continue
  
  // Применение эффектов
  if (effects.successBonus) {
    baseSuccess += effects.successBonus
    successModifiers.push({
      source: trait.name,
      sourceIcon: trait.icon,
      value: effects.successBonus,
      description: `Характер: ${trait.description}`,
      type: effects.successBonus > 0 ? 'positive' : 'negative'
    })
  }
  
  if (effects.goldBonus) {
    goldModifiers.push({ /* ... */ })
  }
  
  if (effects.warSoulBonus) {
    warSoulModifiers.push({ /* ... */ })
  }
  
  // hot_headed special: случайный бонус
  if (trait.id === 'hot_headed') {
    const randomBonus = (Math.random() - 0.5) * 20 // -10% to +10%
    baseSuccess += randomBonus
    successModifiers.push({
      source: 'Непредсказуемость',
      sourceIcon: '🎲',
      value: randomBonus,
      description: randomBonus > 0 ? 'Удача на стороне!' : 'Не повезло...',
      type: randomBonus > 0 ? 'positive' : 'negative'
    })
  }
}
```

---

## Этап 7.6: Мотивация — связывание с наградами

### Проблема
Мотивация влияет ТОЛЬКО на согласие, но НЕ на результаты миссии.

### Решение: Мотивация → Бонусы к наградам

#### Обновить motivations.ts:

```typescript
export interface MotivationData {
  // ... существующие поля
  
  // НОВОЕ: Влияние на результаты миссии
  missionBonuses?: {
    successBonus?: number      // Бонус к успеху
    goldBonus?: number         // Бонус к золоту
    warSoulBonus?: number      // Бонус к душам
    gloryBonus?: number        // Бонус к славе
    critBonus?: number         // Бонус к криту
    
    // Условия
    triggers?: {
      condition: string
      bonus: { success?: number, gold?: number, warSoul?: number, glory?: number }
    }[]
  }
}
```

#### Добавить эффекты для каждой мотивации:

| Мотивация | Эффект при успехе | Условие |
|-----------|-------------------|---------|
| `gold` | +15% gold | Всегда |
| `glory` | +20% glory | Всегда |
| `challenge` | +10% success, +15% warSoul | hard/extreme/legendary |
| `safety` | -20% weaponLoss, -15% weaponWear | Всегда |
| `experience` | +25% warSoul | Всегда |
| `revenge` | +15% success, +10% gold | Против определённых врагов |
| `curiosity` | +10% gold (находки) | Новые локации |
| `duty` | +10% success, +15% glory | Защитные миссии |

#### Интеграция в calculator:

```typescript
// ===== 8. ВЛИЯНИЕ МОТИВАЦИИ =====
for (const motivationId of adventurer.personality.motivations) {
  const motivation = getMotivationById(motivationId)
  if (!motivation?.missionBonuses) continue
  
  const bonuses = motivation.missionBonuses
  
  // Базовые бонусы
  if (bonuses.successBonus) {
    baseSuccess += bonuses.successBonus
    successModifiers.push({
      source: motivation.name,
      sourceIcon: motivation.icon,
      value: bonuses.successBonus,
      description: `Мотивация: ${motivation.description}`,
      type: 'positive'
    })
  }
  
  if (bonuses.goldBonus) {
    goldModifiers.push({
      source: motivation.name,
      sourceIcon: motivation.icon,
      value: bonuses.goldBonus,
      description: 'Мотивирован на золото',
      type: 'positive'
    })
  }
  
  if (bonuses.warSoulBonus) {
    warSoulModifiers.push({
      source: motivation.name,
      sourceIcon: motivation.icon,
      value: bonuses.warSoulBonus,
      description: 'Стремится к опыту',
      type: 'positive'
    })
  }
  
  // Условные триггеры
  if (bonuses.triggers) {
    for (const trigger of bonuses.triggers) {
      if (checkTriggerCondition(trigger.condition, expedition, adventurer)) {
        // Применить бонус триггера
      }
    }
  }
}
```

---

## Этап 7.7: Социальные теги — полное влияние

### Проблема
refuseChance НЕ используется в calculator, только в согласии.

### Решение: Добавить successMod

#### Обновить social-tags.ts:

```typescript
export interface SocialTagData {
  // ... существующие поля
  
  effects: {
    goldModifier: number
    refuseChance: number
    // НОВОЕ:
    successModifier: number    // Модификатор успеха
    warSoulModifier: number    // Модификатор душ
    specialBonus?: {
      condition: string
      success?: number
      gold?: number
    }
  }
}
```

#### Добавить эффекты:

| Тег | successModifier | Обоснование |
|-----|-----------------|-------------|
| `noble` | -5% | Привык к комфорту, труднее в поле |
| `peasant` | +3% | Закалённый трудом |
| `outcast` | +5% | Нечего терять |
| `famous` | -3% | Груз репутации |
| `newcomer` | +5% | Старается проявить себя |
| `veteran_guild` | +8% | Опыт работы в гильдии |
| `mysterious` | 0% (random ±5%) | Непредсказуемо |
| `legendary` | +10% | Легендарные навыки |

---

## Этап 7.8: Уровень — расширение влияния

### Текущее влияние:
- levelMatch: +5% optimal, -penalty underlevel, -boredom overlevel

### Добавить:
- Бонус к душам войны: `(level / 10)%` (уровень 30 → +3% душ)
- Бонус к криту: `(level / 20)%` (уровень 40 → +2% крита)

```typescript
// ===== УРОВЕНЬ — РАСШИРЕННОЕ ВЛИЯНИЕ =====
const levelWarSoulBonus = adventurer.combat.level / 10 // 1% за 10 уровней
if (levelWarSoulBonus > 0) {
  warSoulModifiers.push({
    source: 'Уровень',
    sourceIcon: '📈',
    value: levelWarSoulBonus,
    description: `Опыт уровня ${adventurer.combat.level}`,
    type: 'positive'
  })
}

const levelCritBonus = adventurer.combat.level / 20
// Добавить к базовому криту
```

---

## ИТОГОВАЯ СВОДНАЯ ТАБЛИЦА СВЯЗЕЙ

### Все характеристики связаны с механиками:

| Характеристика | Успех | Золото | Души | Слава | Оружие | Крит | Условия |
|----------------|-------|--------|------|-------|--------|------|---------|
| **Power** | — | — | +(p-25)*0.5% | — | — | — | Всегда |
| **Precision** | +(p-25)*0.3% | — | — | — | — | — | Всегда |
| **Endurance** | — | — | — | — | -(e-25)*0.4% износ | — | Всегда |
| **Luck** | — | — | — | — | — | 5+(l-25)*0.2% | Всегда |
| **Уровень** | levelMatch | — | level/10% | — | — | level/20% | Всегда |
| **Редкость** | — | +10-50% | +15-100% | — | — | — | Всегда |
| **Стиль боя** | ±10-30% | — | — | — | — | — | По типу миссии |
| **Характер** | ±5-15% | ±10% | — | — | ±15% | — | По черте |
| **Мотивация** | ±10% | ±15% | ±25% | ±20% | ±20% | — | По мотивации |
| **Социальный тег** | ±10% | ±30% | — | — | — | — | По тегу |
| **Сильные стороны** | +3-10% | +8-15% | +5% | — | -10-30% | — | По силе |
| **Слабости** | -5-20% | -10-15% | — | — | +5-20% | — | По слабости |
| **Оружие preferred** | +5% | — | — | — | — | — | Совпадение |
| **Оружие avoided** | -5% | — | — | — | — | — | Совпадение |

---

## Приоритеты реализации (ОБНОВЛЁННЫЕ)

### Приоритет 1: Критично — Боевые характеристики (4-5 часов)
- [ ] Power → War Soul
- [ ] Precision → Success
- [ ] Endurance → Weapon Wear
- [ ] Luck → Crit

### Приоритет 2: Критично — Характер (3-4 часа)
- [ ] Добавить expeditionEffects в personality-traits.ts
- [ ] Интегрировать в calculator
- [ ] UI отображение

### Приоритет 3: Важно — Мотивация (2-3 часа)
- [ ] Добавить missionBonuses в motivations.ts
- [ ] Интегрировать в calculator

### Приоритет 4: Важно — Социальные теги (1-2 часа)
- [ ] Добавить successModifier в social-tags.ts
- [ ] Интегрировать в calculator

### Приоритет 5: Важно — Уровень (1 час)
- [ ] Добавить warSoulBonus и critBonus за уровень

### Приоритет 6: База искателей (4-5 часов)
- [ ] KnownAdventurer тип
- [ ] Интеграция в store
- [ ] Повторное появление

### Приоритет 7: UI (2-3 часа)
- [ ] Бейджи "Встречали X раз"
- [ ] Перевод tooltips
- [ ] Отображение всех модификаторов

---

## Этап 9: Архитектура расширяемой системы эффектов

### Проблемы текущей архитектуры

| Проблема | Описание |
|----------|----------|
| **Жёсткие секции** | Каждый тип тега обрабатывается в отдельном блоке кода |
| **Дублирование** | Похожий код для strengths/weaknesses/personality |
| **Hardcoded формулы** | Формулы прописаны в коде, не параметризованы |
| **Нет реестра** | Каждый новый тип требует изменения calculator |
| **Смешение ответственности** | Calculator знает о всех типах тегов напрямую |

### Решение: Unified Effect System

#### 9.1. Унифицированный формат эффекта

**Создать:** `src/types/effects.ts`

```typescript
/**
 * Унифицированная система эффектов
 * Все модификаторы описываются в одном формате
 */

// Все возможные цели эффектов
export type EffectTarget = 
  | 'success'           // Шанс успеха
  | 'gold'              // Золото
  | 'warSoul'           // Души войны
  | 'glory'             // Слава
  | 'weaponLoss'        // Шанс потери оружия
  | 'weaponWear'        // Износ оружия
  | 'critChance'        // Шанс крита
  | 'refuseChance'      // Шанс отказа (для согласия)

// Все возможные типы операций
export type EffectOperation = 
  | 'add'               // +X (сложение)
  | 'multiply'          // *X (умножение)
  | 'percent_add'       // +X% (процент к базе)
  | 'percent_mult'      // *X% (множитель)
  | 'set'               // =X (установка значения)
  | 'random'            // Случайное значение в диапазоне

// Условия применения эффекта
export interface EffectCondition {
  type: 'difficulty' | 'missionType' | 'level' | 'weapon' | 'custom'
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in'
  value: string | number | string[] | number[]
}

// Формула для динамического расчёта
export interface EffectFormula {
  type: 'linear' | 'threshold' | 'curve'
  // linear: base + coefficient * value
  // threshold: value >= threshold ? then_value : else_value  
  // curve: база с несколькими порогами
  params: {
    base?: number
    coefficient?: number
    thresholds?: { at: number; value: number }[]
  }
}

// Унифицированный эффект
export interface UnifiedEffect {
  id: string                    // Уникальный ID эффекта
  source: string                // Источник (имя черты, силы, итд)
  sourceIcon: string            // Иконка источника
  sourceType: EffectSourceType  // Тип источника
  
  target: EffectTarget          // Что изменяет
  operation: EffectOperation    // Как изменяет
  value: number | EffectFormula // Значение или формула
  
  conditions?: EffectCondition[] // Условия применения (И)
  description: string           // Описание для UI
  isPositive?: boolean          // Для UI (positive/negative)
}

// Типы источников эффектов
export type EffectSourceType = 
  | 'combat_stat'       // Боевая характеристика (power, precision, etc.)
  | 'trait'             // Черта характера
  | 'strength'          // Сильная сторона
  | 'weakness'          // Слабость
  | 'combat_style'      // Стиль боя
  | 'social_tag'        // Социальный тег
  | 'motivation'        // Мотивация
  | 'weapon'            // Оружие
  | 'level'             // Уровень
  | 'rarity'            // Редкость
  | 'contract'          // Контракт
  | 'guild'             // Гильдия
  | 'equipment'         // Экипировка (будущее)
  | 'buff'              // Временный бафф (будущее)
  | 'achievement'       // Достижение (будущее)
```

#### 9.2. Реестр эффектов

**Создать:** `src/lib/effect-registry.ts`

```typescript
/**
 * Централизованный реестр всех эффектов
 * Добавление новых эффектов = добавление в реестр, БЕЗ изменения calculator
 */

import type { UnifiedEffect, EffectSourceType } from '@/types/effects'

// Интерфейс провайдера эффектов
export interface EffectProvider {
  type: EffectSourceType
  getEffects(context: EffectContext): UnifiedEffect[]
}

// Контекст для расчёта эффектов
export interface EffectContext {
  adventurer: AdventurerExtended
  expedition: ExpeditionTemplate
  guildLevel: number
  weapon: CraftedWeapon
  // Для будущих расширений
  buffs?: Buff[]
  achievements?: Achievement[]
}

// Реестр провайдеров
class EffectRegistry {
  private providers: Map<EffectSourceType, EffectProvider> = new Map()
  
  register(provider: EffectProvider) {
    this.providers.set(provider.type, provider)
  }
  
  getAllEffects(context: EffectContext): UnifiedEffect[] {
    const effects: UnifiedEffect[] = []
    
    for (const provider of this.providers.values()) {
      effects.push(...provider.getEffects(context))
    }
    
    return effects
  }
}

export const effectRegistry = new EffectRegistry()
```

#### 9.3. Провайдеры эффектов

**Создать директорию:** `src/lib/effects/`

```typescript
// src/lib/effects/combat-stat-provider.ts
export const combatStatProvider: EffectProvider = {
  type: 'combat_stat',
  
  getEffects(context: EffectContext): UnifiedEffect[] {
    const { adventurer } = context
    const effects: UnifiedEffect[] = []
    
    // Power → War Soul (формула описана в данных, не в коде!)
    effects.push({
      id: 'power_to_warSoul',
      source: 'Сила',
      sourceIcon: '💪',
      sourceType: 'combat_stat',
      target: 'warSoul',
      operation: 'percent_add',
      value: {
        type: 'linear',
        params: { base: 0, coefficient: 0.5, baseValue: -25 }
        // Формула: (power - 25) * 0.5
      },
      description: 'Мощь искателя увеличивает добычу душ'
    })
    
    // Precision → Success
    effects.push({
      id: 'precision_to_success',
      source: 'Меткость',
      sourceIcon: '🎯',
      sourceType: 'combat_stat',
      target: 'success',
      operation: 'add',
      value: {
        type: 'linear',
        params: { base: 0, coefficient: 0.3, baseValue: -25 }
      },
      description: 'Точность ударов повышает успех'
    })
    
    // Endurance → Weapon Wear
    effects.push({
      id: 'endurance_to_wear',
      source: 'Выносливость',
      sourceIcon: '🛡️',
      sourceType: 'combat_stat',
      target: 'weaponWear',
      operation: 'add',
      value: {
        type: 'linear',
        params: { base: 0, coefficient: -0.4, baseValue: -25 }
      },
      description: 'Стойкость защищает оружие от износа'
    })
    
    // Luck → Crit
    effects.push({
      id: 'luck_to_crit',
      source: 'Удача',
      sourceIcon: '⭐',
      sourceType: 'combat_stat',
      target: 'critChance',
      operation: 'add',
      value: {
        type: 'linear',
        params: { base: 5, coefficient: 0.2, baseValue: -25 }
      },
      description: 'Удача увеличивает шанс крита'
    })
    
    return effects
  }
}

// src/lib/effects/strength-provider.ts
export const strengthProvider: EffectProvider = {
  type: 'strength',
  
  getEffects(context: EffectContext): UnifiedEffect[] {
    const { adventurer, expedition } = context
    const effects: UnifiedEffect[] = []
    
    for (const strength of adventurer.strengths) {
      const data = getStrengthById(strength.id)
      if (!data) continue
      
      // Проверка условий
      if (!checkConditions(data.conditions, context)) continue
      
      // Автоматическая конвертация effects в UnifiedEffect
      effects.push(...convertToUnifiedEffects(data, 'strength'))
    }
    
    return effects
  }
}

// src/lib/effects/trait-provider.ts
export const traitProvider: EffectProvider = {
  type: 'trait',
  
  getEffects(context: EffectContext): UnifiedEffect[] {
    const { adventurer } = context
    const effects: UnifiedEffect[] = []
    
    // Primary trait
    const primary = getPersonalityTraitById(adventurer.personality.primaryTrait)
    if (primary?.expeditionEffects) {
      effects.push(...convertToUnifiedEffects(primary.expeditionEffects, 'trait', primary))
    }
    
    // Secondary trait
    if (adventurer.personality.secondaryTrait) {
      const secondary = getPersonalityTraitById(adventurer.personality.secondaryTrait)
      if (secondary?.expeditionEffects) {
        effects.push(...convertToUnifiedEffects(secondary.expeditionEffects, 'trait', secondary))
      }
    }
    
    return effects
  }
}
```

#### 9.4. Пайплайн применения эффектов

**Создать:** `src/lib/effect-pipeline.ts`

```typescript
/**
 * Пайплайн применения эффектов
 * Централизованная логика расчёта ВСЕХ модификаторов
 */

import { effectRegistry } from './effect-registry'
import type { UnifiedEffect, EffectContext, EffectTarget } from '@/types/effects'

// Результаты расчёта
export interface CalculationResult {
  value: number
  modifiers: ModifierDetail[]
}

export interface ExpeditionCalculationResult {
  success: CalculationResult
  gold: CalculationResult
  warSoul: CalculationResult
  glory: CalculationResult
  weaponLoss: CalculationResult
  weaponWear: CalculationResult
  critChance: CalculationResult
}

// Базовые значения
interface BaseValues {
  success: number
  gold: number
  warSoul: number
  glory: number
  weaponLoss: number
  weaponWear: number
  critChance: number
}

/**
 * Главная функция расчёта - заменяет весь старый calculator
 */
export function calculateExpedition(
  context: EffectContext
): ExpeditionCalculationResult {
  // 1. Получить все эффекты из реестра
  const effects = effectRegistry.getAllEffects(context)
  
  // 2. Рассчитать базовые значения
  const bases = calculateBaseValues(context)
  
  // 3. Применить эффекты по пайплайну
  return {
    success: applyEffects(effects, 'success', bases.success, context),
    gold: applyEffects(effects, 'gold', bases.gold, context),
    warSoul: applyEffects(effects, 'warSoul', bases.warSoul, context),
    glory: applyEffects(effects, 'glory', bases.glory, context),
    weaponLoss: applyEffects(effects, 'weaponLoss', bases.weaponLoss, context),
    weaponWear: applyEffects(effects, 'weaponWear', bases.weaponWear, context),
    critChance: applyEffects(effects, 'critChance', bases.critChance, context),
  }
}

/**
 * Применить эффекты к конкретной цели
 */
function applyEffects(
  effects: UnifiedEffect[],
  target: EffectTarget,
  baseValue: number,
  context: EffectContext
): CalculationResult {
  const relevantEffects = effects.filter(e => e.target === target)
  const modifiers: ModifierDetail[] = []
  
  let result = baseValue
  let percentAdd = 0
  let percentMult = 1
  
  // Порядок применения:
  // 1. add операции
  // 2. percent_add операции (суммируются)
  // 3. percent_mult операции (умножаются)
  // 4. multiply операции
  // 5. set операции (переопределяют)
  
  for (const effect of relevantEffects) {
    // Проверка условий
    if (!checkEffectConditions(effect, context)) continue
    
    const value = resolveEffectValue(effect, context)
    
    switch (effect.operation) {
      case 'add':
        result += value
        break
      case 'percent_add':
        percentAdd += value
        break
      case 'percent_mult':
        percentMult *= (1 + value / 100)
        break
      case 'multiply':
        result *= value
        break
      case 'set':
        result = value
        break
      case 'random':
        result += (Math.random() - 0.5) * 2 * value
        break
    }
    
    // Добавить в модификаторы для UI
    modifiers.push({
      source: effect.source,
      sourceIcon: effect.sourceIcon,
      value: value,
      description: effect.description,
      type: effect.isPositive ?? (value > 0) ? 'positive' : 'negative'
    })
  }
  
  // Применить накопленные проценты
  result = result * (1 + percentAdd / 100) * percentMult
  
  return { value: result, modifiers }
}

/**
 * Рассчитать значение эффекта (формула или константа)
 */
function resolveEffectValue(effect: UnifiedEffect, context: EffectContext): number {
  if (typeof effect.value === 'number') {
    return effect.value
  }
  
  const formula = effect.value
  const { adventurer } = context
  
  // Получить исходное значение для формулы
  let sourceValue = 0
  switch (effect.sourceType) {
    case 'combat_stat':
      if (effect.source === 'Сила') sourceValue = adventurer.combat.power
      if (effect.source === 'Меткость') sourceValue = adventurer.combat.precision
      if (effect.source === 'Выносливость') sourceValue = adventurer.combat.endurance
      if (effect.source === 'Удача') sourceValue = adventurer.combat.luck
      break
    case 'level':
      sourceValue = adventurer.combat.level
      break
  }
  
  switch (formula.type) {
    case 'linear':
      const { base = 0, coefficient = 1, baseValue = 0 } = formula.params
      return base + coefficient * (sourceValue - baseValue)
      
    case 'threshold':
      // TODO
      return 0
      
    case 'curve':
      // TODO
      return 0
      
    default:
      return 0
  }
}
```

#### 9.5. Инициализация реестра

**Создать:** `src/lib/effects/index.ts`

```typescript
import { effectRegistry } from '../effect-registry'
import { combatStatProvider } from './combat-stat-provider'
import { strengthProvider } from './strength-provider'
import { weaknessProvider } from './weakness-provider'
import { traitProvider } from './trait-provider'
import { motivationProvider } from './motivation-provider'
import { socialTagProvider } from './social-tag-provider'
import { combatStyleProvider } from './combat-style-provider'
import { levelProvider } from './level-provider'
import { rarityProvider } from './rarity-provider'
import { weaponProvider } from './weapon-provider'

// Регистрация всех провайдеров
export function initializeEffectSystem() {
  effectRegistry.register(combatStatProvider)
  effectRegistry.register(strengthProvider)
  effectRegistry.register(weaknessProvider)
  effectRegistry.register(traitProvider)
  effectRegistry.register(motivationProvider)
  effectRegistry.register(socialTagProvider)
  effectRegistry.register(combatStyleProvider)
  effectRegistry.register(levelProvider)
  effectRegistry.register(rarityProvider)
  effectRegistry.register(weaponProvider)
  
  // Будущие провайдеры добавляются здесь:
  // effectRegistry.register(equipmentProvider)  // Экипировка
  // effectRegistry.register(buffProvider)      // Временные баффы
  // effectRegistry.register(achievementProvider) // Достижения
}

// Автоинициализация
initializeEffectSystem()
```

---

### Как добавлять новые эффекты в будущем

#### Сценарий 1: Новая характеристика (например, "Интеллект")

```typescript
// 1. Добавить в тип AdventurerExtended
interface CombatStats {
  // ...
  intelligence: number  // НОВОЕ
}

// 2. Добавить эффект в combat-stat-provider.ts
effects.push({
  id: 'intelligence_to_gold',
  source: 'Интеллект',
  sourceIcon: '🧠',
  sourceType: 'combat_stat',
  target: 'gold',
  operation: 'percent_add',
  value: {
    type: 'linear',
    params: { base: 0, coefficient: 0.4, baseValue: -25 }
  },
  description: 'Интеллект помогает находить сокровища'
})

// ГОТОВО! Calculator не трогаем!
```

#### Сценарий 2: Новый тип источника (например, "Экипировка")

```typescript
// 1. Создать provider
// src/lib/effects/equipment-provider.ts
export const equipmentProvider: EffectProvider = {
  type: 'equipment',
  
  getEffects(context: EffectContext): UnifiedEffect[] {
    const effects: UnifiedEffect[] = []
    
    for (const item of context.adventurer.equipment ?? []) {
      if (item.bonus) {
        effects.push({
          id: `equipment_${item.id}`,
          source: item.name,
          sourceIcon: item.icon,
          sourceType: 'equipment',
          target: item.bonus.target,
          operation: item.bonus.operation,
          value: item.bonus.value,
          description: item.bonus.description
        })
      }
    }
    
    return effects
  }
}

// 2. Зарегистрировать в index.ts
effectRegistry.register(equipmentProvider)

// ГОТОВО! Calculator не трогаем!
```

#### Сценарий 3: Новая цель эффекта (например, "experienceBonus")

```typescript
// 1. Добавить в EffectTarget type
export type EffectTarget = 
  | 'success' | 'gold' | 'warSoul' | 'glory' | 'weaponLoss' | 'weaponWear' | 'critChance'
  | 'experienceBonus'  // НОВОЕ

// 2. Добавить в ExpeditionCalculationResult
interface ExpeditionCalculationResult {
  // ...
  experienceBonus: CalculationResult  // НОВОЕ
}

// 3. Добавить в applyEffects в pipeline
// ГОТОВО! Все провайдеры могут теперь давать бонус к опыту!
```

---

### Преимущества новой архитектуры

| Аспект | Было | Стало |
|--------|------|-------|
| **Добавление эффекта** | Изменить calculator | Добавить в провайдер |
| **Новый тип источника** | Переписать calculator | Создать provider |
| **Формулы** | Hardcoded в коде | Параметризованы в данных |
| **Условия** | Разбросаны | Централизованы |
| **UI модификаторов** | Дублирование | Автоматически из эффектов |
| **Тестирование** | Тестировать весь calculator | Тестировать провайдеры изолированно |
| **Расширяемость** | Низкая | Высокая |

---

### План внедрения архитектуры

| Шаг | Что делать | Время |
|-----|------------|-------|
| 1 | Создать types/effects.ts | 1 час |
| 2 | Создать effect-registry.ts | 1 час |
| 3 | Создать провайдеры для текущих источников | 3-4 часа |
| 4 | Создать effect-pipeline.ts | 2 часа |
| 5 | Переписать calculator на использование pipeline | 2 часа |
| 6 | Тестирование | 1-2 часа |
| **Итого** | | **10-12 часов** |

### Связь с основным планом

Архитектура Unified Effect System:
- **Выполняется ПЕРЕД** этапами 7.1-7.8 (или параллельно с первыми подэтапами)
- Обеспечивает **безболезненное добавление** всех запланированных эффектов
- Создаёт **платформу для будущего** (экипировка, баффы, достижения)

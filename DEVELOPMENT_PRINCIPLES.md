# Принципы разработки SwordCraft

> Краткий справочник для быстрого изучения и использования.

---

## 1. Zustand — критические правила

### Индивидуальные селекторы
```tsx
// ✅ ПРАВИЛЬНО
const gold = useGameStore((state) => state.resources.gold)
const iron = useGameStore((state) => state.resources.iron)
const addResource = useGameStore((state) => state.addResource)

// ❌ ЗАПРЕЩЕНО — вызывает infinite loop
const { gold, iron } = useGameStore((state) => ({
  gold: state.resources.gold,
  iron: state.resources.iron
}), shallow)
```

**Причина:** Группировка в inline объект создаёт новую ссылку на каждый рендер → бесконечный цикл.

---

## 2. React производительность

### useMemo — для вычислений
```tsx
// ✅ Сортировка, фильтрация, сложные расчёты
const sortedWeapons = useMemo(() => 
  weapons.sort((a, b) => b.attack - a.attack),
  [weapons]
)

const filteredRecipes = useMemo(() =>
  recipes.filter(r => player.level >= r.requiredLevel),
  [recipes, player.level]
)
```

### React.memo — для списков
```tsx
const WeaponCard = React.memo(({ weapon, onSelect }) => (
  <Card onClick={() => onSelect(weapon.id)}>
    {weapon.name}
  </Card>
))
```

### Ключи — только стабильные ID
```tsx
// ✅ Правильно
{items.map(item => <Card key={item.id} />)}

// ❌ Неправильно
{items.map((item, index) => <Card key={index} />)}
```

---

## 3. Архитектура модификаторов

### Добавление нового модификатора
1. Создать провайдер в `src/lib/modifier-system/providers/`
2. Экспортировать из `index.ts`
3. Модификатор автоматически применяется в calculator

### Структура провайдера
```tsx
export const myProvider: ModifierProvider = {
  id: 'my-modifier',
  name: 'Название',
  getModifiers: (context: ModifierContext): Modifier[] => {
    // Возврат массива модификаторов
    return [{
      target: 'successChance',
      operation: 'add',
      value: 0.1,
      source: { type: 'trait', id: 'brave', name: 'Храбрый' }
    }]
  }
}
```

---

## 4. Структура файлов

### Новая фича → своя директория
```
src/components/new-feature/
├── index.ts           # Экспорты
├── main-component.tsx # Главный компонент
├── sub-component.tsx  # Подкомпоненты
└── utils.ts           # Утилиты
```

### Slice для нового состояния
```
src/store/slices/new-feature-slice.ts
├── Типы состояния
├── Начальное состояние
└── Actions
```

---

## 5. Безопасность изменений

### Перед изменением store
1. Проверить persist-ключи
2. Убедиться в обратной совместимости
3. Добавить миграцию при изменении структуры

### Перед изменением типов
1. Проверить все использования
2. Обновить конвертеры при необходимости
3. Запустить `bun run build`

---

## 6. Чек-лист перед коммитом

- [ ] `bun run build` без ошибок
- [ ] Zustand селекторы индивидуальные
- [ ] useMemo для сортировок/фильтров
- [ ] Стабильные ключи в списках
- [ ] Нет any-типов
- [ ] Новые файлы в правильных директориях

---

## 7. Типичные ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| Infinite loop | Группировка селекторов | Индивидуальные селекторы |
| Лишние рендеры | Нет useMemo | Добавить useMemo |
| Пропала анимация | key={index} | key={item.id} |
| TypeError | Опциональная цепочка | Добавить `?.` и `??` |

---

## 8. Связи State → Components

```
GameState (store)
    ├── resources → forge-screen, resources-screen
    ├── workers → workers-screen
    ├── weaponInventory → forge-screen, dungeons-screen
    ├── guild → guild-screen
    │   ├── adventurers → recruitment-interface
    │   ├── expeditions → expeditions-section
    │   └── knownAdventurers → adventurer-card-v2
    └── player → все экраны
```

---

## Быстрая навигация

| Что ищем | Где искать |
|----------|------------|
| Ресурсы | `store/slices/resources-slice.ts` |
| Оружие | `data/weapon-recipes.ts`, `components/forge/` |
| Экспедиции | `lib/expedition-calculator-v2.ts` |
| Искатели | `lib/adventurer-generator-extended.ts` |
| Теги | `data/adventurer-tags/` |
| UI компоненты | `components/ui/`, `components/guild/` |

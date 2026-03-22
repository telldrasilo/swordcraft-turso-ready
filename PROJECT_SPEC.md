# ⚡ Quick Rules for Development

## ⚠️ КРИТИЧЕСКИ: Zustand селекторы

```tsx
// ✅ Правильно — индивидуальные
const gold = useGameStore((state) => state.resources.gold)
const addResource = useGameStore((state) => state.addResource)

// ❌ Запрещено — вызывает infinite loop!
const { gold, iron } = useGameStore((state) => ({
  gold: state.resources.gold,
  iron: state.resources.iron
}), shallow)
```

## Мемоизация

- `useMemo` — для сортировки/фильтрации массивов
- `React.memo` — для компонентов в списках
- `key={item.id}` — стабильные ключи, не index

## Структура

```
src/store/slices/     → 9 Zustand slices
src/components/*/     → Компоненты по фичам
src/components/screens/ → 5 экранов-контейнеров
```

## Документация

- `docs/SPECIFICATION.md` — полная спецификация игры
- `worklog.md` — история изменений

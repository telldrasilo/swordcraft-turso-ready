# Аудит game-store-composed.ts

> **Дата**: 2026-03-22
> **Файл**: `src/store/game-store-composed.ts`
> **Строк**: 1744

---

## Карта функций по slices

### 🟢 Resources Slice (строки 333-393)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `addResource` | 336-338 | ❌ | Нет | ⚠️ Дублирует slice |
| `spendResource` | 340-347 | ❌ | Нет | ⚠️ Дублирует slice |
| `canAfford` | 349-355 | ❌ | Нет | ⚠️ Дублирует slice |
| `spendResources` | 357-367 | ❌ | Нет | ⚠️ Дублирует slice |
| `sellResource` | 369-389 | ✅ `RESOURCE_SELL_PRICES` | ✅ statistics | ⚠️ Cross-slice |
| `getResourceSellPrice` | 391-393 | ✅ `RESOURCE_SELL_PRICES` | Нет | ⚠️ Дублирует slice |

**Вывод**: Почти все функции дублируют `resources-slice.ts`. Нужно использовать slice.

---

### 🟡 Player Slice (строки 395-421)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `setPlayerName` | 399 | ❌ | Нет | ⚠️ Дублирует slice |
| `addExperience` | 401-417 | ✅ `getTitleByLevel` | Нет | ⚠️ Дублирует slice |
| `addFame` | 419-421 | ❌ | Нет | ⚠️ Дублирует slice |

**Вывод**: Дублирует `player-slice.ts`. Slice уже правильно использует utils!

---

### 🟠 Workers Slice (строки 423-557)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `hireWorker` | 428-459 | ✅ `generateId`, `generateWorkerName` | ✅ resources, statistics | 🔴 Cross-slice |
| `assignWorker` | 461-463 | ❌ | Нет | ⚠️ Дублирует slice |
| `updateWorkerStamina` | 465-471 | ❌ | Нет | ⚠️ Дублирует slice |
| `addWorkerExperience` | 473-511 | ❌ | Нет | ⚠️ Дублирует slice |
| `fireWorker` | 513-528 | ❌ | ✅ resources | 🔴 Cross-slice |
| `getWorkersQuality` | 530-535 | ❌ | Нет | ⚠️ Дублирует slice |
| `updateBuildingProgress` | 537-539 | ❌ | Нет | ⚠️ Дублирует slice |
| `upgradeBuilding` | 541-557 | ❌ | ✅ resources | 🔴 Cross-slice |

**Вывод**: Большая часть дублирует slice. Cross-slice функции нужно оставить в composed.

---

### 🔴 Craft Slice (строки 559-891)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `setCurrentScreen` | 568 | ❌ | Нет | ⚠️ Дублирует |
| `startCraft` | 570-593 | ❌ | ✅ resources, player | 🔴 Cross-slice |
| `updateCraftProgress` | 595-597 | ❌ | Нет | ⚠️ Дублирует |
| `completeCraft` | 599-649 | ⚠️ локальные функции | ✅ player, statistics | 🔴 Cross-slice |
| `isCrafting` | 651 | ❌ | Нет | ⚠️ Дублирует |
| `startRefining` | 653-681 | ❌ | ✅ resources | 🔴 Cross-slice |
| `updateRefiningProgress` | 683-685 | ❌ | Нет | ⚠️ Дублирует |
| `completeRefining` | 687-710 | ❌ | ✅ resources, player | 🔴 Cross-slice |
| `isRefining` | 712 | ❌ | Нет | ⚠️ Дублирует |
| `canRefine` | 714-730 | ❌ | ✅ player | 🔴 Cross-slice |
| `unlockRecipe` | 732-769 | ❌ | ✅ statistics | 🔴 Cross-slice |
| `isRecipeUnlocked` | 771-775 | ❌ | Нет | ⚠️ Дублирует |
| `getRecipeSource` | 777 | ❌ | Нет | ⚠️ Дублирует |
| `sellWeapon` | 779-801 | ❌ | ✅ resources, statistics | 🔴 Cross-slice |
| `getWeaponById` | 803 | ❌ | Нет | ⚠️ Дублирует |
| `addWeapon` | 805-814 | ❌ | ✅ statistics | 🔴 Cross-slice |
| `addWeaponV2` | 816-891 | ❌ | ✅ statistics | 🔴 Cross-slice |

**Вывод**: Много cross-slice функций. Локальные функции `calculateCraftQuality`, `getQualityGrade`, `calculateAttack`, `calculateSellPrice` должны быть из utils!

---

### 🟣 Orders (строки 893-989)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `generateOrder` | 897-910 | ❌ `require('@/data/market-data')` | ✅ player | 🔴 Cross-slice |
| `acceptOrder` | 912-928 | ❌ | Нет | ⚠️ Дублирует slice? |
| `completeOrder` | 930-972 | ❌ | ✅ resources, player, statistics | 🔴 Cross-slice |
| `expireOrder` | 974-983 | ❌ | Нет | ⚠️ Дублирует slice? |
| `getActiveOrder` | 985-989 | ❌ | Нет | ⚠️ Дублирует slice? |

**Вывод**: Есть `orders-slice.ts`, но он не интегрирован.

---

### 🔵 Tutorial (строки 991-1016)

| Функция | Строк | Cross-slice | Статус |
|---------|-------|-------------|--------|
| `nextTutorialStep` | 994-999 | Нет | ⚠️ Дублирует slice |
| `skipTutorial` | 1001-1007 | Нет | ⚠️ Дублирует slice |
| `completeTutorialStep` | 1009-1014 | Нет | ⚠️ Дублирует slice |
| `isTutorialActive` | 1016 | Нет | ⚠️ Дублирует slice |

**Вывод**: Есть `tutorial-slice.ts`, полностью дублируется.

---

### 🟤 Emergency Help (строки 1018-1055)

| Функция | Строк | Cross-slice | Статус |
|---------|-------|-------------|--------|
| `canGetEmergencyHelp` | 1019-1022 | ✅ workers, resources | ✅ Оставить в composed |
| `getEmergencyHelp` | 1024-1055 | ✅ resources, workers, statistics | ✅ Оставить в composed |

**Вывод**: Это чисто cross-slice логика, правильно в composed.

---

### 🟣 Enchantments (строки 1057-1178)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `sacrificeWeapon` | 1058-1087 | ✅ `calculateSacrificeValue` | ✅ resources, statistics | 🔴 Cross-slice |
| `unlockEnchantment` | 1089-1115 | ✅ `canAffordEnchantment` | ✅ resources, player | 🔴 Cross-slice |
| `isEnchantmentUnlocked` | 1117 | ❌ | Нет | ⚠️ Дублирует |
| `enchantWeapon` | 1119-1157 | ✅ `areEnchantmentsCompatible` | ✅ statistics | 🔴 Cross-slice |
| `removeEnchantment` | 1159-1178 | ❌ | Нет | ⚠️ Дублирует |
| `addWarSoulToWeapon` | 1178+ | ❌ | Нет | ⚠️ Дублирует slice |

**Вывод**: Есть `enchantments-slice.ts`, частично дублируется.

---

### ⚫ Repair (строки 1200+)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `getBestBlacksmith` | - | ✅ `findBestBlacksmith` | Нет | ✅ Использует utils |
| `getRepairOptions` | - | ✅ `getRepairOptionsForWeapon` | Нет | ✅ Использует utils |
| `executeWeaponRepair` | - | ✅ `executeRepairUtil` | ✅ resources, workers | 🔴 Cross-slice |
| `getWeaponRepairCost` | - | ✅ `calculateRepairCost` | Нет | ✅ Использует utils |
| `getMaxRepairPercent` | - | ✅ `calculateMaxRepairPercent` | Нет | ✅ Использует utils |
| `repairWeapon` | - | ✅ `calculateRepairCost`, `calculateMaxRepairPercent` | ✅ resources | 🔴 Cross-slice |

**Вывод**: Хорошо использует utils! Cross-slice логика правильно в composed.

---

### 🟢 Guild (строки 1300+)

| Функция | Строк | Использует utils | Cross-slice | Статус |
|---------|-------|------------------|-------------|--------|
| `refreshAdventurers` | - | ✅ `generateAdventurerPool`, `isAdventurerExpired` | Нет | ✅ |
| `initializeAdventurers` | - | ❌ | Нет | ✅ |
| `startExpedition` | - | ❌ | ✅ resources, weaponInventory | 🔴 Cross-slice |
| `cancelExpedition` | - | ❌ | ✅ resources | 🔴 Cross-slice |
| `completeExpedition` | - | ✅ `calculateExpeditionOutcome` | ✅ resources, player, weaponInventory | 🔴 Cross-slice |
| `startRecoveryQuest` | - | ❌ | ✅ resources | 🔴 Cross-slice |
| `completeRecoveryQuest` | - | ❌ | ✅ weaponInventory | 🔴 Cross-slice |
| `declineRecoveryQuest` | - | ❌ | Нет | ✅ |
| `addGlory` | - | ✅ `getGuildLevel` | Нет | ✅ |
| `getAdventurerById` | - | ❌ | Нет | ✅ |
| `getActiveExpeditionById` | - | ❌ | Нет | ✅ |
| `isWeaponInExpedition` | - | ❌ | Нет | ✅ |

**Вывод**: Хорошо использует utils. Cross-slice логика правильно в composed.

---

## Статистика

### По типу функции

| Тип | Количество | Процент |
|-----|------------|---------|
| 🔴 Cross-slice (координация) | ~25 | 35% |
| ⚠️ Дублирует slice | ~35 | 50% |
| ✅ Правильно использует utils | ~10 | 15% |

### По slice

| Slice | Функций в composed | Дублируют slice | Cross-slice |
|-------|-------------------|-----------------|-------------|
| Resources | 6 | 5 | 1 |
| Player | 3 | 3 | 0 |
| Workers | 8 | 5 | 3 |
| Craft | 17 | 8 | 9 |
| Orders | 5 | 3 | 2 |
| Tutorial | 4 | 4 | 0 |
| Emergency | 2 | 0 | 2 |
| Enchantments | 6 | 3 | 3 |
| Repair | 6 | 0 | 6 |
| Guild | 12 | 4 | 8 |

---

## Проблемы для решения

### 1. Локальные функции в completeCraft
```typescript
// Строки 607-611 — используют НЕ импортированные функции!
const quality = calculateCraftQuality(workersQuality, state.player.level, recipe.tier)
const qualityGrade = getQualityGrade(quality)
const attack = calculateAttack(recipe.type, recipe.tier, recipe.material, quality)
const sellPrice = calculateSellPrice(recipe.baseSellPrice, quality, recipe.tier)
```

**Проблема**: Эти функции не импортированы из utils, но вызываются! Это бага или магия?

**Решение**: Импортировать из `@/lib/store-utils/craft-utils`

### 2. calculateSacrificeValue
```typescript
// Строка 1063
const result = calculateSacrificeValue(...)
```

**Проблема**: Функция не импортирована, но вызывается.

**Решение**: Импортировать из `@/lib/store-utils/enchantment-utils`

### 3. Дубликаты в slices
В `workers-slice.ts`, `craft-slice.ts` есть локальные `generateId()`, `generateWorkerName()` и т.д.

**Решение**: Удалить локальные функции, импортировать из utils.

---

## План действий

1. **Фаза 2**: Удалить локальные функции в slices, импортировать из utils
2. **Фаза 3**: Обновить slices для использования utils
3. **Фаза 4**: Переписать composed:
   - Удалить дублирующие функции
   - Оставить только cross-slice координацию
   - Использовать slices для одиночных операций

---

## Cross-slice операции (остаются в composed)

Эти функции затрагивают несколько slices и должны остаться в composed:

1. `hireWorker` — workers + resources + statistics
2. `fireWorker` — workers + resources
3. `upgradeBuilding` — buildings + resources
4. `startCraft` — craft + resources + player
5. `completeCraft` — craft + player + statistics
6. `startRefining` — craft + resources
7. `completeRefining` — craft + resources + player
8. `sellWeapon` — craft + resources + statistics
9. `completeOrder` — orders + craft + resources + player + statistics
10. `sacrificeWeapon` — craft + resources + statistics
11. `unlockEnchantment` — enchantments + resources + player
12. `executeWeaponRepair` — repair + resources + workers + craft
13. `startExpedition` — guild + resources + craft
14. `completeExpedition` — guild + resources + player + craft + knownAdventurers
15. `getEmergencyHelp` — resources + workers + statistics

**Итого**: ~15 cross-slice функций (~150-200 строк кода)

---

*Аудит завершён: 2026-03-22*

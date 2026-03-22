# 🚀 Деплой SwordCraft v2 на Vercel + Turso

Полная инструкция по развёртыванию с облачными сохранениями.

---

## 📊 Что вы получите

| Функция | Описание |
|---------|----------|
| **Облачные сохранения** | Доступны с любого устройства |
| **Автосохранение** | Каждую минуту + при закрытии вкладки |
| **9 GB места** | ~90,000+ игроков |
| **Edge-расположение** | Быстро по всему миру |
| **Бесплатно** | Навсегда |

---

## 🔄 Пошаговая инструкция

### Шаг 1: Создание базы данных Turso (5 минут)

```bash
# 1. Установите Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# 2. Перезапустите терминал или выполните
source ~/.bashrc  # или ~/.zshrc

# 3. Авторизуйтесь (откроется браузер)
turso auth login

# 4. Создайте базу данных
turso db create swordcraft

# 5. Получите URL базы данных
turso db show swordcraft
# Скопируйте поле "URL" (например: libsql://swordcraft-abc123.turso.io)

# 6. Создайте токен авторизации
turso db tokens create swordcraft
# Скопируйте токен (длинная строка)
```

### Шаг 2: Подготовка репозитория

```bash
# 1. Форкните репозиторий на GitHub
# https://github.com/telldrasilo/SwordCraft-v2/fork

# 2. Клонируйте свой форк
git clone https://github.com/ВАШ_ЮЗЕР/SwordCraft-v2.git
cd SwordCraft-v2

# 3. Создайте файл .env
cp .env.example .env
```

### Шаг 3: Настройка .env

Отредактируйте `.env`:

```env
# Turso Database
DATABASE_URL="libsql://swordcraft-ВАШ-HASH.turso.io"
DATABASE_AUTH_TOKEN="ВАШ_ТОКЕН_ИЗ_TURSO"

# NextAuth (сгенерируйте секрет)
NEXTAUTH_SECRET="сгенерируйте-командой-ниже"
NEXTAUTH_URL="http://localhost:3000"
```

Генерация секрета:
```bash
openssl rand -base64 32
```

### Шаг 4: Локальный тест

```bash
# Установка зависимостей
npm install

# Инициализация базы данных
npm run db:setup

# Запуск в режиме разработки
npm run dev
```

Откройте http://localhost:3000 и проверьте:
- ✅ Игра загружается
- ✅ В панели ресурсов есть индикатор сохранения (☁️)
- ✅ Через минуту появляется "Сохранено только что"

### Шаг 5: Деплой на Vercel

#### Вариант А: Через Vercel CLI

```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Авторизуйтесь
vercel login

# 3. Запустите деплой
vercel

# 4. Для продакшена
vercel --prod
```

#### Вариант Б: Через веб-интерфейс

1. Откройте [vercel.com](https://vercel.com)
2. Нажмите **"Add New Project"**
3. Импортируйте ваш GitHub репозиторий
4. Настройте переменные окружения:

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | `libsql://swordcraft-xxx.turso.io` |
| `DATABASE_AUTH_TOKEN` | Токен из Turso |
| `NEXTAUTH_SECRET` | Сгенерированный секрет |
| `NEXTAUTH_URL` | `https://ваш-проект.vercel.app` |

5. Нажмите **"Deploy"**

### Шаг 6: Проверка

1. Откройте ваш сайт на Vercel
2. Поиграйте немного
3. Откройте сайт в другом браузере/устройстве
4. Убедитесь, что прогресс сохранился! 🎉

---

## 🔧 Устранение проблем

### Ошибка: "Cannot find module '@prisma/client'"

```bash
# Добавьте в package.json в scripts:
"postinstall": "prisma generate"

# Затем передеплойте
```

### Ошибка: "Database connection failed"

1. Проверьте правильность `DATABASE_URL`
2. Убедитесь, что токен не истёк:
```bash
turso db tokens list swordcraft
# Если нужен новый:
turso db tokens create swordcraft
```

### Ошибка: "Prisma schema validation error"

```bash
# Перегенерируйте клиент
npx prisma generate

# И пересоздайте схему
npx prisma db push --force-reset
```

### Сохранения не работают

1. Откройте DevTools → Network
2. Найдите запрос к `/api/save`
3. Проверьте ответ сервера
4. Убедитесь, что переменные окружения установлены

---

## 📁 Структура проекта

```
src/
├── app/
│   └── api/save/route.ts      # API сохранения
├── hooks/
│   └── use-cloud-save.ts      # Хук синхронизации
├── components/layout/
│   └── game-layout.tsx        # Интегрирован cloud save
└── lib/
    └── db.ts                  # Prisma + libSQL

prisma/
└── schema.prisma              # Схема БД (libSQL)

.env.example                   # Шаблон переменных
```

---

## 🎯 Что дальше?

### Добавить авторизацию (опционально)

```bash
npm install next-auth @auth/prisma-adapter
```

Создайте OAuth приложение:
- [Google Cloud Console](https://console.cloud.google.com)
- [Discord Developer Portal](https://discord.com/developers)

### Мониторинг

```bash
# Просмотр логов Vercel
vercel logs

# Просмотр данных Turso
turso db shell swordcraft
```

---

## 💡 Советы

1. **Резервные копии**: Turso автоматически создаёт снапшоты
2. **Масштабирование**: При росте аудитории включите Turso Scale
3. **Аналитика**: Подключите Vercel Analytics для отслеживания usage
4. **Кэширование**: Используйте Vercel KV для часто запрашиваемых данных

---

## 📞 Поддержка

- [Turso Docs](https://docs.turso.tech)
- [Vercel Docs](https://vercel.com/docs)
- [Prisma libSQL](https://www.prisma.io/docs/orm/overview/databases/libsql)

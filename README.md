# 🏥 Вебпортал Перечинської ЦРЛ

Офіційний вебпортал Перечинської центральної районної лікарні з системою реєстрації звернень громадян.

## Технічний стек

| Компонент | Технологія |
|-----------|------------|
| Backend API | Fastify 4.x |
| База даних | PostgreSQL 16 + Prisma ORM |
| Frontend | React 18 + Vite |
| UI бібліотека | Material-UI (MUI) v5 |
| Авторизація | JWT (access + refresh tokens) |
| Контейнери | Docker + docker-compose |

## Швидкий старт

### 1. Вимоги
- Node.js 20+
- Docker + Docker Compose (або PostgreSQL 16 локально)
- npm 10+

### 2. Клонування та налаштування

```bash
# Скопіювати env файл
cp .env.example backend/.env

# Запустити базу даних
docker-compose up -d

# Або з pgAdmin (для розробки)
docker-compose --profile dev up -d
```

### 3. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

API доступний на: http://localhost:4000
Swagger документація: http://localhost:4000/documentation

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Додаток доступний на: http://localhost:5173

## Ролі користувачів

| Роль | Опис |
|------|------|
| `ADMIN` | Повний доступ до системи |
| `DOCTOR` | Перегляд та відповідь на звернення |
| `USER` | Реєстрація та перегляд власних звернень |

## Облікові дані за замовчуванням

Після запуску `node prisma/seed.js`:

```
Email: admin@perechyn-hospital.gov.ua
Пароль: Admin@12345
```

## API Endpoints

Повна документація доступна за адресою: http://localhost:4000/documentation

### Авторизація
- `POST /api/auth/register` — Реєстрація нового користувача
- `POST /api/auth/login` — Вхід до системи
- `POST /api/auth/refresh` — Оновлення access токена
- `POST /api/auth/logout` — Вихід

### Звернення
- `GET /api/appeals` — Список звернень (Auth)
- `POST /api/appeals` — Нове звернення (Auth)
- `GET /api/appeals/:id` — Деталі звернення (Auth)

### Адміністрування
- `GET /api/admin/users` — Всі користувачі (Admin)
- `GET /api/admin/appeals` — Всі звернення (Admin/Doctor)
- `GET /api/admin/stats` — Статистика (Admin)

## Структура проекту

```
perechyn-hospital-portal/
├── backend/                  # Fastify API
│   ├── prisma/               # Схема БД та seed
│   └── src/
│       ├── config/           # Конфігурація
│       ├── middleware/       # Auth middleware
│       ├── modules/          # Feature modules
│       ├── plugins/          # Fastify плагіни
│       ├── utils/            # Утиліти
│       └── app.js            # App factory
├── frontend/                 # React SPA
│   └── src/
│       ├── api/              # API клієнт
│       ├── components/       # UI компоненти
│       ├── pages/            # Сторінки
│       ├── router/           # Маршрутизація
│       ├── store/            # Redux store
│       └── theme/            # MUI тема
├── docker-compose.yml
└── .env.example
```

## Ліцензія

Розроблено для Перечинської ЦРЛ © 2025

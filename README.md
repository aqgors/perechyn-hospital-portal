# 🏥 Perechyn Hospital Portal | Вебпортал Перечинської ЦРЛ

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-000000?logo=fastify&logoColor=white)](https://www.fastify.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![i18n](https://img.shields.io/badge/i18n-UA%20%7C%20EN-blue)](https://www.i18next.com/)

Сучасний повнофункціональний вебпортал для **Комунального некомерційного підприємства «Перечинська центральна районна лікарня»**. Проєкт поєднує в собі зручність для пацієнтів та потужні інструменти для медичного персоналу.

---

## ✨ Ключові особливості

*   **🛡 Розумний запис на прийом**: Інтерактивна система вибору лікаря та вільного часового слоту з автоматичним контролем зайнятості та захистом від Timezone-багів.
*   **📑 Кабінет пацієнта**: Історія звернень, статус лікування та прямий зв'язок з лікарем.
*   **👩‍⚕️ Панель лікаря та реєстратури**: Ефективне управління чергою, обробка звернень та чат з пацієнтами.
*   **📊 Адмін-панель**: Керування користувачами, аналітика звернень та моніторинг активності.
*   **🌐 Повна локалізація**: Двомовний інтерфейс (Українська / Англійська) на рівні UI та системних повідомлень.
*   **📧 Професійні сповіщення**: Естетичні email-шаблони для OTP-верифікації та оновлення статусів.
*   **🌓 Темна та світла теми**: Повністю адаптований інтерфейс з преміальним дизайном на базі Material UI.

---

## 🛠 Технологічний стек

| Складник | Технології |
| :--- | :--- |
| **Frontend** | React 18, Vite, Redux Toolkit, Material UI (MUI) v5, i18next |
| **Backend** | Fastify 4, Node.js, Prisma ORM, Zod, JWT Auth |
| **Database** | PostgreSQL 16 (Relational data), Prisma Studio |
| **Email** | Nodemailer (SMTP) з HTML-шаблонами |
| **Ops** | Docker, Docker Compose, Nginx (Stage build) |

---

## 🚀 Швидкий запуск (Docker)

Найшвидший спосіб запустити весь проєкт — використати Docker Compose:

```bash
# 1. Створіть .env файл для бекенду (використовуйте .env.example)
cp .env.example backend/.env

# 2. Запустіть контейнери (Backend, Frontend, Postgres)
docker-compose up -d --build
```
*   **Frontend**: [http://localhost:5173](http://localhost:5173)
*   **Backend API**: [http://localhost:3001](http://localhost:3001)
*   **pgAdmin** (опціонально): [http://localhost:5050](http://localhost:5050) (використовуйте `--profile dev`)

---

## 💻 Локальна розробка

Якщо ви хочете запустити компоненти окремо:

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
node prisma/seed.js # Наповнення тестовими даними
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Облікові дані для тестування

Після виконання `seed.js` ви можете увійти в систему:

| Роль | Email | Пароль |
| :--- | :--- | :--- |
| **Admin** | `admin@perechyn-hospital.gov.ua` | `Admin@12345` |
| **Doctor** | `doctor@perechyn-hospital.gov.ua` | `Doctor@12345` |

---

## 📁 Структура проєкту

```bash
root/
├── backend/                  # Fastify Сервер
│   ├── prisma/               # Схема БД та Міграції
│   └── src/                  # Вихідний код (Controller-Service-Routes)
├── frontend/                 # React Додаток
│   ├── src/api/              # Axios клієнти
│   ├── src/components/       # MUI Компоненти
│   ├── src/store/            # Redux Стейт
│   └── src/locales/          # i18n JSON переклади
├── docker-compose.yml        # Оркестрація контейнерів
└── .env.example              # Шаблон змінних середовища
```

---

## 📄 Ліцензія

Розроблено спеціально для **Перечинської ЦРЛ**. Усі права захищено © 2026.

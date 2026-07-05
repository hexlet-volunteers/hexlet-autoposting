# Отложка — сервис автопостинга и кросспостинга

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=hexlet-autoposting)

**Отложка** — веб-сервис, который помогает вести соцсети без ручной рутины: вы один раз собираете контент-план, а сервис сам публикует посты точно в срок сразу в несколько площадок. Один черновик адаптируется под каждую платформу (кросспостинг), текст помогает написать ИИ-ассистент, медиа хранятся в общей медиатеке, а результаты видны в отчётах. Проект разрабатывается командой и сообществом [Hexlet](https://hexlet.io).

Поддерживаемые площадки: **ВКонтакте, Telegram, Одноклассники, MAX, Дзен, RUTUBE, YouTube**.

> Этот README — «карта» для новых разработчиков. Начните с раздела [Как устроен проект](#как-устроен-проект) и [Бэклога](#бэклог-эпики--вехи--issues).

---

## Что умеет продукт

- 📅 **Автопостинг по расписанию** — контент-план на неделю/месяц/год, посты выходят сами.
- 🔁 **Кросспостинг** — один пост → публикация во все площадки с адаптацией под каждую.
- 🤖 **ИИ-помощник** — генерация текста по теме или фото, варианты тона, описания для видео (с квотой по тарифу).
- 🖼 **Медиатека** — общее хранилище фото/видео проекта (JPG/PNG/MP4).
- 📊 **Отчёты** — показатели по площадкам за период, доставка отчёта в Telegram.
- 👥 **Команда и роли** — Владелец / Редактор / Автор, приглашения по email.
- 💳 **Тарифы и биллинг** — бесплатный тариф навсегда + платные планы, оплата картой и по счёту для юрлиц.
- 🔐 **Вход** — почта/пароль и OAuth: VK ID, Telegram, Яндекс, Сбер ID, T-ID, Госуслуги.

---

## Как выглядит

| Лендинг | Личный кабинет | Композер поста |
|---|---|---|
| ![Лендинг](https://raw.githubusercontent.com/hexlet-volunteers/hexlet-autoposting/f4c6f3a3de56b94ae4690eefd967375e3c91d6f4/docs/design/screens/landing-home__full.png) | ![Кабинет](https://raw.githubusercontent.com/hexlet-volunteers/hexlet-autoposting/f4c6f3a3de56b94ae4690eefd967375e3c91d6f4/docs/design/screens/app-dashboard__full.png) | ![Композер](https://raw.githubusercontent.com/hexlet-volunteers/hexlet-autoposting/f4c6f3a3de56b94ae4690eefd967375e3c91d6f4/docs/design/screens/app-dashboard__modal-01.png) |

Все экраны (52 скриншота) и **интерактивные макеты** лежат в [`docs/design/`](docs/design). Открыть макет: файлы `docs/design/mockups/*.html` (кликабельные прототипы) — по ним и написаны issues.

---

## Технологии

**Frontend:** TypeScript · React · Vite · **Mantine UI** · **Redux Toolkit** (только UI-состояние) · **TanStack Query** (серверное состояние) · архитектура **Feature-Sliced Design**.

**Backend:** Go · Gin · **PostgreSQL + sqlc** · **Kafka** (воркер публикации).

**Контракт API — Design First:** **TypeSpec** (`.tsp`) → **OpenAPI 3.1** → генерация бэкенда (**oapi-codegen**) и фронт-клиента (**@hey-api/openapi-ts** + хуки TanStack Query).

**Дизайн-токены:** фон `#F6F4EF`, текст `#17150F`, primary `#2B50EC`, акцент `#FFD84D`, шрифт **Golos Text**.

---

## Как устроен проект

Система состоит из **маркетингового сайта** (лендинг, фичи, тарифы, вход) и **приложения** (личный кабинет), которые общаются с бэкендом по единому API-контракту. Публикация в соцсети асинхронная — через очередь.

```
                 ┌───────────────────────────────┐
  Публичный      │        Маркетинг-сайт         │   React + Mantine
  посетитель ──▶ │  лендинг · фичи · тарифы · вход │
                 └───────────────┬───────────────┘
                                 │  регистрация / вход
                                 ▼
                 ┌───────────────────────────────┐
  Пользователь ─▶│      Личный кабинет (SPA)      │   контент-план, композер,
                 │                                │   медиатека, отчёты, команда
                 └───────────────┬───────────────┘
                                 │  REST (OpenAPI 3.1)
                                 ▼
                 ┌───────────────────────────────┐
                 │   Content & Schedule Service   │   Go + Gin + PostgreSQL (sqlc)
                 │   (API + планировщик)          │
                 └───────────────┬───────────────┘
                                 │  наступило время публикации
                                 ▼
                       Kafka: publications.pending
                                 │
                                 ▼
                 ┌───────────────────────────────┐
                 │       Publishing Worker        │   публикация + кросспостинг
                 └───┬───────┬───────┬───────┬────┘
                     ▼       ▼       ▼       ▼
                    ВК      TG      Дзен   … (7 площадок, официальные API)
```

### Структура репозитория (целевая)

```
.
├── api/                # TypeSpec (.tsp) — источник правды для API + собранный OpenAPI 3.1
├── backend/            # Go + Gin (internal/...), генерируется из OpenAPI (oapi-codegen)
├── frontend/           # React + TS + Vite + Mantine, FSD (app/pages/widgets/features/entities/shared)
├── docs/
│   ├── design/         # дизайн-макеты (mockups/*.html) + скриншоты экранов (screens/*.png)
│   └── adr/            # архитектурные решения
├── db/migrations/      # SQL-миграции
└── docker-compose.yml
```

---

## Design First — как мы разрабатываем API

**Единственный источник правды для API — это TypeSpec (`.tsp`).** Любое изменение начинается с контракта, код НЕ пишется руками поверх сгенерированного.

```
1. Правишь контракт .tsp
        ▼
2. tsp compile → OpenAPI 3.1 (api/openapi/openapi.yaml)
        ├──▶ backend: oapi-codegen → типы + роутер + ServerInterface (реализуешь хендлеры)
        └──▶ frontend: @hey-api/openapi-ts → типизированный клиент + хуки TanStack Query
        ▼
3. Раздельная раскатка фронта и бэка
```

CI-гардрейлы: перегенерация + `git diff --exit-code` (нет расхождений), линт спеки (Spectral/Redocly), oasdiff (ломающие изменения).

---

## Локальный запуск

Инфраструктура (PostgreSQL 16 + Kafka 3.9.1 в режиме KRaft, без ZooKeeper) поднимается через Docker Compose. Удобные обёртки — в `Makefile`:

```bash
make up        # поднять сервисы (PostgreSQL + Kafka)
make ps        # статус контейнеров (должны быть healthy)
make down      # остановить
make clean     # остановить и удалить volume-данные (чистый старт)
```

Диагностика инфраструктуры:

```bash
make postgres        # подключиться к PostgreSQL (креды из .env)
make kafka-api       # проверить доступность брокера
make kafka-topics    # список топиков Kafka
make logs            # логи всех сервисов (make logs-postgres / make logs-kafka)
```

Бэкенд (Go):

```bash
make tidy      # go mod tidy + fmt + go vet
make test      # тесты
make lint      # golangci-lint (make lint-fix — с автоправками)
```

Фронтенд:

```bash
cd frontend
npm install
npm run dev    # http://localhost:5173
```

Переменные окружения — в `.env` (см. `.env.example`): доступ к БД, секреты JWT, ключи OAuth-провайдеров, брокеры Kafka.

---

## Бэклог: эпики → вехи → issues

Работа разбита на **12 эпиков** и **8 вех** (milestones). Полный бэклог с описанием каждой задачи — в [BACKLOG.md](BACKLOG.md); задачи заведены как GitHub Issues (метки `epic`, `area:*`, `type:*`, `priority:*`).

**Вехи:** `M0 Фундамент` · `M1 Маркетинг-сайт` · `M2 Ядро приложения` · `M3 Публикация` · `M4 Медиа и ИИ` · `M5 Отчёты и команда` · `M6 Биллинг` · `M7 Hardening и запуск`.

**Эпики:** Frontend-фундамент и дизайн-система · Маркетинг-сайт · Авторизация · Оболочка и проекты · Контент-план и композер · Медиатека · Площадки и публикация · ИИ-помощник · Отчёты · Команда и роли · Биллинг · Backend-фундамент (Design First).

Каждый issue написан для джуна: **Контекст → Что нужно сделать → Технические детали → Критерии приёмки → Definition of Done → Подсказки**, и у фронтенд-задач приложен скриншот экрана.

---

## Разработка и вклад

- Прежде чем брать задачу — найдите её issue и веху; фронтенд-задачи начинайте с изучения макета в `docs/design/`.
- Ветка от `main` → Pull Request → зелёный CI (тесты + линтеры + гардрейлы контракта).
- Изменение API всегда начинается с правки `.tsp`, а не сгенерированного кода.

---

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=hexlet-autoposting)

Репозиторий создан и поддерживается командой [Hexlet](https://hexlet.io) и сообществом.

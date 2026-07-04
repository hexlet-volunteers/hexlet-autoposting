# Hexlet Autoposting

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=hexlet-autoposting)

Сервис автопостинга для Telegram и ВКонтакте — часть образовательной экосистемы [Hexlet](https://hexlet.io). Он позволяет создавать посты, планировать их публикацию на заданное время и автоматически раскладывать контент по внешним платформам (Telegram, VK). Ядро сервиса состоит из двух частей: приёма и планирования контента (Content & Schedule Service) и воркера публикации (Publishing Worker), которые общаются между собой через Kafka. Проект разрабатывается волонтёрами и студентами Hexlet.

---

## Технологии

Мы движемся к следующему целевому стеку. Часть уже есть в коде, часть внедряется — это явно помечено.

### Backend

| Технология | Статус |
| --- | --- |
| Go 1.24 | есть |
| Gin (`gin v1.11.0`) — HTTP-фреймворк | есть |
| PostgreSQL (`pgx/v4`, сырой SQL) | есть |
| Kafka (`segmentio/kafka-go`), топик `publications.pending` | есть |
| Telegram Bot API (`go-telegram-bot-api/v5`) | есть (воркер в работе) |
| `oapi-codegen v2` — генерация типов, роутера и `ServerInterface` из OpenAPI | внедряется |
| `oapi-codegen/gin-middleware` (`OapiRequestValidator`) — валидация запросов по контракту | внедряется |
| VK API — воркер публикации | планируется |
| `sqlc` + `pgx/v5` вместо сырого SQL на `pgx/v4` | планируется (M4) |

> Сейчас API-документация генерируется из кода аннотациями `swaggo` (Swagger 2.0, code-first). Это временное состояние: целевой подход — обратный (spec-first), см. раздел «Design First».

### Frontend

Фронтенда в репозитории пока нет. Он появится в рамках M3 и будет построен на:

| Технология | Назначение |
| --- | --- |
| TypeScript + React + Vite | база приложения |
| Mantine UI | компонентная библиотека |
| Redux Toolkit | **только** клиентское/UI-состояние |
| TanStack Query | серверное состояние |
| `@hey-api/openapi-ts` + плагин TanStack Query | генерация типизированного клиента и `queryOptions` из OpenAPI |

> RTK Query не используем: смешивать его с TanStack Query для серверного состояния — антипаттерн.

### Инфраструктура и контракт

- **PostgreSQL 17** (в `docker-compose` — с репликой master/slave).
- **Kafka** (`confluentinc/cp-kafka`) + **Zookeeper**.
- **TypeSpec** (`.tsp`) → компиляция в **OpenAPI 3.1** (`@typespec/openapi3`, `@typespec/http`) — единый источник правды для API (внедряется).

---

## Архитектура

Система состоит из двух сервисов, которые обмениваются событиями через Kafka, и общей БД. Контент принимается и планируется одним компонентом, а фактическая публикация во внешние платформы выполняется отдельным воркером.

```
                    ┌──────────────────────────────┐
   HTTP :8080       │   Content & Schedule Service  │
  клиент/фронт ───▶ │   (Gin API + планировщик)     │
                    └───────────────┬───────────────┘
                                    │  пишет посты и расписание
                                    ▼
                            ┌───────────────┐
                            │  PostgreSQL   │
                            └───────┬───────┘
                                    │  наступает время публикации
                                    ▼
                     Kafka topic: publications.pending
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │      Publishing Worker        │
                    │  (потребитель Kafka)          │
                    └───────┬───────────────┬───────┘
                            │               │
                            ▼               ▼
                     Telegram Bot API     VK API
```

Поток:

1. Клиент создаёт пост через HTTP API (Content & Schedule Service). Пост и время публикации сохраняются в PostgreSQL.
2. Планировщик (`internal/service/scheduler_service.go`) отслеживает запланированные посты и, когда наступает их время, отправляет событие в Kafka-топик `publications.pending`.
3. Publishing Worker читает `publications.pending` и публикует контент во внешние платформы — Telegram и (в планах) VK.

---

## Design First — как мы разрабатываем API

Это ключевой принцип проекта. **Единственный источник правды для API — это TypeSpec (`.tsp`).** Мы описываем контракт первым, а код бэкенда и фронтенда генерируем из него.

### Золотой путь (golden path)

```
1. Правишь контракт в .tsp        (api/*.tsp)
        │
        ▼
2. tsp compile                     → OpenAPI 3.1  (api/openapi/openapi.yaml)
        │
        ├──────────────▶ 3a. Генерация бэкенда
        │                    oapi-codegen v2 (gin-server)
        │                    → типы + роутер + ServerInterface (*.gen.go)
        │
        └──────────────▶ 3b. Генерация фронтенда
                             @hey-api/openapi-ts + TanStack Query plugin
                             → типизированный клиент + queryOptions
        │
        ▼
4. Раздельная раскатка FE и BE
```

- **Меняешь API — начинаешь с `.tsp`.** Никогда не наоборот.
- **НЕ редактируй сгенерированные файлы руками.** Файлы `*.gen.go` (бэкенд) и сгенерированный клиент (фронтенд) перезаписываются при каждой генерации — любые ручные правки в них будут потеряны. Ручная реализация хендлеров живёт в **отдельных** файлах и реализует сгенерированный `ServerInterface`.
- **Валидация запросов** на бэкенде выполняется по контракту через `oapi-codegen/gin-middleware` (`OapiRequestValidator` поверх `kin-openapi`) — не пишем ручные валидаторы.
- **Аддитивные** изменения контракта (новые необязательные поля, новые ручки) раскатываются на FE и BE независимо. **Ломающие** изменения требуют координации по схеме expand-then-contract.

### Гардрейлы в CI (обязательны)

- **Stale-codegen gate** — CI заново прогоняет полную генерацию и делает `git diff --exit-code`: если сгенерированный код разошёлся с контрактом, сборка падает.
- **Spec lint** — линтинг OpenAPI-спеки (Spectral / Redocly).
- **oasdiff** — GitHub Action для обнаружения ломающих изменений контракта на PR.
- **golangci-lint** — `govet`, `errcheck`, `staticcheck`, `revive` для Go-кода.

---

## Локальный запуск

### Требования

- Docker и Docker Compose
- Go 1.24+ (для локальной сборки и генерации)

### Переменные окружения

Скопируйте пример и заполните значения (файл `.env` в корне — он в `.gitignore`):

```bash
cp .env.example .env   # если файла-примера ещё нет, создайте .env вручную
```

`docker-compose.yml` ожидает следующие переменные:

| Переменная | Назначение |
| --- | --- |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | учётные данные PostgreSQL |
| `MASTER_HOST`, `MASTER_PORT` | адрес основной БД |
| `SLAVE_HOST`, `SLAVE_PORT` | адрес реплики БД |
| `DB_SSLMODE` | режим SSL (в compose — `disable`) |
| `KAFKA_BROKERS` | брокеры Kafka (в compose — `kafka:9092`) |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | секреты для JWT |
| `GOOGLE_KEY`, `GOOGLE_SECRET` | ключи Google-интеграции |

### Запуск

```bash
docker-compose up --build
```

Поднимутся: приложение, PostgreSQL (master `:5432` / slave `:5433`), Kafka (`:9092`) и Zookeeper (`:2181`).

- HTTP API доступен на **`:8080`**.
- Миграции применяются из `db/migrations/` при инициализации PostgreSQL.
- Топики Kafka (например `publications.pending`) можно создать скриптом `scripts/create-kafka-topics.bat` (Windows) либо аналогичной командой `kafka-topics`.

### Генерация из контракта (локально)

По мере внедрения Design First генерация будет вынесена в скрипты/`Makefile`. Ориентировочный порядок:

```bash
# 1. Скомпилировать TypeSpec → OpenAPI 3.1
npx tsp compile api/

# 2. Сгенерировать бэкенд-код из OpenAPI
go generate ./...        # обёртка над oapi-codegen v2

# 3. Сгенерировать фронтенд-клиент из OpenAPI
npm run generate         # обёртка над @hey-api/openapi-ts (в /frontend)
```

> Точные команды появятся вместе с настройкой генерации (M1–M3). Не запускайте генерацию с ручными правками в `*.gen.go` — их перезапишет.

---

## Структура репозитория

Текущая структура — Go-приложение в корне. Целевая структура (по мере миграции) — три верхнеуровневых каталога: контракт, бэкенд, фронтенд.

### Целевая структура

```
.
├── api/                     # TypeSpec (.tsp) — источник правды + собранный OpenAPI 3.1
│   └── openapi/             # сгенерированный openapi.yaml (артефакт)
├── backend/
│   └── internal/
│       ├── app/             # сборка приложения
│       ├── config/          # конфигурация из окружения
│       ├── handler/         # реализация ServerInterface (ручной код)
│       ├── domain/          # доменные модели
│       ├── repository/      # доступ к данным (позже — sqlc + pgx/v5)
│       ├── service/         # бизнес-логика, планировщик
│       └── kafka/           # продюсер/консьюмер publications.pending
├── frontend/                # React + TS + Vite + Mantine + TanStack Query
├── db/
│   └── migrations/          # SQL-миграции (001_init_schema.sql, ...)
├── docker-compose.yml
└── Dockerfile
```

### Как есть сейчас

- Go-модуль называется `hexlet`, `main.go` и весь код лежат в корне и `internal/`.
- Каталогов `api/`, `backend/`, `frontend/` пока нет — они появятся в ходе миграции.

---

## Статус миграции

Проект находится в переходном состоянии между тем, что есть, и целевой архитектурой Design First:

- **Есть:** Go/Gin backend, PostgreSQL на `pgx/v4` (сырой SQL), Kafka, планировщик, Telegram-воркер (в работе). API-документация генерируется из кода через `swaggo` (Swagger 2.0, code-first).
- **Внедряется:** TypeSpec → OpenAPI 3.1 как источник правды, генерация бэкенда через `oapi-codegen v2`, CI-гардрейлы (stale-codegen gate, spec lint, oasdiff, golangci-lint).
- **Планируется:** фронтенд (React/TS/Mantine/TanStack Query, M3), слой данных на `sqlc` + `pgx/v5` (M4), воркер публикации в VK.

Работа разбита на эпики и вехи (milestones): **M0 — Foundations & Decisions**, **M1 — Contract Freeze (API in TypeSpec)**, **M2 — Backend Spec-First**, **M3 — Frontend MVP**, **M4 — Data Layer (sqlc + pgx v5)**, **M5 — Stabilization & Docs**.

---

## Разработка и вклад

- Правила оформления вклада — в [CONTRIBUTING.md](CONTRIBUTING.md) (файл появится/дополняется по мере роста проекта).
- Ветки и PR: разработка ведётся в отдельных ветках от `main`, изменения приходят через Pull Request с обязательным прохождением CI (тесты + линтеры + гардрейлы контракта).
- Бэклог организован как **эпики → вехи (milestones) → issues**. Прежде чем брать задачу, найдите соответствующий issue и веху. Любое изменение API начинается с правки `.tsp`, а не сгенерированного кода.

---

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=hexlet-autoposting)

Этот репозиторий создан и поддерживается командой [Hexlet](https://hexlet.io) и сообществом.

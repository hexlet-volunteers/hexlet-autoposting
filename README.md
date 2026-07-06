# Отложка — сервис автопостинга и кросспостинга

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=hexlet-autoposting)

**Отложка** помогает вести соцсети без ручной рутины: вы собираете контент-план один раз, а сервис сам публикует посты в срок сразу в несколько площадок. Один черновик адаптируется под каждую платформу (кросспостинг), текст помогает написать ИИ-ассистент, медиа хранятся в общей медиатеке, результаты видны в отчётах.

Поддерживаемые площадки: **ВКонтакте, Telegram, Одноклассники, MAX, Дзен, RUTUBE, YouTube**.

Проект разрабатывается командой и сообществом [Hexlet](https://hexlet.io).

## Технологии

- **Frontend:** TypeScript · React · Vite · Mantine UI · Redux Toolkit · TanStack Query · архитектура Feature-Sliced Design.
- **Backend:** Go · Gin · PostgreSQL (sqlc) · Kafka (асинхронный воркер публикации).
- **API — Design First:** TypeSpec → OpenAPI 3.1 → генерация серверных типов (oapi-codegen) и типизированного фронт-клиента (@hey-api/openapi-ts).

## Локальный запуск

Нужны **Docker** (для PostgreSQL и Kafka), **Go** и **Node.js**.

**1. Переменные окружения** — скопируйте пример и при необходимости поправьте:

```bash
cp .env.example .env
```

**2. Инфраструктура** (PostgreSQL + Kafka через Docker Compose):

```bash
make up     # поднять сервисы
make ps     # проверить, что контейнеры healthy
make down   # остановить
```

**3. Backend** (Go):

```bash
make test   # тесты
make lint   # линтер
go run .     # запустить сервис
```

**4. Frontend** (React):

```bash
cd frontend
npm install
npm run dev  # http://localhost:5173
```

## Дополнительно

- Бэклог задач (эпики, вехи, issues) — [BACKLOG.md](BACKLOG.md).
- Дизайн-макеты и скриншоты экранов — [`docs/design/`](docs/design).

---

[![Hexlet Ltd. logo](https://raw.githubusercontent.com/Hexlet/assets/master/images/hexlet_logo128.png)](https://hexlet.io/?utm_source=github&utm_medium=link&utm_campaign=hexlet-autoposting)

Репозиторий создан и поддерживается командой [Hexlet](https://hexlet.io) и сообществом.

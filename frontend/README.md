# Frontend — Hexlet Autoposting

SPA для планирования и публикации постов. Стек: **React + TypeScript + Vite + Mantine UI**,
**Redux Toolkit** (только клиентское/UI-состояние) и **TanStack Query** (серверное состояние).
Архитектура — **Feature-Sliced Design (FSD)**.

## Запуск

```bash
npm install
cp .env.example .env        # при необходимости укажи VITE_API_URL
npm run dev                 # http://localhost:5173 (проксирует /posts, /platforms на :8080)
npm run typecheck           # проверка типов
npm run build               # прод-сборка
```

## Архитектура (FSD)

Слои сверху вниз; импорт разрешён **только вниз** (слой видит нижележащие, не наоборот):

```
app/        # инициализация: провайдеры (Mantine, Query, Redux), роутинг, store, тема
pages/      # страницы-композиции: posts, platforms, login, not-found
widgets/    # самостоятельные блоки: posts-board, platforms-list, app-shell (макет)
features/   # действия пользователя: create/edit/delete-post, create/delete-platform,
            #                        filter-posts-by-status, switch-user, auth
entities/   # бизнес-сущности: post, platform, session (модель + api + ui)
shared/     # переиспользуемое без доменной логики: api-клиент, config, lib, ui
```

Каждый слайс имеет сегменты `ui/` (компоненты), `model/` (типы, стор, хуки),
`api/` (запросы/хуки данных) и публичный `index.ts` — импортировать слайс можно **только**
через его `index.ts`, не залезая внутрь.

### Разделение состояния

- **Серверное состояние** — TanStack Query (`entities/*/api`, ключи в `*Keys`, инвалидция в мутациях `features/*`).
- **Клиентское/UI-состояние** — Redux Toolkit (`entities/session`, `features/filter-posts-by-status`).
  RTK Query намеренно не используется (см. решение в корневом `BACKLOG.md`).

## Связь с бэкендом и Design First

Клиент к API — в `shared/api`. Сейчас это тонкий рукописный `client.ts` (bridge). Целевое
состояние по **Design First**: клиент и хуки TanStack Query **генерируются из OpenAPI**
(`npm run generate:api`, конфиг `openapi-ts.config.ts`) — см. `src/shared/api/README.md`.

### Известная особенность контракта

Текущий бэкенд ждёт `id_user` в **теле** GET-запросов, чего браузерный `fetch` не умеет
(бэклог #45/#82). Поэтому клиент шлёт `id_user` **query-параметром** — форму, которую поддержит
перегенерированный Design-First бэкенд. Пока нет JWT-аутентификации (#60), текущий пользователь
хранится в `entities/session` и переключается в шапке (`features/switch-user`).

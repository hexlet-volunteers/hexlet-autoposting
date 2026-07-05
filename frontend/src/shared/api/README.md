# shared/api

Единая точка доступа к бэкенду для всех вышележащих слоёв (`entities`, `features`, …).

## Сейчас (bridge)

`client.ts` — тонкий рукописный типизированный клиент поверх `fetch`. Слои выше импортируют
только `request` / `HttpError` из `@/shared/api`, поэтому реализацию можно подменить незаметно.

## Целевое состояние (Design First)

Клиент **генерируется из OpenAPI-контракта**, а не пишется руками:

```bash
npm run generate:api      # обёртка над @hey-api/openapi-ts, см. ../../openapi-ts.config.ts
```

Генератор кладёт типы, клиент и хуки TanStack Query в `src/shared/api/generated` (в `.gitignore`).
Когда контракт (`../api/openapi/openapi.yaml`) появится (веха M1), `entities/*/api` переключаются
на сгенерированные хуки, а `client.ts` удаляется.

> Правило: **не редактировать сгенерированные файлы руками.** Изменение API начинается с `.tsp`.

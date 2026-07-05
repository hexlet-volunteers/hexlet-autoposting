# Бэклог продукта «Отложка»

Полный план работ по продукту, разбитый на **эпики → вехи (milestones) → issues**. Задачи заведены как GitHub Issues; здесь — навигационный индекс со ссылками. Подробности, скриншоты и критерии приёмки — в самих issue. См. также [README](README.md) и дизайн-макеты в [`docs/design/`](docs/design).

Каждый issue написан для джуна: **Контекст → Что нужно сделать → Технические детали → Критерии приёмки → Definition of Done → Подсказки**; у фронтенд-задач приложен скриншот экрана.

## Вехи

| Веха | Issues | Цель |
| --- | --- | --- |
| **M0 — Фундамент** | 16 | Дизайн-система, FSD-скаффолд, контракт TypeSpec + доменная БД, ядро авторизации. |
| **M1 — Маркетинг-сайт** | 8 | Публичные страницы: лендинг, фичи, тарифы, правовая, шапка/футер. |
| **M2 — Ядро приложения** | 12 | Оболочка, проекты, контент-план, композер. |
| **M3 — Публикация** | 6 | Подключение площадок (OAuth ×7), кросспостинг, воркер. |
| **M4 — Медиа и ИИ** | 10 | Медиатека и ИИ-помощник (генерация, квоты). |
| **M5 — Отчёты и команда** | 8 | Отчёты по площадкам и управление командой/ролями. |
| **M6 — Биллинг** | 6 | Каталог тарифов, апгрейд, платежи, лимиты. |
| **M7 — Hardening и запуск** | 0 | Стабилизация, наблюдаемость, финальные гардрейлы. |

Всего: **12 эпиков**, **66 задач**, **8 вех**.

---

## [#93](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/93) EPIC: Маркетинг-сайт «Отложка»

**Цель.** Собрать публичный маркетинг-сайт «Отложки»: общая шапка и футер, главная страница-лендинг со всеми секциями и интерактивными демо, A/B-варианты hero, три страницы фич (Автопостинг, Кросспостинг, ИИ-помощник), страница «Тарифы» и страница «Правовая информация». Всё строго по макетам docs/design/mockups, на целевом стеке (TypeScript + React + Vite + Mantine + TanStack Query, организация по Feature-Sliced Design). Интерактивные демо на лендинге (календарь, генератор ИИ, превью кросспостинга) — клиентские симуляции без обращения к бэкенду; позже часть из них может дёргать реальные ручки. Цель эпика — привести неавторизованного посетителя к регистрации («Попробовать бесплатно»).

**Метки:** `epic` · `type:feature` · `area:frontend` · `priority:P1` · **веха:** M1 — Маркетинг-сайт

Задачи (8):

- [ ] [#99](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/99) **Публичная шапка + футер маркетинга (переиспользуемые виджеты)** — M1 · P1 · M · FE
- [ ] [#100](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/100) **Главная страница-лендинг: сборка всех секций** — M1 · P1 · XL · FE
- [ ] [#101](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/101) **A/B-варианты hero главной (Планёрка / Эфир / Магнитики)** — M1 · P2 · L · FE
- [ ] [#102](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/102) **Страница фичи «Автопостинг»** — M1 · P1 · M · FE
- [ ] [#103](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/103) **Страница фичи «Кросспостинг»** — M1 · P1 · M · FE
- [ ] [#104](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/104) **Страница фичи «ИИ-помощник»** — M1 · P1 · M · FE
- [ ] [#105](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/105) **Страница «Тарифы» (вёрстка: карточки, таблица, FAQ)** — M1 · P1 · L · FE
- [ ] [#106](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/106) **Страница «Правовая информация» (оферта, политика, sticky-оглавление)** — M1 · P2 · M · FE

## [#94](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/94) EPIC: Авторизация и онбординг

**Цель.** Реализовать полный контур входа в «Отложку»: единый экран с тремя режимами (Вход / Регистрация / Восстановление пароля), 6 кнопок OAuth-входа (VK ID, Telegram, Яндекс, Сбер ID, T-ID, Госуслуги), а также backend-контур аутентификации — email-логин/регистрация/сброс пароля с выдачей JWT + refresh и «Запомнить меня», OAuth-интеграции 6 провайдеров с созданием/линковкой пользователя, и эндпоинты сессии GET /me + logout. При регистрации новому пользователю автоматически провижинится бесплатный тариф (3 соцсети и 10 постов в месяц). Контракт API — Design First: сначала описывается в TypeSpec (.tsp), затем компилируется в OpenAPI 3.1, backend генерируется oapi-codegen, клиент — @hey-api/openapi-ts; сгенерированные файлы не редактируются руками.

**Метки:** `epic` · `area:frontend` · `area:backend` · `area:auth` · `priority:P0` · **веха:** M0 — Фундамент

Задачи (6):

- [ ] [#107](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/107) **Контракт аутентификации в TypeSpec: /auth/*, /me, схемы токенов и пользователя** — M0 · P0 · M · BE
- [ ] [#108](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/108) **FE: Экран входа/регистрации/сброса пароля — одна карточка с тремя режимами** — M0 · P0 · L · FE
- [ ] [#109](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/109) **FE: Кнопки OAuth-входа — 6 провайдеров с бренд-цветами** — M0 · P1 · M · FE
- [ ] [#110](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/110) **BE: Email-аутентификация — /auth/login, /auth/register, /auth/password-reset, JWT + refresh, провижининг free-тарифа** — M0 · P0 · L · BE
- [ ] [#111](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/111) **BE: OAuth-интеграции 6 провайдеров — authorize + callback, создание/линковка пользователя, сессия** — M0 · P1 · L · BE
- [ ] [#112](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/112) **BE: Сессия и текущий пользователь — GET /me и POST /auth/logout** — M0 · P0 · M · BE

## [#95](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/95) EPIC: Оболочка приложения и проекты

**Цель.** Собрать каркас приложения «Отложка» после входа: постоянный сайдбар (бренд, свитчер проектов, навигация по разделам, виджет тарифа с квотой ИИ, аккаунт), модалки «Новый проект» и «Выбор цвета», раздел «Настройки» (профиль + настройки проекта + архивирование), а также серверные ручки для проектов, профиля и настроек проекта. Все экраны берут копию и токены из макета docs/design/mockups/app-dashboard.html. Контракт API — Design First: TypeSpec → OpenAPI 3.1 → бэкенд генерируется oapi-codegen, фронтенд-клиент — @hey-api/openapi-ts; сгенерированные файлы руками не правим.

**Метки:** `epic` · `area:frontend` · `area:backend` · `priority:P0` · **веха:** M2 — Ядро приложения

Задачи (6):

- [ ] [#113](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/113) **FE: App shell и сайдбар (бренд, свитчер проектов, навигация, виджет тарифа, аккаунт)** — M2 · P0 · L · FE
- [ ] [#114](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/114) **FE: Модалка «Новый проект» и свитчер активного проекта** — M2 · P0 · M · FE
- [ ] [#115](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/115) **FE: Модалка «Выбор цвета» (палитра свотчей)** — M2 · P1 · S · FE
- [ ] [#116](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/116) **FE: Раздел «Настройки» — профиль, настройки проекта, архивирование (danger-зона)** — M2 · P1 · L · FE
- [ ] [#117](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/117) **BE: Проекты — CRUD, архивирование/восстановление, активный проект** — M2 · P0 · L · BE
- [ ] [#118](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/118) **BE: Профиль и настройки проекта — GET/PATCH /me и GET/PATCH /projects/{id}/settings** — M2 · P1 · M · BE

## [#96](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/96) EPIC: Контент-план и композер

**Цель.** Реализовать ядро приложения «Отложка» — контент-план проекта (календарь с масштабами Неделя/Месяц/Квартал/Год, очередь и архив отправленных), модальный композер для создания и редактирования постов (текст с форматированием, выбор площадок, дата/время, повторы, вложения, панель ИИ), модалку статистики опубликованного поста, а также backend-эндпоинты постов, контент-плана, очереди/архива и статистики. Контракт API авторуется в TypeSpec → OpenAPI 3.1, backend генерируется oapi-codegen, клиент — @hey-api/openapi-ts; никто не правит сгенерированные файлы руками. Frontend строится по FSD, серверное состояние — через TanStack Query, UI-состояние (открытие модалки, черновик формы) — через Redux Toolkit. Итог: пользователь видит свой контент-план, планирует и редактирует посты в композере, следит за очередью публикаций и смотрит статистику вышедших постов — точно по макету app-dashboard.html.

**Метки:** `epic` · `area:frontend` · `area:backend` · `priority:P0` · **веха:** M2 — Ядро приложения

Задачи (6):

- [ ] [#119](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/119) **BE: Контракт TypeSpec и API постов + контент-план (POST/PATCH/DELETE /posts, GET /content-plan)** — M2 · P0 · XL · BE
- [ ] [#120](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/120) **BE: Очередь и архив — GET /posts/queue, GET /posts/sent, GET /posts/{id}/stats** — M2 · P0 · L · BE
- [ ] [#121](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/121) **FE: Контент-план — календарь с масштабами Неделя/Месяц/Квартал/Год** — M2 · P0 · XL · FE
- [ ] [#122](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/122) **FE: Очередь и архив — вкладки «В очереди» и «Отправленные»** — M2 · P0 · L · FE
- [ ] [#123](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/123) **FE: Композер — модалка создания и редактирования поста** — M2 · P0 · XL · FE
- [ ] [#124](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/124) **FE: Модалка «Статистика поста» — аналитика опубликованного поста** — M2 · P1 · M · FE

## [#97](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/97) EPIC: Медиатека — хранилище фото и видео проекта

**Цель.** Реализовать раздел «Медиатека» приложения «Отложка»: пользователь видит сетку фото и видео проекта (имя, тип, размер, дата), может загружать файлы (мульти-загрузка JPG/PNG/MP4 до 2 ГБ), открывать предпросмотр с метаданными и удалять медиа. Медиатека также служит источником файлов для композера поста (эпик E5): в модалке «Загрузка файла» можно либо загрузить новый файл, либо выбрать существующий из медиатеки. На бэкенде — контракт в TypeSpec → OpenAPI 3.1 → oapi-codegen: список медиа проекта, multipart-загрузка с валидацией типа/размера, удаление, получение деталей и preview URL, а также привязка медиа к посту. Ground truth — макет docs/design/mockups/app-dashboard.html (экраны «Медиатека», «Загрузка файла», «Загрузка в медиатеку», «Предпросмотр медиа»).

**Метки:** `epic` · `area:frontend` · `area:backend` · `priority:P1` · **веха:** M4 — Медиа и ИИ

Задачи (5):

- [ ] [#125](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/125) **BE: Контракт и API медиатеки — список, загрузка (multipart), удаление, детали/preview** — M4 · P1 · L · BE
- [ ] [#126](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/126) **BE: Привязка медиа к посту (media_ids в композере, эпик E5)** — M4 · P1 · M · BE
- [ ] [#127](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/127) **FE: Раздел «Медиатека» — сетка фото/видео, кнопка загрузки, открытие предпросмотра** — M4 · P1 · L · FE
- [ ] [#128](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/128) **FE: Модалки «Загрузка в медиатеку» (мульти-загрузка) и «Загрузка файла» (для поста)** — M4 · P1 · L · FE
- [ ] [#129](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/129) **FE: Модалка «Предпросмотр медиа» — метаданные и удаление** — M4 · P1 · M · FE

## [#98](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/98) EPIC: Площадки и публикация

**Цель.** Дать пользователю подключить все 7 площадок (ВКонтакте, Telegram, Одноклассники, MAX, Дзен, RUTUBE, YouTube) через OAuth, видеть их статус в проекте, а затем публиковать один черновик сразу в несколько площадок с автоматической адаптацией под лимиты и форматы каждой сети. Публикация выполняется асинхронным воркером через Kafka, с постатусной обработкой по каждой площадке, ретраями и событием результата. Контракт API — Design First: сначала описывается в TypeSpec (.tsp) → компилируется в OpenAPI 3.1 → бэкенд генерируется oapi-codegen, клиент фронта — @hey-api/openapi-ts. Никто не правит сгенерированные файлы руками.

Ground truth (макеты): docs/design/mockups/app-dashboard.html (модалка «Подключение площадки», фильтр-чипсы площадок), docs/design/mockups/feature-crossposting.html (адаптация под сеть), docs/design/mockups/feature-autoposting.html (очередь и статусы «опубликован»/«в очереди»).

**Метки:** `epic` · `area:frontend` · `area:backend` · `area:infra` · `priority:P0` · **веха:** M3 — Публикация

Задачи (6):

- [ ] [#130](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/130) **BE: Контракт TypeSpec для площадок и публикаций (connections + publications) → OpenAPI** — M3 · P0 · M · BE
- [ ] [#131](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/131) **FE: Модалка «Подключение площадки» — список 7 площадок со статусом, подключить/отключить (OAuth), выбор канала/сообщества** — M3 · P0 · L · FE
- [ ] [#132](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/132) **FE: Индикаторы статуса площадок в проекте + фильтр-чипсы по площадкам** — M3 · P0 · M · FE
- [ ] [#133](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/133) **BE: OAuth-подключение площадок (VK/TG/OK/MAX/Дзен/RUTUBE/YouTube): authorize + callback, хранение токенов, выбор сообщества/канала, DELETE отключение** — M3 · P0 · XL · BE
- [ ] [#134](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/134) **BE: Воркер публикации (Kafka publications.pending): постинг в площадки через официальные API, постатусные результаты, ретраи, событие результата** — M3 · P0 · XL · BE
- [ ] [#135](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/135) **BE+FE: Кросспостинг — адаптация черновика под каждую площадку, POST publish в N площадок, GET статусов публикации** — M3 · P0 · XL · BE

## [#136](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/136) EPIC: Frontend-фундамент и дизайн-система

**Цель.** Поднять каркас фронтенда «Отложки»: проект Vite+React+TS со структурой Feature-Sliced Design, тему Mantine из дизайн-токенов, общий UI-кит и переиспользуемые компоненты (в т.ч. бейджи 7 площадок), провайдеры и роутинг с разделением публичных/приватных маршрутов, генерируемый по Design First API-клиент. На этом фундаменте строятся все остальные фронтенд-эпики.

**Метки:** `epic` · `area:frontend` · `area:design-system` · `priority:P0` · **веха:** M0 — Фундамент

Задачи (6):

- [ ] [#142](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/142) **FE: Скаффолд фронтенда — Vite + React + TS + структура FSD** — M0 · P0 · M · CHORE
- [ ] [#143](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/143) **FE: Mantine-тема из дизайн-токенов «Отложки»** — M0 · P0 · S · feature
- [ ] [#144](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/144) **FE: Общий UI-кит (shared/ui) — базовые компоненты** — M0 · P1 · M · feature
- [ ] [#145](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/145) **FE: Компонент NetworkBadge — 7 площадок с бренд-цветами** — M0 · P1 · S · feature
- [ ] [#146](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/146) **FE: Провайдеры приложения и роутинг (публичное/приватное)** — M0 · P0 · M · feature
- [ ] [#147](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/147) **FE: Генерируемый API-клиент по Design First (@hey-api/openapi-ts)** — M0 · P1 · M · CHORE

## [#137](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/137) EPIC: ИИ-помощник

**Цель.** Дать пользователю ИИ-ассистента для написания постов: панель в композере (генерация текста по теме и по фото, варианты тона, вставка в редактор), индикатор квоты, а на бэкенде — ручки генерации текста и описаний видео с учётом и enforcement квоты по тарифу.

**Метки:** `epic` · `area:ai` · `priority:P1` · **веха:** M4 — Медиа и ИИ

Задачи (5):

- [ ] [#148](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/148) **FE: Панель ИИ-помощника в композере** — M4 · P1 · M · feature
- [ ] [#149](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/149) **FE: Индикатор квоты ИИ в сайдбаре/панели** — M4 · P2 · S · feature
- [ ] [#150](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/150) **BE: Генерация текста ИИ — POST /ai/generate с учётом квоты** — M4 · P1 · L · BE
- [ ] [#151](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/151) **BE: Генерация описания видео — POST /ai/video-description** — M4 · P2 · M · BE
- [ ] [#152](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/152) **BE: Учёт и лимиты квоты ИИ по тарифу** — M4 · P1 · M · BE

## [#138](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/138) EPIC: Отчёты и аналитика

**Цель.** Показать пользователю эффективность публикаций: раздел «Отчёты» с таблицей показателей по каждой площадке и фильтрами период/год (с состояниями пусто/загрузка/ошибка и экспортом), а на бэкенде — агрегированная аналитика по площадкам и плановая доставка отчёта в Telegram с настройками уведомлений.

**Метки:** `epic` · `priority:P1` · **веха:** M5 — Отчёты и команда

Задачи (4):

- [ ] [#153](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/153) **FE: Раздел «Отчёты» — таблица по площадкам + фильтры** — M5 · P1 · M · feature
- [ ] [#154](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/154) **FE: Отчёты — состояния пусто/загрузка/ошибка и экспорт** — M5 · P2 · S · feature
- [ ] [#155](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/155) **BE: Аналитика по площадкам за период и год** — M5 · P1 · L · BE
- [ ] [#156](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/156) **BE: Плановая доставка отчёта в Telegram + настройки уведомлений** — M5 · P2 · M · BE

## [#139](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/139) EPIC: Команда и роли

**Цель.** Дать возможность работать над проектом командой: раздел «Команда» со списком участников (роль, статус приглашения) и приглашением по email, управление доступом (смена роли, отзыв), а на бэкенде — участники/приглашения и модель ролей Владелец/Редактор/Автор с проверкой прав на всех защищённых действиях.

**Метки:** `epic` · `priority:P1` · **веха:** M5 — Отчёты и команда

Задачи (4):

- [ ] [#157](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/157) **FE: Раздел «Команда» — список участников и приглашение** — M5 · P1 · M · feature
- [ ] [#158](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/158) **FE: Управление доступом — смена роли и отзыв** — M5 · P2 · S · feature
- [ ] [#159](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/159) **BE: Участники проекта — список, приглашение, отзыв** — M5 · P1 · M · BE
- [ ] [#160](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/160) **BE: Модель ролей и прав (Владелец/Редактор/Автор)** — M5 · P1 · M · BE

## [#140](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/140) EPIC: Биллинг и подписки

**Цель.** Монетизация «Отложки»: карточки тарифов и таблица сравнения из каталога планов, многошаговая модалка апгрейда (выбор → оплата → успех), виджет тарифа/квоты и мягкий enforcement лимитов в UI; на бэкенде — каталог тарифов, смена подписки, платежи (карта с автопродлением и счёт для юрлиц) и enforcement лимитов.

**Метки:** `epic` · `area:billing` · `priority:P1` · **веха:** M6 — Биллинг

Задачи (6):

- [ ] [#161](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/161) **FE: Карточки тарифов и таблица сравнения** — M6 · P1 · M · feature
- [ ] [#162](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/162) **FE: Модалка «Апгрейд тарифа» — многошаговая (выбор → оплата → успех)** — M6 · P1 · L · feature
- [ ] [#163](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/163) **FE: Виджет тарифа/квоты и enforcement лимитов в UI** — M6 · P2 · S · feature
- [ ] [#164](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/164) **BE: Каталог тарифов — GET /plans** — M6 · P1 · M · BE
- [ ] [#165](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/165) **BE: Смена тарифа и подписка** — M6 · P1 · M · BE
- [ ] [#166](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/166) **BE: Платежи — токенизация карты, автопродление, счёт для юрлиц** — M6 · P1 · L · BE

## [#141](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/141) EPIC: Backend-фундамент и Design First

**Цель.** Фундамент бэкенда под весь продукт: полноценная доменная модель БД (проекты, пользователи, площадки, посты+таргеты, медиа, тарифы/подписки, команда, аналитика) на sqlc; единый TypeSpec-контракт всего API → OpenAPI 3.1 (из него генерируются BE и FE); инфраструктура публикации (Kafka-топики, схема событий, скелет воркера) и наблюдаемость (zap, healthcheck, .env). Переиспользует существующие задачи миграции #35, #36, #38, #39, #40, #41 — расширяя их до продуктового масштаба.

**Метки:** `epic` · `area:backend` · `area:contract` · `area:infra` · `priority:P0` · **веха:** M0 — Фундамент

Задачи (4):

- [ ] [#167](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/167) **BE: Доменная модель БД под продукт (миграции + sqlc)** — M0 · P0 · L · BE
- [ ] [#168](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/168) **BE: Единый TypeSpec-контракт всего продукта → OpenAPI 3.1** — M0 · P0 · L · BE
- [ ] [#169](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/169) **BE: Инфраструктура публикации — Kafka-топики, схема событий, скелет воркера** — M0 · P1 · M · CHORE
- [ ] [#170](https://github.com/hexlet-volunteers/hexlet-autoposting/issues/170) **BE: Наблюдаемость и конфигурация — zap, healthcheck, .env** — M0 · P1 · M · CHORE

---

## Переиспользование прежнего бэклога

Технический фундамент из ранее заведённого «миграционного» бэклога **переиспользуется, а не дублируется** — задачи по TypeSpec-контракту, spec-first бэкенду, sqlc/pgx v5, CI и техдолгу учтены в эпике **Backend-фундамент и Design First** ссылками на существующие issues: #35, #36, #38, #39, #40, #41 (и их подзадачи #42–#91).

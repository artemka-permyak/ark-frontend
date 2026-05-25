# Airesto — расписание бронирований

SPA-страница расписания бронирований ресторана (тестовое задание Airesto). Реализована на Vue 3 + Vite + TS + Pinia + Tailwind, без готовых библиотек таблиц-расписаний.

## Демо

**[ark-frontend-two.vercel.app](https://ark-frontend-two.vercel.app/)**

## Локальный запуск

```bash
npm install
npm run dev
```

Dev-сервер откроется на `http://localhost:5173`. Запросы к `/api/*` проксируются на `https://hh.frontend.ark.software` (см. `vite.config.ts`). Если API недоступен — приложение автоматически переключается на локальный `fallback.json` с баннером «Используются демо-данные».

## Скрипты

- `npm run dev` — dev-сервер с HMR.
- `npm run build` — продакшн-сборка (с typecheck).
- `npm run preview` — превью прод-сборки.
- `npm run typecheck` — `vue-tsc --noEmit`.
- `npm run test` — юнит-тесты алгоритма раскладки (vitest).

## Архитектура (FSD)

```
src/
├── app/                              # точка входа, стили, корневой App
│   ├── App.vue
│   ├── main.ts
│   └── styles/{tokens.css, global.css}
├── shared/                           # переиспользуемые утилиты и UI-кит
│   ├── lib/{time, dateFormat, duration, useCurrentTime}.ts
│   └── ui/Chip.vue
├── entities/
│   └── booking/                      # бизнес-сущность «бронирования»
│       ├── api/{booking.ts, fallback.json}
│       ├── model/{store.ts, types.ts}
│       ├── lib/{eventLayout, statusMap}.ts (+ eventLayout.test.ts)
│       └── ui/EventCard.vue
├── features/                         # пользовательские действия
│   ├── date-filter/
│   ├── zone-filter/
│   ├── cell-select/                  # выделение столов и времени
│   ├── hover-event/
│   └── theme/
└── widgets/                          # композитные блоки
    ├── schedule-header/
    └── schedule-grid/                # ScheduleGrid + TableColumn + TimeColumn + CurrentTimeLine
```

Каждый слайс экспортируется через `index.ts` (public API). Импорты через alias `@/*` → `src/*`.

### Ядро раскладки (`entities/booking/lib/eventLayout.ts`)

1. Фильтрация: события другого дня (по TZ ресторана), `end <= start`, целиком за пределами окна.
2. Сортировка: `start` ↑, при равенстве — длиннее первым.
3. Группы пересечений (±30 мин от якоря) → делят ширину колонки поровну.
4. Depth (события начавшиеся раньше с разницей > 30 мин и ещё активные) → сдвиг `4px × depth`.
5. Clamp `top%`/`height%` к [0..100].
6. Метка `compressed` — карточка визуально уже полной ячейки (cross-группа или есть перекрывающая карточка с большим depth).
7. `overlapIds` — id перекрывающихся по времени соседей (для hover-блюра).

10 unit-тестов покрывают: фильтрацию невалидных событий, clamp по `closing_time` и переходы через полночь, кейсы столов 5/21/191 из §7.4, метки compressed и overlapIds.

### Производительность

- `shallowRef` + `markRaw` для ответа API.
- Раскладка считается per-column в `computed` `TableColumn` — изменение фильтра по зонам не пересчитывает остальные столы.
- Sticky-заголовки чистым CSS, без scroll-listener'ов.
- Hover-эффекты основаны на CSS + одной shallowRef + `getBoundingClientRect` только при наведении.

## Реализованные требования

### Обязательное

- [x] Vue 3 + Composition API + `<script setup>`
- [x] Загрузка с API + fallback на локальный JSON + баннер «Используются демо-данные»
- [x] Vite-прокси `/api → hh.frontend.ark.software` для dev
- [x] Зоны и порядок столов — динамически из ответа
- [x] Поддержка всех статусов из `Возможные события` + неизвестный → нейтральный стиль
- [x] Аномалии данных: `end<start` пропускается, превышение `closing_time` clamp'ится, события через полночь clamp'ятся, `capacity:0` рендерится, дубликаты обрабатываются
- [x] Фильтрация событий по выбранному дню на клиенте (по TZ ресторана)
- [x] Чипы дат: подписи «сегодня/завтра/день недели» в родительном падеже
- [x] Мульти-фильтр зон с сохранением в `localStorage`, пустое состояние при всех выключенных
- [x] Sticky-заголовки столов (top) и времени (left) одновременно + sticky corner
- [x] Оранжевая линия текущего времени по TZ ресторана, обновляется по минутному тику
- [x] Алгоритм наложения (4px × depth) + пересечения (±30 мин, деление ширины)
- [x] Hover: подъём z-index, подсветка, ширина auto под полный контент, блюр только пересекающихся карточек

### Дополнительное

- [x] Светлая / тёмная тема с `localStorage` и `prefers-color-scheme`
- [x] Скрытие контента карточек при cross-группе/depth-перекрытии (ellipsis), полные тексты в одиночных карточках
- [x] Click-based выделение столов и времени с шагом 15 мин (backdrop-blur, серая overflow-зона, кнопки «Создать»/«Отменить»). На «Создать» — `console.log {table_ids, start_time, end_time}`. Esc / «Отменить» — сброс.
- [x] TypeScript `strict: true`
- [x] Юнит-тесты алгоритма раскладки (vitest)

# Airesto — расписание бронирований

SPA-страница расписания бронирований ресторана (тестовое задание Airesto). Реализована на Vue 3 + Vite + TS + Pinia + Tailwind, без готовых библиотек таблиц-расписаний.

## Демо

Деплой пока не настроен. Локальный запуск:

```bash
npm install
npm run dev
```

Dev-сервер откроется на `http://localhost:5173`. Запросы к `/api/*` проксируются на `https://hh.frontend.ark.software` (см. `vite.config.ts`).

## Скрипты

- `npm run dev` — dev-сервер с HMR.
- `npm run build` — продакшн-сборка (с typecheck).
- `npm run preview` — превью прод-сборки.
- `npm run typecheck` — `vue-tsc --noEmit`.
- `npm run test` — юнит-тесты алгоритма раскладки (vitest).

## Архитектура

```
src/
├── api/
│   ├── booking.ts          # fetch + fallback
│   └── fallback.json       # демо-данные, включают все аномалии из ТЗ §3.3
├── stores/
│   └── schedule.ts         # Pinia: data, selectedDate, hiddenZones, computed события по столам
├── composables/
│   ├── useEventLayout.ts   # ядро: группы пересечений (±30 мин), depth, top/height%, compressed
│   ├── useEventLayout.test.ts
│   ├── useCurrentTime.ts   # тик каждую минуту, выровненный по началу минуты
│   ├── useTheme.ts         # светлая/тёмная тема + localStorage + prefers-color-scheme
│   └── useDragSelect.ts    # ЛКМ-зажим → прямоугольник → console.log
├── components/
│   ├── ScheduleHeader.vue
│   ├── DateFilter.vue
│   ├── ZoneFilter.vue
│   ├── ScheduleGrid.vue    # sticky-сетка, корневая раскладка
│   ├── TableColumn.vue
│   ├── EventCard.vue       # стили событий, hover-эффекты на CSS
│   ├── TimeColumn.vue
│   ├── CurrentTimeLine.vue
│   └── DragSelectOverlay.vue
├── utils/
│   ├── time.ts             # парсинг TZ через Intl.DateTimeFormat
│   ├── dateFormat.ts       # «19 мая», «сегодня/завтра/день недели»
│   └── statusMap.ts        # маппинг статусов API → styleKey + badge
├── styles/
│   ├── tokens.css          # CSS-переменные тем
│   └── global.css          # tailwind + сброс
└── types/api.ts
```

### Ядро раскладки (`useEventLayout.ts`)

Алгоритм из ТЗ §7:

1. Фильтрация: события другого дня (по TZ ресторана), `end <= start`, целиком за пределами окна.
2. Сортировка: `start` ↑, при равенстве — длиннее первым.
3. Группы пересечений (±30 мин от якоря) → делят ширину колонки поровну.
4. Depth (события начавшиеся раньше с разницей > 30 мин и ещё активные) → сдвиг `4px × depth`.
5. Clamp `height%` к [0..100-top].
6. Метка `compressed`, если >30% высоты перекрыто сверху (для скрытия строк до hover).

Тесты в `useEventLayout.test.ts` покрывают:
- фильтрацию невалидных событий (`end<start`, нулевая длительность, другой день),
- clamp по `closing_time` и для событий, переходящих на следующий день,
- кейсы столов 5, 21, 191 из §7.4,
- метку `compressed`.

### Производительность

- `shallowRef` + `markRaw` для ответа API.
- `tableEvents` собираются один раз в `computed` стора; в каждом `TableColumn` — отдельный `computed` для раскладки только своего столба.
- Sticky-заголовки — чистый CSS, scroll-listeners не используются.
- Hover-эффекты — только CSS (`:hover`, `group-hover`, `:has(.event-card:hover)`).
- Drag-обработчики — глобальные `mousemove/mouseup` только во время активного выделения.

## Реализованные требования

### Обязательное (§5, §6, §7, §9)
- [x] Vue 3 + Composition API + `<script setup>`
- [x] Загрузка с `https://hh.frontend.ark.software/api/booking` + fallback на локальный JSON + баннер «Используются демо-данные»
- [x] Vite-прокси `/api → hh.frontend.ark.software` для dev
- [x] Зоны и порядок столов — динамически из ответа
- [x] Поддержка статусов `Отменен`, `Вызвана`, `Занял место` + неизвестный → нейтральный серый
- [x] Аномалии данных §3.3: `end<start` пропускается, превышение `closing_time` clamp'ится, события через полночь clamp'ятся, `capacity:0` рендерится, дубликаты обрабатываются как разные события
- [x] Фильтрация событий по выбранному дню на клиенте (по TZ ресторана)
- [x] Чипы дат: активная = `current_day`, подписи «сегодня/завтра/день недели» в родительном падеже
- [x] Мульти-фильтр зон с сохранением в `localStorage` (ключ `airesto:zones`), пустое состояние при всех выключенных
- [x] Sticky-заголовки столов (top) и времени (left) одновременно + sticky corner
- [x] Оранжевая линия текущего времени по TZ ресторана, обновляется по минутному тику, виден только в `current_day`
- [x] Алгоритм наложения (4px × depth) + пересечения (±30 мин, деление ширины)
- [x] Hover: подъём z-index, подсветка, раскрытие сжатого контента — CSS-only

### Опциональное (§10)
- [x] Светлая / тёмная тема — toggle в header, localStorage (`airesto:theme`), prefers-color-scheme при первом запуске
- [x] Скрытие контента карточек при наложениях >30% сверху, раскрытие на hover
- [x] Drag-to-select по сетке (`console.log` `{ table_ids, start_time, end_time }`), Esc / клик «Отмена» — сброс
- [x] TypeScript `strict: true`
- [x] Юнит-тесты `useEventLayout` (vitest)

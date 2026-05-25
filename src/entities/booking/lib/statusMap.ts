import type {
  Order,
  OrderStatus,
  Reservation,
  ScheduleEvent,
  StyleKey,
} from '../model/types';

export type StyleSpec = {
  rimVar: string;
  fillVar: string;
  badgeBgVar?: string;
  badgeTextVar?: string;
};

const STYLES: Record<StyleKey, StyleSpec> = {
  'order-new': {
    rimVar: '--c-order-rim',
    fillVar: '--c-order-fill',
    badgeBgVar: '--c-order-badge-bg',
    badgeTextVar: '--c-order-badge-text',
  },
  'order-bill': {
    rimVar: '--c-order-bill-rim',
    fillVar: '--c-order-bill-fill',
    badgeBgVar: '--c-order-bill-badge-bg',
    badgeTextVar: '--c-order-bill-badge-text',
  },
  'order-closed': {
    rimVar: '--c-order-closed-rim',
    fillVar: '--c-order-closed-fill',
    badgeBgVar: '--c-order-closed-badge-bg',
    badgeTextVar: '--c-order-closed-badge-text',
  },
  'order-banquet': {
    rimVar: '--c-banquet-rim',
    fillVar: '--c-banquet-fill',
    badgeBgVar: '--c-banquet-badge-bg',
    badgeTextVar: '--c-banquet-badge-text',
  },
  'res-queue': {
    rimVar: '--c-res-queue-rim',
    fillVar: '--c-res-queue-fill',
    badgeBgVar: '--c-res-queue-badge-bg',
    badgeTextVar: '--c-res-queue-badge-text',
  },
  'res-new': {
    rimVar: '--c-res-new-rim',
    fillVar: '--c-res-new-fill',
    badgeBgVar: '--c-res-new-badge-bg',
    badgeTextVar: '--c-res-new-badge-text',
  },
  'res-app': {
    rimVar: '--c-res-app-rim',
    fillVar: '--c-res-app-fill',
    badgeBgVar: '--c-res-app-badge-bg',
    badgeTextVar: '--c-res-app-badge-text',
  },
  'res-open': {
    rimVar: '--c-res-open-rim',
    fillVar: '--c-res-open-fill',
    badgeBgVar: '--c-res-open-badge-bg',
    badgeTextVar: '--c-res-open-badge-text',
  },
  'res-closed': {
    rimVar: '--c-res-closed-rim',
    fillVar: '--c-res-closed-fill',
    badgeBgVar: '--c-res-closed-badge-bg',
    badgeTextVar: '--c-res-closed-badge-text',
  },
  'res-unknown': {
    rimVar: '--c-res-unknown-rim',
    fillVar: '--c-res-unknown-fill',
    badgeBgVar: '--c-res-unknown-badge-bg',
    badgeTextVar: '--c-res-unknown-badge-text',
  },
};

const ORDER_DEFS: Record<OrderStatus, { title: string; badge?: string; styleKey: StyleKey }> = {
  New: { title: 'Заказ', badge: 'Новый', styleKey: 'order-new' },
  Bill: { title: 'Заказ', badge: 'Пречек', styleKey: 'order-bill' },
  Closed: { title: 'Заказ', badge: 'Закрытый', styleKey: 'order-closed' },
  Banquet: { title: 'Банкет', styleKey: 'order-banquet' },
};

const RES_DEFS: Record<string, { badge: string; styleKey: StyleKey }> = {
  'Живая очередь': { badge: 'Живая очередь', styleKey: 'res-queue' },
  Новая: { badge: 'Ожидает подтверждения', styleKey: 'res-new' },
  Заявка: { badge: 'Ожидаем', styleKey: 'res-app' },
  Открыт: { badge: 'В зале', styleKey: 'res-open' },
  Закрыт: { badge: 'Отменен', styleKey: 'res-closed' },
  Отменен: { badge: 'Отменен', styleKey: 'res-closed' },
  Вызвана: { badge: 'Вызвана', styleKey: 'res-app' },
  'Занял место': { badge: 'В зале', styleKey: 'res-open' },
};

/** Returns the visual style spec (CSS variable names) for a given style key. */
export function getStyle(key: StyleKey): StyleSpec {
  return STYLES[key] ?? STYLES['res-unknown'];
}

/** Converts an API order into the unified `ScheduleEvent` shape. */
export function orderToEvent(
  order: Order,
  tableId: string,
  start: Date,
  end: Date,
): ScheduleEvent {
  const def = ORDER_DEFS[order.status];
  return {
    id: `order-${order.id}`,
    tableId,
    source: 'order',
    title: def.title,
    badge: def.badge,
    styleKey: def.styleKey,
    start,
    end,
    rawStatus: order.status,
  };
}

/** Converts an API reservation into the unified `ScheduleEvent` shape. */
export function reservationToEvent(
  res: Reservation,
  tableId: string,
  start: Date,
  end: Date,
): ScheduleEvent {
  const def = RES_DEFS[res.status] ?? { badge: res.status, styleKey: 'res-unknown' as StyleKey };
  const phoneTail =
    typeof res.phone_number === 'string' && res.phone_number.length >= 4
      ? res.phone_number.slice(-4)
      : undefined;
  return {
    id: `res-${res.id}`,
    tableId,
    source: 'reservation',
    title: `№${res.id}`,
    badge: def.badge,
    name: res.name_for_reservation,
    numPeople: res.num_people,
    phoneTail,
    styleKey: def.styleKey,
    start,
    end,
    rawStatus: res.status,
  };
}

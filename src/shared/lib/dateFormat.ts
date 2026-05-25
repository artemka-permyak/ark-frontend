const MONTHS_RU_GEN = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const WEEKDAYS_RU = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
];

/** Parses a `YYYY-MM-DD` string as a UTC midnight `Date`. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Returns a human-readable `D месяца` label (Russian genitive). */
export function formatDayMonth(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getUTCDate()} ${MONTHS_RU_GEN[d.getUTCMonth()]}`;
}

/** Returns `сегодня`/`завтра`/`вчера`/weekday name relative to `referenceISO`. */
export function formatRelativeDay(iso: string, referenceISO: string): string {
  const target = parseISODate(iso);
  const ref = parseISODate(referenceISO);
  const diff = Math.round((target.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'сегодня';
  if (diff === 1) return 'завтра';
  if (diff === -1) return 'вчера';
  return WEEKDAYS_RU[target.getUTCDay()];
}

export type TzParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function getFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatterCache.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    formatterCache.set(timeZone, f);
  }
  return f;
}

/** Converts an `HH:MM` string into minutes since midnight. */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** Formats a minutes-since-midnight value back to `HH:MM`. */
export function minutesToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Decomposes a `Date` into calendar parts as seen in the given time zone. */
export function getTzParts(date: Date, timeZone: string): TzParts {
  const parts = getFormatter(timeZone).formatToParts(date);
  const pick = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? '0');
  return {
    year: pick('year'),
    month: pick('month'),
    day: pick('day'),
    hour: pick('hour') % 24,
    minute: pick('minute'),
    second: pick('second'),
  };
}

/** Returns the `YYYY-MM-DD` date the given instant falls on in `timeZone`. */
export function tzDateString(date: Date, timeZone: string): string {
  const { year, month, day } = getTzParts(date, timeZone);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Returns minutes-since-midnight of the given instant in `timeZone`. */
export function tzMinutesOfDay(date: Date, timeZone: string): number {
  const { hour, minute } = getTzParts(date, timeZone);
  return hour * 60 + minute;
}

/** Formats the given instant as `HH:MM` in `timeZone`. */
export function formatHHMM(date: Date, timeZone: string): string {
  const { hour, minute } = getTzParts(date, timeZone);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

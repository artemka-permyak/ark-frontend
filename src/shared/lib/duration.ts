function pluralize(n: number, [one, few, many]: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

/**
 * Human-readable duration label in Russian, e.g. `15 мин`, `1 час`, `2 часа`,
 * `5 часов`, `1 час 30 мин`.
 */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 мин';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${pluralize(hours, ['час', 'часа', 'часов'])}`);
  if (minutes > 0) parts.push(`${minutes} мин`);
  return parts.join(' ');
}

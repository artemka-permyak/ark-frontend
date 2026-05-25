import type { LaidOutEvent, ScheduleEvent } from '../model/types';

const MIN_30 = 30 * 60_000;

export type LayoutBounds = {
  openingMin: number;
  closingMin: number;
  selectedDay: string;
  tzMinutesOfDay: (d: Date) => number;
  tzDateString: (d: Date) => string;
};

function percentOf(min: number, opening: number, closing: number): number {
  const total = closing - opening;
  return total <= 0 ? 0 : ((min - opening) / total) * 100;
}

function calcDepth(event: ScheduleEvent, all: ScheduleEvent[]): number {
  let depth = 0;
  for (const other of all) {
    if (other.id === event.id) continue;
    if (
      other.start.getTime() < event.start.getTime() &&
      other.end.getTime() > event.start.getTime() &&
      event.start.getTime() - other.start.getTime() > MIN_30
    ) {
      depth++;
    }
  }
  return depth;
}

function timeRangesOverlap(aTop: number, aHeight: number, bTop: number, bHeight: number): boolean {
  return Math.max(aTop, bTop) < Math.min(aTop + aHeight, bTop + bHeight);
}

/**
 * Lays out events of a single table column.
 *
 * Pipeline:
 * 1. Drop invalid events (zero/negative duration, other day, fully out of range).
 * 2. Sort by start ASC; ties broken by longer duration first.
 * 3. Group events whose starts are within ±30 min — they share width equally.
 * 4. Compute depth offset: how many earlier-started events are still active.
 * 5. Convert times to `top%`/`height%`, clamping to the working window.
 * 6. Mark `compressed`: card is narrower than a full cell.
 * 7. Compute `overlapIds`: time-overlapping neighbors (per column).
 */
export function layoutColumn(events: ScheduleEvent[], bounds: LayoutBounds): LaidOutEvent[] {
  const { openingMin, closingMin, tzMinutesOfDay, tzDateString, selectedDay } = bounds;

  const valid = events.filter((ev) => {
    if (!(ev.end.getTime() > ev.start.getTime())) return false;
    if (tzDateString(ev.start) !== selectedDay) return false;
    const startMin = tzMinutesOfDay(ev.start);
    const endDay = tzDateString(ev.end);
    const endMin = endDay === selectedDay ? tzMinutesOfDay(ev.end) : 24 * 60;
    if (endMin <= openingMin) return false;
    if (startMin >= closingMin) return false;
    return true;
  });

  const sorted = [...valid].sort(
    (a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime(),
  );

  const groups: ScheduleEvent[][] = [];
  for (const ev of sorted) {
    const last = groups[groups.length - 1];
    const anchor = last?.[0];
    if (anchor && Math.abs(ev.start.getTime() - anchor.start.getTime()) <= MIN_30) {
      last.push(ev);
    } else {
      groups.push([ev]);
    }
  }

  const result: LaidOutEvent[] = [];
  for (const group of groups) {
    const slotCount = group.length;
    group.forEach((ev, slotIdx) => {
      const startMin = Math.max(tzMinutesOfDay(ev.start), openingMin);
      const endDay = tzDateString(ev.end);
      const rawEndMin = endDay === selectedDay ? tzMinutesOfDay(ev.end) : 24 * 60;
      const endMin = Math.min(rawEndMin, closingMin);
      const top = percentOf(startMin, openingMin, closingMin);
      const heightEnd = percentOf(endMin, openingMin, closingMin);
      const height = Math.max(0, Math.min(heightEnd, 100) - top);
      result.push({
        ...ev,
        top,
        height,
        slotIndex: slotIdx,
        slotCount,
        depth: calcDepth(ev, sorted),
        compressed: false,
        overlapIds: [],
      });
    });
  }

  for (const ev of result) {
    if (ev.slotCount > 1) {
      ev.compressed = true;
      continue;
    }
    for (const other of result) {
      if (other.id === ev.id || other.depth <= ev.depth) continue;
      if (timeRangesOverlap(ev.top, ev.height, other.top, other.height)) {
        ev.compressed = true;
        break;
      }
    }
  }

  for (const ev of result) {
    const ids: string[] = [];
    for (const other of result) {
      if (other.id === ev.id) continue;
      if (timeRangesOverlap(ev.top, ev.height, other.top, other.height)) {
        ids.push(other.id);
      }
    }
    ev.overlapIds = ids;
  }

  return result;
}

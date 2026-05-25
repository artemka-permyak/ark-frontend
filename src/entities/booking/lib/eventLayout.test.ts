import { describe, expect, it } from 'vitest';
import { layoutColumn, type LayoutBounds } from './eventLayout';
import type { ScheduleEvent } from '../model/types';

const TZ_OFFSET_MIN = 10 * 60;

function tzMinutesOfDay(d: Date): number {
  const local = d.getTime() + TZ_OFFSET_MIN * 60_000;
  const dayMs = 24 * 60 * 60_000;
  return ((Math.floor((local % dayMs) / 60_000) % (24 * 60)) + 24 * 60) % (24 * 60);
}

function tzDateString(d: Date): string {
  const local = new Date(d.getTime() + TZ_OFFSET_MIN * 60_000);
  return local.toISOString().slice(0, 10);
}

const BOUNDS: LayoutBounds = {
  openingMin: 11 * 60,
  closingMin: 23 * 60 + 40,
  tzMinutesOfDay,
  tzDateString,
  selectedDay: '2026-05-19',
};

function ev(id: string, start: string, end: string): ScheduleEvent {
  return {
    id,
    tableId: 't',
    source: 'order',
    title: 'X',
    start: new Date(start),
    end: new Date(end),
    rawStatus: 'New',
    styleKey: 'order-new',
  };
}

describe('layoutColumn', () => {
  it('filters out invalid events (end<=start, out of day)', () => {
    const events = [
      ev('a', '2026-05-19T13:00:00+10:00', '2026-05-19T14:00:00+10:00'),
      ev('bad-end', '2026-05-19T15:00:00+10:00', '2025-04-06T00:00:00+10:00'),
      ev('bad-zero', '2026-05-19T15:00:00+10:00', '2026-05-19T15:00:00+10:00'),
      ev('other-day', '2026-05-20T13:00:00+10:00', '2026-05-20T14:00:00+10:00'),
    ];
    const laid = layoutColumn(events, BOUNDS);
    expect(laid.map((e) => e.id)).toEqual(['a']);
  });

  it('clamps height for events ending past closing_time', () => {
    const events = [ev('late', '2026-05-19T23:00:00+10:00', '2026-05-19T23:45:00+10:00')];
    const laid = layoutColumn(events, BOUNDS);
    expect(laid).toHaveLength(1);
    expect(laid[0].top + laid[0].height).toBeCloseTo(100, 5);
  });

  it('clamps next-day end to closing_time of selected day', () => {
    const events = [ev('overnight', '2026-05-19T21:45:00+10:00', '2026-05-20T00:15:00+10:00')];
    const laid = layoutColumn(events, BOUNDS);
    expect(laid).toHaveLength(1);
    expect(laid[0].top + laid[0].height).toBeCloseTo(100, 5);
  });

  it('Table 5 case: anchor groups and depth offsets', () => {
    const events = [
      ev('new', '2026-05-19T13:00:00+10:00', '2026-05-19T14:00:00+10:00'),
      ev('closed', '2026-05-19T14:30:00+10:00', '2026-05-19T18:00:00+10:00'),
      ev('bill', '2026-05-19T15:15:00+10:00', '2026-05-19T16:00:00+10:00'),
      ev('banquet', '2026-05-19T16:30:00+10:00', '2026-05-19T17:45:00+10:00'),
    ];
    const laid = layoutColumn(events, BOUNDS);
    const by = Object.fromEntries(laid.map((e) => [e.id, e]));
    expect(by['new'].depth).toBe(0);
    expect(by['closed'].depth).toBe(0);
    expect(by['bill'].depth).toBe(1);
    expect(by['banquet'].depth).toBe(1);
    expect(by['new'].slotCount).toBe(1);
    expect(by['closed'].slotCount).toBe(1);
    expect(by['bill'].slotCount).toBe(1);
    expect(by['banquet'].slotCount).toBe(1);
  });

  it('Table 21 case: ±30min cross groups split width', () => {
    const events = [
      ev('res-23', '2026-05-19T13:00:00+10:00', '2026-05-19T14:00:00+10:00'),
      ev('res-24', '2026-05-19T14:30:00+10:00', '2026-05-19T16:30:00+10:00'),
      ev('bill', '2026-05-19T14:30:00+10:00', '2026-05-19T16:00:00+10:00'),
      ev('closed', '2026-05-19T15:30:00+10:00', '2026-05-19T17:00:00+10:00'),
    ];
    const laid = layoutColumn(events, BOUNDS);
    const by = Object.fromEntries(laid.map((e) => [e.id, e]));
    expect(by['res-23'].slotCount).toBe(1);
    expect(by['res-24'].slotCount).toBe(2);
    expect(by['bill'].slotCount).toBe(2);
    expect(by['closed'].depth).toBeGreaterThanOrEqual(1);
  });

  it('Table 191 stress: 5+ events all laid out', () => {
    const events = [
      ev('a', '2026-05-19T14:30:00+10:00', '2026-05-19T15:30:00+10:00'),
      ev('b', '2026-05-19T14:30:00+10:00', '2026-05-19T15:30:00+10:00'),
      ev('c', '2026-05-19T15:00:00+10:00', '2026-05-19T16:00:00+10:00'),
      ev('d', '2026-05-19T16:30:00+10:00', '2026-05-19T18:00:00+10:00'),
      ev('e', '2026-05-19T17:00:00+10:00', '2026-05-19T19:00:00+10:00'),
    ];
    const laid = layoutColumn(events, BOUNDS);
    expect(laid).toHaveLength(5);
    for (const e of laid) {
      expect(e.top).toBeGreaterThanOrEqual(0);
      expect(e.top + e.height).toBeLessThanOrEqual(100.001);
      expect(e.height).toBeGreaterThan(0);
    }
  });

  it('marks back card compressed when a higher-depth card overlaps it in time', () => {
    const events = [
      ev('back', '2026-05-19T14:00:00+10:00', '2026-05-19T17:00:00+10:00'),
      ev('front', '2026-05-19T15:00:00+10:00', '2026-05-19T17:00:00+10:00'),
    ];
    const laid = layoutColumn(events, BOUNDS);
    const back = laid.find((e) => e.id === 'back')!;
    const front = laid.find((e) => e.id === 'front')!;
    expect(back.compressed).toBe(true);
    expect(front.compressed).toBe(false);
  });

  it('marks all cross-group siblings compressed (split column width)', () => {
    const events = [
      ev('x', '2026-05-19T14:00:00+10:00', '2026-05-19T15:30:00+10:00'),
      ev('y', '2026-05-19T14:00:00+10:00', '2026-05-19T15:00:00+10:00'),
    ];
    const laid = layoutColumn(events, BOUNDS);
    expect(laid.find((e) => e.id === 'x')!.compressed).toBe(true);
    expect(laid.find((e) => e.id === 'y')!.compressed).toBe(true);
  });

  it('does NOT mark a lone card as compressed', () => {
    const events = [ev('solo', '2026-05-19T13:00:00+10:00', '2026-05-19T14:00:00+10:00')];
    const laid = layoutColumn(events, BOUNDS);
    expect(laid[0].compressed).toBe(false);
  });

  it('computes overlapIds with all time-overlapping siblings (symmetric)', () => {
    const events = [
      ev('A', '2026-05-19T13:00:00+10:00', '2026-05-19T15:00:00+10:00'),
      ev('B', '2026-05-19T14:00:00+10:00', '2026-05-19T16:00:00+10:00'),
      ev('C', '2026-05-19T17:00:00+10:00', '2026-05-19T18:00:00+10:00'),
    ];
    const laid = layoutColumn(events, BOUNDS);
    const by = Object.fromEntries(laid.map((e) => [e.id, e]));
    expect(by['A'].overlapIds.sort()).toEqual(['B']);
    expect(by['B'].overlapIds.sort()).toEqual(['A']);
    expect(by['C'].overlapIds).toEqual([]);
  });
});

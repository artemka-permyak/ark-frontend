import { defineStore } from 'pinia';
import { computed, markRaw, ref, shallowRef } from 'vue';
import { loadBooking } from '../api/booking';
import { orderToEvent, reservationToEvent } from '../lib/statusMap';
import type { BookingResponse, ScheduleEvent, Table } from './types';

const ZONES_LS_KEY = 'airesto:zones';

function loadHiddenZones(): Set<string> {
  try {
    const raw = localStorage.getItem(ZONES_LS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveHiddenZones(zones: Set<string>) {
  try {
    localStorage.setItem(ZONES_LS_KEY, JSON.stringify([...zones]));
  } catch {
    /* ignore */
  }
}

/**
 * Holds the booking response, the user's current day/zone selection and
 * derived collections (visible tables, per-table event lists).
 */
export const useBookingStore = defineStore('booking', () => {
  const data = shallowRef<BookingResponse | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const usingFallback = ref(false);
  const selectedDate = ref<string>('');
  const hiddenZones = ref<Set<string>>(loadHiddenZones());

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const result = await loadBooking();
      data.value = markRaw(result.data);
      usingFallback.value = result.usingFallback;
      if (!selectedDate.value || !result.data.available_days.includes(selectedDate.value)) {
        selectedDate.value = result.data.current_day;
      }
    } catch (e) {
      error.value = (e as Error).message ?? 'unknown';
    } finally {
      loading.value = false;
    }
  }

  function setDate(d: string) {
    selectedDate.value = d;
  }

  function toggleZone(zone: string) {
    const next = new Set(hiddenZones.value);
    if (next.has(zone)) next.delete(zone);
    else next.add(zone);
    hiddenZones.value = next;
    saveHiddenZones(next);
  }

  const zones = computed<string[]>(() => {
    if (!data.value) return [];
    const seen = new Set<string>();
    const result: string[] = [];
    for (const t of data.value.tables) {
      if (!seen.has(t.zone)) {
        seen.add(t.zone);
        result.push(t.zone);
      }
    }
    return result;
  });

  const visibleTables = computed<Table[]>(() => {
    if (!data.value) return [];
    return data.value.tables.filter((t) => !hiddenZones.value.has(t.zone));
  });

  const tableEvents = computed<Map<string, ScheduleEvent[]>>(() => {
    const map = new Map<string, ScheduleEvent[]>();
    if (!data.value) return map;
    for (const t of data.value.tables) {
      const events: ScheduleEvent[] = [];
      for (const o of t.orders) {
        events.push(orderToEvent(o, t.id, new Date(o.start_time), new Date(o.end_time)));
      }
      for (const r of t.reservations) {
        events.push(reservationToEvent(r, t.id, new Date(r.seating_time), new Date(r.end_time)));
      }
      map.set(t.id, events);
    }
    return map;
  });

  return {
    data,
    loading,
    error,
    usingFallback,
    selectedDate,
    hiddenZones,
    zones,
    visibleTables,
    tableEvents,
    load,
    setDate,
    toggleZone,
  };
});

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useBookingStore, type LayoutBounds } from '@/entities/booking';
import { hhmmToMinutes, minutesToHHMM, tzDateString, tzMinutesOfDay } from '@/shared/lib/time';
import {
  CellSelectOverlay,
  SLOT_MIN,
  useCellSelect,
  type SelectionRange,
} from '@/features/cell-select';
import TableColumn from './TableColumn.vue';
import TimeColumn from './TimeColumn.vue';
import CurrentTimeLine from './CurrentTimeLine.vue';

const TIME_COL_W = 52;
const HEADER_H = 56;
const COL_W = 80;
const PX_PER_MIN = 40 / 30;

const store = useBookingStore();
const { data, visibleTables, selectedDate, tableEvents } = storeToRefs(store);

const openingMin = computed(() =>
  data.value ? hhmmToMinutes(data.value.restaurant.opening_time) : 0,
);
const closingMin = computed(() =>
  data.value ? hhmmToMinutes(data.value.restaurant.closing_time) : 0,
);
const timezone = computed(() => data.value?.restaurant.timezone ?? 'UTC');
const bodyHeight = computed(() => Math.max(0, (closingMin.value - openingMin.value) * PX_PER_MIN));
const totalWidth = computed(() => TIME_COL_W + visibleTables.value.length * COL_W);
const noVisible = computed(() => visibleTables.value.length === 0);

const bounds = computed<LayoutBounds>(() => ({
  openingMin: openingMin.value,
  closingMin: closingMin.value,
  selectedDay: selectedDate.value,
  tzMinutesOfDay: (d: Date) => tzMinutesOfDay(d, timezone.value),
  tzDateString: (d: Date) => tzDateString(d, timezone.value),
}));

function eventsForTable(tableId: string) {
  return tableEvents.value.get(tableId) ?? [];
}

const bodyRef = ref<HTMLElement | null>(null);

const slotPx = SLOT_MIN * PX_PER_MIN;

function pxToCol(relX: number): number {
  if (relX < 0) return -1;
  const idx = Math.floor(relX / COL_W);
  return idx >= 0 && idx < visibleTables.value.length ? idx : -1;
}
function pxToSlot(relY: number): number {
  if (relY < 0 || slotPx <= 0) return -1;
  const slotIdx = Math.floor(relY / slotPx);
  const slotMin = openingMin.value + slotIdx * SLOT_MIN;
  if (slotMin + SLOT_MIN > closingMin.value) return -1;
  return slotMin;
}

function onCreate(range: SelectionRange) {
  const tableIds = visibleTables.value.slice(range.startCol, range.endCol + 1).map((t) => t.id);
  const start = `${selectedDate.value}T${minutesToHHMM(range.startMin)}:00 ${timezone.value}`;
  const end = `${selectedDate.value}T${minutesToHHMM(range.endMin)}:00 ${timezone.value}`;
  console.log('[cell-select]', { table_ids: tableIds, start_time: start, end_time: end });
}

const { state, hover, selection, onPointerMove, onPointerLeave, onClick, confirm, cancel } =
  useCellSelect({
    containerRef: bodyRef,
    pxToCol,
    pxToSlot,
    onCreate,
  });
</script>

<template>
  <div v-if="data" class="flex min-h-0 flex-1 flex-col">
    <div v-if="noVisible" class="flex flex-1 items-center justify-center text-muted">
      Выберите хотя бы одну зону
    </div>

    <div v-else class="relative flex-1 overflow-auto">
      <div
        class="relative grid"
        :style="{
          gridTemplateColumns: `${TIME_COL_W}px ${visibleTables.length * COL_W}px`,
          gridTemplateRows: `${HEADER_H}px ${bodyHeight}px`,
          width: `${totalWidth}px`,
        }"
      >
        <div
          class="sticky left-0 top-0 z-40 bg-page"
          :style="{ height: `${HEADER_H}px`, width: `${TIME_COL_W}px` }"
        />

        <div
          class="sticky top-0 z-30 flex border-b border-app-soft bg-page"
          :style="{ height: `${HEADER_H}px` }"
        >
          <div
            v-for="t in visibleTables"
            :key="t.id"
            class="flex flex-col justify-center px-2"
            :style="{ width: `${COL_W}px` }"
          >
            <div class="flex items-baseline gap-1">
              <span>
                <span class="text-[11px] font-normal leading-[14px] text-muted">#</span>
                <span class="text-[13px] font-semibold leading-[20px] text-app">{{ t.number }}</span>
              </span>
              <span class="text-[11px] font-normal leading-[14px] text-muted">
                {{ t.capacity }} чел
              </span>
            </div>
            <div class="truncate text-[11px] font-normal leading-[14px] text-muted">{{ t.zone }}</div>
          </div>
        </div>

        <div class="sticky left-0 z-30 bg-page" :style="{ width: `${TIME_COL_W}px` }">
          <TimeColumn :opening-min="openingMin" :closing-min="closingMin" />
        </div>

        <div
          ref="bodyRef"
          class="relative flex"
          data-cell-zone
          @mousemove="onPointerMove"
          @mouseleave="onPointerLeave"
          @click="onClick"
        >
          <div
            v-for="t in visibleTables"
            :key="t.id"
            class="border-r border-app-soft"
            :style="{ width: `${COL_W}px`, '--col-w': `${COL_W}px` }"
            data-column
          >
            <TableColumn :events="eventsForTable(t.id)" :bounds="bounds" :timezone="timezone" />
          </div>
          <CurrentTimeLine
            :timezone="timezone"
            :selected-day="selectedDate"
            :opening-min="openingMin"
            :closing-min="closingMin"
          />
          <CellSelectOverlay
            :state="state"
            :hover="hover"
            :selection="selection"
            :tables="visibleTables"
            :opening-min="openingMin"
            :col-w="COL_W"
            :px-per-min="PX_PER_MIN"
            :selected-date="selectedDate"
            @confirm="confirm"
            @cancel="cancel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Table } from '@/entities/booking';
import { formatDayMonth, formatDuration, minutesToHHMM } from '@/shared/lib';
import type { SelectionRange, SelectionState, Snap } from './useCellSelect';
import { SLOT_MIN } from './useCellSelect';

const props = defineProps<{
  state: SelectionState;
  hover: Snap | null;
  selection: SelectionRange | null;
  tables: Table[];
  openingMin: number;
  colW: number;
  pxPerMin: number;
  selectedDate: string;
}>();

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();

const hoverBox = computed(() => {
  if (props.state !== 'idle' || !props.hover) return null;
  return {
    top: `${(props.hover.slot - props.openingMin) * props.pxPerMin}px`,
    left: `${props.hover.col * props.colW}px`,
    width: `${props.colW}px`,
    height: `${SLOT_MIN * props.pxPerMin}px`,
    label: minutesToHHMM(props.hover.slot),
  };
});

const selectionBox = computed<Record<string, string> | null>(() => {
  if (!props.selection) return null;
  const s = props.selection;
  const heightPx = (s.endMin - s.startMin) * props.pxPerMin;
  return {
    top: `${(s.startMin - props.openingMin) * props.pxPerMin}px`,
    left: `${s.startCol * props.colW}px`,
    width: `${(s.endCol - s.startCol + 1) * props.colW}px`,
    height: `${heightPx}px`,
    '--selection-h': `${heightPx}px`,
  };
});

const selectedTables = computed<Table[]>(() => {
  if (!props.selection) return [];
  const { startCol, endCol } = props.selection;
  return props.tables.slice(startCol, endCol + 1);
});

const dateLabel = computed(() => (props.selectedDate ? formatDayMonth(props.selectedDate) : ''));
const timeLabel = computed(() =>
  props.selection
    ? `${minutesToHHMM(props.selection.startMin)} – ${minutesToHHMM(props.selection.endMin)}`
    : '',
);
const durationLabel = computed(() =>
  props.selection ? formatDuration(props.selection.endMin - props.selection.startMin) : '',
);
const tableNumbers = computed(() => selectedTables.value.map((t) => t.number));
const totalCapacity = computed(() => selectedTables.value.reduce((sum, t) => sum + t.capacity, 0));
</script>

<template>
  <div
    v-if="hoverBox"
    class="cell-hover pointer-events-none absolute"
    :style="{ top: hoverBox.top, left: hoverBox.left, width: hoverBox.width, height: hoverBox.height }"
  >
    <span class="cell-hover__label">{{ hoverBox.label }}</span>
  </div>

  <div v-if="selectionBox" class="cell-selection absolute z-50" :style="selectionBox">
    <div class="cell-selection__box">
      <div class="cell-selection__highlight" aria-hidden />

      <div class="cell-selection__layer cell-selection__layer--bright">
        <div class="cell-selection__tooltip">
          <div class="cell-selection__title">Новое бронирование</div>
          <div class="cell-selection__date">{{ dateLabel }}</div>
          <div class="cell-selection__time">{{ timeLabel }}</div>
          <div class="cell-selection__duration">{{ durationLabel }}</div>
          <div class="cell-selection__tables">
            <span class="cell-selection__muted">Столы</span>
            <template v-for="(num, i) in tableNumbers" :key="num">
              <span v-if="i > 0" class="cell-selection__muted">+</span>
              <span class="cell-selection__strong">#{{ num }}</span>
            </template>
          </div>
          <div class="cell-selection__capacity">
            <span class="cell-selection__muted">На</span>
            <span class="cell-selection__strong">{{ totalCapacity }} чел</span>
          </div>
        </div>
        <div v-if="state === 'confirming'" class="cell-selection__actions">
          <button
            type="button"
            class="btn btn--primary"
            @click.stop="$emit('confirm')"
          >
            Создать
          </button>
          <button
            type="button"
            class="btn btn--ghost"
            @click.stop="$emit('cancel')"
          >
            Отменить
          </button>
        </div>
      </div>

      <div class="cell-selection__layer cell-selection__layer--muted" aria-hidden>
        <div class="cell-selection__tooltip">
          <div class="cell-selection__title">Новое бронирование</div>
          <div class="cell-selection__date">{{ dateLabel }}</div>
          <div class="cell-selection__time">{{ timeLabel }}</div>
          <div class="cell-selection__duration">{{ durationLabel }}</div>
          <div class="cell-selection__tables">
            <span>Столы</span>
            <template v-for="(num, i) in tableNumbers" :key="num">
              <span v-if="i > 0">+</span>
              <span class="cell-selection__strong">#{{ num }}</span>
            </template>
          </div>
          <div class="cell-selection__capacity">
            <span>На</span>
            <span class="cell-selection__strong">{{ totalCapacity }} чел</span>
          </div>
        </div>
        <div v-if="state === 'confirming'" class="cell-selection__actions">
          <div class="btn btn--primary">Создать</div>
          <div class="btn btn--ghost">Отменить</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cell-hover {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 2px;
  display: flex;
  align-items: flex-start;
  padding: 2px 6px;
}
.cell-hover__label {
  font-size: 11px;
  line-height: 14px;
  color: var(--c-text-muted);
}

.cell-selection {
  pointer-events: none;
}
.cell-selection__box {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  min-height: 100%;
  background: rgba(20, 24, 32, 0.55);
  border: 1px solid var(--c-accent);
  border-radius: 6px;
  pointer-events: auto;
  overflow: hidden;
  backdrop-filter: blur(12px) saturate(140%);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
}
:root[data-theme='light'] .cell-selection__box {
  background: rgba(255, 255, 255, 0.65);
}
.cell-selection__highlight {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--selection-h, 100%);
  background: rgba(0, 122, 255, 0.16);
  pointer-events: none;
}
.cell-selection__layer {
  display: flex;
  flex-direction: column;
}
.cell-selection__layer--bright {
  position: relative;
  z-index: 1;
}
.cell-selection__layer--muted {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  color: var(--c-text-muted);
  clip-path: inset(0 0 var(--selection-h, 0px) 0);
}
.cell-selection__layer--muted .cell-selection__strong {
  color: var(--c-text-muted);
  font-weight: 700;
}

.cell-selection__tooltip {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 16px;
  color: var(--c-text);
}
.cell-selection__title {
  font-weight: 600;
  font-size: 13px;
}
.cell-selection__date {
  color: var(--c-text-muted);
}
.cell-selection__time {
  font-weight: 700;
  font-size: 14px;
}
.cell-selection__duration {
  color: var(--c-text-muted);
}
.cell-selection__tables,
.cell-selection__capacity {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
}
.cell-selection__tables {
  margin-top: 6px;
}
.cell-selection__muted {
  color: var(--c-text-muted);
}
.cell-selection__strong {
  font-weight: 700;
  color: var(--c-text);
}

.cell-selection__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
}
.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 6px;
  border: 0;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: filter 120ms ease, background-color 120ms ease;
}
.btn--primary {
  background: var(--c-accent);
  color: var(--c-accent-text);
}
.btn--primary:hover {
  filter: brightness(1.08);
}
.btn--ghost {
  background: rgba(255, 255, 255, 0.08);
  color: var(--c-text);
}
.btn--ghost:hover {
  background: rgba(255, 255, 255, 0.12);
}
</style>

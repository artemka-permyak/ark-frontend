<script setup lang="ts">
import { computed, ref } from 'vue';
import type { LaidOutEvent } from '../model/types';
import { getStyle } from '../lib/statusMap';
import { formatHHMM } from '@/shared/lib/time';
import { useHoveredEvent } from '@/features/hover-event';

const props = defineProps<{
  event: LaidOutEvent;
  timezone: string;
}>();

const cardEl = ref<HTMLElement | null>(null);
const { hoveredEvent, hoveredRect, setHovered, clearHovered } = useHoveredEvent();

const style = computed(() => {
  const s = getStyle(props.event.styleKey);
  const slotPercent = 100 / props.event.slotCount;
  const leftPercent = props.event.slotIndex * slotPercent;
  const depthPx = props.event.depth * 4;
  const depthZ = 1 + props.event.depth * 2;
  return {
    top: `${props.event.top}%`,
    height: `${props.event.height}%`,
    left: `calc(${leftPercent}% + ${depthPx}px)`,
    width: `calc(${slotPercent}% - ${depthPx}px - 2px)`,
    background: `var(${s.fillVar})`,
    borderLeftColor: `var(${s.rimVar})`,
    '--depth-z': String(depthZ),
    zIndex: String(depthZ),
  } as Record<string, string>;
});

const badgeStyle = computed(() => {
  const s = getStyle(props.event.styleKey);
  if (!s.badgeBgVar) return {};
  return {
    background: `var(${s.badgeBgVar})`,
    color: `var(${s.badgeTextVar ?? '--c-text'})`,
  };
});

const timeLabel = computed(
  () =>
    `${formatHHMM(props.event.start, props.timezone)}-${formatHHMM(props.event.end, props.timezone)}`,
);

const isBlurred = computed(() => {
  const h = hoveredEvent.value;
  if (!h || h.id === props.event.id) return false;
  if (props.event.overlapIds.includes(h.id)) return true;
  const hr = hoveredRect.value;
  if (!hr || !cardEl.value) return false;
  const my = cardEl.value.getBoundingClientRect();
  return hr.right > my.left && hr.left < my.right && hr.bottom > my.top && hr.top < my.bottom;
});

function onEnter(e: MouseEvent) {
  setHovered(props.event, e.currentTarget as HTMLElement);
}
function onLeave() {
  clearHovered(props.event.id);
}
</script>

<template>
  <div
    ref="cardEl"
    class="event-card group absolute overflow-hidden rounded-md border-l-2 p-0.5 pl-1.5 text-[11px] leading-[1.25] text-app shadow-sm transition-[box-shadow,filter,opacity]"
    :class="{ 'is-compressed': event.compressed, 'is-blurred': isBlurred }"
    :style="style"
    :title="`${event.title} • ${event.name ?? ''} • ${event.badge ?? event.rawStatus} • ${timeLabel}`"
    data-event-card
    @mouseenter="onEnter"
    @mouseleave="onLeave"
  >
    <template v-if="event.source === 'order'">
      <div class="event-row font-semibold text-app">{{ event.title }}</div>
      <div
        v-if="event.badge"
        class="event-row event-badge inline-block max-w-full rounded p-0.5 text-[8px] font-semibold leading-[8px]"
        :style="badgeStyle"
      >
        {{ event.badge }}
      </div>
      <div class="event-row event-time text-muted">
        {{ formatHHMM(event.start, timezone) }}-{{ formatHHMM(event.end, timezone) }}
      </div>
    </template>

    <template v-else>
      <div class="event-row text-[10px] text-muted">{{ event.title }}</div>
      <div class="event-row event-name font-semibold text-app">
        {{ event.name || 'Гость' }}<span v-if="event.numPeople != null">;
          <span class="text-muted">{{ event.numPeople }}чел</span>
        </span>
      </div>
      <div
        v-if="event.badge"
        class="event-row event-badge inline-block max-w-full rounded p-0.5 text-[8px] font-semibold leading-[8px]"
        :style="badgeStyle"
      >
        {{ event.badge }}
      </div>
      <div class="event-meta flex flex-wrap items-baseline gap-x-2 text-muted">
        <span v-if="event.phoneTail" class="event-row event-phone">📞 {{ event.phoneTail }}</span>
        <span class="event-row event-time">
          {{ formatHHMM(event.start, timezone) }}-{{ formatHHMM(event.end, timezone) }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.event-card {
  min-height: 18px;
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
}
.event-row {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  min-width: 0;
}
.event-card.is-compressed .event-row {
  text-overflow: ellipsis;
}
.event-time {
  line-height: 1.15;
}
.event-card:hover {
  width: auto !important;
  right: auto;
  min-width: var(--col-w, 80px);
  z-index: calc(var(--depth-z, 10) + 1);
  filter: brightness(1.12);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.5),
    0 0 0 1px var(--c-accent);
}
.event-card.is-blurred {
  opacity: 0.55;
  filter: blur(1.5px);
}
</style>

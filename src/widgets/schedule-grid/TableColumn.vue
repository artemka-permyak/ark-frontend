<script setup lang="ts">
import { computed } from 'vue';
import { EventCard, layoutColumn, type LaidOutEvent, type LayoutBounds, type ScheduleEvent } from '@/entities/booking';

const props = defineProps<{
  events: ScheduleEvent[];
  bounds: LayoutBounds;
  timezone: string;
}>();

const laid = computed<LaidOutEvent[]>(() => layoutColumn(props.events, props.bounds));

const gridLines = computed(() => {
  const lines: number[] = [];
  const total = props.bounds.closingMin - props.bounds.openingMin;
  for (let m = props.bounds.openingMin + 30; m < props.bounds.closingMin; m += 30) {
    lines.push(((m - props.bounds.openingMin) / total) * 100);
  }
  return lines;
});
</script>

<template>
  <div class="relative h-full w-full bg-page">
    <div
      v-for="(top, i) in gridLines"
      :key="i"
      class="pointer-events-none absolute left-0 right-0 border-t border-app-soft"
      :style="{ top: `${top}%` }"
    />
    <EventCard v-for="ev in laid" :key="ev.id" :event="ev" :timezone="timezone" />
  </div>
</template>

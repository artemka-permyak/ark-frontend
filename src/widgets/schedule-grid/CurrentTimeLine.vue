<script setup lang="ts">
import { computed } from 'vue';
import { tzDateString, tzMinutesOfDay, useCurrentTime } from '@/shared/lib';

const props = defineProps<{
  timezone: string;
  selectedDay: string;
  openingMin: number;
  closingMin: number;
}>();

const { now } = useCurrentTime();

const position = computed(() => {
  const nowDay = tzDateString(now.value, props.timezone);
  if (props.selectedDay !== nowDay) return null;
  const nowMin = tzMinutesOfDay(now.value, props.timezone);
  if (nowMin < props.openingMin || nowMin > props.closingMin) return null;
  const total = props.closingMin - props.openingMin;
  return ((nowMin - props.openingMin) / total) * 100;
});
</script>

<template>
  <div
    v-if="position != null"
    class="pointer-events-none absolute left-0 right-0 z-30 h-[1.5px]"
    :style="{ top: `${position}%`, background: 'var(--c-now)' }"
  />
</template>

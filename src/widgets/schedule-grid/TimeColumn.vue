<script setup lang="ts">
import { computed } from 'vue';
import { minutesToHHMM } from '@/shared/lib/time';

const props = defineProps<{
  openingMin: number;
  closingMin: number;
}>();

const slots = computed(() => {
  const result: { label: string; top: number }[] = [];
  const total = props.closingMin - props.openingMin;
  for (let m = props.openingMin; m <= props.closingMin; m += 30) {
    result.push({
      label: minutesToHHMM(m),
      top: ((m - props.openingMin) / total) * 100,
    });
  }
  return result;
});
</script>

<template>
  <div class="relative h-full w-full">
    <div
      v-for="slot in slots"
      :key="slot.label"
      class="absolute right-2 whitespace-nowrap text-[11px] leading-[14px] text-muted"
      :style="{ top: `${slot.top}%` }"
    >
      {{ slot.label }}
    </div>
  </div>
</template>

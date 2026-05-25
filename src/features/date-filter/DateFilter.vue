<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBookingStore } from '@/entities/booking';
import { formatDayMonth, formatRelativeDay } from '@/shared/lib/dateFormat';
import { Chip } from '@/shared/ui';

const store = useBookingStore();
const { data, selectedDate } = storeToRefs(store);
</script>

<template>
  <div v-if="data" class="flex flex-wrap gap-2">
    <Chip
      v-for="day in data.available_days"
      :key="day"
      :active="day === selectedDate"
      @click="store.setDate(day)"
    >
      <span class="font-semibold">{{ formatDayMonth(day) }}</span>
      <span class="font-normal">{{ formatRelativeDay(day, data.current_day) }}</span>
    </Chip>
  </div>
</template>

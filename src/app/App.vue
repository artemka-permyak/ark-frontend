<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useBookingStore } from '@/entities/booking';
import { useTheme } from '@/features/theme';
import { DateFilter } from '@/features/date-filter';
import { ZoneFilter } from '@/features/zone-filter';
import { ScheduleHeader } from '@/widgets/schedule-header';
import { ScheduleGrid } from '@/widgets/schedule-grid';

const store = useBookingStore();
const { loading, error, data, usingFallback } = storeToRefs(store);

useTheme();

onMounted(() => {
  store.load();
});
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-page">
    <ScheduleHeader />

    <div v-if="loading" class="flex flex-1 items-center justify-center text-muted">
      Загрузка данных…
    </div>

    <div v-else-if="error" class="flex flex-1 flex-col items-center justify-center gap-3">
      <div class="text-muted">Ошибка загрузки: {{ error }}</div>
      <button
        class="rounded-chip bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        @click="store.load()"
      >
        Повторить
      </button>
    </div>

    <main v-else-if="data" class="flex min-h-0 flex-1 flex-col px-5 pt-8">
      <div
        v-if="usingFallback"
        class="mb-4 inline-block self-start rounded-chip bg-yellow-500/15 px-3 py-1 text-xs text-yellow-700 dark:text-yellow-300"
      >
        Используются демо-данные
      </div>

      <h1 class="mb-6 text-[20px] font-bold leading-[28px] text-app">Бронирования</h1>

      <div class="mb-5">
        <div class="mb-2 text-sm text-faint">Дата</div>
        <DateFilter />
      </div>

      <div class="mb-6">
        <div class="mb-2 text-sm text-faint">Отображаемые зоны</div>
        <ZoneFilter />
      </div>

      <ScheduleGrid />
    </main>
  </div>
</template>

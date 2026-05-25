<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBookingStore } from '@/entities/booking';
import { useTheme } from '@/features/theme';

const store = useBookingStore();
const { data } = storeToRefs(store);
const { theme, toggle } = useTheme();
</script>

<template>
  <header class="header">
    <div class="brand">
      <span class="brand__name">AIRESTO</span>
      <span class="brand__sep">|</span>
      <span v-if="data" class="brand__restaurant">{{ data.restaurant.restaurant_name }}</span>
    </div>

    <div class="actions">
      <div class="search">
        <span aria-hidden>🔍</span>
        <span>⌘+Л поиск по имени</span>
      </div>
      <button
        type="button"
        class="theme-toggle"
        :title="theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'"
        @click="toggle"
      >
        {{ theme === 'dark' ? '☀' : '☾' }}
      </button>
      <button type="button" class="logout">
        <span>→</span>
        <span>Выйти</span>
      </button>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 44px;
  padding: 0 20px;
  background: var(--c-bg-elev);
}
.brand {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: Inter, sans-serif;
  font-weight: 600;
  font-size: 11px;
  line-height: 14px;
  color: var(--c-text);
}
.brand__sep {
  font-weight: 400;
}
.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 258px;
  height: 28px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid var(--c-line-soft);
  background: var(--c-page);
  font-size: 11px;
  color: var(--c-text-muted);
}
.theme-toggle {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 4px;
  background: var(--c-bg-chip);
  color: var(--c-text-muted);
  cursor: pointer;
}
.theme-toggle:hover {
  color: var(--c-text);
}
.logout {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-radius: 4px;
  background: var(--c-bg-chip);
  color: var(--c-text);
  font-size: 12px;
  cursor: pointer;
}
.logout:hover {
  filter: brightness(1.15);
}
:root[data-theme='light'] .logout:hover {
  filter: brightness(0.95);
}
</style>

<script setup lang="ts">
defineProps<{
  active?: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    type="button"
    class="chip"
    :class="{ 'chip--active': active }"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
.chip {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--c-bg-chip);
  color: var(--c-text);
  font-family: inherit;
  font-size: 11px;
  line-height: 14px;
  transition: background-color 120ms ease, color 120ms ease;
  cursor: pointer;
  border: 0;
}
.chip:hover:not(.chip--active) {
  background: rgba(255, 255, 255, 0.06);
}
:root[data-theme='light'] .chip:hover:not(.chip--active) {
  background: rgba(0, 0, 0, 0.06);
}
.chip--active {
  background: var(--c-accent);
  color: var(--c-accent-text);
}
</style>

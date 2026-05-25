<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useBookingStore } from '@/entities/booking';
import { Chip } from '@/shared/ui';

const store = useBookingStore();
const { zones, hiddenZones } = storeToRefs(store);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <Chip
      v-for="zone in zones"
      :key="zone"
      :active="!hiddenZones.has(zone)"
      @click="store.toggleZone(zone)"
    >
      <span>{{ zone }}</span>
    </Chip>
  </div>
</template>

import { ref, shallowRef } from 'vue';
import type { LaidOutEvent } from '@/entities/booking';

type Rect = { left: number; right: number; top: number; bottom: number };

const hoveredEvent = shallowRef<LaidOutEvent | null>(null);
const hoveredRect = ref<Rect | null>(null);

/**
 * Shared hover state used by `EventCard` to dim/blur visually overlapping
 * siblings. Tracks both the event and its measured bounding rect (captured
 * after the hover styles are applied, so cards in adjacent columns can detect
 * physical overlap with the expanded card).
 */
export function useHoveredEvent() {
  function setHovered(ev: LaidOutEvent, el: HTMLElement) {
    hoveredEvent.value = ev;
    requestAnimationFrame(() => {
      if (hoveredEvent.value?.id !== ev.id) return;
      const r = el.getBoundingClientRect();
      hoveredRect.value = { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    });
  }
  function clearHovered(id: string) {
    if (hoveredEvent.value?.id === id) {
      hoveredEvent.value = null;
      hoveredRect.value = null;
    }
  }
  return { hoveredEvent, hoveredRect, setHovered, clearHovered };
}

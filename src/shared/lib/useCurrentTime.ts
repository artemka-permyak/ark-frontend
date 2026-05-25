import { onMounted, onUnmounted, ref } from 'vue';

/**
 * Reactive `now` ref that updates every minute, aligned to the wall-clock
 * start of the next minute.
 */
export function useCurrentTime() {
  const now = ref(new Date());
  let timeoutId: number | undefined;
  let intervalId: number | undefined;

  function tick() {
    now.value = new Date();
  }

  onMounted(() => {
    tick();
    const ms = new Date();
    const delayToNextMinute = (60 - ms.getSeconds()) * 1000 - ms.getMilliseconds();
    timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 60_000);
    }, delayToNextMinute);
  });

  onUnmounted(() => {
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    if (intervalId !== undefined) window.clearInterval(intervalId);
  });

  return { now };
}

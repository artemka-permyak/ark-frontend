import { onMounted, ref, watch } from 'vue';

type Theme = 'light' | 'dark';
const KEY = 'airesto:theme';

const theme = ref<Theme>('dark');

function apply(t: Theme) {
  document.documentElement.setAttribute('data-theme', t);
}

/**
 * Light/dark theme toggle persisted to localStorage. Falls back to
 * `prefers-color-scheme` on first load.
 */
export function useTheme() {
  onMounted(() => {
    const saved = localStorage.getItem(KEY) as Theme | null;
    if (saved === 'dark' || saved === 'light') {
      theme.value = saved;
    } else {
      theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    apply(theme.value);
  });

  watch(theme, (t) => {
    apply(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
  });

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  return { theme, toggle };
}

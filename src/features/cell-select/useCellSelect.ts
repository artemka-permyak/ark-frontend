import { computed, onUnmounted, ref, type Ref } from 'vue';

export const SLOT_MIN = 15;

export type Snap = { col: number; slot: number };
export type SelectionState = 'idle' | 'selecting' | 'confirming';

export type SelectionRange = {
  startCol: number;
  endCol: number;
  startMin: number;
  endMin: number;
};

export type CellSelectOptions = {
  containerRef: Ref<HTMLElement | null>;
  /** Maps an X (px, in container coords) to a column index, or -1 if outside. */
  pxToCol: (relX: number) => number;
  /** Maps a Y (px) to a 15-min slot start (absolute minutes-from-midnight). */
  pxToSlot: (relY: number) => number;
  /** Called when the user confirms the selection. */
  onCreate: (range: SelectionRange) => void;
};

/**
 * Click-based rectangular selection:
 *
 * 1. Idle: cursor over an empty cell shows a hover hint (15-min half-cell).
 * 2. First click → `selecting`: mouse-move freely expands the selection box.
 * 3. Second click → `confirming`: shows Create/Cancel actions.
 * 4. Esc or Cancel → resets to idle.
 */
export function useCellSelect(opts: CellSelectOptions) {
  const state = ref<SelectionState>('idle');
  const hover = ref<Snap | null>(null);
  const anchor = ref<Snap | null>(null);
  const current = ref<Snap | null>(null);

  function snapFromEvent(e: MouseEvent): Snap | null {
    const el = opts.containerRef.value;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left + el.scrollLeft;
    const y = e.clientY - rect.top + el.scrollTop;
    const col = opts.pxToCol(x);
    const slot = opts.pxToSlot(y);
    if (col < 0 || slot < 0) return null;
    return { col, slot };
  }

  function isOnEventCard(e: MouseEvent): boolean {
    return Boolean((e.target as HTMLElement | null)?.closest('[data-event-card]'));
  }

  function onPointerMove(e: MouseEvent) {
    if (state.value === 'confirming') return;
    if (isOnEventCard(e)) {
      if (state.value === 'idle') hover.value = null;
      return;
    }
    const snap = snapFromEvent(e);
    if (!snap) {
      if (state.value === 'idle') hover.value = null;
      return;
    }
    if (state.value === 'idle') hover.value = snap;
    else if (state.value === 'selecting') current.value = snap;
  }

  function onPointerLeave() {
    if (state.value === 'idle') hover.value = null;
  }

  function onClick(e: MouseEvent) {
    if (state.value === 'confirming') return;
    if (isOnEventCard(e)) return;
    const snap = snapFromEvent(e);
    if (!snap) return;
    if (state.value === 'idle') {
      anchor.value = snap;
      current.value = snap;
      hover.value = null;
      state.value = 'selecting';
    } else if (state.value === 'selecting') {
      current.value = snap;
      state.value = 'confirming';
    }
  }

  const selection = computed<SelectionRange | null>(() => {
    if (!anchor.value || !current.value) return null;
    const a = anchor.value;
    const c = current.value;
    return {
      startCol: Math.min(a.col, c.col),
      endCol: Math.max(a.col, c.col),
      startMin: Math.min(a.slot, c.slot),
      endMin: Math.max(a.slot, c.slot) + SLOT_MIN,
    };
  });

  function confirm() {
    if (selection.value) opts.onCreate(selection.value);
    cancel();
  }

  function cancel() {
    state.value = 'idle';
    anchor.value = null;
    current.value = null;
    hover.value = null;
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') cancel();
  }

  window.addEventListener('keydown', onKeyDown);
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
  });

  return {
    state,
    hover,
    selection,
    onPointerMove,
    onPointerLeave,
    onClick,
    confirm,
    cancel,
  };
}

import type { BookingResponse } from '../model/types';
import fallback from './fallback.json';

const PROD_URL = 'https://hh.frontend.ark.software/api/booking';
const DEV_URL = '/api/booking';

export type LoadResult = {
  data: BookingResponse;
  usingFallback: boolean;
};

/**
 * Fetches the booking response from the backend, falling back to a bundled
 * snapshot if the network call fails (CORS, offline, server down).
 *
 * @param signal - Abort signal forwarded to `fetch`.
 */
export async function loadBooking(signal?: AbortSignal): Promise<LoadResult> {
  const url = import.meta.env.DEV ? DEV_URL : PROD_URL;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as BookingResponse;
    return { data, usingFallback: false };
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err;
    console.warn('[airesto] API недоступен, используем fallback', err);
    return { data: fallback as unknown as BookingResponse, usingFallback: true };
  }
}

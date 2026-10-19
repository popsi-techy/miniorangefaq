/** Reads a 1-based page number from a search param, clamped to the valid range. */
export function readPage(value: string | null, total: number, pageSize: number) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const n = parseInt(value ?? '1', 10);
  return Number.isFinite(n) ? Math.min(Math.max(1, n), pages) : 1;
}

import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ParamChanges = Record<string, string | null>;

/**
 * URL search params as page state (filters, sort, page). Keeps state shareable and
 * restorable with Back. `update` merges changes into the *latest* params, removes
 * empty values and resets ?page unless it is part of the change.
 */
export function useUrlParams() {
  const [params, setParams] = useSearchParams();
  const update = useCallback(
    (changes: ParamChanges, { replace = true }: { replace?: boolean } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
          if (!('page' in changes)) next.delete('page');
          return next;
        },
        { replace },
      );
    },
    [setParams],
  );
  return [params, update] as const;
}

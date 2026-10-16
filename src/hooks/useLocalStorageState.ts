import { useEffect, useRef, useState } from 'react';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

function deepMergeDefaults<T>(fallback: T, parsed: T): T {
  if (!isPlainObject(fallback) || !isPlainObject(parsed)) return parsed;
  const result: Record<string, unknown> = { ...fallback };
  for (const key of Object.keys(parsed)) {
    result[key] = deepMergeDefaults(fallback[key], parsed[key]);
  }
  return result as T;
}

export function useLocalStorageState<T>(key: string, initialValue: () => T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (!stored) return initialValue();
      const parsed = JSON.parse(stored) as T;
      return deepMergeDefaults(initialValue(), parsed);
    } catch {
      return initialValue();
    }
  });

  const isFirstRun = useRef(true);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(state));
        setSavedAt(Date.now());
      } catch {
        // localStorage unavailable (private browsing, quota) — draft simply won't persist
      }
    }, 400);
    return () => window.clearTimeout(handle);
  }, [key, state]);

  const clear = () => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  };

  return { state, setState, savedAt, clear };
}

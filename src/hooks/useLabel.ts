import { useAppSelector } from '../store/hooks';

export function useLabelMap(): Record<string, string> {
  return useAppSelector((state) => state.systemLabel.map);
}

export function resolveLabel(map: Record<string, string>, key: string | undefined, fallback: string): string {
  if (!key) return fallback;
  return map[key] ?? fallback;
}

/**
 * Reads a runtime-editable system label by key, falling back to the given
 * default when it hasn't been fetched yet or has no override in the DB.
 */
export function useLabel(key: string, fallback: string): string {
  const map = useLabelMap();
  return resolveLabel(map, key, fallback);
}

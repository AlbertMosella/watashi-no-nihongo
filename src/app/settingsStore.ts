import type { KeyValueStorage } from '@/domain/ports';
import { sanitizeSettings, type Settings } from '@/domain/settings';

export const SETTINGS_KEY = 'wnn.settings';

/**
 * Store mínim compatible amb `useSyncExternalStore`: snapshot immutable + subscripció.
 * Els components se subscriuen amb selectors, de manera que només es tornen a pintar
 * quan canvia el tros de preferències que fan servir.
 */
export class SettingsStore {
  private state: Settings;
  private readonly listeners = new Set<() => void>();

  constructor(
    private readonly storage: KeyValueStorage,
    knownCategoryIds?: ReadonlySet<string>,
  ) {
    this.state = sanitizeSettings(storage.read(SETTINGS_KEY), knownCategoryIds);
  }

  getSnapshot = (): Settings => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  update(patch: Partial<Settings> | ((s: Settings) => Partial<Settings>)): void {
    const changes = typeof patch === 'function' ? patch(this.state) : patch;
    const next = { ...this.state, ...changes };
    if (shallowEqual(next, this.state)) return;
    this.state = next;
    this.storage.write(SETTINGS_KEY, next);
    for (const listener of this.listeners) listener();
  }
}

function shallowEqual(a: object, b: object): boolean {
  const ka = Object.keys(a) as (keyof typeof a)[];
  return ka.length === Object.keys(b).length && ka.every((k) => a[k] === b[k]);
}

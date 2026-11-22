import { MemoryStorage } from '@/data/localStorageAdapter';
import { DEFAULT_SETTINGS } from '@/domain/settings';
import { SETTINGS_KEY, SettingsStore } from './settingsStore';

describe('SettingsStore', () => {
  it('carrega els valors desats i neteja els invàlids', () => {
    const storage = new MemoryStorage();
    storage.write(SETTINGS_KEY, { language: 'es', categoryIds: ['a', 'x'] });
    const store = new SettingsStore(storage, new Set(['a']));
    expect(store.getSnapshot().language).toBe('es');
    expect(store.getSnapshot().categoryIds).toEqual(['a']);
  });

  it('desa i notifica els canvis', () => {
    const storage = new MemoryStorage();
    const store = new SettingsStore(storage);
    const listener = vi.fn();
    store.subscribe(listener);
    store.update({ showRomaji: false });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(storage.read(SETTINGS_KEY)).toMatchObject({ showRomaji: false });
  });

  it('no notifica si res canvia (snapshot estable)', () => {
    const store = new SettingsStore(new MemoryStorage());
    const before = store.getSnapshot();
    const listener = vi.fn();
    store.subscribe(listener);
    store.update({ language: DEFAULT_SETTINGS.language });
    expect(listener).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toBe(before);
  });

  it('accepta actualitzacions funcionals', () => {
    const store = new SettingsStore(new MemoryStorage());
    store.update((s) => ({ categoryIds: [...s.categoryIds, 'kanji'] }));
    expect(store.getSnapshot().categoryIds).toEqual(['hiragana-basic', 'kanji']);
  });
});

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Card } from '@/domain/card';
import { buildDeck } from '@/domain/deck';
import type { Settings } from '@/domain/settings';
import { useServices } from './services';

/** Llegeix un tros de les preferències. Només es repinta si aquest tros canvia. */
export function useSetting<K extends keyof Settings>(key: K): Settings[K] {
  const { settings } = useServices();
  return useSyncExternalStore(settings.subscribe, () => settings.getSnapshot()[key]);
}

export function useSettings(): Settings {
  const { settings } = useServices();
  return useSyncExternalStore(settings.subscribe, settings.getSnapshot);
}

export function useUpdateSettings() {
  const { settings } = useServices();
  return useCallback((patch: Parameters<typeof settings.update>[0]) => settings.update(patch), [settings]);
}

export type DeckState =
  | { readonly status: 'loading'; readonly cards: readonly Card[] }
  | { readonly status: 'ready'; readonly cards: readonly Card[] }
  | { readonly status: 'error'; readonly cards: readonly Card[]; readonly error: unknown };

/**
 * Carrega (en paral·lel i amb cache) les categories seleccionades i construeix el mall.
 * Mentre carrega, conserva les targetes anteriors per evitar parpellejos.
 */
export function useDeck(): DeckState {
  const { cards: repository } = useServices();
  const categoryIds = useSetting('categoryIds');
  const shuffle = useSetting('shuffle');
  const seed = useSetting('shuffleSeed');
  const order = useMemo(() => repository.getCategories().map((c) => c.id), [repository]);
  // Identifica la petició actual: si el resultat desat és d'una petició anterior, estem carregant.
  const request = useMemo(() => ({ categoryIds, shuffle, seed }), [categoryIds, shuffle, seed]);
  const [result, setResult] = useState<{ request: object; state: DeckState }>({
    request: {},
    state: { status: 'loading', cards: [] },
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all(request.categoryIds.map(async (id) => [id, await repository.getCards(id)] as const))
      .then((entries) => {
        if (cancelled) return;
        const cards = buildDeck(new Map(entries), order, request);
        setResult({ request, state: { status: 'ready', cards } });
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult((prev) => ({ request, state: { status: 'error', cards: prev.state.cards, error } }));
      });
    return () => {
      cancelled = true;
    };
  }, [repository, order, request]);

  return result.request === request ? result.state : { status: 'loading', cards: result.state.cards };
}

export function useSpeech() {
  const { speech } = useServices();
  const available = useSyncExternalStore(
    useCallback((l: () => void) => speech.subscribe(l), [speech]),
    () => speech.isAvailable(),
  );
  const speak = useCallback((text: string) => speech.speak(text), [speech]);
  return { available, speak };
}

/** Sincronitza el tema (atribut data-theme) i l'idioma del document. */
export function useDocumentSettings(): void {
  const theme = useSetting('theme');
  const language = useSetting('language');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
}

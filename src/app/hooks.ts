import { useCallback, useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { Card } from '@/domain/card';
import type { TopicContent } from '@/domain/conversation';
import { buildDeck } from '@/domain/deck';
import { buildSearchIndex, searchCards } from '@/domain/search';
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

/**
 * Cerca de text sobre TOTES les targetes (independent de les categories seleccionades).
 * - Les categories es carreguen el primer cop que es cerca (chunks en cache, també offline).
 * - L'índex normalitzat es construeix un sol cop per idioma.
 * - useDeferredValue fa que escriure sigui fluid encara que hi hagi milers de targetes.
 */
export function useSearchDeck(query: string): DeckState {
  const { cards: repository } = useServices();
  const language = useSetting('language');
  const active = query.trim().length > 0;
  const deferredQuery = useDeferredValue(query);
  const [all, setAll] = useState<readonly Card[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!active || all) return;
    let cancelled = false;
    const ids = repository.getCategories().map((c) => c.id);
    Promise.all(ids.map((id) => repository.getCards(id)))
      .then((lists) => !cancelled && setAll(lists.flat()))
      .catch((e: unknown) => !cancelled && setError(e));
    return () => {
      cancelled = true;
    };
  }, [active, all, repository]);

  const index = useMemo(() => (all ? buildSearchIndex(all, language) : null), [all, language]);
  const results = useMemo(() => (index ? searchCards(index, deferredQuery) : []), [index, deferredQuery]);

  if (error) return { status: 'error', cards: [], error };
  if (!index) return { status: 'loading', cards: [] };
  return { status: 'ready', cards: results };
}

export type TopicState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly content: TopicContent }
  | { readonly status: 'error'; readonly error: unknown };

/** Carrega les converses d'una temàtica (des del chunk en cache, també offline). */
export function useTopic(topicId: string): TopicState {
  const { conversations } = useServices();
  const [result, setResult] = useState<{ topicId: string; state: TopicState } | null>(null);

  useEffect(() => {
    let cancelled = false;
    conversations
      .getTopic(topicId)
      .then((content) => !cancelled && setResult({ topicId, state: { status: 'ready', content } }))
      .catch((error: unknown) => !cancelled && setResult({ topicId, state: { status: 'error', error } }));
    return () => {
      cancelled = true;
    };
  }, [conversations, topicId]);

  return result?.topicId === topicId ? result.state : { status: 'loading' };
}

/** Com es pot instal·lar l'app en aquest dispositiu (o si ja ho està). */
export function useInstall() {
  const { install } = useServices();
  const mode = useSyncExternalStore(install.subscribe, install.getSnapshot);
  const prompt = useCallback(() => install.install(), [install]);
  return { mode, prompt };
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

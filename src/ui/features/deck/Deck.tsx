import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDeck, useSettings, useSpeech, type DeckState } from '@/app/hooks';
import { categoryLabelKey, useT } from '@/app/i18n';
import { useServices } from '@/app/services';
import type { FaceSettings } from '@/domain/faces';
import { Button } from '@/ui/components';
import { Flashcard } from './Flashcard';
import { useCardScroller } from './useCardScroller';
import styles from './Deck.module.css';

export interface DeckProps {
  onOpenFilters: () => void;
  /** Quan hi ha un panell obert, el teclat no ha de moure les targetes. */
  keyboardEnabled: boolean;
  /** Resultats d'una cerca de text: substitueixen el mall de les categories. */
  search?: { query: string; state: DeckState } | null;
}

export function Deck({ onOpenFilters, keyboardEnabled, search }: DeckProps) {
  const t = useT();
  const categoryDeck = useDeck();
  const deck = search ? search.state : categoryDeck;
  const settings = useSettings();
  const { cards: repository } = useServices();
  const { available: speechAvailable, speak } = useSpeech();
  const cards = deck.cards;

  const categories = useMemo(
    () => new Map(repository.getCategories().map((c) => [c.id, c])),
    [repository],
  );

  // Objecte estable: les targetes memoitzades només es repinten si canvia alguna d'aquestes opcions.
  const { language, frontSide, scriptMode, showRomaji, showFurigana } = settings;
  const faceSettings = useMemo<FaceSettings>(
    () => ({ language, frontSide, scriptMode, showRomaji, showFurigana }),
    [language, frontSide, scriptMode, showRomaji, showFurigana],
  );

  const scroller = useCardScroller(cards.length, cards);
  const { current, range, itemHeight, registerItem, scrollToIndex, containerRef } = scroller;

  // Només la targeta actual pot estar girada; en canviar de targeta, es torna a posar de cara.
  const [flip, setFlip] = useState<{ index: number; flipped: boolean }>({ index: -1, flipped: false });
  // Mall nou (filtres o resultats de cerca): cap targeta girada.
  const [prevCards, setPrevCards] = useState(cards);
  if (prevCards !== cards) {
    setPrevCards(cards);
    setFlip({ index: -1, flipped: false });
  }
  const [hasFlipped, setHasFlipped] = useState(false);
  const onFlip = useCallback((index: number) => {
    setHasFlipped(true);
    setFlip((f) => ({ index, flipped: f.index === index ? !f.flipped : true }));
  }, []);
  const showHint = !hasFlipped && current === 0;

  // Teclat: espai/enter giren, fletxes avancen.
  useEffect(() => {
    if (!keyboardEnabled) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof Element && target.closest('input, textarea, select, dialog, button')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onFlip(current);
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'j') {
        e.preventDefault();
        scrollToIndex(current + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'k') {
        e.preventDefault();
        scrollToIndex(current - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyboardEnabled, current, onFlip, scrollToIndex]);

  const visible = [];
  if (itemHeight > 0) {
    for (let i = range.start; i <= range.end; i++) {
      const card = cards[i];
      if (!card) continue;
      visible.push(
        <Flashcard
          key={card.id + ':' + i}
          card={card}
          index={i}
          height={itemHeight}
          category={categories.get(card.categoryId)}
          categoryLabel={t(categoryLabelKey(card.categoryId))}
          faceSettings={faceSettings}
          flipped={flip.index === i && flip.flipped && i === current}
          onFlip={onFlip}
          speechAvailable={speechAvailable}
          onSpeak={speak}
          register={registerItem}
          hint={showHint && i === 0 ? t('deck.hint') : undefined}
          t={t}
        />,
      );
    }
  }

  const empty = !search && settings.categoryIds.length === 0;
  const noResults = !!search && search.state.status === 'ready' && cards.length === 0;

  return (
    <main className={styles.deck}>
      <div
        ref={containerRef}
        className={styles.scroller}
        aria-roledescription="carousel"
        aria-label={t('app.title')}
      >
        <div className={styles.spacer} style={{ height: cards.length * itemHeight }}>
          {visible}
        </div>
      </div>

      {noResults ? (
        <div className={styles.state}>
          <p>{t('search.empty', { q: search.query.trim() })}</p>
          <p className={styles.small}>{t('search.hint')}</p>
        </div>
      ) : empty ? (
        <div className={styles.state}>
          <p>{t('deck.empty')}</p>
          <Button variant="primary" icon="layers" onClick={onOpenFilters}>
            {t('deck.emptyAction')}
          </Button>
        </div>
      ) : deck.status === 'loading' && cards.length === 0 ? (
        <div className={styles.state} aria-busy="true">
          <span className={styles.spinner} aria-hidden="true" />
          <p className="visually-hidden">{t('deck.loading')}</p>
        </div>
      ) : deck.status === 'error' ? (
        <div className={styles.state} role="alert">
          <p>{t('deck.error')}</p>
          <Button onClick={() => window.location.reload()}>{t('deck.retry')}</Button>
        </div>
      ) : null}

      {cards.length > 0 && !empty && (
        <div className={styles.footer}>
          <p className={styles.position} aria-live="polite">
            {t('deck.position', { current: current + 1, total: cards.length })}
          </p>
          <div className={styles.progress} aria-hidden="true">
            <span style={{ transform: `scaleX(${(current + 1) / cards.length})` }} />
          </div>
        </div>
      )}
    </main>
  );
}

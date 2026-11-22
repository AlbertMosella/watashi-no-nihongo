import { memo, useCallback, useMemo, useState, type CSSProperties } from 'react';
import type { Card } from '@/domain/card';
import type { Category } from '@/domain/category';
import { getCardFaces, type Face, type FaceSettings } from '@/domain/faces';
import type { Translate } from '@/app/i18n';
import { cx, Icon } from '@/ui/components';
import { FaceView } from './FaceView';
import styles from './Flashcard.module.css';

export interface FlashcardProps {
  card: Card;
  index: number;
  height: number;
  category: Category | undefined;
  categoryLabel: string;
  faceSettings: FaceSettings;
  flipped: boolean;
  onFlip: (index: number) => void;
  speechAvailable: boolean;
  onSpeak: (text: string) => void;
  register: (index: number, el: HTMLElement | null) => void;
  /** Pista d'ús (només a la primera targeta fins al primer gir). */
  hint?: string;
  t: Translate;
}

export const Flashcard = memo(function Flashcard({
  card,
  index,
  height,
  category,
  categoryLabel,
  faceSettings,
  flipped,
  onFlip,
  speechAvailable,
  onSpeak,
  register,
  hint,
  t,
}: FlashcardProps) {
  const { front, back } = useMemo(() => getCardFaces(card, faceSettings), [card, faceSettings]);
  const ref = useCallback((el: HTMLElement | null) => register(index, el), [register, index]);
  // L'animació d'"aixecar" la targeta només s'activa quan es gira, no en muntar-la.
  const [prevFlipped, setPrevFlipped] = useState(flipped);
  const [animateLift, setAnimateLift] = useState(false);
  if (prevFlipped !== flipped) {
    setPrevFlipped(flipped);
    setAnimateLift(true);
  }

  const style = { top: index * height, height, '--hue': category?.hue ?? 30 } as CSSProperties;

  return (
    <div ref={ref} className={styles.slot} style={style} data-index={index} data-hue="">
      <div className={styles.motion}>
        <div
          className={cx(styles.card, animateLift && (flipped ? styles.liftA : styles.liftB))}
          onClick={() => onFlip(index)}
          aria-label={t('card.flip')}
        >
          <div className={cx(styles.inner, flipped && styles.flipped)}>
            <Side face={front} side="front" hidden={flipped} hint={hint} {...{ category, categoryLabel, speechAvailable, onSpeak, t }} />
            <Side face={back} side="back" hidden={!flipped} {...{ category, categoryLabel, speechAvailable, onSpeak, t }} />
          </div>
        </div>
      </div>
    </div>
  );
});

interface SideProps {
  face: Face;
  side: 'front' | 'back';
  hidden: boolean;
  category: Category | undefined;
  categoryLabel: string;
  speechAvailable: boolean;
  onSpeak: (text: string) => void;
  hint?: string;
  t: Translate;
}

function Side({ face, side, hidden, category, categoryLabel, speechAvailable, onSpeak, hint, t }: SideProps) {
  const speech = 'speech' in face ? face.speech : undefined;
  return (
    <section className={cx(styles.face, styles[side])} aria-hidden={hidden}>
      <header className={styles.faceHeader}>
        <span className={styles.badge}>
          <span lang="ja" aria-hidden="true">
            {category?.emoji}
          </span>
          {categoryLabel}
        </span>
        {speech && (
          <button
            type="button"
            className={styles.speak}
            tabIndex={hidden ? -1 : 0}
            disabled={!speechAvailable}
            aria-label={speechAvailable ? t('card.speak') : t('card.speakUnavailable')}
            title={speechAvailable ? t('card.speak') : t('card.speakUnavailable')}
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(speech);
            }}
          >
            <Icon name="speaker" size={20} />
          </button>
        )}
      </header>
      <FaceView face={face} t={t} />
      {side === 'front' && (
        <footer className={cx(styles.faceFooter, hint && styles.hint)}>
          <Icon name="flip" size={16} />
          {hint && <span>{hint}</span>}
        </footer>
      )}
    </section>
  );
}

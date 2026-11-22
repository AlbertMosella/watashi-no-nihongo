import { memo, useState, type KeyboardEvent } from 'react';
import { useT } from '@/app/i18n';
import { viewLine, type ConversationLine, type ConversationSettings } from '@/domain/conversation';
import { cx, Icon } from '@/ui/components';
import { Furigana } from '../deck/Furigana';
import styles from './Conversations.module.css';

export interface BubbleProps {
  line: ConversationLine;
  speakerLabel: string;
  settings: ConversationSettings;
  speechAvailable: boolean;
  onSpeak: (text: string) => void;
}

/**
 * Una línia de la conversa. En mode pràctica, una part (el japonès o la traducció)
 * surt difuminada fins que es toca la bombolla.
 */
export const Bubble = memo(function Bubble({ line, speakerLabel, settings, speechAvailable, onSpeak }: BubbleProps) {
  const t = useT();
  const view = viewLine(line, settings);
  const [revealed, setRevealed] = useState(false);
  const hidden = revealed ? 'none' : view.hidden;
  const interactive = view.hidden !== 'none';

  const toggle = () => interactive && setRevealed((r) => !r);
  const onKeyDown = (e: KeyboardEvent) => {
    if (interactive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <li className={cx(styles.line, view.fromLearner && styles.mine)}>
      <span className={styles.speaker}>{speakerLabel}</span>
      <div
        className={cx(styles.bubble, interactive && styles.interactive)}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-expanded={interactive ? hidden === 'none' : undefined}
        onClick={toggle}
        onKeyDown={onKeyDown}
      >
        <div className={styles.bubbleTop}>
          <Hideable hidden={hidden === 'japanese'} revealed={revealed && view.hidden === 'japanese'} label={t('conversations.reveal')}>
            <p className={styles.ja}>
              <Furigana text={view.japanese.text} show={view.japanese.showFurigana} />
            </p>
            {view.japanese.romaji && <p className={styles.romaji}>{view.japanese.romaji}</p>}
          </Hideable>
          <button
            type="button"
            className={styles.speak}
            disabled={!speechAvailable}
            aria-label={speechAvailable ? t('card.speak') : t('card.speakUnavailable')}
            title={speechAvailable ? t('card.speak') : t('card.speakUnavailable')}
            onClick={(e) => {
              e.stopPropagation();
              onSpeak(view.speech);
            }}
          >
            <Icon name="speaker" size={16} />
          </button>
        </div>
        <Hideable hidden={hidden === 'translation'} revealed={revealed && view.hidden === 'translation'} label={t('conversations.reveal')}>
          <p className={styles.translation}>{view.translation}</p>
        </Hideable>
      </div>
    </li>
  );
});

/**
 * Contingut difuminat (i amagat als lectors de pantalla) fins que es destapa.
 * L'animació de "desdifuminar" només es fa en destapar-lo, no en pintar-lo d'entrada.
 */
function Hideable({
  hidden,
  revealed,
  label,
  children,
}: {
  hidden: boolean;
  revealed: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (!hidden) return <div className={revealed ? styles.reveal : undefined}>{children}</div>;
  return (
    <div className={styles.hiddenPart}>
      <div aria-hidden="true" className={styles.blur}>
        {children}
      </div>
      <span className={styles.revealLabel}>{label}</span>
    </div>
  );
}

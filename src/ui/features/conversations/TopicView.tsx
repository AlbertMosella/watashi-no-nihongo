import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useSettings, useSpeech, useTopic, useUpdateSettings } from '@/app/hooks';
import { topicLabelKey, useT } from '@/app/i18n';
import { LEARNER, type ConversationSettings, type Topic, type TopicContent } from '@/domain/conversation';
import { toJapaneseText } from '@/domain/display';
import { Icon, IconButton, SegmentedControl } from '@/ui/components';
import { Furigana } from '../deck/Furigana';
import { Bubble } from './Bubble';
import styles from './Conversations.module.css';

type Mode = 'read' | 'practice';

const PHRASES_BLOCK = 'phrases';

export function TopicView({ topic, onBack }: { topic: Topic; onBack: () => void }) {
  const t = useT();
  const state = useTopic(topic.id);
  const s = useSettings();
  const update = useUpdateSettings();

  // Blocs desplegats. Viu aquí (i no dins del cos) perquè es mantinguin oberts en canviar de mode.
  const [openIds, setOpenIds] = useState<ReadonlySet<string>>(() => new Set());
  const toggleBlock = useCallback((id: string, open: boolean) => {
    setOpenIds((prev) => {
      if (prev.has(id) === open) return prev;
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const settings = useMemo<ConversationSettings>(
    () => ({
      language: s.language,
      scriptMode: s.scriptMode,
      showRomaji: s.showRomaji,
      showFurigana: s.showFurigana,
      practice: s.practice,
    }),
    [s.language, s.scriptMode, s.showRomaji, s.showFurigana, s.practice],
  );

  return (
    <article data-hue="" style={{ '--hue': topic.hue } as CSSProperties}>
      <header className={styles.topicHeader}>
        <IconButton icon="back" label={t('conversations.back')} variant="ghost" onClick={onBack} />
        <h1 className={styles.pageTitle}>
          <span aria-hidden="true">{topic.emoji} </span>
          {t(topicLabelKey(topic.id))}
        </h1>
      </header>

      <SegmentedControl<Mode>
        label={t('conversations.mode')}
        hideLabel
        value={s.practice ? 'practice' : 'read'}
        options={[
          { value: 'read', label: t('conversations.mode.read') },
          { value: 'practice', label: t('conversations.mode.practice') },
        ]}
        onChange={(mode) => update({ practice: mode === 'practice' })}
      />
      {s.practice && <p className={styles.hint}>{t('conversations.practiceHint')}</p>}

      {state.status === 'loading' && <div className={styles.spinner} aria-label={t('deck.loading')} />}
      {state.status === 'error' && (
        <p role="alert" className={styles.hint}>
          {t('conversations.error')}
        </p>
      )}
      {state.status === 'ready' && (
        // La key reinicia les bombolles destapades en canviar de mode.
        <TopicBody
          key={String(s.practice)}
          content={state.content}
          settings={settings}
          openIds={openIds}
          onToggle={toggleBlock}
        />
      )}
    </article>
  );
}

interface TopicBodyProps {
  content: TopicContent;
  settings: ConversationSettings;
  openIds: ReadonlySet<string>;
  onToggle: (id: string, open: boolean) => void;
}

function TopicBody({ content, settings, openIds, onToggle }: TopicBodyProps) {
  const t = useT();
  const { available, speak } = useSpeech();
  const lang = settings.language;

  return (
    <div className={styles.blocks}>
      {content.conversations.map((conversation) => (
        <Block
          key={conversation.id}
          id={conversation.id}
          title={conversation.title[lang]}
          open={openIds.has(conversation.id)}
          onToggle={onToggle}
        >
          <ol className={styles.chat}>
            {conversation.lines.map((line, i) => (
              <Bubble
                key={i}
                line={line}
                speakerLabel={
                  line.speaker === LEARNER ? t('conversations.you') : (content.speakers[line.speaker]?.[lang] ?? line.speaker)
                }
                settings={settings}
                speechAvailable={available}
                onSpeak={speak}
              />
            ))}
          </ol>
        </Block>
      ))}

      <Block
        id={PHRASES_BLOCK}
        title={t('conversations.phrases')}
        icon="★"
        open={openIds.has(PHRASES_BLOCK)}
        onToggle={onToggle}
      >
        <ul className={styles.phrases}>
          {content.phrases.map((phrase, i) => {
            const jp = toJapaneseText(phrase.japanese, phrase.romaji, settings);
            return (
              <li key={i} className={styles.phrase}>
                <p className={styles.phraseJa}>
                  <Furigana text={jp.text} show={jp.showFurigana} />
                </p>
                {jp.romaji && <p className={styles.romaji}>{jp.romaji}</p>}
                <p className={styles.phraseMeaning}>{phrase.meaning[lang]}</p>
                {phrase.note && <p className={styles.note}>{phrase.note[lang]}</p>}
              </li>
            );
          })}
        </ul>
      </Block>
    </div>
  );
}

interface BlockProps {
  id: string;
  title: string;
  icon?: string;
  open: boolean;
  onToggle: (id: string, open: boolean) => void;
  children: ReactNode;
}

/**
 * Bloc plegable sobre <details> natiu (accessible i amb teclat sense JS extra).
 * El contingut només es pinta quan està obert: menys DOM i les bombolles s'animen en obrir-lo.
 */
function Block({ id, title, icon, open, onToggle, children }: BlockProps) {
  return (
    <details
      className={styles.block}
      open={open}
      onToggle={(e) => onToggle(id, (e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className={styles.blockSummary}>
        {icon && (
          <span className={styles.blockIcon} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className={styles.blockTitle}>{title}</span>
        <span className={styles.chevron} aria-hidden="true">
          <Icon name="back" size={18} />
        </span>
      </summary>
      {open && <div className={styles.blockContent}>{children}</div>}
    </details>
  );
}

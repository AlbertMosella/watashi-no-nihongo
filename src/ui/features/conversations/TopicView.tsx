import { useMemo, type CSSProperties } from 'react';
import { useSettings, useSpeech, useTopic, useUpdateSettings } from '@/app/hooks';
import { topicLabelKey, useT } from '@/app/i18n';
import { LEARNER, type ConversationSettings, type Topic, type TopicContent } from '@/domain/conversation';
import { toJapaneseText } from '@/domain/display';
import { IconButton, SegmentedControl } from '@/ui/components';
import { Furigana } from '../deck/Furigana';
import { Bubble } from './Bubble';
import styles from './Conversations.module.css';

type Mode = 'read' | 'practice';

export function TopicView({ topic, onBack }: { topic: Topic; onBack: () => void }) {
  const t = useT();
  const state = useTopic(topic.id);
  const s = useSettings();
  const update = useUpdateSettings();

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
        <TopicBody key={String(s.practice)} content={state.content} settings={settings} />
      )}
    </article>
  );
}

function TopicBody({ content, settings }: { content: TopicContent; settings: ConversationSettings }) {
  const t = useT();
  const { available, speak } = useSpeech();
  const lang = settings.language;

  return (
    <>
      {content.conversations.map((conversation) => (
        <section key={conversation.id} className={styles.conversation}>
          <h2 className={styles.conversationTitle}>{conversation.title[lang]}</h2>
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
        </section>
      ))}

      <section className={styles.conversation}>
        <h2 className={styles.conversationTitle}>{t('conversations.phrases')}</h2>
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
      </section>
    </>
  );
}

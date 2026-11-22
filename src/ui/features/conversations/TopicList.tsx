import type { CSSProperties } from 'react';
import { topicLabelKey, useT } from '@/app/i18n';
import type { Topic } from '@/domain/conversation';
import { Icon } from '@/ui/components';
import styles from './Conversations.module.css';

export function TopicList({ topics, onOpen }: { topics: readonly Topic[]; onOpen: (topicId: string) => void }) {
  const t = useT();
  return (
    <>
      <header className={styles.listHeader}>
        <h1 className={styles.pageTitle}>{t('conversations.title')}</h1>
        <p className={styles.intro}>{t('conversations.intro')}</p>
      </header>
      <ul className={styles.topics}>
        {topics.map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              className={styles.topic}
              data-hue=""
              style={{ '--hue': topic.hue } as CSSProperties}
              onClick={() => onOpen(topic.id)}
            >
              <span className={styles.topicEmoji} aria-hidden="true">
                {topic.emoji}
              </span>
              <span className={styles.topicLabel}>{t(topicLabelKey(topic.id))}</span>
              <Icon name="back" size={18} />
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

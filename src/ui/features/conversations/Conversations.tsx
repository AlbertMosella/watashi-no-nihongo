import { useCallback, useEffect, useRef, useState } from 'react';
import { useServices } from '@/app/services';
import { TopicList } from './TopicList';
import { TopicView } from './TopicView';
import styles from './Conversations.module.css';

/**
 * Apartat de converses: llista de temàtiques → una temàtica.
 * Obrir una temàtica afegeix una entrada a l'historial, així el botó "enrere"
 * del mòbil torna a la llista en lloc de sortir de l'app.
 */
export function Conversations() {
  const { conversations } = useServices();
  const [topicId, setTopicId] = useState<string | null>(() => readTopicFromHistory());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPop = () => setTopicId(readTopicFromHistory());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Cada canvi de vista comença a dalt de tot.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [topicId]);

  const open = useCallback((id: string) => {
    window.history.pushState({ ...window.history.state, topic: id }, '');
    setTopicId(id);
  }, []);

  const back = useCallback(() => {
    if (readTopicFromHistory()) window.history.back();
    else setTopicId(null);
  }, []);

  const topic = topicId ? conversations.getTopics().find((t) => t.id === topicId) : undefined;

  return (
    <div ref={scrollRef} className={styles.scroller}>
      <div className={styles.page}>
        {topic ? <TopicView topic={topic} onBack={back} /> : <TopicList topics={conversations.getTopics()} onOpen={open} />}
      </div>
    </div>
  );
}

function readTopicFromHistory(): string | null {
  const state: unknown = window.history.state;
  return typeof state === 'object' && state !== null && typeof (state as { topic?: unknown }).topic === 'string'
    ? (state as { topic: string }).topic
    : null;
}

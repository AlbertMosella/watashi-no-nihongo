import type { Topic, TopicContent } from '@/domain/conversation';
import type { ConversationRepository } from '@/domain/ports';
import { mapRawTopic, type RawTopic } from './rawConversations';

export type TopicLoader = () => Promise<{ default: RawTopic }>;

/** Repositori de converses sobre JSON: un chunk per temàtica, carregat a demanda i en cache. */
export class JsonConversationRepository implements ConversationRepository {
  private readonly cache = new Map<string, Promise<TopicContent>>();

  constructor(
    private readonly topics: readonly Topic[],
    private readonly loaders: Readonly<Record<string, TopicLoader>>,
  ) {}

  getTopics(): readonly Topic[] {
    return this.topics;
  }

  getTopic(topicId: string): Promise<TopicContent> {
    let pending = this.cache.get(topicId);
    if (!pending) {
      pending = this.load(topicId);
      pending.catch(() => this.cache.delete(topicId));
      this.cache.set(topicId, pending);
    }
    return pending;
  }

  private async load(topicId: string): Promise<TopicContent> {
    const loader = this.loaders[topicId];
    if (!loader || !this.topics.some((t) => t.id === topicId)) throw new Error(`Temàtica desconeguda: ${topicId}`);
    const module = await loader();
    return mapRawTopic(topicId, module.default);
  }
}

/** Loaders de Vite: un chunk per fitxer de `./conversations`, indexat per id de temàtica. */
export function viteTopicLoaders(): Record<string, TopicLoader> {
  const modules = import.meta.glob<{ default: RawTopic }>('./conversations/*.json');
  return Object.fromEntries(
    Object.entries(modules).map(([path, load]) => [path.replace(/^.*\/(.+)\.json$/, '$1'), load]),
  );
}

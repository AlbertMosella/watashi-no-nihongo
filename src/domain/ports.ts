import type { Card } from './card';
import type { Category } from './category';
import type { Topic, TopicContent } from './conversation';

/**
 * Ports (interfícies) que el domini necessita del món exterior.
 * Les implementacions concretes viuen a `src/data` i s'injecten des de `src/app`
 * (principi d'inversió de dependències).
 */

export interface CardRepository {
  /** Totes les categories, en ordre pedagògic. */
  getCategories(): readonly Category[];
  /** Carrega (i guarda en memòria) les targetes d'una categoria. */
  getCards(categoryId: string): Promise<readonly Card[]>;
}

export interface ConversationRepository {
  /** Totes les temàtiques, en ordre. */
  getTopics(): readonly Topic[];
  /** Carrega (i guarda en memòria) les converses d'una temàtica. */
  getTopic(topicId: string): Promise<TopicContent>;
}

export interface KeyValueStorage {
  read(key: string): unknown;
  write(key: string, value: unknown): void;
}

export interface SpeechService {
  /** Hi ha una veu japonesa utilitzable ara mateix. */
  isAvailable(): boolean;
  speak(text: string): void;
  /** Avisa quan canvia la disponibilitat (veus carregades, connexió...). */
  subscribe(listener: () => void): () => void;
}

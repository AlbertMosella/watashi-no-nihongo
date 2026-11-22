import { createContext, useContext, type ReactNode } from 'react';
import type { CardRepository, ConversationRepository, SpeechService } from '@/domain/ports';
import { CATEGORIES } from '@/data/categories';
import { JsonCardRepository, viteCardLoaders } from '@/data/jsonCardRepository';
import { JsonConversationRepository, viteTopicLoaders } from '@/data/jsonConversationRepository';
import { LocalStorageAdapter } from '@/data/localStorageAdapter';
import { TOPICS } from '@/data/topics';
import { InstallPrompt } from './installPrompt';
import { PwaUpdates } from './pwaUpdates';
import { SettingsStore } from './settingsStore';
import { WebSpeechService } from './webSpeechService';

/** Dependències de l'app. La UI només coneix les interfícies; els tests hi injecten dobles. */
export interface AppServices {
  readonly cards: CardRepository;
  readonly conversations: ConversationRepository;
  readonly settings: SettingsStore;
  readonly speech: SpeechService;
  readonly updates: PwaUpdates;
  readonly install: InstallPrompt;
}

/** Composition root: l'únic lloc on es trien les implementacions concretes. */
export function createAppServices(): AppServices {
  return {
    cards: new JsonCardRepository(CATEGORIES, viteCardLoaders()),
    conversations: new JsonConversationRepository(TOPICS, viteTopicLoaders()),
    settings: new SettingsStore(new LocalStorageAdapter(), new Set(CATEGORIES.map((c) => c.id))),
    speech: new WebSpeechService(),
    updates: new PwaUpdates(),
    install: new InstallPrompt(),
  };
}

const ServicesContext = createContext<AppServices | null>(null);

export function ServicesProvider({ services, children }: { services: AppServices; children: ReactNode }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices(): AppServices {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('useServices s’ha d’usar dins de <ServicesProvider>');
  return services;
}

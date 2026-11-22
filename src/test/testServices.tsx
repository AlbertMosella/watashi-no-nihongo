import type { ReactNode } from 'react';
import { InstallPrompt } from '@/app/installPrompt';
import { PwaUpdates } from '@/app/pwaUpdates';
import { ServicesProvider, type AppServices } from '@/app/services';
import { SettingsStore } from '@/app/settingsStore';
import { CATEGORIES } from '@/data/categories';
import { JsonCardRepository } from '@/data/jsonCardRepository';
import { JsonConversationRepository } from '@/data/jsonConversationRepository';
import { MemoryStorage } from '@/data/localStorageAdapter';
import { TOPICS } from '@/data/topics';
import type { SpeechService } from '@/domain/ports';

const silentSpeech: SpeechService = {
  isAvailable: () => false,
  speak: () => undefined,
  subscribe: () => () => undefined,
};

/** Serveis en memòria per als tests de components (sense localStorage ni service worker). */
export function createTestServices(storage = new MemoryStorage()): AppServices {
  return {
    cards: new JsonCardRepository(CATEGORIES, {}),
    conversations: new JsonConversationRepository(TOPICS, {}),
    settings: new SettingsStore(storage),
    speech: silentSpeech,
    updates: new PwaUpdates(undefined),
    install: new InstallPrompt(undefined),
  };
}

export function withServices(services: AppServices) {
  return ({ children }: { children: ReactNode }) => <ServicesProvider services={services}>{children}</ServicesProvider>;
}

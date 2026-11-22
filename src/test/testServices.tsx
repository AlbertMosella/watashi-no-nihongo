import type { ReactNode } from 'react';
import { PwaUpdates } from '@/app/pwaUpdates';
import { ServicesProvider, type AppServices } from '@/app/services';
import { SettingsStore } from '@/app/settingsStore';
import { CATEGORIES } from '@/data/categories';
import { JsonCardRepository } from '@/data/jsonCardRepository';
import { MemoryStorage } from '@/data/localStorageAdapter';
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
    settings: new SettingsStore(storage),
    speech: silentSpeech,
    updates: new PwaUpdates(undefined),
  };
}

export function withServices(services: AppServices) {
  return ({ children }: { children: ReactNode }) => <ServicesProvider services={services}>{children}</ServicesProvider>;
}

import { useMemo } from 'react';
import type { StudentLanguage } from '@/domain/language';
import { useSetting } from '../hooks';
import { ca, type MessageKey, type Messages } from './ca';
import { en } from './en';
import { es } from './es';

export type { MessageKey } from './ca';

/** Els textos de la UI són petits (uns pocs KB): s'inclouen tots, sense càrrega diferida. */
export const MESSAGES: Readonly<Record<StudentLanguage, Messages>> = { ca, es, en };

export type Translate = (key: MessageKey, params?: Readonly<Record<string, string | number>>) => string;

export function createTranslator(language: StudentLanguage): Translate {
  const messages = MESSAGES[language];
  return (key, params) => {
    const text = messages[key] ?? ca[key] ?? key;
    return params ? text.replace(/\{(\w+)\}/g, (m, name: string) => String(params[name] ?? m)) : text;
  };
}

/** L'idioma de la UI és el mateix que l'idioma de l'estudiant. */
export function useT(): Translate {
  const language = useSetting('language');
  return useMemo(() => createTranslator(language), [language]);
}

/** Nom de cada idioma en el seu propi idioma (per triar-lo sense dependre de l'idioma actual). */
export const LANGUAGE_ENDONYMS: Readonly<Record<StudentLanguage, string>> = {
  ca: 'Català',
  es: 'Castellano',
  en: 'English',
};

export function categoryLabelKey(categoryId: string): MessageKey {
  return `category.${categoryId}` as MessageKey;
}

export function topicLabelKey(topicId: string): MessageKey {
  return `topic.${topicId}` as MessageKey;
}

import type { TopicContent } from '@/domain/conversation';
import { parseFurigana } from '@/domain/furigana';
import type { Translations } from '@/domain/language';

/**
 * Format dels fitxers `src/data/conversations/<topicId>.json`.
 *
 * {
 *   "speakers": { "staff": { "ca": "Cambrer", "es": "Camarero", "en": "Waiter" } },
 *   "conversations": [{
 *     "id": "entering",
 *     "title": { "ca": "...", "es": "...", "en": "..." },
 *     "lines": [{ "s": "staff", "jp": "何名様[なんめいさま]ですか。", "r": "nanmei-sama desu ka?",
 *                 "ca": "...", "es": "...", "en": "..." }]
 *   }],
 *   "phrases": [{ "jp": "〜をください。", "r": "~ o kudasai.", "ca": "...", "es": "...", "en": "...",
 *                 "note": { "ca": "...", "es": "...", "en": "..." } }]
 * }
 *
 * A diferència de les targetes, el romaji (`r`) és obligatori: les frases porten
 * partícules (は → wa) i espais entre paraules, que no es poden deduir del kana.
 */

export interface RawLine extends Translations {
  s: string;
  jp: string;
  r: string;
}

export interface RawConversation {
  id: string;
  title: Translations;
  lines: RawLine[];
}

export interface RawPhrase extends Translations {
  jp: string;
  r: string;
  note?: Translations;
}

export interface RawTopic {
  speakers: Record<string, Translations>;
  conversations: RawConversation[];
  phrases: RawPhrase[];
}

const translations = (t: Translations): Translations => ({ ca: t.ca, es: t.es, en: t.en });

export function mapRawTopic(topicId: string, raw: RawTopic): TopicContent {
  return {
    topicId,
    speakers: Object.fromEntries(Object.entries(raw.speakers).map(([id, t]) => [id, translations(t)])),
    conversations: raw.conversations.map((c) => ({
      id: `${topicId}:${c.id}`,
      title: translations(c.title),
      lines: c.lines.map((l) => ({
        speaker: l.s,
        japanese: parseFurigana(l.jp),
        romaji: l.r,
        translation: translations(l),
      })),
    })),
    phrases: raw.phrases.map((p) => ({
      japanese: parseFurigana(p.jp),
      romaji: p.r,
      meaning: translations(p),
      note: p.note && translations(p.note),
    })),
  };
}

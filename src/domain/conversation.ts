import { toJapaneseText, type JapaneseDisplaySettings, type JapaneseText } from './display';
import { furiganaToKana, type FuriganaText } from './furigana';
import type { StudentLanguage, Translations } from './language';

/** Interlocutor reservat per a l'estudiant ("tu"). La resta es defineixen a cada temàtica. */
export const LEARNER = 'you';

/** Una temàtica de converses (presentar-se, restaurant...). */
export interface Topic {
  readonly id: string;
  readonly hue: number;
  readonly emoji: string;
}

export interface ConversationLine {
  /** `LEARNER` o un dels interlocutors de la temàtica. */
  readonly speaker: string;
  readonly japanese: FuriganaText;
  readonly romaji: string;
  readonly translation: Translations;
}

export interface Conversation {
  readonly id: string;
  readonly title: Translations;
  readonly lines: readonly ConversationLine[];
}

/** Estructura reutilitzable ("〜をください") amb una nota opcional. */
export interface KeyPhrase {
  readonly japanese: FuriganaText;
  readonly romaji: string;
  readonly meaning: Translations;
  readonly note?: Translations;
}

export interface TopicContent {
  readonly topicId: string;
  /** Nom de cada interlocutor (excepte l'estudiant) en cada idioma. */
  readonly speakers: Readonly<Record<string, Translations>>;
  readonly conversations: readonly Conversation[];
  readonly phrases: readonly KeyPhrase[];
}

export type ConversationSettings = JapaneseDisplaySettings & {
  readonly language: StudentLanguage;
  /** Mode pràctica: l'estudiant fa de "tu" i les respostes s'amaguen fins que es toquen. */
  readonly practice: boolean;
};

/** Una línia llesta per pintar: què es veu d'entrada i què s'amaga fins que es toca. */
export interface LineView {
  readonly fromLearner: boolean;
  readonly japanese: JapaneseText;
  readonly translation: string;
  readonly speech: string;
  /** Mode pràctica: les línies de l'estudiant amaguen el japonès; les dels altres, la traducció. */
  readonly hidden: 'none' | 'japanese' | 'translation';
}

export function viewLine(line: ConversationLine, s: ConversationSettings): LineView {
  const fromLearner = line.speaker === LEARNER;
  return {
    fromLearner,
    japanese: toJapaneseText(line.japanese, line.romaji, s),
    translation: line.translation[s.language],
    speech: furiganaToKana(line.japanese),
    hidden: !s.practice ? 'none' : fromLearner ? 'japanese' : 'translation',
  };
}

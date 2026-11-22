import type { FuriganaText } from './furigana';
import type { Translations } from './language';

interface BaseCard {
  /** Identificador estable (s'usarà per desar el progrés a la fase 2). */
  readonly id: string;
  readonly categoryId: string;
}

/** Un caràcter de hiragana o katakana. L'altra cara és el seu so. */
export interface KanaCard extends BaseCard {
  readonly kind: 'kana';
  readonly char: string;
  readonly romaji: string;
}

export interface KanjiExample {
  readonly japanese: FuriganaText;
  readonly romaji: string;
  readonly meaning: Translations;
}

export interface KanjiCard extends BaseCard {
  readonly kind: 'kanji';
  readonly kanji: string;
  readonly meaning: Translations;
  /** Lectures on'yomi (katakana). */
  readonly on: readonly string[];
  /** Lectures kun'yomi (hiragana). */
  readonly kun: readonly string[];
  readonly example?: KanjiExample;
}

export interface WordCard extends BaseCard {
  readonly kind: 'word';
  readonly japanese: FuriganaText;
  readonly romaji: string;
  readonly meaning: Translations;
}

export type Card = KanaCard | KanjiCard | WordCard;

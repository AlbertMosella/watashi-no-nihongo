import type { Card } from '@/domain/card';
import type { CategoryGroup } from '@/domain/category';
import { furiganaToKana, parseFurigana } from '@/domain/furigana';
import { kanaToRomaji } from '@/domain/romaji';

/**
 * Format dels fitxers JSON de `src/data/cards`. És compacte i fàcil d'editar a mà;
 * el mapper el converteix en entitats de domini.
 */

/** Kana: { "c": "あ", "r": "a" } */
export interface RawKana {
  c: string;
  r: string;
}

/** Text japonès amb furigana ("食[た]べる"), traduccions i romaji opcional (si no, es calcula). */
export interface RawText {
  jp: string;
  ca: string;
  es: string;
  en: string;
  r?: string;
}

export type RawWord = RawText;

export interface RawKanji {
  k: string;
  on: string[];
  kun: string[];
  ca: string;
  es: string;
  en: string;
  ex?: RawText;
}

export type RawCard = RawKana | RawKanji | RawWord;

function romajiOf(raw: RawText): string {
  return raw.r ?? kanaToRomaji(furiganaToKana(parseFurigana(raw.jp)));
}

export function mapRawCards(categoryId: string, group: CategoryGroup, raw: readonly unknown[]): Card[] {
  switch (group) {
    case 'kana':
      return (raw as RawKana[]).map((k) => ({
        kind: 'kana',
        id: `${categoryId}:${k.c}`,
        categoryId,
        char: k.c,
        romaji: k.r,
      }));
    case 'kanji':
      return (raw as RawKanji[]).map((k) => ({
        kind: 'kanji',
        id: `${categoryId}:${k.k}`,
        categoryId,
        kanji: k.k,
        meaning: { ca: k.ca, es: k.es, en: k.en },
        on: k.on,
        kun: k.kun,
        example: k.ex && {
          japanese: parseFurigana(k.ex.jp),
          romaji: romajiOf(k.ex),
          meaning: { ca: k.ex.ca, es: k.ex.es, en: k.ex.en },
        },
      }));
    case 'vocab':
      return (raw as RawWord[]).map((w) => ({
        kind: 'word',
        id: `${categoryId}:${w.jp}`,
        categoryId,
        japanese: parseFurigana(w.jp),
        romaji: romajiOf(w),
        meaning: { ca: w.ca, es: w.es, en: w.en },
      }));
  }
}

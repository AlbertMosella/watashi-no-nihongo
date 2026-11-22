import type { Card } from './card';
import { furiganaToKana, furiganaToWritten } from './furigana';
import type { StudentLanguage } from './language';
import { toHiragana } from './romaji';

/**
 * Cerca de targetes per text.
 * Es busca al significat (en l'idioma de l'estudiant), al japonès (escrit, kana i
 * katakana com a hiragana) i al romaji, ignorant majúscules i accents.
 */

/** Minúscules, sense accents ni signes, katakana → hiragana i espais compactats. */
export function normalize(text: string): string {
  return toHiragana(text)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[·'’"«»()[\]¿?¡!.,;:~〜、。]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Els textos d'una targeta on es pot trobar la cerca. El primer és el significat. */
function searchableTexts(card: Card, language: StudentLanguage): string[] {
  switch (card.kind) {
    case 'kana':
      return [card.romaji, card.char];
    case 'word':
      return [card.meaning[language], furiganaToWritten(card.japanese), furiganaToKana(card.japanese), card.romaji];
    case 'kanji':
      return [card.meaning[language], card.kanji, ...card.on, ...card.kun.map((k) => k.replace(/[.-]/g, ''))];
  }
}

export interface SearchIndexEntry {
  readonly card: Card;
  /** Textos normalitzats. */
  readonly texts: readonly string[];
}

/** Precalcula els textos normalitzats (es fa un sol cop per idioma, no a cada tecla). */
export function buildSearchIndex(cards: readonly Card[], language: StudentLanguage): SearchIndexEntry[] {
  return cards.map((card) => ({ card, texts: searchableTexts(card, language).map(normalize) }));
}

/**
 * Puntuació d'una coincidència (més baixa = millor), o null si no coincideix.
 *  0: el text sencer és la cerca ("menjar" → "menjar")
 *  1: una de les paraules és la cerca ("menjar" → "bon profit (abans de menjar)")
 *  2: alguna paraula comença per la cerca ("pom" → "poma")
 *  3: la cerca apareix en qualsevol lloc ("oma" → "poma")
 */
function score(texts: readonly string[], query: string): number | null {
  let best: number | null = null;
  for (const text of texts) {
    if (!text.includes(query)) continue;
    const words = text.split(/[ ,/]+/);
    const s =
      text === query ? 0 : words.includes(query) ? 1 : words.some((w) => w.startsWith(query)) ? 2 : 3;
    if (best === null || s < best) best = s;
    if (best === 0) break;
  }
  return best;
}

/** Targetes que coincideixen, de la més rellevant a la menys (estable dins de cada nivell). */
export function searchCards(index: readonly SearchIndexEntry[], rawQuery: string): Card[] {
  const query = normalize(rawQuery);
  if (!query) return [];
  const matches: { card: Card; score: number; order: number }[] = [];
  index.forEach((entry, order) => {
    const s = score(entry.texts, query);
    if (s !== null) matches.push({ card: entry.card, score: s, order });
  });
  matches.sort((a, b) => a.score - b.score || a.order - b.order);
  return matches.map((m) => m.card);
}

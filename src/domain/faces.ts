import type { Card, KanjiCard, WordCard } from './card';
import { furiganaToKana, plainFurigana, type FuriganaText } from './furigana';
import type { Settings } from './settings';

/**
 * Què es mostra a cada cara d'una targeta. És una descripció pura (sense React):
 * la UI només ha de pintar-la. Així totes les regles (idioma, romaji, kana/kanji,
 * cara inicial...) es poden provar amb tests unitaris.
 */

export interface JapaneseText {
  readonly text: FuriganaText;
  readonly showFurigana: boolean;
  readonly romaji?: string;
}

export interface KanjiDetails {
  readonly on: readonly string[];
  readonly kun: readonly string[];
  readonly example?: JapaneseText & { readonly meaning: string };
}

export type Face =
  | { readonly kind: 'meaning'; readonly text: string; readonly details?: KanjiDetails }
  | { readonly kind: 'sound'; readonly romaji: string }
  | { readonly kind: 'kana'; readonly char: string; readonly speech: string }
  | { readonly kind: 'word'; readonly japanese: JapaneseText; readonly speech: string }
  | {
      readonly kind: 'kanji';
      readonly kanji: string;
      readonly details?: KanjiDetails;
      readonly speech: string;
    };

export interface CardFaces {
  readonly front: Face;
  readonly back: Face;
}

export type FaceSettings = Pick<
  Settings,
  'language' | 'frontSide' | 'scriptMode' | 'showRomaji' | 'showFurigana'
>;

export function getCardFaces(card: Card, settings: FaceSettings): CardFaces {
  const [native, japanese] = buildSides(card, settings);
  return settings.frontSide === 'native'
    ? { front: native, back: japanese }
    : { front: japanese, back: native };
}

/** Retorna [cara de l'idioma de l'estudiant, cara japonesa]. */
function buildSides(card: Card, s: FaceSettings): [Face, Face] {
  switch (card.kind) {
    case 'kana':
      return [
        { kind: 'sound', romaji: card.romaji },
        { kind: 'kana', char: card.char, speech: card.char },
      ];
    case 'word':
      return [
        { kind: 'meaning', text: card.meaning[s.language] },
        { kind: 'word', japanese: japaneseText(card, s), speech: furiganaToKana(card.japanese) },
      ];
    case 'kanji':
      return kanjiSides(card, s);
  }
}

function kanjiSides(card: KanjiCard, s: FaceSettings): [Face, Face] {
  const details = kanjiDetails(card, s);
  const speech = card.example ? furiganaToKana(card.example.japanese) : (card.kun[0] ?? card.on[0] ?? card.kanji);
  // Els detalls (lectures i exemple) formen part de la resposta: van sempre a la cara del darrere.
  if (s.frontSide === 'native') {
    return [
      { kind: 'meaning', text: card.meaning[s.language] },
      { kind: 'kanji', kanji: card.kanji, details, speech },
    ];
  }
  return [
    { kind: 'meaning', text: card.meaning[s.language], details },
    { kind: 'kanji', kanji: card.kanji, speech },
  ];
}

function kanjiDetails(card: KanjiCard, s: FaceSettings): KanjiDetails {
  const ex = card.example;
  return {
    on: card.on,
    kun: card.kun,
    // L'exemple sempre es mostra amb kanji (és el que s'està estudiant), amb furigana si cal.
    example: ex && {
      text: ex.japanese,
      showFurigana: s.showFurigana,
      romaji: s.showRomaji ? ex.romaji : undefined,
      meaning: ex.meaning[s.language],
    },
  };
}

function japaneseText(card: WordCard, s: FaceSettings): JapaneseText {
  const text = s.scriptMode === 'kana' ? plainFurigana(furiganaToKana(card.japanese)) : card.japanese;
  return {
    text,
    showFurigana: s.showFurigana,
    romaji: s.showRomaji ? card.romaji : undefined,
  };
}

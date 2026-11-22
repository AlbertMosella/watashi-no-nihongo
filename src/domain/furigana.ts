/**
 * Notació de furigana (estil Anki): la lectura entre claudàtors s'aplica
 * al bloc de kanji immediatament anterior.
 *
 *   "食[た]べる"      → 食(た) + べる
 *   "お茶[ちゃ]"      → お + 茶(ちゃ)
 *   "日本語[にほんご]" → 日本語(にほんご)
 */

export interface FuriganaSegment {
  /** Text tal com s'escriu (kanji o kana). */
  readonly text: string;
  /** Lectura en kana, només si el segment conté kanji. */
  readonly reading?: string;
}

export type FuriganaText = readonly FuriganaSegment[];

const KANJI = /[\p{Script=Han}々〆ヶ]/u;
const NOTATION = /([\p{Script=Han}々〆ヶ]+)\[([^\]]+)\]/gu;

export class FuriganaSyntaxError extends Error {
  constructor(source: string, reason: string) {
    super(`Furigana invàlid "${source}": ${reason}`);
    this.name = 'FuriganaSyntaxError';
  }
}

export function parseFurigana(source: string): FuriganaText {
  const segments: FuriganaSegment[] = [];
  let cursor = 0;

  for (const match of source.matchAll(NOTATION)) {
    const [whole, kanji, reading] = match;
    const index = match.index;
    if (index > cursor) pushPlain(segments, source.slice(cursor, index));
    segments.push({ text: kanji!, reading: reading! });
    cursor = index + whole.length;
  }
  if (cursor < source.length) pushPlain(segments, source.slice(cursor));

  for (const segment of segments) {
    if (segment.reading === undefined && KANJI.test(segment.text)) {
      throw new FuriganaSyntaxError(source, `el kanji de "${segment.text}" no té lectura`);
    }
    if (segment.reading === undefined && /[[\]]/.test(segment.text)) {
      throw new FuriganaSyntaxError(source, 'claudàtors sense kanji davant');
    }
  }
  return segments;
}

function pushPlain(segments: FuriganaSegment[], text: string): void {
  const last = segments[segments.length - 1];
  if (last && last.reading === undefined) {
    segments[segments.length - 1] = { text: last.text + text };
  } else {
    segments.push({ text });
  }
}

/** Forma escrita habitual (amb kanji): "食べる". */
export function furiganaToWritten(text: FuriganaText): string {
  return text.map((s) => s.text).join('');
}

/** Només kana: "たべる". */
export function furiganaToKana(text: FuriganaText): string {
  return text.map((s) => s.reading ?? s.text).join('');
}

export function hasKanji(text: FuriganaText): boolean {
  return text.some((s) => s.reading !== undefined);
}

/** Converteix una cadena en un text de furigana sense lectures (kana pur). */
export function plainFurigana(text: string): FuriganaText {
  return [{ text }];
}

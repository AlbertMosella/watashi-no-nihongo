import { furiganaToKana, plainFurigana, type FuriganaText } from './furigana';
import type { Settings } from './settings';

/** Preferències que afecten com es pinta qualsevol text japonès (targetes i converses). */
export type JapaneseDisplaySettings = Pick<Settings, 'scriptMode' | 'showRomaji' | 'showFurigana'>;

/** Text japonès llest per pintar segons les preferències. */
export interface JapaneseText {
  readonly text: FuriganaText;
  readonly showFurigana: boolean;
  readonly romaji?: string;
}

/**
 * Aplica les preferències de l'estudiant a un text japonès:
 * només kana (sense kanji), furigana i romaji opcionals.
 */
export function toJapaneseText(text: FuriganaText, romaji: string, s: JapaneseDisplaySettings): JapaneseText {
  return {
    text: s.scriptMode === 'kana' ? plainFurigana(furiganaToKana(text)) : text,
    showFurigana: s.showFurigana,
    romaji: s.showRomaji ? romaji : undefined,
  };
}

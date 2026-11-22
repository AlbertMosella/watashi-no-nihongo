import { DEFAULT_LANGUAGE, isStudentLanguage, type StudentLanguage } from './language';

/** Quina cara veiem primer. */
export type FrontSide = 'native' | 'japanese';
/** 'kana': només hiragana/katakana. 'kanji': forma habitual amb kanji. */
export type ScriptMode = 'kana' | 'kanji';
export type ThemePreference = 'system' | 'light' | 'dark';

export interface Settings {
  readonly language: StudentLanguage;
  readonly frontSide: FrontSide;
  readonly scriptMode: ScriptMode;
  readonly showRomaji: boolean;
  readonly showFurigana: boolean;
  readonly shuffle: boolean;
  readonly shuffleSeed: number;
  readonly theme: ThemePreference;
  readonly categoryIds: readonly string[];
}

export const DEFAULT_SETTINGS: Settings = {
  language: DEFAULT_LANGUAGE,
  frontSide: 'native',
  scriptMode: 'kanji',
  showRomaji: true,
  showFurigana: true,
  shuffle: false,
  shuffleSeed: 1,
  theme: 'system',
  categoryIds: ['hiragana-basic'],
};

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === 'string' && (values as readonly string[]).includes(v);

const isFrontSide = oneOf<FrontSide>(['native', 'japanese']);
const isScriptMode = oneOf<ScriptMode>(['kana', 'kanji']);
const isTheme = oneOf<ThemePreference>(['system', 'light', 'dark']);
const isBool = (v: unknown): v is boolean => typeof v === 'boolean';

/**
 * Valida unes preferències desconegudes (p. ex. de localStorage d'una versió antiga):
 * qualsevol camp invàlid torna al valor per defecte.
 */
export function sanitizeSettings(raw: unknown, knownCategoryIds?: ReadonlySet<string>): Settings {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;

  let categoryIds = Array.isArray(r.categoryIds)
    ? r.categoryIds.filter((id): id is string => typeof id === 'string')
    : d.categoryIds;
  if (knownCategoryIds) categoryIds = categoryIds.filter((id) => knownCategoryIds.has(id));

  return {
    language: isStudentLanguage(r.language) ? r.language : d.language,
    frontSide: isFrontSide(r.frontSide) ? r.frontSide : d.frontSide,
    scriptMode: isScriptMode(r.scriptMode) ? r.scriptMode : d.scriptMode,
    showRomaji: isBool(r.showRomaji) ? r.showRomaji : d.showRomaji,
    showFurigana: isBool(r.showFurigana) ? r.showFurigana : d.showFurigana,
    shuffle: isBool(r.shuffle) ? r.shuffle : d.shuffle,
    shuffleSeed: Number.isInteger(r.shuffleSeed) ? (r.shuffleSeed as number) : d.shuffleSeed,
    theme: isTheme(r.theme) ? r.theme : d.theme,
    categoryIds: [...new Set(categoryIds)],
  };
}

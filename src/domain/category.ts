export type CategoryGroup = 'kana' | 'kanji' | 'vocab';

export interface Category {
  readonly id: string;
  readonly group: CategoryGroup;
  /** To del color pastel de la targeta (0–360). La resta del color la deriva el tema. */
  readonly hue: number;
  readonly emoji: string;
}

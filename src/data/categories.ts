import type { Category } from '@/domain/category';

/**
 * Registre de categories, en ordre pedagògic.
 * Afegir una categoria = afegir una entrada aquí + `src/data/cards/<id>.json`
 * + l'etiqueta a `src/app/i18n` (el test de dades comprova que tot quadra).
 */
export const CATEGORIES: readonly Category[] = [
  // Kana
  { id: 'hiragana-basic', group: 'kana', hue: 345, emoji: 'あ' },
  { id: 'hiragana-dakuten', group: 'kana', hue: 345, emoji: 'が' },
  { id: 'hiragana-combo', group: 'kana', hue: 345, emoji: 'きゃ' },
  { id: 'katakana-basic', group: 'kana', hue: 205, emoji: 'ア' },
  { id: 'katakana-dakuten', group: 'kana', hue: 205, emoji: 'ガ' },
  { id: 'katakana-combo', group: 'kana', hue: 205, emoji: 'キャ' },
  // Kanji
  { id: 'kanji', group: 'kanji', hue: 268, emoji: '漢' },
  // Vocabulari
  { id: 'greetings', group: 'vocab', hue: 158, emoji: '👋' },
  { id: 'expressions', group: 'vocab', hue: 48, emoji: '💬' },
  { id: 'pronouns', group: 'vocab', hue: 295, emoji: '❓' },
  { id: 'numbers', group: 'vocab', hue: 75, emoji: '🔢' },
  { id: 'time', group: 'vocab', hue: 222, emoji: '📅' },
  { id: 'family', group: 'vocab', hue: 330, emoji: '👪' },
  { id: 'body', group: 'vocab', hue: 12, emoji: '🖐️' },
  { id: 'food', group: 'vocab', hue: 28, emoji: '🍱' },
  { id: 'fruits', group: 'vocab', hue: 95, emoji: '🍎' },
  { id: 'drinks', group: 'vocab', hue: 182, emoji: '🍵' },
  { id: 'animals', group: 'vocab', hue: 38, emoji: '🐱' },
  { id: 'colors', group: 'vocab', hue: 312, emoji: '🎨' },
  { id: 'home', group: 'vocab', hue: 20, emoji: '🏠' },
  { id: 'city', group: 'vocab', hue: 240, emoji: '🏙️' },
  { id: 'transport', group: 'vocab', hue: 195, emoji: '🚃' },
  { id: 'school', group: 'vocab', hue: 60, emoji: '🎒' },
  { id: 'nature', group: 'vocab', hue: 135, emoji: '🌿' },
  { id: 'clothes', group: 'vocab', hue: 280, emoji: '👘' },
  { id: 'verbs', group: 'vocab', hue: 170, emoji: '🏃' },
  { id: 'adjectives', group: 'vocab', hue: 355, emoji: '✨' },
];

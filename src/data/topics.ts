import type { Topic } from '@/domain/conversation';

/**
 * Registre de temàtiques de conversa, en l'ordre en què es mostren.
 * Afegir una temàtica = entrada aquí + `src/data/conversations/<id>.json`
 * + l'etiqueta `topic.<id>` a `src/app/i18n` (el test de dades ho comprova).
 */
export const TOPICS: readonly Topic[] = [
  { id: 'introductions', hue: 200, emoji: '🙋' },
  { id: 'introducing-others', hue: 330, emoji: '👪' },
  { id: 'small-talk', hue: 48, emoji: '💬' },
  { id: 'restaurant', hue: 18, emoji: '🍜' },
  { id: 'cafe-konbini', hue: 30, emoji: '☕' },
  { id: 'directions', hue: 140, emoji: '🗺️' },
  { id: 'transport', hue: 210, emoji: '🚃' },
  { id: 'shopping', hue: 300, emoji: '🛍️' },
  { id: 'hotel', hue: 255, emoji: '🏨' },
  { id: 'plans', hue: 95, emoji: '📅' },
  { id: 'health', hue: 0, emoji: '💊' },
];

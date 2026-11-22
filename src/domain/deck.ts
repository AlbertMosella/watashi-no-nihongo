import type { Card } from './card';
import { shuffled } from './random';

export interface DeckOptions {
  readonly categoryIds: readonly string[];
  readonly shuffle: boolean;
  readonly seed: number;
}

/**
 * Construeix el mall de targetes: les categories seleccionades en l'ordre del registre
 * (que és l'ordre pedagògic) i, opcionalment, barrejades amb una llavor estable.
 */
export function buildDeck(
  cardsByCategory: ReadonlyMap<string, readonly Card[]>,
  categoryOrder: readonly string[],
  options: DeckOptions,
): readonly Card[] {
  const selected = new Set(options.categoryIds);
  const ordered: Card[] = [];
  for (const id of categoryOrder) {
    if (!selected.has(id)) continue;
    const cards = cardsByCategory.get(id);
    if (cards) for (const card of cards) ordered.push(card);
  }
  return options.shuffle ? shuffled(ordered, options.seed) : ordered;
}

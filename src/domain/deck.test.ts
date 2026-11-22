import type { Card } from './card';
import { buildDeck } from './deck';

const kana = (id: string, categoryId: string): Card => ({ kind: 'kana', id, categoryId, char: id, romaji: id });

const cards = new Map<string, Card[]>([
  ['a', [kana('a1', 'a'), kana('a2', 'a')]],
  ['b', [kana('b1', 'b')]],
  ['c', [kana('c1', 'c')]],
]);
const order = ['a', 'b', 'c'];

describe('buildDeck', () => {
  it("respecta l'ordre del registre, no el de selecció", () => {
    const deck = buildDeck(cards, order, { categoryIds: ['c', 'a'], shuffle: false, seed: 1 });
    expect(deck.map((c) => c.id)).toEqual(['a1', 'a2', 'c1']);
  });

  it('ignora categories no carregades', () => {
    const deck = buildDeck(cards, order, { categoryIds: ['x', 'b'], shuffle: false, seed: 1 });
    expect(deck.map((c) => c.id)).toEqual(['b1']);
  });

  it('barreja de forma estable amb la llavor', () => {
    const opts = { categoryIds: order, shuffle: true, seed: 3 };
    expect(buildDeck(cards, order, opts)).toEqual(buildDeck(cards, order, opts));
    expect(buildDeck(cards, order, opts)).toHaveLength(4);
  });
});

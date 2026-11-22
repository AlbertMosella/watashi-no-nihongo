import { shuffled } from './random';

describe('shuffled', () => {
  const items = Array.from({ length: 100 }, (_, i) => i);

  it('és determinista per a una mateixa llavor', () => {
    expect(shuffled(items, 42)).toEqual(shuffled(items, 42));
  });

  it('canvia amb llavors diferents', () => {
    expect(shuffled(items, 1)).not.toEqual(shuffled(items, 2));
  });

  it("conserva tots els elements i no muta l'original", () => {
    const copy = items.slice();
    const result = shuffled(items, 7);
    expect([...result].sort((a, b) => a - b)).toEqual(items);
    expect(items).toEqual(copy);
  });
});

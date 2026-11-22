import type { Category } from '@/domain/category';
import { JsonCardRepository } from './jsonCardRepository';

const categories: Category[] = [
  { id: 'hira', group: 'kana', hue: 0, emoji: 'あ' },
  { id: 'food', group: 'vocab', hue: 10, emoji: '🍱' },
];

describe('JsonCardRepository', () => {
  it('carrega i converteix les dades crues', async () => {
    const repo = new JsonCardRepository(categories, {
      food: async () => ({ default: [{ jp: 'お茶[ちゃ]', ca: 'te', es: 'té', en: 'tea' }] }),
    });
    const [card] = await repo.getCards('food');
    expect(card).toMatchObject({ kind: 'word', id: 'food:お茶[ちゃ]', romaji: 'ocha', meaning: { ca: 'te' } });
  });

  it('només carrega cada categoria una vegada', async () => {
    const loader = vi.fn(async () => ({ default: [{ c: 'あ', r: 'a' }] }));
    const repo = new JsonCardRepository(categories, { hira: loader });
    await Promise.all([repo.getCards('hira'), repo.getCards('hira')]);
    await repo.getCards('hira');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('permet tornar-ho a provar si una càrrega falla', async () => {
    const loader = vi
      .fn<() => Promise<{ default: unknown[] }>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ default: [{ c: 'あ', r: 'a' }] });
    const repo = new JsonCardRepository(categories, { hira: loader });
    await expect(repo.getCards('hira')).rejects.toThrow('offline');
    await expect(repo.getCards('hira')).resolves.toHaveLength(1);
  });

  it('rebutja categories desconegudes', async () => {
    const repo = new JsonCardRepository(categories, {});
    await expect(repo.getCards('nope')).rejects.toThrow();
  });
});

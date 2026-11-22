import type { KanjiCard, WordCard } from './card';
import { getCardFaces, type FaceSettings } from './faces';
import { parseFurigana } from './furigana';

const base: FaceSettings = {
  language: 'ca',
  frontSide: 'native',
  scriptMode: 'kanji',
  showRomaji: true,
  showFurigana: true,
};

const word: WordCard = {
  kind: 'word',
  id: 'food:お茶[ちゃ]',
  categoryId: 'food',
  japanese: parseFurigana('お茶[ちゃ]'),
  romaji: 'ocha',
  meaning: { ca: 'te', es: 'té', en: 'tea' },
};

const kanji: KanjiCard = {
  kind: 'kanji',
  id: 'kanji:日',
  categoryId: 'kanji',
  kanji: '日',
  meaning: { ca: 'dia', es: 'día', en: 'day' },
  on: ['ニチ'],
  kun: ['ひ'],
  example: {
    japanese: parseFurigana('日本[にほん]'),
    romaji: 'nihon',
    meaning: { ca: 'Japó', es: 'Japón', en: 'Japan' },
  },
};

describe('getCardFaces', () => {
  it("mostra primer l'idioma de l'estudiant", () => {
    const { front, back } = getCardFaces(word, base);
    expect(front).toEqual({ kind: 'meaning', text: 'te' });
    expect(back.kind).toBe('word');
  });

  it('inverteix les cares', () => {
    const { front, back } = getCardFaces(word, { ...base, frontSide: 'japanese', language: 'en' });
    expect(front.kind).toBe('word');
    expect(back).toEqual({ kind: 'meaning', text: 'tea' });
  });

  it('amaga el romaji i passa a només kana', () => {
    const { back } = getCardFaces(word, { ...base, showRomaji: false, scriptMode: 'kana' });
    expect(back).toMatchObject({
      kind: 'word',
      japanese: { text: [{ text: 'おちゃ' }], romaji: undefined },
      speech: 'おちゃ',
    });
  });

  it('posa els detalls del kanji sempre a la cara del darrere', () => {
    const normal = getCardFaces(kanji, base);
    expect(normal.back).toMatchObject({ kind: 'kanji', details: { on: ['ニチ'] } });
    expect(normal.front).not.toHaveProperty('details');

    const inverted = getCardFaces(kanji, { ...base, frontSide: 'japanese' });
    expect(inverted.front).toMatchObject({ kind: 'kanji', kanji: '日' });
    expect(inverted.front).not.toHaveProperty('details');
    expect(inverted.back).toMatchObject({ kind: 'meaning', details: { example: { meaning: 'Japó' } } });
  });

  it("per al kana, l'altra cara és el so", () => {
    const { front, back } = getCardFaces(
      { kind: 'kana', id: 'h:か', categoryId: 'h', char: 'か', romaji: 'ka' },
      base,
    );
    expect(front).toEqual({ kind: 'sound', romaji: 'ka' });
    expect(back).toEqual({ kind: 'kana', char: 'か', speech: 'か' });
  });
});

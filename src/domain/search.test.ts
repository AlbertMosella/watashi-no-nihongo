import type { Card } from './card';
import { parseFurigana } from './furigana';
import { buildSearchIndex, normalize, searchCards } from './search';

const word = (id: string, jp: string, romaji: string, ca: string): Card => ({
  kind: 'word',
  id,
  categoryId: 'test',
  japanese: parseFurigana(jp),
  romaji,
  meaning: { ca, es: ca, en: ca },
});

const cards: Card[] = [
  word('pomada', 'なんこう', 'nankou', 'pomada'),
  word('poma', 'りんご', 'ringo', 'poma'),
  word('cafe', 'コーヒー', 'koohii', 'cafè'),
  word('menjar', '食[た]べる', 'taberu', 'menjar'),
  word('esmorzar', '朝[あさ]ご飯[はん]', 'asagohan', 'esmorzar, menjar del matí'),
  { kind: 'kana', id: 'a', categoryId: 'hiragana', char: 'あ', romaji: 'a' },
  {
    kind: 'kanji',
    id: 'kanji:日',
    categoryId: 'kanji',
    kanji: '日',
    meaning: { ca: 'dia, sol', es: 'día', en: 'day' },
    on: ['ニチ'],
    kun: ['ひ'],
  },
];

const index = buildSearchIndex(cards, 'ca');
const ids = (q: string) => searchCards(index, q).map((c) => c.id);

describe('normalize', () => {
  it('treu accents, majúscules i signes i passa katakana a hiragana', () => {
    expect(normalize('  Cafè ')).toBe('cafe');
    expect(normalize('Al·lèrgia')).toBe('al lergia');
    expect(normalize('コーヒー')).toBe('こーひー');
  });
});

describe('searchCards', () => {
  it('troba per significat ignorant accents', () => {
    expect(ids('cafe')).toEqual(['cafe']);
    expect(ids('CAFÈ')).toEqual(['cafe']);
  });

  it('posa primer les coincidències exactes', () => {
    expect(ids('poma')).toEqual(['poma', 'pomada']);
    // "menjar" exacte primer; "menjar del matí" (conté la paraula) després.
    expect(ids('menjar')).toEqual(['menjar', 'esmorzar']);
    expect(ids('matí')).toEqual(['esmorzar']);
  });

  it('troba per japonès (kanji, kana i katakana) i per romaji', () => {
    expect(ids('食べる')).toEqual(['menjar']);
    expect(ids('たべる')).toEqual(['menjar']);
    expect(ids('コーヒー')).toEqual(['cafe']);
    expect(ids('ringo')).toEqual(['poma']);
  });

  it('troba kana i kanji', () => {
    expect(ids('あ')).toContain('a');
    expect(ids('dia')).toEqual(['kanji:日']);
    expect(ids('ニチ')).toEqual(['kanji:日']);
  });

  it('no retorna res amb una cerca buida', () => {
    expect(ids('   ')).toEqual([]);
  });
});

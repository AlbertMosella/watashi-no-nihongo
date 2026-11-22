import { kanaToRomaji, RomajiConversionError, toHiragana } from './romaji';

describe('kanaToRomaji', () => {
  it.each([
    ['ありがとう', 'arigatou'],
    ['すし', 'sushi'],
    ['ちゃ', 'cha'],
    ['きって', 'kitte'],
    ['まっちゃ', 'matcha'],
    ['がっこう', 'gakkou'],
    ['しんぶん', 'shinbun'],
    ['きんようび', "kin'youbi"],
    ['こんいん', "kon'in"],
    ['コーヒー', 'koohii'],
    ['パーティー', 'paatii'],
    ['ファイル', 'fairu'],
    ['じゅぎょう', 'jugyou'],
    ['にほんご', 'nihongo'],
  ])('%s → %s', (kana, romaji) => {
    expect(kanaToRomaji(kana)).toBe(romaji);
  });

  it('rebutja caràcters desconeguts', () => {
    expect(() => kanaToRomaji('日本')).toThrow(RomajiConversionError);
  });
});

describe('toHiragana', () => {
  it('converteix katakana i deixa la resta', () => {
    expect(toHiragana('カタカナー')).toBe('かたかなー');
  });
});

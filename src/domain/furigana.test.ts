import { FuriganaSyntaxError, furiganaToKana, furiganaToWritten, hasKanji, parseFurigana } from './furigana';

describe('parseFurigana', () => {
  it('aplica la lectura al bloc de kanji anterior', () => {
    expect(parseFurigana('食[た]べる')).toEqual([{ text: '食', reading: 'た' }, { text: 'べる' }]);
    expect(parseFurigana('お茶[ちゃ]')).toEqual([{ text: 'お' }, { text: '茶', reading: 'ちゃ' }]);
    expect(parseFurigana('日本語[にほんご]')).toEqual([{ text: '日本語', reading: 'にほんご' }]);
  });

  it('suporta diversos blocs', () => {
    const t = parseFurigana('食[た]べ物[もの]');
    expect(furiganaToWritten(t)).toBe('食べ物');
    expect(furiganaToKana(t)).toBe('たべもの');
  });

  it('accepta kana pur', () => {
    const t = parseFurigana('りんご');
    expect(t).toEqual([{ text: 'りんご' }]);
    expect(hasKanji(t)).toBe(false);
  });

  it('falla si un kanji no té lectura', () => {
    expect(() => parseFurigana('日本')).toThrow(FuriganaSyntaxError);
    expect(() => parseFurigana('食べ物[もの]')).toThrow(FuriganaSyntaxError);
  });

  it('falla amb claudàtors sense kanji', () => {
    expect(() => parseFurigana('あ[い]')).toThrow(FuriganaSyntaxError);
  });
});

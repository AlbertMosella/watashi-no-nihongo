import { LEARNER, viewLine, type ConversationLine, type ConversationSettings } from './conversation';
import { parseFurigana } from './furigana';

const base: ConversationSettings = {
  language: 'ca',
  scriptMode: 'kanji',
  showRomaji: true,
  showFurigana: true,
  practice: false,
};

const staff: ConversationLine = {
  speaker: 'staff',
  japanese: parseFurigana('何名様[なんめいさま]ですか。'),
  romaji: 'nanmei-sama desu ka?',
  translation: { ca: 'Quantes persones són?', es: '¿Cuántas personas son?', en: 'How many people?' },
};

const you: ConversationLine = {
  speaker: LEARNER,
  japanese: parseFurigana('二人[ふたり]です。'),
  romaji: 'futari desu.',
  translation: { ca: 'Som dues persones.', es: 'Somos dos.', en: 'Two people.' },
};

describe('viewLine', () => {
  it("mostra-ho tot en mode lectura, en l'idioma de l'estudiant", () => {
    const v = viewLine(staff, { ...base, language: 'es' });
    expect(v).toMatchObject({ fromLearner: false, hidden: 'none', translation: '¿Cuántas personas son?' });
    expect(v.japanese.romaji).toBe('nanmei-sama desu ka?');
  });

  it("en mode pràctica amaga el japonès de l'estudiant i la traducció dels altres", () => {
    expect(viewLine(you, { ...base, practice: true }).hidden).toBe('japanese');
    expect(viewLine(staff, { ...base, practice: true }).hidden).toBe('translation');
  });

  it('respecta només kana i romaji desactivat', () => {
    const v = viewLine(you, { ...base, scriptMode: 'kana', showRomaji: false });
    expect(v.japanese.text).toEqual([{ text: 'ふたりです。' }]);
    expect(v.japanese.romaji).toBeUndefined();
    expect(v.speech).toBe('ふたりです。');
  });
});

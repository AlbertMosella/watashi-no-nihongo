import { CATEGORIES } from '@/data/categories';
import { STUDENT_LANGUAGES } from '@/domain/language';
import { ca } from './ca';
import { categoryLabelKey, createTranslator, MESSAGES } from './index';

describe('i18n', () => {
  it('tots els idiomes tenen les mateixes claus i cap text buit', () => {
    const keys = Object.keys(ca).sort();
    for (const lang of STUDENT_LANGUAGES) {
      expect(Object.keys(MESSAGES[lang]).sort()).toEqual(keys);
      expect(Object.values(MESSAGES[lang]).filter((v) => !v.trim())).toEqual([]);
    }
  });

  it('totes les categories tenen etiqueta', () => {
    const missing = CATEGORIES.map((c) => categoryLabelKey(c.id)).filter((k) => !(k in ca));
    expect(missing).toEqual([]);
  });

  it('interpola paràmetres', () => {
    expect(createTranslator('ca')('deck.position', { current: 3, total: 10 })).toBe('3 de 10');
    expect(createTranslator('en')('deck.position', { current: 3, total: 10 })).toBe('3 of 10');
  });
});

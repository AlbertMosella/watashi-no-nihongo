/**
 * Test d'integritat de TOTES les dades. Si algú afegeix o edita un JSON malament,
 * aquest test falla dient exactament quina entrada i per què.
 */
import { CATEGORIES } from './categories';
import { mapRawCards, type RawKana, type RawKanji, type RawWord } from './rawCards';

const files = import.meta.glob<unknown[]>('./cards/*.json', { eager: true, import: 'default' });
const byId = new Map(
  Object.entries(files).map(([path, data]) => [path.replace(/^.*\/(.+)\.json$/, '$1'), data]),
);

const KANA_ONLY = /^[\p{Script=Hiragana}\p{Script=Katakana}ー・、。？！〜 \u3000]+$/u;
const KATAKANA = /^[\p{Script=Katakana}ー]+$/u;
const HIRAGANA_READING = /^-?[\p{Script=Hiragana}]+(\.[\p{Script=Hiragana}]+)?-?$/u;
const ROMAJI = /^[a-z' .,?!~"-]+$/;

const nonEmpty = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && v === v.trim();

function checkText(where: string, t: RawWord, problems: string[]) {
  for (const lang of ['jp', 'ca', 'es', 'en'] as const) {
    if (!nonEmpty(t[lang])) problems.push(`${where}: camp "${lang}" buit o amb espais`);
  }
  if (t.r !== undefined && !ROMAJI.test(t.r)) problems.push(`${where}: romaji "${t.r}" invàlid`);
  const extra = Object.keys(t).filter((k) => !['jp', 'ca', 'es', 'en', 'r'].includes(k));
  if (extra.length) problems.push(`${where}: camps desconeguts ${extra.join(',')}`);
}

describe('dataset', () => {
  it('cada categoria té el seu fitxer i cada fitxer la seva categoria', () => {
    const categoryIds = CATEGORIES.map((c) => c.id).sort();
    expect([...byId.keys()].sort()).toEqual(categoryIds);
  });

  it('els ids de categoria són únics', () => {
    const ids = CATEGORIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const category of CATEGORIES) {
    describe(category.id, () => {
      const raw = byId.get(category.id) ?? [];

      it('no és buida', () => {
        expect(raw.length).toBeGreaterThan(0);
      });

      it('té un format vàlid', () => {
        const problems: string[] = [];
        raw.forEach((item, i) => {
          const where = `${category.id}[${i}]`;
          if (category.group === 'kana') {
            const k = item as RawKana;
            if (!KANA_ONLY.test(k.c)) problems.push(`${where}: "${k.c}" no és kana`);
            if (!ROMAJI.test(k.r)) problems.push(`${where}: romaji "${k.r}" invàlid`);
          } else if (category.group === 'kanji') {
            const k = item as RawKanji;
            if ([...k.k].length !== 1) problems.push(`${where}: "${k.k}" ha de ser un sol kanji`);
            for (const lang of ['ca', 'es', 'en'] as const) {
              if (!nonEmpty(k[lang])) problems.push(`${where}: camp "${lang}" buit`);
            }
            if (k.on.length + k.kun.length === 0) problems.push(`${where}: sense lectures`);
            for (const on of k.on) if (!KATAKANA.test(on)) problems.push(`${where}: on "${on}" ha de ser katakana`);
            for (const kun of k.kun) if (!HIRAGANA_READING.test(kun)) problems.push(`${where}: kun "${kun}" invàlid`);
            if (k.ex) {
              checkText(`${where}.ex`, k.ex, problems);
              if (!k.ex.jp.includes(k.k)) problems.push(`${where}: l'exemple no conté ${k.k}`);
            }
          } else {
            checkText(where, item as RawWord, problems);
          }
        });
        expect(problems).toEqual([]);
      });

      it('es pot convertir a targetes (furigana i romaji correctes)', () => {
        const cards = mapRawCards(category.id, category.group, raw);
        const problems: string[] = [];
        for (const card of cards) {
          const romaji = card.kind === 'kanji' ? card.example?.romaji : card.romaji;
          if (romaji !== undefined && !ROMAJI.test(romaji)) problems.push(`${card.id}: romaji "${romaji}"`);
        }
        expect(problems).toEqual([]);
      });

      it('no té targetes duplicades', () => {
        const ids = mapRawCards(category.id, category.group, raw).map((c) => c.id);
        const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
        expect(dupes).toEqual([]);
      });
    });
  }
});

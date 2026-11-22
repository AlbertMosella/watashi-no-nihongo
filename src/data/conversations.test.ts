/**
 * Integritat de totes les converses: format, interlocutors, furigana i romaji.
 * Si un JSON està malament, el test diu exactament quina línia i per què.
 */
import { LEARNER } from '@/domain/conversation';
import { furiganaToKana, parseFurigana } from '@/domain/furigana';
import type { Translations } from '@/domain/language';
import { mapRawTopic, type RawTopic } from './rawConversations';
import { TOPICS } from './topics';

const files = import.meta.glob<RawTopic>('./conversations/*.json', { eager: true, import: 'default' });
const byId = new Map(
  Object.entries(files).map(([path, data]) => [path.replace(/^.*\/(.+)\.json$/, '$1'), data]),
);

const ROMAJI = /^[A-Za-z0-9' .,?!~"()-]+$/;
/** El japonès de les línies només pot tenir kana, kanji, números i puntuació japonesa. */
const JAPANESE = /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々〆ヶ、。？！「」〜・…０-９0-9A-Za-zＡ-Ｚ[\]\u3000 ]+$/u;

const isText = (v: unknown) => typeof v === 'string' && v.trim().length > 0 && v === v.trim();

function checkTranslations(where: string, t: Translations | undefined, problems: string[]) {
  for (const lang of ['ca', 'es', 'en'] as const) {
    if (!isText(t?.[lang])) problems.push(`${where}: falta "${lang}"`);
  }
}

function checkJapanese(where: string, jp: string, r: string, problems: string[]) {
  if (!isText(jp)) return problems.push(`${where}: "jp" buit`);
  if (!JAPANESE.test(jp)) problems.push(`${where}: caràcters no vàlids a "${jp}"`);
  try {
    furiganaToKana(parseFurigana(jp));
  } catch (e) {
    problems.push(`${where}: ${(e as Error).message}`);
  }
  if (!isText(r) || !ROMAJI.test(r)) problems.push(`${where}: romaji "${r}" invàlid`);
}

describe('converses', () => {
  it('cada temàtica té el seu fitxer i cada fitxer la seva temàtica', () => {
    expect([...byId.keys()].sort()).toEqual(TOPICS.map((t) => t.id).sort());
  });

  for (const topic of TOPICS) {
    describe(topic.id, () => {
      const raw = byId.get(topic.id);

      it('té converses i frases clau', () => {
        expect(raw?.conversations.length).toBeGreaterThan(0);
        expect(raw?.phrases.length).toBeGreaterThan(0);
      });

      it('té un format vàlid', () => {
        const problems: string[] = [];
        if (!raw) return;
        const speakers = new Set(Object.keys(raw.speakers ?? {}));
        if (speakers.has(LEARNER)) problems.push(`"${LEARNER}" és reservat, no s'ha de definir a speakers`);
        for (const [id, t] of Object.entries(raw.speakers ?? {})) checkTranslations(`speakers.${id}`, t, problems);

        const ids = new Set<string>();
        raw.conversations.forEach((c, ci) => {
          const where = `conversations[${ci}]`;
          if (!/^[a-z0-9-]+$/.test(c.id ?? '')) problems.push(`${where}: id "${c.id}" ha de ser kebab-case`);
          if (ids.has(c.id)) problems.push(`${where}: id duplicat "${c.id}"`);
          ids.add(c.id);
          checkTranslations(`${where}.title`, c.title, problems);
          if (c.lines.length < 2) problems.push(`${where}: massa curta`);
          if (!c.lines.some((l) => l.s === LEARNER)) problems.push(`${where}: l'estudiant ("${LEARNER}") no hi parla`);
          c.lines.forEach((l, li) => {
            const w = `${where}.lines[${li}]`;
            if (l.s !== LEARNER && !speakers.has(l.s)) problems.push(`${w}: interlocutor desconegut "${l.s}"`);
            checkJapanese(w, l.jp, l.r, problems);
            checkTranslations(w, l, problems);
          });
        });

        raw.phrases.forEach((p, pi) => {
          const w = `phrases[${pi}]`;
          checkJapanese(w, p.jp, p.r, problems);
          checkTranslations(w, p, problems);
          if (p.note) checkTranslations(`${w}.note`, p.note, problems);
        });

        expect(problems).toEqual([]);
      });

      it('es pot convertir al model de domini', () => {
        if (raw) expect(() => mapRawTopic(topic.id, raw)).not.toThrow();
      });
    });
  }
});

/**
 * Conversió kana → romaji (Hepburn simplificat, sense macrons):
 *  - っ/ッ dobla la consonant següent (きって → kitte, まっちゃ → matcha)
 *  - ん davant de vocal o y s'escriu n' (きんようび → kin'youbi)
 *  - ー allarga la vocal anterior (コーヒー → koohii)
 *  - おう, えい... es mantenen tal com s'escriuen (ありがとう → arigatou)
 * Les partícules (は → wa) no es poden deduir: les dades poden donar el romaji explícit.
 */

const BASE: Record<string, string> = {
  あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
  か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
  さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
  た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
  な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
  は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
  ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
  や: 'ya', ゆ: 'yu', よ: 'yo',
  ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
  わ: 'wa', ゐ: 'wi', ゑ: 'we', を: 'wo', ん: 'n',
  が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
  ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
  だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
  ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
  ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
  ゔ: 'vu',
  ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
  ゃ: 'ya', ゅ: 'yu', ょ: 'yo', ゎ: 'wa',
};

const DIGRAPHS: Record<string, string> = {
  きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
  しゃ: 'sha', しゅ: 'shu', しぇ: 'she', しょ: 'sho',
  ちゃ: 'cha', ちゅ: 'chu', ちぇ: 'che', ちょ: 'cho',
  にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
  ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
  みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
  りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
  ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
  じゃ: 'ja', じゅ: 'ju', じぇ: 'je', じょ: 'jo',
  ぢゃ: 'ja', ぢゅ: 'ju', ぢょ: 'jo',
  びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
  ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
  // Combinacions habituals en paraules estrangeres (katakana).
  ふぁ: 'fa', ふぃ: 'fi', ふぇ: 'fe', ふぉ: 'fo',
  てぃ: 'ti', でぃ: 'di', とぅ: 'tu', どぅ: 'du',
  うぃ: 'wi', うぇ: 'we', うぉ: 'wo',
  ゔぁ: 'va', ゔぃ: 'vi', ゔぇ: 've', ゔぉ: 'vo',
  つぁ: 'tsa', つぇ: 'tse', つぉ: 'tso',
  いぇ: 'ye',
};

const PUNCTUATION: Record<string, string> = {
  '、': ',', '。': '.', '？': '?', '！': '!', '・': ' ', '　': ' ', ' ': ' ', '〜': '~', '「': '"', '」': '"',
};

const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;
const KATAKANA_TO_HIRAGANA_OFFSET = 0x60;

/** Passa el katakana a hiragana (ー i la resta es mantenen). */
export function toHiragana(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    out +=
      code >= KATAKANA_START && code <= KATAKANA_END
        ? String.fromCodePoint(code - KATAKANA_TO_HIRAGANA_OFFSET)
        : ch;
  }
  return out;
}

export class RomajiConversionError extends Error {
  constructor(source: string, char: string) {
    super(`No es pot convertir "${char}" a romaji (a "${source}")`);
    this.name = 'RomajiConversionError';
  }
}

const VOWELS = new Set(['a', 'i', 'u', 'e', 'o']);

export function kanaToRomaji(kana: string): string {
  const chars = [...toHiragana(kana)];
  let out = '';
  let pendingSokuon = false;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    const pair = ch + (chars[i + 1] ?? '');

    if (ch === 'っ') {
      pendingSokuon = true;
      continue;
    }

    if (ch === 'ー') {
      const lastVowel = [...out].reverse().find((c) => VOWELS.has(c));
      if (lastVowel) out += lastVowel;
      continue;
    }

    let syllable: string | undefined;
    if (DIGRAPHS[pair]) {
      syllable = DIGRAPHS[pair];
      i++;
    } else if (BASE[ch]) {
      syllable = BASE[ch];
    } else if (PUNCTUATION[ch] !== undefined) {
      syllable = PUNCTUATION[ch];
    } else if (/[\p{Script=Latin}\d\s.,!?'-]/u.test(ch)) {
      syllable = ch;
    } else {
      throw new RomajiConversionError(kana, ch);
    }

    if (pendingSokuon) {
      pendingSokuon = false;
      if (syllable.startsWith('ch')) out += 't';
      else if (/^[a-z]/.test(syllable) && !VOWELS.has(syllable[0]!)) out += syllable[0];
    }

    if (ch === 'ん') {
      const next = chars[i + 1];
      const nextRomaji = next ? BASE[toHiragana(next)] : undefined;
      if (nextRomaji && (VOWELS.has(nextRomaji[0]!) || nextRomaji[0] === 'y')) {
        out += "n'";
        continue;
      }
    }

    out += syllable;
  }
  return out;
}

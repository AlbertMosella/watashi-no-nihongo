import { memo, type CSSProperties } from 'react';
import type { Face, KanjiDetails } from '@/domain/faces';
import { furiganaToWritten } from '@/domain/furigana';
import type { Translate } from '@/app/i18n';
import { Furigana } from './Furigana';
import styles from './Flashcard.module.css';

/** Nombre de caràcters, per ajustar la mida de la lletra a l'amplada de la targeta. */
const charsVar = (text: string) => ({ '--chars': [...text].length }) as CSSProperties;

export const FaceView = memo(function FaceView({ face, t }: { face: Face; t: Translate }) {
  switch (face.kind) {
    case 'meaning':
      return (
        <div className={styles.content}>
          <p className={styles.meaning} style={charsVar(face.text)}>
            {face.text}
          </p>
          {face.details && <Details details={face.details} t={t} />}
        </div>
      );
    case 'sound':
      return (
        <div className={styles.content}>
          <p className={styles.sound}>{face.romaji}</p>
        </div>
      );
    case 'kana':
      return (
        <div className={styles.content}>
          <p className={styles.kana} lang="ja" style={charsVar(face.char)}>
            {face.char}
          </p>
        </div>
      );
    case 'word': {
      const written = furiganaToWritten(face.japanese.text);
      return (
        <div className={styles.content}>
          <p className={styles.word} style={charsVar(written)}>
            <Furigana text={face.japanese.text} show={face.japanese.showFurigana} />
          </p>
          {face.japanese.romaji && <p className={styles.romaji}>{face.japanese.romaji}</p>}
        </div>
      );
    }
    case 'kanji':
      return (
        <div className={styles.content}>
          <p className={styles.kanji} lang="ja">
            {face.kanji}
          </p>
          {face.details && <Details details={face.details} t={t} />}
        </div>
      );
  }
});

function Details({ details, t }: { details: KanjiDetails; t: Translate }) {
  const { on, kun, example } = details;
  return (
    <div className={styles.details}>
      <dl className={styles.readings}>
        {on.length > 0 && (
          <div>
            <dt>{t('card.on')}</dt>
            <dd lang="ja">{on.join('・')}</dd>
          </div>
        )}
        {kun.length > 0 && (
          <div>
            <dt>{t('card.kun')}</dt>
            <dd lang="ja">{kun.join('・')}</dd>
          </div>
        )}
      </dl>
      {example && (
        <div className={styles.example}>
          <span className={styles.exampleLabel}>{t('card.example')}</span>
          <span className={styles.exampleJa}>
            <Furigana text={example.text} show={example.showFurigana} />
          </span>
          {example.romaji && <span className={styles.exampleRomaji}>{example.romaji}</span>}
          <span className={styles.exampleMeaning}>{example.meaning}</span>
        </div>
      )}
    </div>
  );
}

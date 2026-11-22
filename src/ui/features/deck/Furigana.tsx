import { memo } from 'react';
import type { FuriganaText } from '@/domain/furigana';

/** Pinta text japonès amb furigana amb <ruby> natiu (accessible i sense JS de maquetació). */
export const Furigana = memo(function Furigana({ text, show }: { text: FuriganaText; show: boolean }) {
  return (
    <span lang="ja">
      {text.map((segment, i) =>
        segment.reading && show ? (
          <ruby key={i}>
            {segment.text}
            <rp>(</rp>
            <rt>{segment.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </span>
  );
});

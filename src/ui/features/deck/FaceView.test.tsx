import { render, screen } from '@testing-library/react';
import { createTranslator } from '@/app/i18n';
import { parseFurigana } from '@/domain/furigana';
import { FaceView } from './FaceView';

const t = createTranslator('ca');

describe('FaceView', () => {
  it('pinta el furigana amb <ruby> i el romaji', () => {
    const { container } = render(
      <FaceView
        t={t}
        face={{
          kind: 'word',
          speech: 'たべる',
          japanese: { text: parseFurigana('食[た]べる'), showFurigana: true, romaji: 'taberu' },
        }}
      />,
    );
    expect(container.querySelector('ruby')).toHaveTextContent('食');
    expect(container.querySelector('rt')).toHaveTextContent('た');
    expect(screen.getByText('taberu')).toBeInTheDocument();
  });

  it('amaga el furigana si està desactivat', () => {
    const { container } = render(
      <FaceView
        t={t}
        face={{
          kind: 'word',
          speech: 'たべる',
          japanese: { text: parseFurigana('食[た]べる'), showFurigana: false },
        }}
      />,
    );
    expect(container.querySelector('rt')).toBeNull();
    expect(container).toHaveTextContent('食べる');
  });

  it('mostra les lectures i l’exemple del kanji', () => {
    render(
      <FaceView
        t={t}
        face={{
          kind: 'kanji',
          kanji: '日',
          speech: 'にほん',
          details: {
            on: ['ニチ', 'ジツ'],
            kun: ['ひ'],
            example: { text: parseFurigana('日本[にほん]'), showFurigana: true, meaning: 'Japó' },
          },
        }}
      />,
    );
    expect(screen.getByText('ニチ・ジツ')).toBeInTheDocument();
    expect(screen.getByText('Exemple')).toBeInTheDocument();
    expect(screen.getByText('Japó')).toBeInTheDocument();
  });
});

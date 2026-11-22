import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LEARNER, type ConversationLine, type ConversationSettings } from '@/domain/conversation';
import { parseFurigana } from '@/domain/furigana';
import { createTestServices, withServices } from '@/test/testServices';
import { Bubble } from './Bubble';

const line: ConversationLine = {
  speaker: LEARNER,
  japanese: parseFurigana('二人[ふたり]です。'),
  romaji: 'futari desu.',
  translation: { ca: 'Som dues persones.', es: 'Somos dos.', en: 'Two people.' },
};

const settings: ConversationSettings = {
  language: 'ca',
  scriptMode: 'kanji',
  showRomaji: true,
  showFurigana: true,
  practice: false,
};

function renderBubble(s: ConversationSettings) {
  return render(
    <ol>
      <Bubble line={line} speakerLabel="Tu" settings={s} speechAvailable={false} onSpeak={() => undefined} />
    </ol>,
    { wrapper: withServices(createTestServices()) },
  );
}

describe('Bubble', () => {
  it('en mode lectura ho mostra tot i no és clicable', () => {
    renderBubble(settings);
    expect(screen.getByText('futari desu.')).toBeVisible();
    expect(screen.getByText('Som dues persones.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { expanded: false })).toBeNull();
  });

  it('en mode pràctica amaga el japonès de l’estudiant fins que es toca', async () => {
    renderBubble({ ...settings, practice: true });
    const bubble = screen.getByRole('button', { expanded: false });
    expect(screen.getByText('futari desu.').closest('[aria-hidden="true"]')).not.toBeNull();
    expect(screen.getByText('Som dues persones.').closest('[aria-hidden="true"]')).toBeNull();

    await userEvent.click(bubble);
    expect(bubble).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('futari desu.').closest('[aria-hidden="true"]')).toBeNull();
  });
});

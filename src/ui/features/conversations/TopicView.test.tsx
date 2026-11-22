import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JsonConversationRepository } from '@/data/jsonConversationRepository';
import type { RawTopic } from '@/data/rawConversations';
import type { Topic } from '@/domain/conversation';
import { createTestServices, withServices } from '@/test/testServices';
import { TopicView } from './TopicView';

const topic: Topic = { id: 'restaurant', hue: 18, emoji: '🍜' };

const raw: RawTopic = {
  speakers: { staff: { ca: 'Cambrer', es: 'Camarero', en: 'Waiter' } },
  conversations: [
    {
      id: 'entering',
      title: { ca: 'Entrar al restaurant', es: 'Entrar', en: 'Entering' },
      lines: [
        { s: 'staff', jp: '何名様[なんめいさま]ですか。', r: 'nanmei-sama desu ka?', ca: 'Quantes persones són?', es: '-', en: '-' },
        { s: 'you', jp: '二人[ふたり]です。', r: 'futari desu.', ca: 'Som dues persones.', es: '-', en: '-' },
      ],
    },
    {
      id: 'paying',
      title: { ca: 'Pagar', es: 'Pagar', en: 'Paying' },
      lines: [{ s: 'you', jp: 'お会計[かいけい]お願[ねが]いします。', r: 'okaikei onegaishimasu.', ca: 'El compte, si us plau.', es: '-', en: '-' }],
    },
  ],
  phrases: [{ jp: '〜をください。', r: '~ o kudasai.', ca: 'Em dona ~.', es: '-', en: '-' }],
};

function setup() {
  const services = {
    ...createTestServices(),
    conversations: new JsonConversationRepository([topic], { restaurant: async () => ({ default: raw }) }),
  };
  render(<TopicView topic={topic} onBack={() => undefined} />, { wrapper: withServices(services) });
  return services;
}

describe('TopicView', () => {
  it('mostra cada conversa i les frases clau com a blocs plegats', async () => {
    setup();
    expect(await screen.findByText('Entrar al restaurant')).toBeInTheDocument();
    expect(screen.getByText('Pagar')).toBeInTheDocument();
    expect(screen.getByText('Frases clau')).toBeInTheDocument();
    expect(screen.queryByText('futari desu.')).toBeNull();
  });

  it('desplega un bloc en tocar-lo i el manté obert en canviar de mode', async () => {
    setup();
    await userEvent.click(await screen.findByText('Entrar al restaurant'));
    expect(screen.getByText('futari desu.')).toBeInTheDocument();
    expect(screen.queryByText('okaikei onegaishimasu.')).toBeNull();

    await userEvent.click(screen.getByRole('radio', { name: 'Practicar' }));
    expect(screen.getByText('futari desu.')).toBeInTheDocument();
  });
});

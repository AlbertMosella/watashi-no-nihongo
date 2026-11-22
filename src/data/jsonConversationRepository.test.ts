import type { Topic } from '@/domain/conversation';
import { JsonConversationRepository } from './jsonConversationRepository';
import type { RawTopic } from './rawConversations';

const topics: Topic[] = [{ id: 'restaurant', hue: 18, emoji: '🍜' }];

const raw: RawTopic = {
  speakers: { staff: { ca: 'Cambrer', es: 'Camarero', en: 'Waiter' } },
  conversations: [
    {
      id: 'entering',
      title: { ca: 'Entrar', es: 'Entrar', en: 'Entering' },
      lines: [
        { s: 'staff', jp: '何名様[なんめいさま]ですか。', r: 'nanmei-sama desu ka?', ca: 'Quants són?', es: '¿Cuántos son?', en: 'How many?' },
        { s: 'you', jp: '二人[ふたり]です。', r: 'futari desu.', ca: 'Dos.', es: 'Dos.', en: 'Two.' },
      ],
    },
  ],
  phrases: [{ jp: '〜をください。', r: '~ o kudasai.', ca: 'Em dona ~.', es: 'Me da ~.', en: '~, please.' }],
};

describe('JsonConversationRepository', () => {
  it('carrega i converteix una temàtica', async () => {
    const repo = new JsonConversationRepository(topics, { restaurant: async () => ({ default: raw }) });
    const content = await repo.getTopic('restaurant');
    expect(content.conversations[0]).toMatchObject({ id: 'restaurant:entering', title: { ca: 'Entrar' } });
    expect(content.conversations[0]!.lines[1]).toMatchObject({ speaker: 'you', romaji: 'futari desu.' });
    expect(content.speakers.staff?.es).toBe('Camarero');
    expect(content.phrases).toHaveLength(1);
  });

  it('només carrega cada temàtica una vegada', async () => {
    const loader = vi.fn(async () => ({ default: raw }));
    const repo = new JsonConversationRepository(topics, { restaurant: loader });
    await Promise.all([repo.getTopic('restaurant'), repo.getTopic('restaurant')]);
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('rebutja temàtiques desconegudes', async () => {
    const repo = new JsonConversationRepository(topics, {});
    await expect(repo.getTopic('nope')).rejects.toThrow();
  });
});

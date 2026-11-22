import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InstallPrompt } from '@/app/installPrompt';
import { SETTINGS_KEY } from '@/app/settingsStore';
import { MemoryStorage } from '@/data/localStorageAdapter';
import { createTestServices, withServices } from '@/test/testServices';
import { Onboarding } from './Onboarding';

function setup() {
  const storage = new MemoryStorage();
  const services = createTestServices(storage);
  render(<Onboarding />, { wrapper: withServices(services) });
  return { storage, services };
}

describe('Onboarding', () => {
  it('explica l’app en català per defecte', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Watashi no Nihongo' })).toBeInTheDocument();
    expect(screen.getByText('Aprèn japonès amb targetes i converses')).toBeInTheDocument();
    expect(screen.getByText(/^Targetes:/)).toBeInTheDocument();
    expect(screen.getByText(/^Converses per temàtiques/)).toBeInTheDocument();
    expect(screen.getByText(/el japonès o el teu idioma/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Català' })).toHaveAttribute('aria-checked', 'true');
  });

  it('en triar idioma, tota la pantalla canvia a l’instant', async () => {
    const { services } = setup();
    await userEvent.click(screen.getByRole('radio', { name: 'English' }));
    expect(services.settings.getSnapshot().language).toBe('en');
    expect(screen.getByText('Learn Japanese with flashcards and conversations')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
  });

  it('"Començar" desa que ja s’ha vist i l’idioma triat', async () => {
    const { storage } = setup();
    await userEvent.click(screen.getByRole('radio', { name: 'Castellano' }));
    await userEvent.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(storage.read(SETTINGS_KEY)).toMatchObject({ onboarded: true, language: 'es' });
  });

  it('explica breument com instal·lar l’app', () => {
    setup();
    expect(screen.getByText(/instal·la-la des del menú del navegador/)).toBeInTheDocument();
  });

  it('no parla d’instal·lar si ja s’executa instal·lada', () => {
    const standalone = Object.assign(new EventTarget(), {
      matchMedia: () => ({ matches: true }),
      navigator: { userAgent: '', maxTouchPoints: 0 },
    }) as unknown as Window;
    const services = { ...createTestServices(), install: new InstallPrompt(standalone) };
    render(<Onboarding />, { wrapper: withServices(services) });
    expect(screen.queryByText(/instal·la-la/)).toBeNull();
  });
});

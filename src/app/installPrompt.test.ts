import { InstallPrompt } from './installPrompt';

/** Finestra mínima falsa: esdeveniments, matchMedia i navigator. */
function fakeWindow({ standalone = false, ua = 'Mozilla/5.0 (Linux; Android 14) Chrome/140', touch = 5 } = {}) {
  const target = new EventTarget();
  return Object.assign(target, {
    matchMedia: (q: string) => ({ matches: standalone && q.includes('standalone') }),
    navigator: { userAgent: ua, maxTouchPoints: touch },
  }) as unknown as Window;
}

function installEvent(outcome: 'accepted' | 'dismissed') {
  const event = new Event('beforeinstallprompt', { cancelable: true });
  return Object.assign(event, {
    prompt: vi.fn(async () => undefined),
    userChoice: Promise.resolve({ outcome }),
  });
}

describe('InstallPrompt', () => {
  it('no diu res si ja s’executa instal·lada', () => {
    expect(new InstallPrompt(fakeWindow({ standalone: true })).getSnapshot()).toBe('installed');
  });

  it('a iPhone/iPad explica els passos de Safari', () => {
    const ios = fakeWindow({ ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' });
    expect(new InstallPrompt(ios).getSnapshot()).toBe('ios');
    const ipad = fakeWindow({ ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', touch: 5 });
    expect(new InstallPrompt(ipad).getSnapshot()).toBe('ios');
  });

  it('ofereix el diàleg natiu quan el navegador el proporciona', async () => {
    const win = fakeWindow();
    const install = new InstallPrompt(win);
    expect(install.getSnapshot()).toBe('manual');

    const event = installEvent('accepted');
    win.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(install.getSnapshot()).toBe('prompt');

    await install.install();
    expect(event.prompt).toHaveBeenCalled();
    expect(install.getSnapshot()).toBe('installed');
  });

  it('si l’usuari el rebutja, torna a les instruccions manuals', async () => {
    const win = fakeWindow();
    const install = new InstallPrompt(win);
    win.dispatchEvent(installEvent('dismissed'));
    await install.install();
    expect(install.getSnapshot()).toBe('manual');
  });
});

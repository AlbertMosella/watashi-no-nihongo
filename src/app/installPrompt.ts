/**
 * Instal·lació de la PWA.
 *
 * - Chrome/Edge/Android emeten `beforeinstallprompt`: el guardem per poder obrir el
 *   diàleg d'instal·lació quan l'usuari prem un botó nostre.
 * - iOS/iPadOS no té aquest esdeveniment: només es pot instal·lar des de Safari
 *   (Comparteix → Afegeix a la pantalla d'inici), així que n'expliquem els passos.
 * - Si l'app ja s'executa instal·lada (display-mode standalone) no cal dir res.
 *
 * S'ha de crear en arrencar l'app: l'esdeveniment es pot emetre abans que es pinti la UI.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export type InstallMode =
  /** Ja instal·lada: no mostrar res. */
  | 'installed'
  /** Hi ha diàleg natiu: mostrar un botó. */
  | 'prompt'
  /** iPhone/iPad: explicar Safari → Comparteix → Afegeix a la pantalla d'inici. */
  | 'ios'
  /** Altres navegadors: indicar el menú del navegador. */
  | 'manual';

export class InstallPrompt {
  private deferred: BeforeInstallPromptEvent | null = null;
  private mode: InstallMode;
  private readonly listeners = new Set<() => void>();

  constructor(win: Window | undefined = typeof window === 'undefined' ? undefined : window) {
    this.mode = detectInitialMode(win);
    if (!win) return;
    win.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault(); // Ensenyem el nostre botó en lloc del bàner automàtic.
      this.deferred = e as BeforeInstallPromptEvent;
      this.set('prompt');
    });
    win.addEventListener('appinstalled', () => {
      this.deferred = null;
      this.set('installed');
    });
  }

  getSnapshot = (): InstallMode => this.mode;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Obre el diàleg natiu d'instal·lació (només en mode 'prompt'). */
  async install(): Promise<void> {
    const event = this.deferred;
    if (!event) return;
    this.deferred = null; // Cada esdeveniment només es pot fer servir un cop.
    await event.prompt();
    const { outcome } = await event.userChoice;
    this.set(outcome === 'accepted' ? 'installed' : 'manual');
  }

  private set(mode: InstallMode): void {
    if (mode === this.mode) return;
    this.mode = mode;
    for (const l of this.listeners) l();
  }
}

function detectInitialMode(win: Window | undefined): InstallMode {
  if (!win) return 'manual';
  const standalone =
    win.matchMedia?.('(display-mode: standalone)').matches ||
    (win.navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return 'installed';
  const ua = win.navigator.userAgent;
  const isIos = /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && win.navigator.maxTouchPoints > 1);
  return isIos ? 'ios' : 'manual';
}

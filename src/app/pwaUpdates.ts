/**
 * Gestió del service worker i de les actualitzacions de la PWA.
 *
 * Com funciona una actualització:
 *  1. Cada deploy genera un `sw.js` diferent (conté la llista de fitxers amb el seu hash).
 *  2. El navegador el descarrega en obrir l'app, quan torna a primer pla i cada 30 minuts.
 *     Si ha canviat, l'instal·la (precarrega tots els fitxers nous) i el deixa "en espera".
 *  3. Mentre està en espera, l'app continua funcionant amb la versió antiga i mostrem un avís.
 *  4. Quan l'usuari prem "Actualitzar", enviem SKIP_WAITING: el SW nou pren el control
 *     (`controllerchange`) i recarreguem la pàgina amb la versió nova.
 */

export interface PwaUpdateState {
  /** Hi ha una versió nova descarregada esperant. */
  readonly needRefresh: boolean;
}

const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000;

export class PwaUpdates {
  private state: PwaUpdateState = { needRefresh: false };
  private readonly listeners = new Set<() => void>();
  private waiting: ServiceWorker | null = null;
  private updateRequested = false;

  constructor(
    private readonly container: ServiceWorkerContainer | undefined = globalThis.navigator?.serviceWorker,
    private readonly scriptUrl = '/sw.js',
  ) {}

  getSnapshot = (): PwaUpdateState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  async register(): Promise<void> {
    const container = this.container;
    if (!container) return;

    container.addEventListener('controllerchange', () => {
      // Només recarreguem si ho ha demanat l'usuari (evita recàrregues inesperades).
      if (this.updateRequested) window.location.reload();
    });

    const registration = await container.register(this.scriptUrl, { scope: '/' });

    // Ja hi havia una versió esperant d'una sessió anterior (p. ex. l'usuari va tancar l'avís).
    if (registration.waiting && container.controller) this.setWaiting(registration.waiting);

    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      installing?.addEventListener('statechange', () => {
        // Sense controller és la primera instal·lació (no una actualització): no cal avisar.
        if (installing.state === 'installed' && container.controller) this.setWaiting(installing);
      });
    });

    const check = () => {
      if (navigator.onLine && !registration.installing) registration.update().catch(() => undefined);
    };
    setInterval(check, UPDATE_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') check();
    });
  }

  /** Activa la versió nova i recarrega. */
  applyUpdate(): void {
    if (!this.waiting) return;
    this.updateRequested = true;
    this.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  dismiss(): void {
    this.set({ needRefresh: false });
  }

  private setWaiting(worker: ServiceWorker): void {
    this.waiting = worker;
    this.set({ needRefresh: true });
  }

  private set(patch: Partial<PwaUpdateState>): void {
    this.state = { ...this.state, ...patch };
    for (const l of this.listeners) l();
  }
}

import { PwaUpdates } from './pwaUpdates';

/** Doble mínim de l'API de service workers. */
class FakeWorker extends EventTarget {
  state: ServiceWorkerState = 'installing';
  postMessage = vi.fn();
  setState(state: ServiceWorkerState) {
    this.state = state;
    this.dispatchEvent(new Event('statechange'));
  }
}

class FakeRegistration extends EventTarget {
  waiting: FakeWorker | null = null;
  installing: FakeWorker | null = null;
  update = vi.fn(async () => undefined);
}

function setup({ controlled, waiting }: { controlled: boolean; waiting?: boolean }) {
  const registration = new FakeRegistration();
  if (waiting) registration.waiting = new FakeWorker();
  const container = Object.assign(new EventTarget(), {
    controller: controlled ? {} : null,
    register: vi.fn(async () => registration),
  });
  const updates = new PwaUpdates(container as unknown as ServiceWorkerContainer);
  return { updates, registration, container };
}

describe('PwaUpdates', () => {
  it('avisa si ja hi havia una versió esperant en obrir l’app', async () => {
    const { updates } = setup({ controlled: true, waiting: true });
    await updates.register();
    expect(updates.getSnapshot().needRefresh).toBe(true);
  });

  it('avisa quan una versió nova acaba d’instal·lar-se', async () => {
    const { updates, registration } = setup({ controlled: true });
    await updates.register();
    const worker = new FakeWorker();
    registration.installing = worker;
    registration.dispatchEvent(new Event('updatefound'));
    worker.setState('installed');
    expect(updates.getSnapshot()).toEqual({ needRefresh: true });
  });

  it('a la primera instal·lació no mostra cap avís', async () => {
    const { updates, registration } = setup({ controlled: false });
    await updates.register();
    const worker = new FakeWorker();
    registration.installing = worker;
    registration.dispatchEvent(new Event('updatefound'));
    worker.setState('installed');
    expect(updates.getSnapshot()).toEqual({ needRefresh: false });
  });

  it('en actualitzar demana SKIP_WAITING a la versió en espera', async () => {
    const { updates, registration } = setup({ controlled: true, waiting: true });
    await updates.register();
    updates.applyUpdate();
    expect(registration.waiting!.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('es pot tancar l’avís', async () => {
    const { updates } = setup({ controlled: true, waiting: true });
    await updates.register();
    const listener = vi.fn();
    updates.subscribe(listener);
    updates.dismiss();
    expect(updates.getSnapshot().needRefresh).toBe(false);
    expect(listener).toHaveBeenCalled();
  });
});

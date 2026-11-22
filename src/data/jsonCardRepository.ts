import type { Card } from '@/domain/card';
import type { Category } from '@/domain/category';
import type { CardRepository } from '@/domain/ports';
import { mapRawCards } from './rawCards';

export type JsonLoader = () => Promise<{ default: readonly unknown[] }>;

/**
 * Repositori sobre fitxers JSON empaquetats amb l'app.
 * Cada categoria és un chunk separat que només es descarrega/parseja quan cal,
 * i el resultat es guarda en memòria (també la promesa, per evitar càrregues duplicades).
 */
export class JsonCardRepository implements CardRepository {
  private readonly cache = new Map<string, Promise<readonly Card[]>>();
  private readonly byId: ReadonlyMap<string, Category>;

  constructor(
    private readonly categories: readonly Category[],
    private readonly loaders: Readonly<Record<string, JsonLoader>>,
  ) {
    this.byId = new Map(categories.map((c) => [c.id, c]));
  }

  getCategories(): readonly Category[] {
    return this.categories;
  }

  getCards(categoryId: string): Promise<readonly Card[]> {
    let pending = this.cache.get(categoryId);
    if (!pending) {
      pending = this.load(categoryId);
      pending.catch(() => this.cache.delete(categoryId));
      this.cache.set(categoryId, pending);
    }
    return pending;
  }

  private async load(categoryId: string): Promise<readonly Card[]> {
    const category = this.byId.get(categoryId);
    const loader = this.loaders[categoryId];
    if (!category || !loader) throw new Error(`Categoria desconeguda: ${categoryId}`);
    const module = await loader();
    return mapRawCards(category.id, category.group, module.default);
  }
}

/** Loaders de Vite: un chunk per fitxer de `./cards`, indexat per id de categoria. */
export function viteCardLoaders(): Record<string, JsonLoader> {
  const modules = import.meta.glob<{ default: unknown[] }>('./cards/*.json');
  return Object.fromEntries(
    Object.entries(modules).map(([path, load]) => [path.replace(/^.*\/(.+)\.json$/, '$1'), load]),
  );
}

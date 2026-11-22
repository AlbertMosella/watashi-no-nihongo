import { lazy, Suspense, useState, useSyncExternalStore } from 'react';
import { useDocumentSettings, useSearchDeck, useSetting, useUpdateSettings } from '@/app/hooks';
import { useT } from '@/app/i18n';
import type { Section } from '@/domain/settings';
import { Icon, IconButton, SegmentedControl } from '@/ui/components';
import { cx } from '@/ui/components';
import { Deck } from './features/deck/Deck';
import { SearchBar } from './features/search/SearchBar';
import styles from './App.module.css';

// Els panells no calen per al primer pintat: es carreguen a part.
const SettingsSheet = lazy(() => import('./features/settings/SettingsSheet').then((m) => ({ default: m.SettingsSheet })));
// L'apartat de converses es carrega només quan s'hi entra.
const Conversations = lazy(() => import('./features/conversations/Conversations').then((m) => ({ default: m.Conversations })));
const CategorySheet = lazy(() => import('./features/settings/CategorySheet').then((m) => ({ default: m.CategorySheet })));
// La benvinguda només surt el primer cop: no cal carregar-la per a la resta de visites.
const Onboarding = lazy(() => import('./features/onboarding/Onboarding').then((m) => ({ default: m.Onboarding })));
const UpdatePrompt = lazy(() => import('./features/update/UpdatePrompt').then((m) => ({ default: m.UpdatePrompt })));

type Panel = 'none' | 'settings' | 'categories';

export function App() {
  useDocumentSettings();
  const onboarded = useSetting('onboarded');

  return (
    <>
      <Suspense fallback={null}>{onboarded ? <Main /> : <Onboarding />}</Suspense>
      <Suspense fallback={null}>
        <UpdatePrompt />
      </Suspense>
    </>
  );
}

/** Pantalla principal: barra d'eines amb els dos apartats (targetes i converses) i els panells. */
function Main() {
  const t = useT();
  const section = useSetting('section');
  const update = useUpdateSettings();
  const [panel, setPanel] = useState<Panel>('none');
  const [opened, setOpened] = useState<ReadonlySet<Panel>>(new Set());
  const categoryIds = useSetting('categoryIds');
  const online = useOnline();

  // Cerca de text (no es desa: és una consulta puntual).
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const searchState = useSearchDeck(query);
  const searching = section === 'cards' && searchOpen && query.trim().length > 0;
  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
  };

  const open = (p: Panel) => {
    setOpened((s) => new Set(s).add(p));
    setPanel(p);
  };
  const close = () => setPanel('none');


  return (
    <div className={cx(styles.app, section === 'cards' && searchOpen && styles.withSearch)}>
      {section === 'cards' ? (
        <Deck
          onOpenFilters={() => open('categories')}
          keyboardEnabled={panel === 'none'}
          search={searching ? { query, state: searchState } : null}
        />
      ) : (
        <Suspense fallback={null}>
          <Conversations />
        </Suspense>
      )}

      <header className={styles.toolbar}>
        <SegmentedControl<Section>
          label={t('section.label')}
          hideLabel
          className={styles.sections}
          value={section}
          options={[
            { value: 'cards', label: t('section.cards') },
            { value: 'conversations', label: t('section.conversations') },
          ]}
          onChange={(value) => update({ section: value })}
        />
        <div className={styles.toolbarEnd}>
          {!online && (
            <span className={styles.offline} title={t('offline.badge')}>
              <Icon name="offline" size={16} />
              <span className="visually-hidden">{t('offline.badge')}</span>
            </span>
          )}
          {section === 'cards' && (
            <IconButton
              icon={searchOpen ? 'close' : 'search'}
              label={searchOpen ? t('search.clear') : t('search.open')}
              aria-pressed={searchOpen}
              onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            />
          )}
          {section === 'cards' && !searchOpen && (
            <span className={styles.filter}>
              <IconButton icon="layers" label={t('filters.icon')} onClick={() => open('categories')} />
              {categoryIds.length > 0 && (
                <span className={styles.count} aria-hidden="true">
                  {categoryIds.length}
                </span>
              )}
            </span>
          )}
          <IconButton icon="settings" label={t('settings.open')} onClick={() => open('settings')} />
        </div>
      </header>

      {section === 'cards' && searchOpen && (
        <SearchBar
          query={query}
          onChange={setQuery}
          onClose={closeSearch}
          count={searching && searchState.status === 'ready' ? searchState.cards.length : null}
        />
      )}

      <Suspense fallback={null}>
        {opened.has('settings') && <SettingsSheet open={panel === 'settings'} onClose={close} />}
        {opened.has('categories') && <CategorySheet open={panel === 'categories'} onClose={close} />}
      </Suspense>
    </div>
  );
}

function useOnline(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('online', cb);
      window.addEventListener('offline', cb);
      return () => {
        window.removeEventListener('online', cb);
        window.removeEventListener('offline', cb);
      };
    },
    () => navigator.onLine,
  );
}

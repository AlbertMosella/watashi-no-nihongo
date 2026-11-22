import { lazy, Suspense, useState, useSyncExternalStore } from 'react';
import { useDocumentSettings, useSetting } from '@/app/hooks';
import { categoryLabelKey, useT } from '@/app/i18n';
import { Icon, IconButton } from '@/ui/components';
import { Deck } from './features/deck/Deck';
import styles from './App.module.css';

// Els panells no calen per al primer pintat: es carreguen a part.
const SettingsSheet = lazy(() => import('./features/settings/SettingsSheet').then((m) => ({ default: m.SettingsSheet })));
const CategorySheet = lazy(() => import('./features/settings/CategorySheet').then((m) => ({ default: m.CategorySheet })));
const UpdatePrompt = lazy(() => import('./features/update/UpdatePrompt').then((m) => ({ default: m.UpdatePrompt })));

type Panel = 'none' | 'settings' | 'categories';

export function App() {
  useDocumentSettings();
  const t = useT();
  const [panel, setPanel] = useState<Panel>('none');
  const [opened, setOpened] = useState<ReadonlySet<Panel>>(new Set());
  const categoryIds = useSetting('categoryIds');
  const online = useOnline();

  const open = (p: Panel) => {
    setOpened((s) => new Set(s).add(p));
    setPanel(p);
  };
  const close = () => setPanel('none');

  const filterLabel =
    categoryIds.length === 1 ? t(categoryLabelKey(categoryIds[0]!)) : `${t('filters.open')} · ${categoryIds.length}`;

  return (
    <div className={styles.app}>
      <Deck onOpenFilters={() => open('categories')} keyboardEnabled={panel === 'none'} />

      <header className={styles.toolbar}>
        <button type="button" className={styles.filterButton} onClick={() => open('categories')}>
          <Icon name="layers" size={18} />
          <span>{filterLabel}</span>
        </button>
        <div className={styles.toolbarEnd}>
          {!online && (
            <span className={styles.offline} title={t('offline.badge')}>
              <Icon name="offline" size={16} />
              <span className="visually-hidden">{t('offline.badge')}</span>
            </span>
          )}
          <IconButton icon="settings" label={t('settings.open')} onClick={() => open('settings')} />
        </div>
      </header>

      <Suspense fallback={null}>
        {opened.has('settings') && <SettingsSheet open={panel === 'settings'} onClose={close} />}
        {opened.has('categories') && <CategorySheet open={panel === 'categories'} onClose={close} />}
        <UpdatePrompt />
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

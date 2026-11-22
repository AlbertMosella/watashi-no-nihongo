import { useSyncExternalStore } from 'react';
import { useT } from '@/app/i18n';
import { useServices } from '@/app/services';
import { Button, Toast } from '@/ui/components';

/** Avís de versió nova. */
export function UpdatePrompt() {
  const t = useT();
  const { updates } = useServices();
  const { needRefresh } = useSyncExternalStore(updates.subscribe, updates.getSnapshot);

  if (!needRefresh) return null;

  return (
    <Toast
      message={t('update.available')}
      actions={
        <>
          <Button size="sm" variant="primary" onClick={() => updates.applyUpdate()}>
            {t('update.action')}
          </Button>
          <Button size="sm" variant="ghost" icon="close" aria-label={t('update.dismiss')} onClick={() => updates.dismiss()} />
        </>
      }
    />
  );
}

import { useId } from 'react';
import { useInstall, useSetting, useUpdateSettings } from '@/app/hooks';
import { LANGUAGE_ENDONYMS, useT, type MessageKey } from '@/app/i18n';
import type { InstallMode } from '@/app/installPrompt';
import { STUDENT_LANGUAGES, type StudentLanguage } from '@/domain/language';
import { Button, Icon, SegmentedControl, type IconName } from '@/ui/components';
import styles from './Onboarding.module.css';

const POINTS: readonly { icon: IconName; text: MessageKey }[] = [
  { icon: 'cards', text: 'onboarding.cards' },
  { icon: 'chat', text: 'onboarding.conversations' },
  { icon: 'swap', text: 'onboarding.front' },
];

/** Text del punt d'instal·lació segons el dispositiu (no surt si ja està instal·lada). */
const INSTALL_TEXT: Readonly<Record<Exclude<InstallMode, 'installed'>, MessageKey>> = {
  prompt: 'onboarding.install',
  ios: 'onboarding.installIos',
  manual: 'onboarding.installManual',
};

/**
 * Pantalla de benvinguda (només el primer cop). En triar l'idioma, tota la pantalla
 * canvia d'idioma a l'instant; "Començar" desa `onboarded` i ja no torna a sortir.
 */
export function Onboarding() {
  const t = useT();
  const language = useSetting('language');
  const update = useUpdateSettings();
  const titleId = useId();
  const install = useInstall();

  return (
    <main className={styles.screen} aria-labelledby={titleId}>
      <div className={styles.content}>
        <div className={styles.illustration} aria-hidden="true">
          <div className={styles.cardBack} data-hue="" />
          <div className={styles.cardFront} data-hue="">
            <span className={styles.faceA}>a</span>
            <span className={styles.faceB} lang="ja">
              あ
            </span>
          </div>
        </div>

        <header className={styles.header}>
          <h1 id={titleId} className={styles.title}>
            Watashi no Nihongo
          </h1>
          <p className={styles.kanji} lang="ja">
            私の日本語
          </p>
          <p className={styles.subtitle}>{t('onboarding.subtitle')}</p>
        </header>

        <ul className={styles.points}>
          {POINTS.map((p) => (
            <li key={p.text}>
              <span className={styles.pointIcon} aria-hidden="true">
                <Icon name={p.icon} size={18} />
              </span>
              <span>{t(p.text)}</span>
            </li>
          ))}
          {install.mode !== 'installed' && (
            <li>
              <span className={styles.pointIcon} aria-hidden="true">
                <Icon name="install" size={18} />
              </span>
              <span className={styles.installText}>{t(INSTALL_TEXT[install.mode])}</span>
              {install.mode === 'prompt' && (
                <Button size="sm" className={styles.install} onClick={() => void install.prompt()}>
                  {t('onboarding.installAction')}
                </Button>
              )}
            </li>
          )}
        </ul>

        <SegmentedControl<StudentLanguage>
          label={t('onboarding.language')}
          value={language}
          options={STUDENT_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_ENDONYMS[l] }))}
          onChange={(value) => update({ language: value })}
        />

        <Button variant="primary" className={styles.start} onClick={() => update({ onboarded: true })}>
          {t('onboarding.start')}
        </Button>
      </div>
    </main>
  );
}

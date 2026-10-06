import { useLocalSearchParams } from 'expo-router';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';

const PAGES: Record<string, { title: TranslationKey; paragraphs: TranslationKey[] }> = {
  about: { title: 'about.title', paragraphs: ['about.p1', 'about.p2', 'about.p3'] },
  privacy: { title: 'privacy.title', paragraphs: ['privacy.p1', 'privacy.p2', 'privacy.p3', 'privacy.p4'] },
  sources: {
    title: 'sources.title',
    paragraphs: [
      'sources.intro',
      'sources.quran',
      'sources.translations',
      'sources.hadith',
      'sources.seerah',
      'sources.recitation',
      'sources.disclaimer',
    ],
  },
};

export default function InfoPage() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const { t } = useI18n();
  const config = PAGES[String(page)];

  if (!config) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="info" title={t('notFound.title')} />
      </Screen>
    );
  }

  return (
    <Screen header={<TopBar title={t(config.title)} />}>
      {config.paragraphs.map((key) => (
        <Card key={key}>
          <AppText variant="body">{t(key)}</AppText>
        </Card>
      ))}
    </Screen>
  );
}

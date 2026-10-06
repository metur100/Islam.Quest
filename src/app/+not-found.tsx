import { router } from 'expo-router';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { useI18n } from '@/hooks/useI18n';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <Screen scroll={false} contentStyle={{ justifyContent: 'center' }}>
      <EmptyState
        icon="map"
        title={t('notFound.title')}
        body={t('notFound.body')}
        actionLabel={t('notFound.home')}
        onAction={() => router.replace('/')}
      />
    </Screen>
  );
}

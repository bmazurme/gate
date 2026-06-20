import { Link } from 'react-router-dom';
import { Flex, Text, Card, Button, Loader, Label } from '@gravity-ui/uikit';
import { useGetMyActiveSubscriptionQuery } from '../store/api/subscriptionsApi/subscriptionsApi';
import type { SubscriptionStatus } from '../store/api/subscriptionsApi/types';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

const STATUS_THEME: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'utility'> = {
  active: 'success',
  pending: 'warning',
  canceled: 'danger',
  expired: 'utility',
};

export function DashboardPage() {
  const { data: subscription, isLoading } = useGetMyActiveSubscriptionQuery();

  return (
    <Flex direction="column" gap={5} width="100%">
      <Card view="outlined" type="container" spacing={{ p: 5 }}>
        {isLoading ? (
          <Loader size="m" />
        ) : subscription ? (
          <Flex direction="column" gap={3}>
            <Flex alignItems="center" gap={2}>
              <Text variant="subheader-1">
                {t('dashboard_active_subscription', { plan: ts(`plan_${subscription.plan}`) })}
              </Text>
              <Label theme={STATUS_THEME[subscription.status]}>
                {ts(`status_${subscription.status}`)}
              </Label>
            </Flex>
            <Text color="secondary">
              {t('dashboard_price_valid_until', {
                price: subscription.price,
                currency: subscription.currency,
                date: subscription.endDate
                  ? new Date(subscription.endDate).toLocaleDateString()
                  : '—',
              })}
            </Text>
            <Flex gap={2}>
              <Button view="normal" component={Link} to={`/subscriptions/${subscription.id}`}>
                {t('dashboard_view_details')}
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex direction="column" gap={3}>
            <Text color="secondary">{t('dashboard_no_subscription')}</Text>
            <Button view="action" component={Link} to="/plans" width="max">
              {t('dashboard_choose_plan')}
            </Button>
          </Flex>
        )}
      </Card>
    </Flex>
  );
}

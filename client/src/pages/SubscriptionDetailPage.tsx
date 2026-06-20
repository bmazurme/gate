import { Link, useParams, Navigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Flex, Text, Card, Button, Loader, Label, Table, Alert } from '@gravity-ui/uikit';
import {
  useGetSubscriptionQuery,
  useCancelSubscriptionMutation,
} from '../store/api/subscriptionsApi/subscriptionsApi';
import type { SubscriptionStatus } from '../store/api/subscriptionsApi/types';
import { useGetPaymentsBySubscriptionQuery } from '../store/api/paymentsApi/paymentsApi';
import type { Payment } from '../store/api/paymentsApi/types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

const STATUS_THEME: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'utility'> = {
  active: 'success',
  pending: 'warning',
  canceled: 'danger',
  expired: 'utility',
};

export function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: subscription, isLoading } = useGetSubscriptionQuery(id ?? skipToken);
  const { data: payments, isLoading: isLoadingPayments } = useGetPaymentsBySubscriptionQuery(
    id ?? skipToken,
  );
  const [cancelSubscription, { isLoading: isCanceling, error }] = useCancelSubscriptionMutation();

  if (!id) {
    return <Navigate to="/subscriptions" replace />;
  }

  if (isLoading) {
    return <Loader size="l" />;
  }

  if (!subscription) {
    return <Text>{t('subscription_detail_not_found')}</Text>;
  }

  return (
    <Flex direction="column" gap={5} width="100%">
      {error && <Alert theme="danger" message={getErrorMessage(error)} />}
      <Card view="outlined" type="container" spacing={{ p: 5 }}>
        <Flex direction="column" gap={3}>
          <Flex alignItems="center" gap={2}>
            <Text variant="subheader-1">{ts(`plan_${subscription.plan}`)}</Text>
            <Label theme={STATUS_THEME[subscription.status]}>
              {ts(`status_${subscription.status}`)}
            </Label>
          </Flex>
          <Text color="secondary">
            {t('subscription_detail_price', {
              price: subscription.price,
              currency: subscription.currency,
            })}
          </Text>
          <Text color="secondary">
            {t('subscription_detail_start', {
              date: subscription.startDate
                ? new Date(subscription.startDate).toLocaleString()
                : '—',
            })}
          </Text>
          <Text color="secondary">
            {t('subscription_detail_end', {
              date: subscription.endDate ? new Date(subscription.endDate).toLocaleString() : '—',
            })}
          </Text>
          <Button view="outlined" width="max" component={Link} to={`/subscriptions/${subscription.id}/edit`}>
            {t('subscription_detail_edit')}
          </Button>
          {subscription.status !== 'canceled' && (
            <Button
              view="outlined-danger"
              width="max"
              loading={isCanceling}
              onClick={() => cancelSubscription(subscription.id)}
            >
              {t('subscription_detail_cancel')}
            </Button>
          )}
        </Flex>
      </Card>

      <Text variant="subheader-1">{t('subscription_detail_payments_title')}</Text>
      {isLoadingPayments ? (
        <Loader />
      ) : (
        <Card view="outlined" type="container" overflow="hidden">
          <Table<Payment>
            data={payments ?? []}
            verticalAlign="middle"
            getRowDescriptor={(item) => ({ id: item.id, interactive: true })}
            columns={[
              {
                id: 'amount',
                name: t('payments_column_amount'),
                primary: true,
                template: (item) => `${item.amount} ${item.currency}`,
              },
              { id: 'status', name: t('payments_column_status') },
              { id: 'provider', name: t('payments_column_provider') },
              {
                id: 'createdAt',
                name: t('payments_column_date'),
                template: (item) => new Date(item.createdAt).toLocaleString(),
              },
            ]}
          />
        </Card>
      )}
    </Flex>
  );
}

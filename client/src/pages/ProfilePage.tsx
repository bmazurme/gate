import { Flex, Text, Card, Loader, Button, Alert, Icon } from '@gravity-ui/uikit';
import { Check } from '@gravity-ui/icons';
import { useMeQuery } from '../store/api/authApi/authApi';
import {
  useGetMyActiveSubscriptionQuery,
  useCancelSubscriptionMutation,
} from '../store/api/subscriptionsApi/subscriptionsApi';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

export function ProfilePage() {
  const { data: user, isLoading } = useMeQuery();
  const { data: activeSubscription } = useGetMyActiveSubscriptionQuery();
  const [cancelSubscription, { isLoading: isCanceling, error: cancelError }] =
    useCancelSubscriptionMutation();

  if (isLoading) {
    return <Loader size="l" />;
  }

  if (!user) {
    return <Text>{t('profile_not_found')}</Text>;
  }

  return (
    <Flex direction="column" gap={5} width="100%">
      {cancelError && <Alert theme="danger" message={getErrorMessage(cancelError)} />}

      <Card view="outlined" type="container" spacing={{ p: 5 }} width={400}>
        <Flex direction="column" gap={3}>
          <Flex direction="column" gap={1}>
            <Text color="secondary">{t('profile_email_label')}</Text>
            <Text variant="subheader-1">{user.email}</Text>
          </Flex>
          <Flex direction="column" gap={1}>
            <Text color="secondary">{t('profile_name_label')}</Text>
            <Text variant="subheader-1">{user.name ?? '—'}</Text>
          </Flex>
          <Flex direction="column" gap={1}>
            <Text color="secondary">{t('profile_registered_label')}</Text>
            <Text variant="subheader-1">{new Date(user.createdAt).toLocaleString()}</Text>
          </Flex>
        </Flex>
      </Card>

      <Card
        view="outlined"
        type="container"
        theme={activeSubscription ? 'success' : 'normal'}
        spacing={{ p: 5 }}
        width={400}
      >
        {activeSubscription ? (
          <Flex alignItems="center" gap={4} wrap="wrap">
            <Icon data={Check} size={20} style={{ color: 'var(--g-color-text-positive)' }} />
            <Flex direction="column" grow={1} style={{ minWidth: 200 }}>
              <Text variant="subheader-2">{t('profile_subscription_active')}</Text>
              <Text color="secondary">
                {t('profile_plan_valid_until', {
                  plan: ts(`plan_${activeSubscription.plan}`),
                  date: activeSubscription.endDate
                    ? new Date(activeSubscription.endDate).toLocaleDateString()
                    : '—',
                })}
              </Text>
            </Flex>
            <Button
              view="outlined-danger"
              loading={isCanceling}
              onClick={() => cancelSubscription(activeSubscription.id)}
            >
              {t('profile_cancel_subscription')}
            </Button>
          </Flex>
        ) : (
          <Text color="secondary">{t('profile_no_subscription')}</Text>
        )}
      </Card>
    </Flex>
  );
}

import { Flex, Text, Card, Button, Loader, Alert, Label, Icon } from '@gravity-ui/uikit';
import { Check } from '@gravity-ui/icons';
import {
  useGetPlansQuery,
  useGetMyActiveSubscriptionQuery,
  useSubscribeMutation,
} from '../store/api/subscriptionsApi/subscriptionsApi';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

export function PlansPage() {
  const { data: plans, isLoading } = useGetPlansQuery();
  const { data: activeSubscription } = useGetMyActiveSubscriptionQuery();
  const [subscribe, { isLoading: isSubscribing, error: subscribeError }] = useSubscribeMutation();

  if (isLoading) {
    return <Loader size="l" />;
  }

  return (
    <Flex direction="column" gap={5} width="100%">
      {subscribeError && <Alert theme="danger" message={getErrorMessage(subscribeError)} />}

      <Flex gap={4} wrap="wrap" alignItems="stretch">
        {plans?.map((plan) => {
          const isCurrent = activeSubscription?.plan === plan.plan;
          return (
            <Card
              key={plan.plan}
              view="outlined"
              type="container"
              theme={isCurrent ? 'info' : 'normal'}
              width={260}
              spacing={{ p: 5 }}
            >
              <Flex direction="column" gap={3} height="100%">
                <Flex alignItems="center" justifyContent="space-between">
                  <Text variant="subheader-2">{ts(`plan_${plan.plan}`)}</Text>
                  {isCurrent && (
                    <Label theme="info" icon={<Icon data={Check} size={12} />}>
                      {t('plans_current_label')}
                    </Label>
                  )}
                </Flex>
                <Text variant="header-1">
                  {plan.price} {plan.currency}
                </Text>
                <Text color="secondary">{t('plans_duration_days', { days: plan.durationDays })}</Text>
                <Flex direction="column" gap={1} grow={1}>
                  {plan.features.map((feature) => (
                    <Text key={feature}>• {feature}</Text>
                  ))}
                </Flex>
                {isCurrent ? (
                  <Button view="outlined" width="max" disabled>
                    {t('plans_current_plan_button')}
                  </Button>
                ) : (
                  <Button
                    view="action"
                    width="max"
                    disabled={Boolean(activeSubscription)}
                    loading={isSubscribing}
                    title={activeSubscription ? t('plans_switch_tooltip') : undefined}
                    onClick={() => subscribe({ plan: plan.plan })}
                  >
                    {activeSubscription ? t('plans_switch_button') : t('plans_subscribe_button')}
                  </Button>
                )}
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Flex>
  );
}

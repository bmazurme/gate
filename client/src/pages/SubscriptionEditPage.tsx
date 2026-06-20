import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Flex, Text, Card, TextInput, Button, Alert, Loader } from '@gravity-ui/uikit';
import {
  useGetSubscriptionQuery,
  useUpdateSubscriptionMutation,
} from '../store/api/subscriptionsApi/subscriptionsApi';
import type { Subscription } from '../store/api/subscriptionsApi/types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

export function SubscriptionEditPage() {
  const { id } = useParams<{ id: string }>();
  const { data: subscription, isLoading } = useGetSubscriptionQuery(id ?? skipToken);

  if (!id) {
    return <Navigate to="/subscriptions" replace />;
  }

  if (isLoading) {
    return <Loader size="l" />;
  }

  if (!subscription) {
    return <Text>{t('subscription_detail_not_found')}</Text>;
  }

  return <SubscriptionEditForm subscription={subscription} />;
}

function SubscriptionEditForm({ subscription }: { subscription: Subscription }) {
  const navigate = useNavigate();
  const [updateSubscription, { isLoading: isSaving, error }] = useUpdateSubscriptionMutation();
  const [price, setPrice] = useState(String(subscription.price));
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const parsedPrice = Number(price);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setValidationError(t('subscription_edit_invalid_price'));
      return;
    }
    setValidationError(null);

    try {
      await updateSubscription({ id: subscription.id, price: parsedPrice }).unwrap();
      navigate(`/subscriptions/${subscription.id}`);
    } catch {
      // ошибка отображается через `error` из хука мутации
    }
  };

  return (
    <Flex direction="column" gap={5} width="100%">
      <Card view="outlined" type="container" spacing={{ p: 5 }} width={400}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={4}>
            {(validationError || error) && (
              <Alert theme="danger" message={validationError ?? getErrorMessage(error)} />
            )}
            <Flex direction="column" gap={1}>
              <Text color="secondary">{t('subscription_edit_plan_label')}</Text>
              <Text variant="subheader-1">{ts(`plan_${subscription.plan}`)}</Text>
            </Flex>
            <TextInput
              type="number"
              label={t('subscription_edit_price_label')}
              value={price}
              onUpdate={setPrice}
              size="l"
            />
            <Button view="action" size="l" type="submit" loading={isSaving} width="max">
              {t('subscription_edit_save')}
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
}

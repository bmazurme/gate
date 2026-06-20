import { useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Flex, Text, Card, TextInput, Button, Alert, Loader } from '@gravity-ui/uikit';
import {
  useGetPlanQuery,
  useUpdatePlanMutation,
} from '../store/api/subscriptionsApi/subscriptionsApi';
import type { PlanDefinition, SubscriptionPlan } from '../store/api/subscriptionsApi/types';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

const VALID_PLANS: SubscriptionPlan[] = ['basic', 'extended', 'max'];

function isSubscriptionPlan(value: string | undefined): value is SubscriptionPlan {
  return Boolean(value) && VALID_PLANS.includes(value as SubscriptionPlan);
}

export function PlanEditPage() {
  const { plan } = useParams<{ plan: string }>();
  const validPlan = isSubscriptionPlan(plan) ? plan : undefined;
  const { data: planDefinition, isLoading } = useGetPlanQuery(validPlan ?? skipToken);

  if (!validPlan) {
    return <Navigate to="/admin/plans" replace />;
  }

  if (isLoading) {
    return <Loader size="l" />;
  }

  if (!planDefinition) {
    return <Text>{t('plans_admin_not_found')}</Text>;
  }

  return <PlanEditForm plan={planDefinition} />;
}

function PlanEditForm({ plan }: { plan: PlanDefinition }) {
  const navigate = useNavigate();
  const [updatePlan, { isLoading: isSaving, error }] = useUpdatePlanMutation();
  const [price, setPrice] = useState(String(plan.price));
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
      await updatePlan({ plan: plan.plan, price: parsedPrice }).unwrap();
      navigate('/admin/plans');
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
              <Text color="secondary">{t('plans_admin_column_plan')}</Text>
              <Text variant="subheader-1">{ts(`plan_${plan.plan}`)}</Text>
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

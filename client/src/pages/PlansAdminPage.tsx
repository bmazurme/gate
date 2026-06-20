import { Link } from 'react-router-dom';
import { Flex, Table, Loader, Card, Button } from '@gravity-ui/uikit';
import { useGetPlansQuery } from '../store/api/subscriptionsApi/subscriptionsApi';
import type { PlanDefinition } from '../store/api/subscriptionsApi/types';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

export function PlansAdminPage() {
  const { data: plans, isLoading } = useGetPlansQuery();

  if (isLoading) {
    return <Loader size="l" />;
  }

  return (
    <Flex direction="column" gap={5} width="100%">
      <Card view="outlined" type="container" overflow="hidden">
        <Table<PlanDefinition>
          data={plans ?? []}
          width="max"
          verticalAlign="middle"
          getRowDescriptor={(item) => ({ id: item.plan, interactive: true })}
          columns={[
            {
              id: 'plan',
              name: t('plans_admin_column_plan'),
              primary: true,
              template: (item) => ts(`plan_${item.plan}`),
            },
            {
              id: 'price',
              name: t('plans_admin_column_price'),
              template: (item) => `${item.price} ${item.currency}`,
            },
            {
              id: 'durationDays',
              name: t('plans_admin_column_duration'),
              template: (item) => t('plans_duration_days', { days: item.durationDays }),
            },
            {
              id: 'actions',
              name: '',
              align: 'end',
              template: (item) => (
                <Button size="s" component={Link} to={`/admin/plans/${item.plan}/edit`}>
                  {t('plans_admin_edit_button')}
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </Flex>
  );
}

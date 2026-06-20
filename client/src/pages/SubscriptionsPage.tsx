import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flex, Table, Loader, Label, Button, Card, Pagination } from '@gravity-ui/uikit';
import { useGetMySubscriptionsQuery } from '../store/api/subscriptionsApi/subscriptionsApi';
import type { Subscription, SubscriptionStatus } from '../store/api/subscriptionsApi/types';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

const STATUS_THEME: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'utility'> = {
  active: 'success',
  pending: 'warning',
  canceled: 'danger',
  expired: 'utility',
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function SubscriptionsPage() {
  const { data: subscriptions, isLoading } = useGetMySubscriptionsQuery();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim().toLowerCase() ?? '';
  const page = parsePositiveInt(searchParams.get('page'), 1);
  const rawPageSize = parsePositiveInt(searchParams.get('pageSize'), PAGE_SIZE_OPTIONS[0]);
  const pageSize = PAGE_SIZE_OPTIONS.includes(rawPageSize) ? rawPageSize : PAGE_SIZE_OPTIONS[0];

  // Сбрасываем страницу на первую при изменении поискового запроса, но не на
  // первом рендере — иначе слетит page, открытый по прямой ссылке с ?page=N.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', '1');
        return next;
      },
      { replace: true },
    );
    // setSearchParams пересоздаётся при каждом изменении searchParams (react-router),
    // поэтому его нельзя включать в зависимости — иначе эффект будет сбрасывать
    // страницу сразу после любого обновления URL, включая клик по пагинации.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (isLoading) {
    return <Loader size="l" />;
  }

  const filteredSubscriptions = (subscriptions ?? []).filter(
    (subscription) =>
      !query ||
      subscription.plan.toLowerCase().includes(query) ||
      subscription.status.toLowerCase().includes(query),
  );
  const pagedSubscriptions = filteredSubscriptions.slice((page - 1) * pageSize, page * pageSize);

  const handlePaginationUpdate = (nextPage: number, nextPageSize: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(nextPage));
      next.set('pageSize', String(nextPageSize));
      return next;
    });
  };

  return (
    <Flex direction="column" gap={5} width="100%">
      <Card view="outlined" type="container" overflow="hidden">
        <Table<Subscription>
          data={pagedSubscriptions}
          width="max"
          verticalAlign="middle"
          getRowDescriptor={(item) => ({ id: item.id, interactive: true })}
          columns={[
            {
              id: 'plan',
              name: t('subscriptions_column_plan'),
              primary: true,
              template: (item) => ts(`plan_${item.plan}`),
            },
            {
              id: 'status',
              name: t('subscriptions_column_status'),
              template: (item) => (
                <Label theme={STATUS_THEME[item.status]}>{ts(`status_${item.status}`)}</Label>
              ),
            },
            {
              id: 'price',
              name: t('subscriptions_column_price'),
              template: (item) => `${item.price} ${item.currency}`,
            },
            {
              id: 'endDate',
              name: t('subscriptions_column_valid_until'),
              template: (item) =>
                item.endDate ? new Date(item.endDate).toLocaleDateString() : '—',
            },
            {
              id: 'actions',
              name: '',
              align: 'end',
              template: (item) => (
                <Button size="s" component={Link} to={`/subscriptions/${item.id}`}>
                  {t('subscriptions_details_button')}
                </Button>
              ),
            },
          ]}
        />
      </Card>
      <Flex justifyContent="flex-end">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredSubscriptions.length}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePaginationUpdate}
        />
      </Flex>
    </Flex>
  );
}

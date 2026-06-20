import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Flex, Table, Loader, Card, Pagination, Label, Button } from '@gravity-ui/uikit';
import { useListUsersQuery } from '../store/api/usersApi/usersApi';
import type { AuthUser } from '../store/api/authApi/types';
import type { PaginatedUsers } from '../store/api/usersApi/types';
import { useAppSelector } from '../hooks/hooks';
import { t } from './i18n';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function UsersPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAdmin = Boolean(currentUser?.roles.includes('admin'));
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('q')?.trim() ?? '';
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
  }, [search]);

  const { data, isLoading } = useListUsersQuery({ page, pageSize, search: search || undefined });
  // Сохраняем последний успешный результат, чтобы при смене страницы/поиска
  // таблица не мигала пустым состоянием, пока грузится следующий запрос.
  const [lastData, setLastData] = useState<PaginatedUsers>();
  if (data && data !== lastData) {
    setLastData(data);
  }

  const users = data ?? lastData;

  if (isLoading && !users) {
    return <Loader size="l" />;
  }

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
        <Table<AuthUser>
          data={users?.data ?? []}
          width="max"
          verticalAlign="middle"
          getRowDescriptor={(item) => ({ id: item.id, interactive: true })}
          columns={[
            { id: 'email', name: t('users_column_email'), primary: true },
            { id: 'name', name: t('users_column_name'), placeholder: '—' },
            {
              id: 'roles',
              name: t('users_column_roles'),
              template: (item) =>
                item.roles.includes('admin') ? (
                  <Label theme="info">{t('users_role_admin')}</Label>
                ) : null,
            },
            {
              id: 'isBlocked',
              name: t('users_column_status'),
              template: (item) => (
                <Label theme={item.isBlocked ? 'danger' : 'success'}>
                  {item.isBlocked ? t('users_status_blocked') : t('users_status_active')}
                </Label>
              ),
            },
            {
              id: 'createdAt',
              name: t('users_column_registered'),
              template: (item) => new Date(item.createdAt).toLocaleDateString(),
            },
            ...(isAdmin
              ? [
                  {
                    id: 'actions',
                    name: '',
                    align: 'end' as const,
                    template: (item: AuthUser) =>
                      item.id === currentUser?.id ? null : (
                        <Button size="s" component={Link} to={`/users/${item.id}/edit`}>
                          {t('users_edit_button')}
                        </Button>
                      ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
      <Flex justifyContent="flex-end">
        <Pagination
          page={page}
          pageSize={pageSize}
          total={users?.total ?? 0}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onUpdate={handlePaginationUpdate}
        />
      </Flex>
    </Flex>
  );
}

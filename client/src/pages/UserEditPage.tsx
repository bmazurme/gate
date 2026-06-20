import { useParams, Navigate } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query/react';
import { Flex, Text, Card, Switch, Alert, Loader } from '@gravity-ui/uikit';
import {
  useGetUserQuery,
  useUpdateUserRolesMutation,
  useUpdateUserBlockedMutation,
} from '../store/api/usersApi/usersApi';
import { useAppSelector } from '../hooks/hooks';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t } from './i18n';

export function UserEditPage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: user, isLoading } = useGetUserQuery(id ?? skipToken);
  const [updateRoles, { isLoading: isSavingRoles, error: rolesError }] =
    useUpdateUserRolesMutation();
  const [updateBlocked, { isLoading: isSavingBlocked, error: blockedError }] =
    useUpdateUserBlockedMutation();

  if (!id || !currentUser?.roles.includes('admin')) {
    return <Navigate to="/users" replace />;
  }

  if (isLoading) {
    return <Loader size="l" />;
  }

  if (!user) {
    return <Text>{t('user_edit_not_found')}</Text>;
  }

  const isSelf = currentUser?.id === user.id;
  const isAdmin = user.roles.includes('admin');

  return (
    <Flex direction="column" gap={5} width="100%">
      {rolesError && <Alert theme="danger" message={getErrorMessage(rolesError)} />}
      {blockedError && <Alert theme="danger" message={getErrorMessage(blockedError)} />}
      <Card view="outlined" type="container" spacing={{ p: 5 }} width={400}>
        <Flex direction="column" gap={4}>
          <Flex direction="column" gap={1}>
            <Text color="secondary">{t('user_edit_email_label')}</Text>
            <Text variant="subheader-1">{user.email}</Text>
          </Flex>

          {isSelf ? (
            <Alert theme="info" message={t('user_edit_self_notice')} />
          ) : (
            <>
              <Switch
                checked={isAdmin}
                loading={isSavingRoles}
                onUpdate={(checked) =>
                  updateRoles({ id: user.id, roles: checked ? ['admin'] : ['user'] })
                }
              >
                {t('user_edit_admin_switch')}
              </Switch>
              <Switch
                checked={user.isBlocked}
                loading={isSavingBlocked}
                onUpdate={(checked) => updateBlocked({ id: user.id, isBlocked: checked })}
              >
                {t('user_edit_blocked_switch')}
              </Switch>
            </>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}

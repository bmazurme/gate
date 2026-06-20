import { Flex, Text, Card, Button, Alert } from '@gravity-ui/uikit';
import {
  useLazyCheckBasicAccessQuery,
  useLazyCheckExtendedAccessQuery,
  useLazyCheckMaxAccessQuery,
  useLazyCheckUserRoleAccessQuery,
  useLazyCheckAdminRoleAccessQuery,
} from '../store/api/accessDemoApi/accessDemoApi';
import { getErrorMessage } from '../utils/getErrorMessage';
import { t as ts } from '../shared/i18n';
import { t } from './i18n';

export function AccessDemoPage() {
  const [checkBasic, basicResult] = useLazyCheckBasicAccessQuery();
  const [checkExtended, extendedResult] = useLazyCheckExtendedAccessQuery();
  const [checkMax, maxResult] = useLazyCheckMaxAccessQuery();
  const [checkUserRole, userRoleResult] = useLazyCheckUserRoleAccessQuery();
  const [checkAdminRole, adminRoleResult] = useLazyCheckAdminRoleAccessQuery();

  const planTiers = [
    {
      title: ts('plan_basic'),
      description: t('access_demo_basic_description'),
      trigger: checkBasic,
      result: basicResult,
    },
    {
      title: ts('plan_extended'),
      description: t('access_demo_extended_description'),
      trigger: checkExtended,
      result: extendedResult,
    },
    {
      title: ts('plan_max'),
      description: t('access_demo_max_description'),
      trigger: checkMax,
      result: maxResult,
    },
  ];

  const roleTiers = [
    {
      title: t('access_demo_role_user_label'),
      description: t('access_demo_role_user_description'),
      trigger: checkUserRole,
      result: userRoleResult,
    },
    {
      title: t('access_demo_role_admin_label'),
      description: t('access_demo_role_admin_description'),
      trigger: checkAdminRole,
      result: adminRoleResult,
    },
  ];

  return (
    <Flex direction="column" gap={7} width="100%">
      <Flex direction="column" gap={4}>
        <Flex direction="column" gap={1}>
          <Text variant="subheader-2">{t('access_demo_by_plan_title')}</Text>
          <Text color="secondary">{t('access_demo_description')}</Text>
        </Flex>
        <Flex gap={4} wrap="wrap">
          {planTiers.map((tier) => (
            <Card key={tier.title} view="outlined" type="container" width={300} spacing={{ p: 5 }}>
              <Flex direction="column" gap={3}>
                <Text variant="subheader-2">{tier.title}</Text>
                <Text color="secondary">{tier.description}</Text>
                <Button
                  view="action"
                  loading={tier.result.isFetching}
                  onClick={() => tier.trigger()}
                >
                  {t('access_demo_test_button')}
                </Button>
                {tier.result.data && (
                  <Alert
                    theme="success"
                    title={t('access_demo_granted_title')}
                    message={tier.result.data.message}
                  />
                )}
                {tier.result.error && (
                  <Alert
                    theme="danger"
                    title={t('access_demo_denied_title')}
                    message={getErrorMessage(tier.result.error)}
                  />
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>

      <Flex direction="column" gap={4}>
        <Flex direction="column" gap={1}>
          <Text variant="subheader-2">{t('access_demo_by_role_title')}</Text>
          <Text color="secondary">{t('access_demo_role_description')}</Text>
        </Flex>
        <Flex gap={4} wrap="wrap">
          {roleTiers.map((tier) => (
            <Card key={tier.title} view="outlined" type="container" width={300} spacing={{ p: 5 }}>
              <Flex direction="column" gap={3}>
                <Text variant="subheader-2">{tier.title}</Text>
                <Text color="secondary">{tier.description}</Text>
                <Button
                  view="action"
                  loading={tier.result.isFetching}
                  onClick={() => tier.trigger()}
                >
                  {t('access_demo_test_button')}
                </Button>
                {tier.result.data && (
                  <Alert
                    theme="success"
                    title={t('access_demo_granted_title')}
                    message={tier.result.data.message}
                  />
                )}
                {tier.result.error && (
                  <Alert
                    theme="danger"
                    title={t('access_demo_denied_title')}
                    message={getErrorMessage(tier.result.error)}
                  />
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}

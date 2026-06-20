import { Link } from 'react-router-dom';
import { Flex, Text, Button } from '@gravity-ui/uikit';
import { t } from './i18n';

export function NotFoundPage() {
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" height="100vh" gap={4}>
      <Text variant="header-1">{t('not_found_title')}</Text>
      <Text color="secondary">{t('not_found_subtitle')}</Text>
      <Button view="action" component={Link} to="/">
        {t('not_found_go_home')}
      </Button>
    </Flex>
  );
}

import { useMatches, useNavigate, useSearchParams } from 'react-router-dom';
import { Flex, Text, TextInput, Button, Icon } from '@gravity-ui/uikit';
import { ArrowLeft, Magnifier } from '@gravity-ui/icons';
import { t } from './i18n';
import type { MessageKey } from './i18n';
import styles from './Header.module.css';

interface RouteHandle {
  titleKey?: MessageKey;
  subtitleKey?: MessageKey;
  back?: string;
  showSearch?: boolean;
}

export function Header() {
  const matches = useMatches();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const handle = (matches.findLast((match) => Boolean(match.handle))?.handle ??
    {}) as RouteHandle;

  const handleSearchUpdate = (value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set('q', value);
    } else {
      next.delete('q');
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <Flex alignItems="center" gap={4} spacing={{ px: 6 }} className={styles.header}>
      {handle.back && (
        <Button view="outlined" onClick={() => navigate(handle.back as string)}>
          <Icon data={ArrowLeft} size={16} />
          {t('header_back')}
        </Button>
      )}
      <Flex direction="column" className={styles.titles}>
        <Text variant="subheader-2" ellipsis>
          {handle.titleKey && t(handle.titleKey)}
        </Text>
        {handle.subtitleKey && (
          <Text variant="caption-2" color="secondary" ellipsis>
            {t(handle.subtitleKey)}
          </Text>
        )}
      </Flex>
      <Flex grow={1} />
      {handle.showSearch && (
        <TextInput
          size="m"
          placeholder={t('header_search_placeholder')}
          value={searchParams.get('q') ?? ''}
          onUpdate={handleSearchUpdate}
          startContent={<Icon data={Magnifier} size={16} />}
          hasClear
          className={styles.search}
        />
      )}
    </Flex>
  );
}

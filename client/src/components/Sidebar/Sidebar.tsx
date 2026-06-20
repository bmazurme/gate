import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Flex, Text, Button, Icon } from '@gravity-ui/uikit';
import {
  House,
  TagDollar,
  ListCheck,
  Persons,
  Person,
  Key,
  Gear,
  ShieldCheck,
  ChevronsLeft,
  ChevronsRight,
  ArrowRightFromLine,
  Sun,
  Moon,
  Globe,
} from '@gravity-ui/icons';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { useLogoutMutation } from '../../store/api/authApi/authApi';
import { loggedOut } from '../../store/slices/authSlice';
import { themeToggled, localeToggled } from '../../store/slices/uiSlice';
import { baseApi } from '../../store/api/baseApi/baseApi';
import { t } from './i18n';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/', labelKey: 'nav_dashboard', icon: House },
  { to: '/access-demo', labelKey: 'nav_access_test', icon: Key },
  { to: '/plans', labelKey: 'nav_plans', icon: TagDollar },
  { to: '/subscriptions', labelKey: 'nav_subscriptions', icon: ListCheck },
  { to: '/admin/plans', labelKey: 'nav_plans_admin', icon: Gear },
  { to: '/users', labelKey: 'nav_users', icon: Persons },
  { to: '/profile', labelKey: 'nav_profile', icon: Person },
] as const;

const EXPANDED_WIDTH = 224;
const COLLAPSED_WIDTH = 64;

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useAppSelector((state) => state.ui.locale);
  const dispatch = useAppDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(loggedOut());
      dispatch(baseApi.util.resetApiState());
    }
  };

  // Button сам делает иконку квадратной (height x height), если это единственный
  // дочерний элемент — поэтому при collapsed передаём только <Icon>, без текста.
  const rowClassName = collapsed ? undefined : styles.rowExpanded;

  return (
    <Flex
      direction="column"
      width={collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH}
      className={styles.sidebar}
    >
      <Flex alignItems="center" gap={2} spacing={{ p: 4 }} className={styles.brandRow}>
        <Flex
          justifyContent="center"
          alignItems="center"
          width={32}
          height={32}
          className={styles.brandIcon}
        >
          <Icon data={ShieldCheck} size={18} />
        </Flex>
        {!collapsed && (
          <Flex direction="column" className={styles.brandText}>
            <Text variant="subheader-2" ellipsis>
              Gate
            </Text>
            <Text variant="caption-2" color="secondary" ellipsis>
              {t('brand_subtitle')}
            </Text>
          </Flex>
        )}
      </Flex>

      <Flex
        direction="column"
        grow={1}
        gap={1}
        spacing={{ p: 2 }}
        alignItems={collapsed ? 'center' : 'stretch'}
        className={styles.nav}
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          const label = t(item.labelKey);
          return (
            <Button
              key={item.to}
              component={Link}
              to={item.to}
              view={isActive ? 'action' : 'flat'}
              width={collapsed ? undefined : 'max'}
              title={collapsed ? label : undefined}
              className={rowClassName}
            >
              <Icon data={item.icon} size={18} />
              {!collapsed && label}
            </Button>
          );
        })}
      </Flex>

      <Flex
        direction="column"
        gap={1}
        spacing={{ p: 2 }}
        alignItems={collapsed ? 'center' : 'stretch'}
        className={styles.footer}
      >
        <Button
          view="flat"
          width={collapsed ? undefined : 'max'}
          title={collapsed ? t('locale_toggle_title') : undefined}
          className={rowClassName}
          onClick={() => dispatch(localeToggled())}
        >
          <Icon data={Globe} size={18} />
          {!collapsed && (locale === 'en' ? t('locale_to_ru') : t('locale_to_en'))}
        </Button>
        <Button
          view="flat"
          width={collapsed ? undefined : 'max'}
          title={collapsed ? t('theme_toggle_title') : undefined}
          className={rowClassName}
          onClick={() => dispatch(themeToggled())}
        >
          <Icon data={theme === 'dark' ? Sun : Moon} size={18} />
          {!collapsed && (theme === 'dark' ? t('theme_to_light') : t('theme_to_dark'))}
        </Button>
        <Button
          view="flat"
          width={collapsed ? undefined : 'max'}
          title={collapsed ? t('collapse_title') : undefined}
          className={rowClassName}
          onClick={() => setCollapsed((value) => !value)}
        >
          <Icon data={collapsed ? ChevronsRight : ChevronsLeft} size={18} />
          {!collapsed && t('collapse_label')}
        </Button>
        <Button
          view="flat"
          width={collapsed ? undefined : 'max'}
          title={collapsed ? t('logout_label') : undefined}
          className={rowClassName}
          loading={isLoggingOut}
          onClick={handleLogout}
        >
          <Icon data={ArrowRightFromLine} size={18} />
          {!collapsed && t('logout_label')}
        </Button>
      </Flex>
    </Flex>
  );
}

import { Outlet } from 'react-router-dom';
import { Flex } from '@gravity-ui/uikit';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <Flex height="100vh">
      <Sidebar />
      <Flex direction="column" grow={1} className={styles.main}>
        <Header />
        <Flex grow={1} spacing={{ p: 6 }} className={styles.content}>
          <Outlet />
        </Flex>
      </Flex>
    </Flex>
  );
}

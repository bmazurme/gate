import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@gravity-ui/uikit';
import { useAppSelector } from './hooks/hooks';
import { AuthBootstrap } from './components/AuthBootstrap/AuthBootstrap';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { useLocalStorage } from './hooks/useLocalStorage';
import { intl } from './i18n/intl';
import { router } from './router';
import { THEME_STORAGE_KEY, LOCALE_STORAGE_KEY } from './store/slices/uiSlice';

function App() {
  const theme = useAppSelector((state) => state.ui.theme);
  const locale = useAppSelector((state) => state.ui.locale);
  intl.setLocale(locale);
  useLocalStorage(THEME_STORAGE_KEY, theme);
  useLocalStorage(LOCALE_STORAGE_KEY, locale);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <AuthBootstrap>
          {/* key={locale} принудительно перемонтирует роутер при смене языка:
              RouterProvider мемоизирован внутри react-router и не подхватывает
              смену locale сам по себе, так как t() читает значение из замыкания
              intl, а не из реактивного состояния. */}
          <RouterProvider key={locale} router={router} />
        </AuthBootstrap>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;

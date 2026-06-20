import { createSlice } from '@reduxjs/toolkit';
import type { Lang } from '../../i18n/intl';
import { getLocalStorageItem } from '../../hooks/useLocalStorage';

export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'gate-theme';
export const LOCALE_STORAGE_KEY = 'gate-locale';

function getInitialTheme(): AppTheme {
  return getLocalStorageItem<AppTheme>(THEME_STORAGE_KEY, ['light', 'dark'], 'dark');
}

function getInitialLocale(): Lang {
  return getLocalStorageItem<Lang>(LOCALE_STORAGE_KEY, ['en', 'ru'], 'en');
}

export interface UiState {
  theme: AppTheme;
  locale: Lang;
}

const initialState: UiState = {
  theme: getInitialTheme(),
  locale: getInitialLocale(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    themeToggled: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    localeToggled: (state) => {
      state.locale = state.locale === 'en' ? 'ru' : 'en';
    },
  },
});

export const { themeToggled, localeToggled } = uiSlice.actions;
export default uiSlice.reducer;

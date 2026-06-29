import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeLangContext = createContext(null);

/**
 * ThemeLangProvider
 * Manages 'dark' | 'light' theme and 'ar' | 'en' language states.
 * Synchronises the <html> element's `dir`, `lang`, and `data-theme` attributes.
 */
export function ThemeLangProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('basira-theme') || 'dark';
    }
    return 'dark';
  });

  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('basira-lang') || 'ar';
    }
    return 'ar';
  });

  // Sync HTML attributes whenever theme or lang changes
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('basira-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    root.setAttribute('lang', lang);
    localStorage.setItem('basira-lang', lang);
  }, [lang]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, []);

  const value = { theme, lang, toggleTheme, toggleLang };

  return (
    <ThemeLangContext.Provider value={value}>
      {children}
    </ThemeLangContext.Provider>
  );
}

/**
 * Custom hook to consume theme & language context.
 */
export function useThemeLang() {
  const ctx = useContext(ThemeLangContext);
  if (!ctx) {
    throw new Error('useThemeLang must be used within a <ThemeLangProvider>');
  }
  return ctx;
}

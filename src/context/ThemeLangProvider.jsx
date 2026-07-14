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

    // Refresh AI content if available and language changed
    const savedAnalysis = localStorage.getItem('basira_analysis');
    if (savedAnalysis) {
      try {
        const data = JSON.parse(savedAnalysis);
        if (data.lang !== lang) {
          fetch('https://9208-2001-16a4-428-478f-608c-aead-f4f0-ba95.ngrok-free.app/api/refresh_analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              historical_data: data.historical_data,
              forecast_data: data.forecast_data,
              lang: lang
            })
          })
            .then(res => res.json())
            .then(newData => {
              if (newData.success) {
                const updated = {
                  ...data,
                  alert: newData.alert,
                  recommendation: newData.recommendation,
                  lang: newData.lang
                };
                localStorage.setItem('basira_analysis', JSON.stringify(updated));
                window.dispatchEvent(new Event('basira_analysis_updated'));
              }
            })
            .catch(console.error);
        }
      } catch (e) {
        console.error('Error parsing basira_analysis for translation sync:', e);
      }
    }
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

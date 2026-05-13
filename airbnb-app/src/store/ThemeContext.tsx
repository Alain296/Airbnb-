import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface ThemeContextValue {
  dark: boolean;
  setDark: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({ dark: false, setDark: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDarkState] = useState(
    () => localStorage.getItem('theme') === 'dark',
  );

  const setDark = (v: boolean) => {
    setDarkState(v);
    localStorage.setItem('theme', v ? 'dark' : 'light');
    // Apply to root so ALL pages get dark background
    document.documentElement.style.background = v ? '#0f172a' : '';
    document.body.style.background            = v ? '#0f172a' : '';
    document.body.style.color                 = v ? '#f1f5f9' : '';
  };

  // Apply on mount
  useEffect(() => {
    if (dark) {
      document.documentElement.style.background = '#0f172a';
      document.body.style.background            = '#0f172a';
      document.body.style.color                 = '#f1f5f9';
    }
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, setDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read persisted preference on mount
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem('barangayskill-theme') === 'dark';
    } catch {
      return false;
    }
  });

  // Sync <html> class whenever state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('barangayskill-theme', isDarkMode ? 'dark' : 'light');
    } catch { /* ignore */ }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** useTheme — call inside any component to get { isDarkMode, toggleDarkMode } */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
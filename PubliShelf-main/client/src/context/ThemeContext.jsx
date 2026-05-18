import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'ocean', toggleTheme: () => {}, setThemeByName: () => {} });

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage or default to 'ocean'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'ocean';
  });

  useEffect(() => {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'ocean' ? 'violet' : 'ocean');
  };

  const setThemeByName = (themeName) => {
    setTheme(themeName);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeByName }}>
      {children}
    </ThemeContext.Provider>
  );
};

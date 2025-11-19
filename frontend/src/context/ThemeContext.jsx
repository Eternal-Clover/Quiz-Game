import { createContext, useState, useEffect } from 'react';

// Initial value dari context
// Skeleton aja
export const ThemeContext = createContext({
  currentTheme: "",
  setCurrentTheme: () => { },
  theme: {
    light: {
      bgColor: "",
      textColor: "",
      cardBg: "",
      borderColor: "",
      buttonBg: "",
      buttonText: "",
      inputBg: "",
      inputBorder: ""
    },
    dark: {
      bgColor: "",
      textColor: "",
      cardBg: "",
      borderColor: "",
      buttonBg: "",
      buttonText: "",
      inputBg: "",
      inputBorder: ""
    }
  }
});

export default function ThemeContextProvider({ children }) {
  const [currentTheme, setCurrentThemeState] = useState(() => {
    // Load theme dari localStorage saat component mount
    try {
      const savedTheme = localStorage.getItem('selectedTheme');
      return savedTheme ? savedTheme : 'light';
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return 'light';
    }
  });

  // Update localStorage ketika theme berubah
  const setCurrentTheme = (theme) => {
    try {
      localStorage.setItem('selectedTheme', theme);
      setCurrentThemeState(theme);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      setCurrentThemeState(theme);
    }
  };

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setCurrentTheme,
      theme: {
        light: {
          bgColor: "bg-slate-50",
          textColor: "text-slate-900",
          cardBg: "bg-white",
          borderColor: "border-slate-300",
          buttonBg: "bg-blue-600 hover:bg-blue-700",
          buttonText: "text-white",
          inputBg: "bg-white",
          inputBorder: "border-slate-400"
        },
        dark: {
          bgColor: "bg-gray-900",
          textColor: "text-gray-100",
          cardBg: "bg-gray-800",
          borderColor: "border-gray-700",
          buttonBg: "bg-blue-700 hover:bg-blue-600",
          buttonText: "text-white",
          inputBg: "bg-gray-800",
          inputBorder: "border-gray-600"
        }
      }
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

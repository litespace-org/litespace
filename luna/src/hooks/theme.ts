import { useCallback, useEffect, useState } from "react";

enum Theme {
  Light = "light",
  Dark = "dark",
}

const KEY = "litespace::theme";

function getCurrentTheme(): Theme {
  const theme = localStorage.getItem(KEY);
  if (theme === Theme.Light || theme === Theme.Dark) return theme;
  return Theme.Light;
}

function setCurrentTheme(theme: Theme): Theme {
  localStorage.setItem(KEY, theme);
  return theme;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const toggleTheme = useCallback(() => {
    const to = theme === Theme.Light ? Theme.Dark : Theme.Light;
    setTheme(setCurrentTheme(to));
  }, [theme]);

  useEffect(() => {
    if (theme === Theme.Dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    setTheme(getCurrentTheme());
  }, []);

  return { theme, toggle: toggleTheme };
}

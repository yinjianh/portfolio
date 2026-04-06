import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "auto" | "warm" | "midnight";
export type ThemeId = "warm" | "midnight";

const ThemeContext = createContext<{
  themeMode: ThemeMode;
  appliedTheme: ThemeId;
  setThemeMode: (mode: ThemeMode) => void;
}>({ themeMode: "auto", appliedTheme: "warm", setThemeMode: () => {} });

function getSystemTheme(): ThemeId {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "midnight" : "warm";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("themeMode") as ThemeMode | null;
    if (saved === "auto") return saved;
    // Legacy support: if old "theme" key exists, migrate it
    const legacy = localStorage.getItem("theme") as ThemeId | null;
    if (legacy === "warm" || legacy === "midnight") return "auto";
    return "auto";
  });

  const [systemTheme, setSystemTheme] = useState<ThemeId>(getSystemTheme);

  const appliedTheme: ThemeId = themeMode === "auto" ? systemTheme : themeMode;

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    if (mode === "auto") localStorage.setItem("themeMode", mode);
    else localStorage.removeItem("themeMode");
    localStorage.removeItem("theme"); // clear legacy key
  };

  // Always listen to system changes — applies when mode is "auto"
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setSystemTheme(getSystemTheme());
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "midnight" : "warm");

    syncSystemTheme();

    if (typeof mq.addEventListener === "function") mq.addEventListener("change", handler);
    else mq.addListener(handler);

    window.addEventListener("focus", syncSystemTheme);
    document.addEventListener("visibilitychange", syncSystemTheme);

    return () => {
      if (typeof mq.removeEventListener === "function") mq.removeEventListener("change", handler);
      else mq.removeListener(handler);

      window.removeEventListener("focus", syncSystemTheme);
      document.removeEventListener("visibilitychange", syncSystemTheme);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appliedTheme);
  }, [appliedTheme]);

  return (
    <ThemeContext.Provider value={{ themeMode, appliedTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Legacy export so existing code that imports `useTheme().theme` still works
export type { ThemeId as Theme };

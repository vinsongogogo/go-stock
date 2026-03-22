import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GetConfig } from "../../../wailsjs/go/main/App";
import {
  WindowSetBackgroundColour,
  WindowSetDarkTheme,
  WindowSetLightTheme,
} from "../../../wailsjs/runtime/runtime";

export type ThemeContextValue = {
  /** 与配置中 `darkTheme` 一致：true 为深色场景 */
  isDark: boolean;
  setIsDark: (next: boolean) => void;
  /** 首次完成 GetConfig 引导 */
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyHtmlDarkClass(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
}

/** 与 main.go / app_windows 中窗口色保持一致 */
export function syncWailsWindowTheme(isDark: boolean) {
  try {
    if (typeof window === "undefined") return;
    const w = window as unknown as { runtime?: unknown };
    if (!w.runtime) return;
    if (isDark) {
      WindowSetBackgroundColour(27, 38, 54, 1);
      WindowSetDarkTheme();
    } else {
      WindowSetBackgroundColour(255, 255, 255, 1);
      WindowSetLightTheme();
    }
  } catch {
    // 浏览器非 Wails 环境无 runtime
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDarkState] = useState(true);
  const [ready, setReady] = useState(false);

  const setIsDark = useCallback((next: boolean) => {
    setIsDarkState(next);
    applyHtmlDarkClass(next);
    syncWailsWindowTheme(next);
  }, []);

  useEffect(() => {
    let cancelled = false;
    GetConfig()
      .then((c) => {
        if (cancelled) return;
        const d = c.darkTheme ?? true;
        setIsDarkState(d);
        applyHtmlDarkClass(d);
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          applyHtmlDarkClass(true);
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ isDark, setIsDark, ready }),
    [isDark, setIsDark, ready]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

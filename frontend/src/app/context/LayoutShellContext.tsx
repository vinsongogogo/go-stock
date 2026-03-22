import {
  createContext,
  useContext,
  type ReactNode,
} from "react";

export type LayoutShellValue = {
  /**
   * true：紧凑壳（汉堡/抽屉、按视口 md 断点排布）
   * false：桌面壳（Wails 或键鼠环境；栅格不依赖视口宽度）
   */
  compactLayout: boolean;
};

const LayoutShellContext = createContext<LayoutShellValue | null>(null);

export function LayoutShellProvider({
  compactLayout,
  children,
}: {
  compactLayout: boolean;
  children: ReactNode;
}) {
  return (
    <LayoutShellContext.Provider value={{ compactLayout }}>
      {children}
    </LayoutShellContext.Provider>
  );
}

export function useLayoutShell(): LayoutShellValue {
  const ctx = useContext(LayoutShellContext);
  if (!ctx) {
    throw new Error("useLayoutShell must be used within LayoutShellProvider");
  }
  return ctx;
}

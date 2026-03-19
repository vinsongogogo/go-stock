import * as React from "react";

/** At or above: PC 壳子 — 左侧菜单常驻、无汉堡顶栏。 */
export const DESKTOP_LAYOUT_MIN_WIDTH = 1024;

/** At or below: 移动壳子 — 侧栏抽屉、汉堡菜单（与设备无关）。 */
export const COMPACT_LAYOUT_MAX_WIDTH = 768;

/** Wails 注入的桌面壳，WebView 常误报 pointer/hover，直接按桌面处理 */
function hasWailsRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as Record<string, unknown>;
  return Boolean(win.runtime) || Boolean(win.wails) || Boolean(win.go);
}

function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

/**
 * 是否存在精细指针（鼠标/触控板）。嵌入式 WebView 往往把 primary 标成 coarse，
 * 但 (any-pointer: fine) 在桌面仍常为 true，需一并判断。
 */
function hasFinePointerInput(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(pointer: fine)").matches ||
    window.matchMedia("(any-pointer: fine)").matches
  );
}

/**
 * True when the app should use the compact (phone-style) shell:
 * overlay sidebar, top hamburger, dimmed backdrop.
 * Combines viewport width with coarse-pointer / hover / UA hints for the gray band
 * between COMPACT_LAYOUT_MAX_WIDTH and DESKTOP_LAYOUT_MIN_WIDTH.
 */
export function computeCompactLayout(width: number): boolean {
  if (typeof window !== "undefined") {
    // Wails 桌面应用：始终使用桌面布局，不支持紧凑模式
    if (hasWailsRuntime()) {
      return false;
    }
    if (!isMobileUserAgent() && hasFinePointerInput()) {
      return false;
    }
  }

  if (width >= DESKTOP_LAYOUT_MIN_WIDTH) return false;
  if (width <= COMPACT_LAYOUT_MAX_WIDTH) return true;
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return false;
  }

  if (isMobileUserAgent()) {
    return true;
  }

  if (hasFinePointerInput()) return false;

  return window.matchMedia("(pointer: coarse)").matches;
}

function subscribeLayout(cb: () => void) {
  const mql = window.matchMedia(
    `(max-width: ${DESKTOP_LAYOUT_MIN_WIDTH - 1}px)`,
  );
  const mqFine = window.matchMedia("(pointer: fine)");
  const mqAnyFine = window.matchMedia("(any-pointer: fine)");
  const onMql = () => cb();
  mql.addEventListener("change", onMql);
  mqFine.addEventListener("change", onMql);
  mqAnyFine.addEventListener("change", onMql);
  window.addEventListener("resize", cb);
  return () => {
    mql.removeEventListener("change", onMql);
    mqFine.removeEventListener("change", onMql);
    mqAnyFine.removeEventListener("change", onMql);
    window.removeEventListener("resize", cb);
  };
}

export function useCompactLayout(): boolean {
  const [compact, setCompact] = React.useState(() =>
    typeof window !== "undefined"
      ? computeCompactLayout(window.innerWidth)
      : false,
  );

  React.useEffect(() => {
    const sync = () => setCompact(computeCompactLayout(window.innerWidth));
    sync();
    return subscribeLayout(sync);
  }, []);

  return compact;
}

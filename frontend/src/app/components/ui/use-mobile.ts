import { useCompactLayout } from "../../hooks/useCompactLayout";

/** Matches app shell compact mode so shadcn Sidebar stays consistent. */
export function useIsMobile() {
  return useCompactLayout();
}

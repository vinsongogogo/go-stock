
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  
  // Force desktop viewport in Wails environment
  if (typeof window !== 'undefined') {
    const win = window as unknown as Record<string, unknown>;
    const isWails = Boolean(win.runtime) || Boolean(win.wails) || Boolean(win.go);
    
    if (isWails) {
      // Ensure viewport meta forces a desktop-width viewport
      const meta = document.querySelector('meta[name="viewport"]');
      if (meta) {
        // Use actual window width or at least 1280px to guarantee lg: breakpoint
        const desktopWidth = Math.max(window.innerWidth, 1280);
        meta.setAttribute('content', `width=${desktopWidth}, initial-scale=1.0`);
      }
      
      // Prevent Ctrl/Cmd + scroll/keyboard zoom
      document.addEventListener('wheel', (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      }, { passive: false });
      
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=' || e.key === '0')) {
          e.preventDefault();
        }
      });
    }
  }
  
  createRoot(document.getElementById("root")!).render(<App />);
  
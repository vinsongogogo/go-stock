interface SubMenuProps {
  items: string[];
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

export function SubMenu({ items, activeItem, onItemClick }: SubMenuProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-muted dark:bg-slate-900 border-b border-border">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {items.map((item) => (
            <button
              key={item}
              onClick={() => onItemClick?.(item)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                activeItem === item
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/60 dark:hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

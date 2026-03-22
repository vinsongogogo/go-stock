type CheckStatus = 'pass' | 'warn' | 'fail' | 'unknown';

interface ActionChecklistProps {
  items?: string[];
}

function parseCheckItem(item: string): { status: CheckStatus; text: string } {
  if (item.startsWith('✅')) {
    return { status: 'pass', text: item.substring(1).trim() };
  }
  if (item.startsWith('⚠️')) {
    return { status: 'warn', text: item.substring(2).trim() };
  }
  if (item.startsWith('❌')) {
    return { status: 'fail', text: item.substring(1).trim() };
  }
  return { status: 'unknown', text: item };
}

const statusStyles: Record<CheckStatus, { bg: string; border: string; icon: string }> = {
  pass: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: '✅'
  },
  warn: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: '⚠️'
  },
  fail: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    icon: '❌'
  },
  unknown: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    icon: '•'
  },
};

export function ActionChecklist({ items }: ActionChecklistProps) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs uppercase tracking-wider text-gray-400">CHECKLIST</span>
        <span className="text-sm font-medium text-white">操作检查清单</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {items.map((item, index) => {
          const { status, text } = parseCheckItem(item);
          const styles = statusStyles[status];
          return (
            <div
              key={index}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${styles.bg} ${styles.border}`}
            >
              <span className="text-base">{styles.icon}</span>
              <span className="text-sm text-gray-300">{text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

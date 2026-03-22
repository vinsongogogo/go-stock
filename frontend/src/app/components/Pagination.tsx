import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  extra?: React.ReactNode;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  extra,
}: PaginationProps) {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="bg-card dark:bg-slate-900 rounded-xl border border-border px-4 py-2.5 shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* 左侧：额外内容 + 信息显示 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {extra}
          <div>
            显示 <span className="text-cyan-600 dark:text-cyan-400 font-medium">{startItem}</span> 至{' '}
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">{endItem}</span> 条，共{' '}
            <span className="text-cyan-600 dark:text-cyan-400 font-medium">{totalItems}</span> 条
          </div>
          <div className="flex items-center gap-2">
            <span>每页</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="px-2 py-1 bg-input-background border border-input rounded text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>条</span>
          </div>
        </div>

        {/* 右侧：分页控制 */}
        <div className="flex items-center gap-2">
          {/* 首页 */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="首页"
          >
            <ChevronsLeft className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* 上一页 */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="上一页"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* 页码 */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-xs text-muted-foreground">
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[32px] px-2 py-1 rounded-lg text-xs transition-all ${
                    currentPage === page
                      ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-700 dark:text-cyan-400 font-medium'
                      : 'border border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* 下一页 */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="下一页"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* 末页 */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="末页"
          >
            <ChevronsRight className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* 跳转 */}
          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
            <span className="text-xs text-muted-foreground">跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              className="w-14 px-2 py-1 bg-input-background border border-input rounded text-xs text-foreground text-center focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = parseInt((e.target as HTMLInputElement).value);
                  if (value >= 1 && value <= totalPages) {
                    onPageChange(value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              placeholder={currentPage.toString()}
            />
            <span className="text-xs text-muted-foreground">页</span>
          </div>
        </div>
      </div>
    </div>
  );
}

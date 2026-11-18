import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface TableFooterProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSize?: boolean;
  maxVisible?: number;
}

const TableFooter = ({ currentPage, totalPages, pageSize, totalItems, onPageChange, onPageSizeChange, showPageSize = true, maxVisible = 5 }: TableFooterProps) => {
  const getVisiblePages = () => {
    const pages = []

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        pages.push(currentPage)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageSizeChange = (value: string) => {
    const newSize = value === 'all' ? totalItems : Number(value)
    onPageSizeChange?.(newSize)
    onPageChange(1)
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-3 border-t border-slate-100 bg-white px-1 py-3 sm:justify-between sm:px-4">
      {/* Left side - Showing count (SilverLogix style) */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <span className="text-slate-800 font-semibold">{startItem}</span> to <span className="text-slate-800 font-semibold">{endItem}</span> of <span className="text-slate-800 font-semibold">{totalItems}</span> entries
      </div>

      {/* Center - Numbered Pagination */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation shadow-2xs"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            page === '...' ? (
              <span key={`${index}-ellipsis`} className="px-1 text-slate-400 text-xs">···</span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`w-7 h-7 rounded-md text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation shadow-2xs"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right side - Rows per page */}
      {showPageSize && <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Rows per page</span>
        <Select value={pageSize === totalItems ? 'all' : String(pageSize)} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="h-7.5 w-[70px] rounded-md border-slate-200 text-xs text-slate-800 font-semibold shadow-2xs px-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>}
    </div>
  )
}

export default TableFooter;

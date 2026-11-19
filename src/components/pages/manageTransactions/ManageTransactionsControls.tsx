import { Filter, RefreshCcw } from 'lucide-react'
import { cn } from '../../../lib/utils'

interface ControlsProps {
  onOpenFilter: () => void
  handleRefreshTransactions?: () => void
  isFetchingTransactions?: boolean
}

const ManageTransactionsControls = ({
  onOpenFilter,
  handleRefreshTransactions,
  isFetchingTransactions,
}: ControlsProps) => {
  return (
    <div className="mt-3 mb-4 flex w-full items-center justify-end gap-2 sm:gap-2.5">
      <button
        onClick={onOpenFilter}
        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 active:scale-98 cursor-pointer touch-manipulation"
      >
        <Filter className="h-3.5 w-3.5 text-slate-500" />
        <span>Filter</span>
      </button>

      {handleRefreshTransactions && (
        <button
          onClick={handleRefreshTransactions}
          disabled={!!isFetchingTransactions}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 disabled:opacity-50 active:scale-98 cursor-pointer touch-manipulation"
          title="Refresh Transactions"
        >
          <RefreshCcw
            className={cn("h-3.5 w-3.5 text-slate-500", isFetchingTransactions && "animate-spin")}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      )}
    </div>
  )
}

export default ManageTransactionsControls

import { RefreshCcw, AlertCircle, ChevronRight } from 'lucide-react';

interface PendingPayoutsCardProps {
  count: number;
  loading: boolean;
  onRetry: () => void;
  onView: () => void;
  retrying?: boolean;
}

const PendingPayoutsCard = ({ count, loading, onRetry, onView, retrying }: PendingPayoutsCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-4.5 hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <p className="text-xs font-semibold text-slate-500 tracking-tight">
              Pending Payouts
            </p>
          </div>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${count > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {loading ? "..." : count}
          </p>
          <span className="text-xs font-medium text-slate-400">Disbursements Waiting</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRetry();
          }}
          disabled={count === 0 || retrying || loading}
          className={`flex-1 flex items-center justify-center gap-1.5 h-8.5 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
            count > 0 
              ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-2xs active:scale-98 disabled:opacity-50' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <RefreshCcw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
          <span>{retrying ? 'Retrying...' : 'Retry All'}</span>
        </button>
        
        <button
          onClick={onView}
          className="h-8.5 px-3 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all text-xs font-semibold shadow-2xs cursor-pointer touch-manipulation"
          title="View Details"
        >
          <span>View</span>
          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </div>
  )
}

export default PendingPayoutsCard;

import { Clock, ChevronRight } from 'lucide-react';

interface InReviewTransactionsCardProps {
  count: number;
  loading: boolean;
  onView: () => void;
}

const InReviewTransactionsCard = ({
  count,
  loading,
  onView,
}: InReviewTransactionsCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-4.5 hover:shadow-sm transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-xs font-semibold text-slate-500 tracking-tight">
              In Review Queue
            </p>
          </div>
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
              count > 0
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-50 text-slate-400"
            }`}
          >
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
            {loading ? "..." : count}
          </p>
          <span className="text-xs font-medium text-slate-400">Transactions Pending Check</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={onView}
          disabled={loading || count === 0}
          className={`flex-1 flex items-center justify-center gap-1.5 h-8.5 rounded-lg text-xs font-semibold transition-all cursor-pointer touch-manipulation ${
            count > 0
              ? "bg-blue-600 text-white hover:bg-blue-700 shadow-2xs active:scale-98"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>Review Transactions</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default InReviewTransactionsCard;

import { Search, SlidersHorizontal } from "lucide-react";

interface WalletToolbarProps {
  query: string;
  selectedCount: number;
  onQueryChange: (value: string) => void;
  onOpenFilters: () => void;
  onClearSelection: () => void;
  onSweep: () => void;
}

export default function WalletToolbar({ query, selectedCount, onQueryChange, onOpenFilters, onClearSelection, onSweep }: WalletToolbarProps) {
  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            aria-label="Search wallets"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search owner, wallet ID or address"
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
          />
        </div>
        <button type="button" onClick={onOpenFilters} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">
          <SlidersHorizontal aria-hidden="true" className="h-4 w-4" /> Filters
        </button>
        {selectedCount > 0 && <button type="button" onClick={onClearSelection} className="text-sm font-semibold text-indigo-600">Clear selection</button>}
        <button type="button" disabled={selectedCount === 0} onClick={onSweep} className="h-10 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
          Sweep selected ({selectedCount})
        </button>
      </div>
      {selectedCount > 0 && <p className="text-xs text-slate-500">Selected wallets stay selected when filters change.</p>}
    </div>
  );
}

import { Filter } from 'lucide-react'

interface ControlsProps {
  onOpenFilter: () => void
}

const DisputesControls = ({ onOpenFilter }: ControlsProps) => {
  return (
    <div className="mb-4 flex items-center justify-end">
      <button
        onClick={onOpenFilter}
        className="inline-flex cursor-pointer hover:bg-slate-50 items-center justify-center gap-1.5 h-9 px-3.5 border border-slate-200 rounded-lg transition-colors bg-white shadow-xs text-xs font-semibold text-slate-700 shrink-0"
      >
        <Filter className="w-3.5 h-3.5 text-slate-500" />
        <span>Filter</span>
      </button>
    </div>
  )
}

export default DisputesControls

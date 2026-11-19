import { Filter, Plus } from 'lucide-react'

interface AdminsControlsProps {
  onOpenFilter: () => void;
  onOpenCreate: () => void;
  onOpenCreateRole: () => void;
}

const AdminsControls = ({ onOpenFilter, onOpenCreate, onOpenCreateRole }: AdminsControlsProps) => {
  return (
    <div className="py-2 mb-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={onOpenFilter}
          className="inline-flex cursor-pointer hover:bg-slate-50 items-center justify-center gap-1.5 h-9 px-3.5 border border-slate-200 rounded-lg transition-colors bg-white shadow-xs text-xs font-semibold text-slate-700 shrink-0"
        >
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter</span>
        </button>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          <button
            onClick={onOpenCreateRole}
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Add Role
          </button>
          <button
            onClick={onOpenCreate}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Admin</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminsControls

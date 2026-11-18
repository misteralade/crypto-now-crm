import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { userStatusOptions } from "../../../util/constants.util.ts"
import { DateInput } from '../../ui/date-input'
import { LabeledSelect } from '../../ui/select'
import { Checkbox } from '../../ui/checkbox'

export interface FilterModalProps {
  open: boolean
  createdAtFrom: Date | undefined
  createdAtTo: Date | undefined
  statusFilter?: string
  hasDisputeFilter?: boolean
  onClose: () => void
  onReset: () => void
  handleChangeCreatedAtFrom: (date: Date) => void
  handleChangeCreatedAtTo: (date: Date) => void
  handleStatusFilterChange: (status: string) => void
  handleHasDisputeChange: (hasDispute: boolean) => void
}

const UsersFilterModal = ({ open, createdAtFrom, createdAtTo, statusFilter, hasDisputeFilter, onClose, onReset, handleChangeCreatedAtFrom, handleChangeCreatedAtTo, handleStatusFilterChange, handleHasDisputeChange }: FilterModalProps) => {
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(open)

  useEffect(() => {
    if (open) {
      setShouldRender(true)
      setIsClosing(false)
    } else if (shouldRender) {
      setIsClosing(true)
      const timer = setTimeout(() => {
        setShouldRender(false)
        setIsClosing(false)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [open, shouldRender])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!shouldRender) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-xs ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`} onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-xl bg-white p-5 shadow-2xl border border-slate-200 ${isClosing ? 'animate-modal-content-out' : 'animate-modal-content-in'}`}>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-900">Filter Users</span>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">Registration Date</p>
            <div className="grid grid-cols-2 gap-2.5">
              <DateInput value={createdAtFrom} onChange={handleChangeCreatedAtFrom} placeholder="From" />
              <DateInput value={createdAtTo} onChange={handleChangeCreatedAtTo} placeholder="To" />
            </div>
          </div>

          <LabeledSelect
            label="Account Status"
            value={statusFilter || '__empty__'}
            options={userStatusOptions.map((s) => ({ value: s.value || '__empty__', label: s.label }))}
            onValueChange={(v) => handleStatusFilterChange(v === '__empty__' ? '' : v)}
          />

          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wide">Disputes</p>
            <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 border border-slate-200/60 px-3 py-2.5">
              <Checkbox
                id="has-dispute"
                label="Has active dispute"
                checked={!!hasDisputeFilter}
                onCheckedChange={(checked) => handleHasDisputeChange(checked === true)}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            onClick={() => { onReset(); onClose() }}
          >
            Reset
          </button>
          <button
            type="button"
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            onClick={onClose}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )
}

export default UsersFilterModal

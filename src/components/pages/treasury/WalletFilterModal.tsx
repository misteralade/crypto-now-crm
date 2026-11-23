import { useState } from "react";
import Modal from "../../ui/modal.tsx";
import { Input } from "../../ui/input.tsx";
import { EMPTY_WALLET_FILTERS, type WalletFilters } from "./wallet-filters.ts";

interface WalletFilterModalProps {
  filters: WalletFilters;
  purposes: string[];
  onApply: (filters: WalletFilters) => void;
  onClose: () => void;
}

const selectClassName = "mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15";

export default function WalletFilterModal({ filters, purposes, onApply, onClose }: WalletFilterModalProps) {
  const [draft, setDraft] = useState(filters);
  const min = draft.min === "" ? undefined : Number(draft.min);
  const max = draft.max === "" ? undefined : Number(draft.max);
  const invalidRange = (min !== undefined && (!Number.isFinite(min) || min < 0)) ||
    (max !== undefined && (!Number.isFinite(max) || max < 0)) ||
    (min !== undefined && max !== undefined && min > max);

  function update(field: keyof WalletFilters, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  return (
    <Modal open onClose={onClose} title="Filter wallets" description="Refine wallets by balance, purpose or status.">
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Minimum balance" type="number" min="0" step="any" value={draft.min} onChange={(event) => update("min", event.target.value)} />
          <Input label="Maximum balance" type="number" min="0" step="any" value={draft.max} onChange={(event) => update("max", event.target.value)} />
        </div>
        {invalidRange && <p className="text-xs text-rose-600">Enter a valid balance range.</p>}
        <label className="block pb-3 text-xs font-semibold text-slate-700">
          Purpose
          <select className={selectClassName} value={draft.purpose} onChange={(event) => update("purpose", event.target.value)}>
            <option value="">All purposes</option>
            {purposes.map((purpose) => <option key={purpose} value={purpose}>{purpose}</option>)}
          </select>
        </label>
        <label className="block pb-4 text-xs font-semibold text-slate-700">
          Status
          <select className={selectClassName} value={draft.status} onChange={(event) => update("status", event.target.value)}>
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        <div className="flex justify-between gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={() => onApply(EMPTY_WALLET_FILTERS)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Clear</button>
          <button type="button" disabled={invalidRange} onClick={() => onApply(draft)} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Apply filters</button>
        </div>
      </div>
    </Modal>
  );
}

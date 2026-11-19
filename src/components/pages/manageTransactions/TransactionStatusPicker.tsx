import { Check, ChevronDown, Save, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { TransactionAction, TransactionStatusType } from "../../../schemas/enum.schema";
import { TRANSACTION_STATUS_SCOPE, TRANSACTION_STATUS_UPDATE_OPTIONS } from "../../../util/constants.util.ts";

interface TransactionStatusPickerProps {
  transactionType: TransactionAction;
  currentStatus: TransactionStatusType;
  selectedStatus?: TransactionStatusType;
  onSelectStatus: (status: TransactionStatusType | undefined) => void;
  onSave: () => void;
  isSaving?: boolean;
  canSave?: boolean;
}

const TransactionStatusPicker = ({
  transactionType,
  currentStatus,
  selectedStatus,
  onSelectStatus,
  onSave,
  isSaving = false,
  canSave = true,
}: TransactionStatusPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pickerRef = useRef<HTMLDivElement>(null);
  const availableStatuses = TRANSACTION_STATUS_UPDATE_OPTIONS.filter(
    ({ scope }) => scope === transactionType || scope === TRANSACTION_STATUS_SCOPE.SHARED,
  );
  const selectedOption = availableStatuses.find(({ value }) => value === (selectedStatus ?? currentStatus));
  const filteredStatuses = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return availableStatuses;
    return availableStatuses.filter(({ label, value }) => `${label} ${value}`.toLocaleLowerCase().includes(query));
  }, [availableStatuses, search]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Node && !pickerRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
      <div ref={pickerRef} className="relative block min-w-0 space-y-1.5">
        <span className="text-xs font-medium text-slate-600">Transaction status</span>
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="transaction-status-options"
            aria-autocomplete="list"
            value={isOpen ? search : selectedOption?.label ?? currentStatus}
            onFocus={() => { setSearch(""); setIsOpen(true); }}
            onChange={(event) => { setSearch(event.target.value); setIsOpen(true); }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsOpen(false);
              if (event.key === "Enter" && filteredStatuses.length > 0) {
                event.preventDefault();
                onSelectStatus(filteredStatuses[0].value);
                setIsOpen(false);
              }
            }}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
          />
          <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          {isOpen && <ul id="transaction-status-options" role="listbox" className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {filteredStatuses.map((option) => <li key={option.value} role="option" aria-selected={option.value === (selectedStatus ?? currentStatus)}>
              <button type="button" onClick={() => { onSelectStatus(option.value); setSearch(""); setIsOpen(false); }} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                <span><span className="block font-medium">{option.label}</span><span className="mt-0.5 block text-xs text-slate-500">{option.description}</span></span>
                {option.value === (selectedStatus ?? currentStatus) && <Check size={15} className="shrink-0 text-blue-600" />}
              </button>
            </li>)}
            {filteredStatuses.length === 0 && <li className="px-3 py-2 text-sm text-slate-500">No matching statuses</li>}
          </ul>}
        </div>
      </div>
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave || !selectedStatus || selectedStatus === currentStatus || isSaving}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
      >
        <Save size={15} />
        {isSaving ? "Saving..." : "Save status"}
      </button>
    </div>
  );
};

export default TransactionStatusPicker;

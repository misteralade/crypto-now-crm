import { useEffect, useMemo, useState } from "react";
import { X, Calendar, DollarSign } from "lucide-react";
import { TRANSACTION_STATUS_OPTIONS } from "../../../util/constants.util.ts";
import type { SearchSupportedCryptoData } from "../../../types/response.payload.types";
import type { TransactionStatus } from "../../../schemas/enum.schema";
import { DateInput } from "../../ui/date-input";
import { Input } from "../../ui/input";
import { LabeledSelect } from "../../ui/select";
import { cn } from "../../../lib/utils";
import { z } from "zod";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
  userEmail: string;
  onApplyEmail: (email: string) => void;
  fromDate: Date | undefined;
  toDate: Date | undefined;
  minAmountRange: number | undefined;
  maxAmountRange: number | undefined;
  handleFromDate: (date: Date) => void;
  handleToDate: (date: Date) => void;
  handleMinAmountRange: (amount: number | undefined) => void;
  handleMaxAmountRange: (amount: number | undefined) => void;
  supportedCryptos: Array<SearchSupportedCryptoData> | null | undefined;
  selectedCryptoId: string | undefined;
  handleSelectedCryptoId: (selectedCryptoId: string) => void;
  selectedStatus: TransactionStatus | undefined | "ALL";
  handleSelectedStatus: (status: TransactionStatus | "ALL") => void;
}

const ManageTransactionFilterModal = ({
  isOpen,
  onClose,
  onReset,
  userEmail,
  onApplyEmail,
  fromDate,
  toDate,
  minAmountRange,
  maxAmountRange,
  handleFromDate,
  handleToDate,
  handleMinAmountRange,
  handleMaxAmountRange,
  supportedCryptos,
  selectedCryptoId,
  handleSelectedCryptoId,
  selectedStatus,
  handleSelectedStatus,
}: FilterModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [emailDraft, setEmailDraft] = useState(userEmail);

  useEffect(() => {
    if (isOpen) {
      setEmailDraft(userEmail);
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      const timer = window.setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 150);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, shouldRender, userEmail]);

  const cryptoOptions = useMemo(() => {
    const list =
      supportedCryptos?.map((crypto) => ({
        value: crypto.id,
        label: `${crypto.name} (${crypto.symbol})`,
      })) || [];
    return [{ value: "", label: "All assets" }, ...list];
  }, [supportedCryptos]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-xs",
          isClosing ? "animate-modal-backdrop-out" : "animate-modal-backdrop-in",
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-xl border border-slate-200/80 shadow-2xl p-5 sm:p-6 transition-all z-10",
          isClosing ? "animate-modal-content-out" : "animate-modal-content-in",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Filter Transactions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Refine transactions by date, amount, or status
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4">
          <Input label="User email" type="email" value={emailDraft} onChange={(event) => setEmailDraft(event.target.value)} placeholder="name@example.com" className="mb-0" />
          {emailDraft.trim() && !z.string().email().safeParse(emailDraft.trim()).success && <p className="text-xs text-red-600">Enter a valid email address.</p>}
          {/* Date Range */}
          <div>
            <label className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-1.5 mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Date Range</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <DateInput
                value={fromDate}
                onChange={handleFromDate}
                placeholder="From date"
                className="h-9.5 text-xs rounded-lg border-slate-300"
              />
              <DateInput
                value={toDate}
                onChange={handleToDate}
                placeholder="To date"
                className="h-9.5 text-xs rounded-lg border-slate-300"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="text-xs font-semibold text-slate-700 tracking-tight flex items-center gap-1.5 mb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" />
              <span>Amount Range (NGN)</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                placeholder="Min ₦"
                type="number"
                value={minAmountRange !== undefined ? minAmountRange : ""}
                onChange={(e) => handleMinAmountRange(e.target.value === "" ? undefined : Number(e.target.value))}
                className="h-9.5 text-xs rounded-lg border-slate-300 mb-0"
              />
              <Input
                placeholder="Max ₦"
                type="number"
                value={maxAmountRange !== undefined ? maxAmountRange : ""}
                onChange={(e) => handleMaxAmountRange(e.target.value === "" ? undefined : Number(e.target.value))}
                className="h-9.5 text-xs rounded-lg border-slate-300 mb-0"
              />
            </div>
          </div>

          {/* Asset & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <LabeledSelect
              label="Asset"
              value={selectedCryptoId ?? ""}
              onValueChange={(val) => handleSelectedCryptoId(val === "__empty__" ? "" : val)}
              options={cryptoOptions}
              className="mb-0"
            />
            <LabeledSelect
              label="Status"
              value={selectedStatus ?? "ALL"}
              onValueChange={(val) => handleSelectedStatus(val as TransactionStatus | "ALL")}
              options={TRANSACTION_STATUS_OPTIONS.map((status) => ({
                value: status.value || "ALL",
                label: status.label,
              }))}
              className="mb-0"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="h-9 px-3.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer touch-manipulation"
          >
            Reset Filters
          </button>

          <button
            type="button"
            onClick={() => { onApplyEmail(emailDraft.trim()); onClose(); }}
            disabled={!!emailDraft.trim() && !z.string().email().safeParse(emailDraft.trim()).success}
            className="h-9 px-4.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer touch-manipulation disabled:opacity-50"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTransactionFilterModal;

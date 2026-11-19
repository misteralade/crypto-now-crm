import { Fragment } from "react";
import CopyDetails from "../../../global/CopyDetails";
import { formatNumber } from "../../../../util/index.util";
import type { LedgerEntryResponsePayload } from "../../../../types/response.payload.types";
import { BookOpen } from "lucide-react";

interface LedgerEntriesSectionProps {
  ledgerEntries: LedgerEntryResponsePayload[] | undefined;
}

const accountTypeMeta: Record<
  string,
  {
    label: string;
    description: string;
  }
> = {
  USER_NGN: {
    label: "User NGN",
    description: "User balance / liability",
  },
  PLATFORM_NGN: {
    label: "Platform NGN",
    description: "Platform treasury account",
  },
  CRYPTO_CUSTODY: {
    label: "Crypto Custody",
    description: "Custodial crypto balance",
  },
  FEE_COLLECTED: {
    label: "Fee Collected",
    description: "Platform fee revenue",
  },
  PAYOUT_SENT: {
    label: "Payout Sent",
    description: "External payout settlement rail",
  },
  REFUND_ISSUED: {
    label: "Refund Issued",
    description: "Customer refund balance",
  },
};

const getAccountMeta = (accountType: string) =>
  accountTypeMeta[accountType] ?? {
    label: accountType.replaceAll("_", " "),
    description: "Ledger account",
  };

const getEntryMeta = (entryType: string, referenceType: string | null) => {
  const isReversal = referenceType === "PAYOUT_REVERSAL";
  const isCredit = entryType === "CREDIT";

  return {
    label: isReversal ? `REVERSAL ${entryType}` : entryType,
    className: isReversal
      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
      : isCredit
        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
        : "bg-rose-50 text-rose-700 border border-rose-200/60",
    dot: isReversal ? "bg-amber-500" : isCredit ? "bg-emerald-500" : "bg-rose-500",
  };
};

const LedgerEntriesSection = ({
  ledgerEntries,
}: LedgerEntriesSectionProps) => {
  const hasEntries = !!ledgerEntries && ledgerEntries.length > 0;

  if (!hasEntries) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h2 className="crm-section-heading font-bold text-slate-900 tracking-tight">Ledger Journal Entries</h2>

        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200/70">
        <table className="min-w-full divide-y divide-slate-200/70">
          <thead>
            <tr className="bg-[#F0F4FA] text-left text-2xs font-bold uppercase tracking-wider text-slate-700">
              <th className="px-3.5 py-3">Timestamp</th>
              <th className="px-3.5 py-3">Account</th>
              <th className="px-3.5 py-3">Entry</th>
              <th className="px-3.5 py-3">Amount</th>
              <th className="px-3.5 py-3">Currency</th>
              <th className="px-3.5 py-3">Description</th>
              <th className="px-3.5 py-3">Reference Type</th>
              <th className="px-3.5 py-3">Reference ID</th>
              <th className="px-3.5 py-3 text-right">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-xs">
            {ledgerEntries.map((entry) => {
              const entryMeta = getEntryMeta(entry.entryType, entry.referenceType);
              const accountMeta = getAccountMeta(entry.accountType);

              return (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-3.5 py-3 text-slate-600 whitespace-nowrap text-2xs">
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3.5 py-3 font-semibold text-slate-900 whitespace-nowrap">
                    <div>
                      <p>{accountMeta.label}</p>
                      <p className="text-2xs text-slate-400 font-normal">
                        {accountMeta.description}
                      </p>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-bold ${entryMeta.className}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${entryMeta.dot}`} />
                      <span>{entryMeta.label}</span>
                    </span>
                  </td>
                  <td className="px-3.5 py-3 font-bold text-slate-900 whitespace-nowrap tabular-nums">
                    {formatNumber(entry.amount)}
                  </td>
                  <td className="px-3.5 py-3 text-slate-600 whitespace-nowrap font-semibold">
                    {entry.currency}
                  </td>
                  <td className="px-3.5 py-3 text-slate-700 min-w-[200px] text-xs">
                    <Fragment>{entry.description}</Fragment>
                  </td>
                  <td className="px-3.5 py-3 whitespace-nowrap">
                    {entry.referenceType ? (
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-semibold ${
                          entry.referenceType === "PAYOUT_REVERSAL"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {entry.referenceType.replaceAll("_", " ")}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-slate-700 min-w-[140px]">
                    {entry.referenceId ? (
                      <CopyDetails
                        text={entry.referenceId}
                        className="!max-w-[160px] font-mono text-2xs"
                        iconClassName="!w-4 !h-4"
                      />
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-right font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                    {entry.runningBalance ? formatNumber(entry.runningBalance) : "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LedgerEntriesSection;



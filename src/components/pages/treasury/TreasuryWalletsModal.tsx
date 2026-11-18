import { useMemo } from "react";
import { ExternalLink, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import Table, { type TableColumn } from "../../table.tsx";
import { useAdminTreasuryWalletsQuery } from "../../../queries/crypto.querries.ts";
import type { BalanceSummaryRow } from "../../../api/sweep.api.ts";
import type { AdminCustodialWalletDetailsResponsePayload } from "../../../types/response.payload.types.ts";

interface TreasuryWalletsModalProps {
  open: boolean;
  scope: BalanceSummaryRow | null;
  onClose: () => void;
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function formatAmount(value: string | number | null | undefined) {
  if (value == null || value === "") return "0.000000";
  return Number(value).toFixed(6).replace(/\.?0+$/, "");
}

function shortAddress(address: string) {
  if (!address) return "-";
  return `${address.slice(0, 10)}...${address.slice(-8)}`;
}

function getOwnerLabel(wallet: AdminCustodialWalletDetailsResponsePayload["wallet"], user: AdminCustodialWalletDetailsResponsePayload["user"]) {
  if (wallet.walletPurpose === "GUEST") {
    return "Guest pool";
  }

  if (!user) {
    return "Unassigned";
  }

  const profileName = [user.profile?.firstName, user.profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return profileName || user.email || "User";
}

function getUsageLabel(wallet: AdminCustodialWalletDetailsResponsePayload["wallet"]) {
  if (wallet.walletPurpose === "GUEST") {
    return wallet.leasedTransactionId ? "Leased guest wallet" : "Reusable guest wallet";
  }

  return "User deposit wallet";
}

export default function TreasuryWalletsModal({
  open,
  scope,
  onClose,
}: TreasuryWalletsModalProps) {
  const navigate = useNavigate();
  const cryptocurrencyId = open ? scope?.cryptocurrencyId : undefined;
  const network = open ? scope?.network : undefined;
  const { data: wallets, isLoading } = useAdminTreasuryWalletsQuery(
    cryptocurrencyId,
    network,
  );

  const rows = useMemo(
    () => wallets ?? [],
    [wallets],
  );

  const columns: TableColumn<AdminCustodialWalletDetailsResponsePayload>[] =
    useMemo(
      () => [
        {
          key: "wallet",
          header: "Wallet",
          render: (_, row) => (
            <div className="space-y-1">
              <p className="font-mono text-xs font-semibold text-[#03034D]">
                {shortAddress(row.wallet.walletAddress)}
              </p>
              <p className="text-[11px] text-gray-500" title={row.wallet.walletAddress}>
                {row.wallet.walletAddress}
              </p>
            </div>
          ),
        },
        {
          key: "owner",
          header: "Ownership",
          render: (_, row) => {
            const label = getOwnerLabel(row.wallet, row.user);
            const usage = getUsageLabel(row.wallet);

            return (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[#03034D]">{label}</p>
                <p className="text-[11px] text-gray-500">{usage}</p>
                {row.user?.email && row.user.email !== label && (
                  <p className="text-[11px] text-gray-500">{row.user.email}</p>
                )}
              </div>
            );
          },
        },
        {
          key: "walletPurpose",
          header: "Purpose",
          render: (_, row) => (
            <div className="space-y-1">
              <span className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                {row.wallet.walletPurpose}
              </span>
              <p className="text-[11px] text-gray-500">
                {row.wallet.isActive ? "Active" : "Inactive"}
              </p>
            </div>
          ),
        },
        {
          key: "cachedBalance",
          header: "Balance",
          render: (_, row) => (
            <div className="space-y-1">
              <p className="font-mono text-sm font-semibold text-[#03034D] tabular-nums">
                {formatAmount(row.wallet.cachedBalance)}
              </p>
              <p className="text-[11px] text-gray-500">{row.cryptocurrency?.symbol ?? row.wallet.network}</p>
            </div>
          ),
        },
        {
          key: "activity",
          header: "Activity",
          render: (_, row) => (
            <div className="space-y-1">
              <p className="text-[11px] text-gray-500">
                Deposits: {row.wallet.totalDepositsCount}
              </p>
              <p className="text-[11px] text-gray-500">
                Last deposit: {formatDate(row.wallet.lastDepositAt)}
              </p>
            </div>
          ),
        },
        {
          key: "action",
          header: "",
          render: (_, row) => (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void navigate({
                  to: "/dashboard/custodial-wallet/$walletAddress",
                  params: { walletAddress: row.wallet.walletAddress },
                  search: { fromSweepId: "" },
                });
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition-all hover:border-indigo-100 hover:bg-indigo-50"
            >
              Open
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          ),
        },
      ],
      [navigate],
    );

  if (!open || !scope) return null;

  const walletCount = rows.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Treasury wallets"
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
          <div className="space-y-1">
            <span className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-700">
              Treasury Wallets
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {scope.symbol} Wallets
            </h2>
            <p className="text-xs text-slate-500">
              {scope.name} on {scope.network} · {walletCount} wallet{walletCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close wallet list"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <Table<AdminCustodialWalletDetailsResponsePayload>
            data={rows}
            columns={columns}
            loading={isLoading}
            onRowClick={(row) => {
              void navigate({
                to: "/dashboard/custodial-wallet/$walletAddress",
                params: { walletAddress: row.wallet.walletAddress },
                search: { fromSweepId: "" },
              });
            }}
            emptyMessage="No active wallets found for this token and network."
            className="border border-[#EEF1FF]"
            theadClassName="bg-gray-50/70 border-b border-gray-100"
          />
        </div>
      </div>
    </div>
  );
}

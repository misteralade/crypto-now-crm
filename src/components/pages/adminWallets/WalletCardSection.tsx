import { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import ConfirmModal from "../../global/ConfirmModal";
import type { SearchSupportedCryptoData } from "../../../types/response.payload.types";
import {
  useAdminDeletePlatformWalletMutation,
} from "../../../queries/crypto.querries";

type FlattenedWallet = {
  id: string;
  cryptoId: string;
  cryptoSymbol: string;
  cryptoName: string;
  network: string;
  walletAddress: string;
  blockchainEnvironment: "testnet" | "mainnet";
};

interface WalletCardSectionProps {
  walletType: "SENDING" | "RECEIVING";
  cryptos: SearchSupportedCryptoData[];
  defaultCryptoId?: string;
}

const WalletCardSection = ({ walletType, cryptos, defaultCryptoId: _defaultCryptoId }: WalletCardSectionProps) => {
  const navigate = useNavigate();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const deleteWalletMutation = useAdminDeletePlatformWalletMutation();

  const handleEditWallet = (walletId: string) => {
    navigate({ to: `/dashboard/admin-wallets/edit/$walletId`, params: { walletId } });
  };

  const handleAddWallet = () => {
    navigate({ to: `/dashboard/admin-wallets/add/$walletType`, params: { walletType } });
  };

  const wallets: FlattenedWallet[] = cryptos.flatMap((crypto) =>
    (crypto.adminCryptoWallets ?? [])
      .filter((w) => w.walletType === walletType)
      .map((w) => ({
        id: w.id,
        cryptoId: crypto.id,
        cryptoSymbol: crypto.symbol,
        cryptoName: crypto.name,
        network: w.network,
        walletAddress: w.walletAddress,
        blockchainEnvironment: w.blockchainEnvironment,
      })),
  );

  const heading = walletType === "SENDING" ? "Buy payout wallets" : "Sweep destination wallets";
  const description = walletType === "SENDING"
    ? "Wallets used to send crypto for customer buy orders."
    : "Destination wallets for swept deposits.";
  const addLabel = walletType === "SENDING" ? "Add sending wallet" : "Add receiving wallet";
  const emptyLabel = walletType === "SENDING" ? "No sending wallets configured yet." : "No receiving wallets configured yet.";

  const handleConfirmDelete = () => {
    if (!pendingDeleteId) return;
    deleteWalletMutation.mutate(pendingDeleteId, { onSuccess: () => setPendingDeleteId(null) });
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{heading}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
        <button
          type="button"
          onClick={handleAddWallet}
          className="inline-flex items-center gap-1.5 h-8.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg transition-all shadow-2xs whitespace-nowrap cursor-pointer touch-manipulation"
        >
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      </div>

      {wallets.length === 0 ? (
        <p className="text-xs text-slate-400 italic py-2">{emptyLabel}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((w) => (
            <div
              key={w.id}
              onClick={() => handleEditWallet(w.id)}
              className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2.5 cursor-pointer hover:border-blue-300 hover:shadow-xs transition-all group"
            >
              {/* Header with coin info and actions */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{w.cryptoSymbol}</span>
                  <span className="text-xs text-slate-500 font-medium">({w.cryptoName})</span>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditWallet(w.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    aria-label="Edit wallet"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDeleteId(w.id);
                    }}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Delete wallet"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                  {w.network}
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  {w.blockchainEnvironment}
                </span>
              </div>

              {/* Wallet Address */}
              <div className="font-mono text-xs text-gray-600 break-all leading-relaxed">
                {w.walletAddress}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={pendingDeleteId !== null}
        actionType="delete"
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this wallet? This cannot be undone."
        confirmText="Delete Wallet"
      />
    </div>
  );
};

export default WalletCardSection;

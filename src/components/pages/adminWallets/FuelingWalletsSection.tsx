import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { cryptoServiceApi } from "../../../api/crypto.api";
import { QUERY_KEYS } from "../../../queries/querries.keys";
import { CRYPTO_SYMBOL } from "../../../util/crypto-symbol";
import { Zap, RefreshCw, Copy, Check } from "lucide-react";
import type { SearchSupportedCryptoData } from "../../../types/response.payload.types";
import { ADMIN_WALLET_OWNERSHIP, CRYPTO_NETWORK } from "../../../util/enum";
import {
  useAdminGeneratePlatformFuelingWalletMutation,
  useAdminGetWalletBalanceMutation,
} from "../../../queries/crypto.querries";

interface FuelingWalletsSectionProps {
  cryptos: SearchSupportedCryptoData[];
}

const NETWORKS_REQUIRING_FUELING = new Set<string>([CRYPTO_NETWORK.ERC20, CRYPTO_NETWORK.TRC20]);

const CatFeeAddress = ({ cryptoId, address, walletId }: { cryptoId: string; address?: string; walletId?: string }) => {
  const [value, setValue] = useState(address ?? "");
  const [balance, setBalance] = useState<number | null>(null);
  const balanceMutation = useAdminGetWalletBalanceMutation();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await cryptoServiceApi.adminSetCatFeeAddress(cryptoId, value.trim());
      if (!result.success) throw new Error(result.message);
    },
    onSuccess: () => {
      toast.success("CatFee address saved");
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CRYPTO.ALL_SUPPORTED_CRYPTO_CURRENCIES] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  return (
    <div className="rounded-xl border border-indigo-100 p-3 space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold">
        CatFee top-up address <span className="rounded-full bg-indigo-50 px-2 py-1 text-indigo-700">External</span>
      </div>
      <input aria-label="CatFee top-up address" value={value} onChange={(event) => setValue(event.target.value)} className="w-full rounded-lg border p-2 text-xs" />
      <button type="button" disabled={mutation.isPending || !value.trim()} onClick={() => mutation.mutate()} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs text-white disabled:opacity-50">Save address</button>
      {walletId && <div className="flex items-center gap-3 text-xs"><span>CatFee balance: {balance === null ? "Not checked" : `${balance.toFixed(6)} TRX`}</span><button type="button" disabled={balanceMutation.isPending} onClick={() => balanceMutation.mutate(walletId, { onSuccess: (data) => setBalance(data.balance) })} className="text-indigo-600">Refresh balance</button></div>}
    </div>
  );
};

// Isolated card component for clean, premium state management and individual balance syncing
const FuelingWalletCard = ({
  row,
  onGenerate,
  isGenerating,
}: {
  row: {
    cryptoId: string;
    cryptoSymbol: string;
    cryptoName: string;
    network: string;
    catFeeAddress?: string;
    catFeeWalletId?: string;
    fuelingWallet?: {
      id: string;
      walletAddress: string;
      cachedBalance?: string | number;
      cachedBalanceUpdatedAt?: string | null;
    };
  };
  onGenerate: () => void;
  isGenerating: boolean;
}) => {
  const [balanceData, setBalanceData] = useState<{
    balance: number;
    symbol: string;
    updatedAt?: Date | string | null;
  } | null>(
    row.fuelingWallet?.cachedBalance != null
      ? {
          balance: Number(row.fuelingWallet.cachedBalance),
          symbol: row.network === "ERC20" ? "ETH" : "TRX",
          updatedAt: row.fuelingWallet.cachedBalanceUpdatedAt,
        }
      : null
  );
  const [copied, setCopied] = useState(false);
  const balanceMutation = useAdminGetWalletBalanceMutation();

  const depositAsset = row.network === "ERC20" ? "ETH (Ethereum)" : "TRX (Tron)";
  const fuelsAsset = `${row.cryptoSymbol} (${row.network})`;
  const hasCatFeeExternalAddress = row.catFeeAddress !== undefined;

  const handleRefresh = () => {
    if (!row.fuelingWallet?.id) return;
    balanceMutation.mutate(row.fuelingWallet.id, {
      onSuccess: (data) => {
        setBalanceData(data);
      },
    });
  };

  const handleCopy = () => {
    if (!row.fuelingWallet?.walletAddress) return;
    navigator.clipboard.writeText(row.fuelingWallet.walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (dateInput: Date | string | null | undefined) => {
    if (!dateInput) return "";
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return (
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " " +
      date.toLocaleDateString([], { month: "short", day: "numeric" })
    );
  };

  return (
    <div
      className={`rounded-2xl border p-5 space-y-4 transition-all ${
        row.fuelingWallet
          ? "border-[#E4E7EC] bg-[#FCFCFE] shadow-sm"
          : "border-indigo-100 bg-indigo-50/15"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-2xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            {row.network} Network
          </span>
          <h4 className="text-sm font-bold text-[#03034D] mt-2">
            {hasCatFeeExternalAddress ? "Retained internal wallet for:" : "Fuels sweeps for:"} <span className="text-indigo-600 font-extrabold">{fuelsAsset}</span>
          </h4>
        </div>
        {row.fuelingWallet ? (
          <span className="text-2xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">
            Active
          </span>
        ) : (
          <span className="text-2xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-semibold">
            Inactive
          </span>
        )}
      </div>

      <div className="space-y-2 border-t border-[#ECECEC]/70 pt-3">
        {row.catFeeAddress !== undefined && <CatFeeAddress cryptoId={row.cryptoId} address={row.catFeeAddress} walletId={row.catFeeWalletId} />}
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Required Gas Asset</span>
          <span className="font-bold text-[#03034D] bg-indigo-50 px-2.5 py-0.5 rounded-lg text-2xs">
            {depositAsset}
          </span>
        </div>

        <div className="rounded-xl bg-[#F4F4F7] p-3 border border-[#E4E7EC] space-y-1 relative group">
          <span className="text-2xs text-gray-500 font-semibold uppercase tracking-wider block">
            Admin Deposit Wallet Address
          </span>
          <div className="font-mono text-xs text-gray-700 break-all select-all font-medium leading-relaxed mt-1 pr-8">
            {row.fuelingWallet?.walletAddress ?? (
              <span className="italic text-indigo-600 font-medium">Not generated yet</span>
            )}
          </div>
          {row.fuelingWallet && (
            <button
              type="button"
              onClick={handleCopy}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-all border border-transparent hover:border-gray-200"
              title="Copy Address"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {row.fuelingWallet && (
          <div className="flex justify-between items-center bg-[#F8F9FC] border border-[#E4E7EC] rounded-xl p-3 text-xs">
            <div>
              <span className="text-gray-500 font-medium block">Native Gas Balance</span>
              <span className="font-bold text-[#03034D] text-sm mt-0.5 block">
                {balanceData !== null ? `${Number(balanceData.balance).toFixed(8).replace(/\.?0+$/, '')} ${balanceData.symbol}` : "-"}
              </span>
              {balanceData?.updatedAt && (
                <span className="text-2xs text-gray-400 block mt-0.5">
                  Last checked: {formatTime(balanceData.updatedAt)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={balanceMutation.isPending}
              className="p-2 text-indigo-600 hover:bg-indigo-50 disabled:bg-gray-100 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center border border-indigo-100 bg-white shadow-sm shrink-0"
              title={balanceMutation.isPending ? "Syncing..." : "Sync Balance"}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${balanceMutation.isPending ? "animate-spin" : ""}`} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        {!row.fuelingWallet && !hasCatFeeExternalAddress ? (
          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center gap-1.5 px-4 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            {isGenerating ? "Generating..." : "Generate Fueling Wallet"}
          </button>
        ) : (
          <div className="text-2xs text-gray-500 leading-normal bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 w-full">
            <strong className="text-blue-800">Operational note:</strong> {hasCatFeeExternalAddress ? "USDT on TRON uses CatFee Energy Rental. This internal wallet is retained and is not used for those sweeps." : <>Deposit <strong>{row.network === "ERC20" ? "ETH" : "TRX"}</strong> directly into this address to cover transaction gas fees for custodial sweeping.</>}
          </div>
        )}
      </div>
    </div>
  );
};

const FuelingWalletsSection = ({ cryptos }: FuelingWalletsSectionProps) => {
  const generateFuelingWalletMutation = useAdminGeneratePlatformFuelingWalletMutation();

  const rows = cryptos.flatMap((crypto) => {
    if (!crypto.sellEnabled) return [];

    // Check cryptocurrency's supported networks configuration
    const networksNeedingFuel = (crypto.sellSupportedNetworks ?? [])
      .filter((n) => NETWORKS_REQUIRING_FUELING.has(n));

    return networksNeedingFuel.map((network) => {
      const fuelingWallet = (crypto.adminCryptoWallets ?? []).find(
        (w) => w.network === network && w.walletType === "FUELING" && w.ownershipType !== ADMIN_WALLET_OWNERSHIP.EXTERNAL,
      );
      const external = (crypto.adminCryptoWallets ?? []).find(
        (w) => w.network === network && w.walletType === "FUELING" && w.ownershipType === ADMIN_WALLET_OWNERSHIP.EXTERNAL,
      );
      return {
        cryptoId: crypto.id,
        cryptoSymbol: crypto.symbol.toUpperCase(),
        cryptoName: crypto.name,
        network,
        catFeeAddress: network === CRYPTO_NETWORK.TRC20 && crypto.symbol.toUpperCase() === CRYPTO_SYMBOL.USDT ? external?.walletAddress ?? "" : undefined,
        catFeeWalletId: external?.id,
        fuelingWallet,
      };
    });
  });

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Fueling Wallets</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Gas wallets utilized to fund automated on-chain sweep operations
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No coins on ERC20/TRC20 networks yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {rows.map((row) => (
            <FuelingWalletCard
              key={`${row.cryptoId}-${row.network}`}
              row={row}
              onGenerate={() =>
                generateFuelingWalletMutation.mutate({ cryptoId: row.cryptoId, network: row.network })
              }
              isGenerating={generateFuelingWalletMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FuelingWalletsSection;

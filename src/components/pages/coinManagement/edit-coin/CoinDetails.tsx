import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../../../util/constants.util.ts";
import { cryptoServiceApi } from "../../../../api/crypto.api";
import { QUERY_KEYS } from "../../../../queries/querries.keys";
import type { EditSupportedCryptoAndAdminWalletRequestType } from "../../../../schemas/crypto.schema";
import type { AdminCryptoWalletResponsePayload } from "../../../../types/response.payload.types";
import { PillInput } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import { Checkbox } from "../../../ui/checkbox";
import { ArrowRight } from "lucide-react";

interface EditCoinDetailsProps {
  cryptoId: string;
  name: string;
  symbol: string;
  networks?: string[];
  active: boolean;
  buyEnabled: boolean;
  sellEnabled: boolean;
  buyPrecision: number | null;
  blockchainEnvironment: "testnet" | "mainnet";
  adminCryptoWallets?: AdminCryptoWalletResponsePayload[];
  onChangeInputField: (
    field: keyof EditSupportedCryptoAndAdminWalletRequestType,
    value: unknown,
  ) => void;
}

const EditCoinDetails = ({
  cryptoId,
  name,
  symbol,
  networks = [],
  active,
  buyEnabled,
  sellEnabled,
  buyPrecision,
  adminCryptoWallets = [],
  onChangeInputField,
}: EditCoinDetailsProps) => {
  const [editedActive, setEditedActive] = useState<boolean | null>(null);
  const [editedBuyEnabled, setEditedBuyEnabled] = useState<boolean | null>(null);
  const [editedBuyPrecision, setEditedBuyPrecision] = useState<string | null>(null);
  const [editedNetworks, setEditedNetworks] = useState<string[] | null>(null);
  const activeNetworks = useQuery({
    queryKey: [QUERY_KEYS.CRYPTO.PUBLIC_SUPPORTED_CRYPTO_NETWORKS, cryptoId],
    queryFn: async () => {
      const result = await cryptoServiceApi.getAllSupportedCryptoCurrencies();
      if (!result.success) throw new Error(result.message);
      const coin = result.data.find((item) => item.id === cryptoId);
      if (!coin) throw new Error("Coin not found in active cryptocurrencies");
      return coin.networks;
    },
    enabled: active && !!cryptoId,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const selectedNetworks = editedNetworks ?? (active ? activeNetworks.data : networks) ?? [];
  const [availableNetworks, setAvailableNetworks] = useState<Array<{ code: string; label: string }>>([]);
  useEffect(() => { void cryptoServiceApi.getNetworks().then((result) => setAvailableNetworks(result.data ?? [])); }, []);

  const walletCounts = adminCryptoWallets.reduce(
    (acc, w) => {
      if (w.walletType === "SENDING") acc.sending += 1;
      else if (w.walletType === "RECEIVING") acc.receiving += 1;
      else if (w.walletType === "FUELING") acc.fueling += 1;
      return acc;
    },
    { sending: 0, receiving: 0, fueling: 0 },
  );

  return (
    <div className="space-y-6">
      {/* SECTION 1: SUPPORTED CRYPTO (READ-ONLY) */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#0E0F0C]">Supported Crypto</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-x-8">
          <PillInput
            label="Coin Name"
            placeholder="e.g. Bitcoin"
            value={name}
            id="name"
            disabled
          />
          <PillInput
            label="Symbol"
            placeholder={symbol}
            value={symbol}
            disabled
            id="symbol"
          />
        </div>

        <div className="bg-[#F8F9FA] p-5 rounded-2xl border border-[#ECECEC]">
          <label className="block text-[11px] font-semibold text-[#03034D] uppercase tracking-wider mb-3">
            Active Networks
          </label>
          <div className="flex flex-wrap gap-4">
            {active && activeNetworks.isError ? (
              <p className="text-sm text-red-600">Could not load active networks. Refresh to try again.</p>
            ) : active && !activeNetworks.isSuccess ? (
              <p className="text-sm text-gray-500">Loading networks...</p>
            ) : availableNetworks.map((opt) => (
              <Checkbox
                key={opt.code}
                id={`network-${opt.code}`}
                label={opt.label}
                checked={selectedNetworks.includes(opt.code)}
                onCheckedChange={() => {
                  const updated = selectedNetworks.includes(opt.code) ? selectedNetworks.filter((network) => network !== opt.code) : [...selectedNetworks, opt.code];
                  setEditedNetworks(updated);
                  onChangeInputField("networks", updated);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: WALLETS SUMMARY (READ-ONLY, LINKS OUT) */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl px-5 py-4 shadow-sm space-y-3">
        <div className="flex justify-between items-center gap-4 flex-wrap sm:flex-nowrap">
          <div>
            <h3 className="text-lg font-bold text-[#03034D]">Wallets</h3>
          </div>
          <Link
            to={ROUTES.ADMIN_WALLETS}
            search={{ cryptoId }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl transition-all whitespace-nowrap"
          >
            Manage Wallets
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <p>Sending: <span className="font-semibold text-[#03034D]">{walletCounts.sending}</span></p>
          <p>Receiving: <span className="font-semibold text-[#03034D]">{walletCounts.receiving}</span></p>
          <p>Fueling: <span className="font-semibold text-[#03034D]">{walletCounts.fueling}</span></p>
        </div>
      </div>

      {/* SECTION 3: COIN STATUS */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <Switch id="buyEnabled" label="Buy enabled" checked={editedBuyEnabled ?? buyEnabled} onCheckedChange={(checked) => { setEditedBuyEnabled(checked); onChangeInputField("buyEnabled", checked); }} />
          <Switch id="sellEnabled" label="Sell enabled" checked={sellEnabled} disabled />
        </div>
        <PillInput label="Buy decimal places" id="buyPrecision" type="number" min={0} max={8} value={editedBuyPrecision ?? (buyPrecision == null ? "" : String(buyPrecision))} onChange={(event) => { setEditedBuyPrecision(event.target.value); onChangeInputField("buyPrecision", event.target.valueAsNumber); }} />
        <div>
          <label className="block text-[13px] font-semibold text-[#454745] mb-3">
            Coin Status
          </label>
          <Switch
            id="isActive"
            label="Active"
            checked={editedActive ?? active}
            onCheckedChange={(checked) => {
              setEditedActive(checked);
              onChangeInputField("isActive", checked);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCoinDetails;

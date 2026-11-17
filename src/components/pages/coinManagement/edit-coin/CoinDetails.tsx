import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ROUTES } from "../../../../util/constants.util.ts";
import { cryptoServiceApi } from "../../../../api/crypto.api";
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
  const [isActive, setIsActive] = useState(active);
  const [selectedNetworks, setSelectedNetworks] = useState(networks);
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
            {availableNetworks.map((opt) => (
              <Checkbox
                key={opt.code}
                id={`network-${opt.code}`}
                label={opt.label}
                checked={selectedNetworks.includes(opt.code)}
                onCheckedChange={() => {
                  const updated = selectedNetworks.includes(opt.code) ? selectedNetworks.filter((network) => network !== opt.code) : [...selectedNetworks, opt.code];
                  setSelectedNetworks(updated);
                  onChangeInputField("networks", updated);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: WALLETS SUMMARY (READ-ONLY, LINKS OUT) */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-start gap-4 flex-wrap sm:flex-nowrap">
          <div>
            <h3 className="text-xl font-bold text-[#03034D]">Wallets</h3>
            <p className="text-xs text-gray-500 mt-1">
              Sending, receiving, and fueling wallets are managed on the dedicated Admin Wallets page.
            </p>
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

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#ECECEC] bg-[#FCFCFE] p-4 text-center">
            <div className="text-2xl font-bold text-[#03034D]">{walletCounts.sending}</div>
            <div className="text-[11px] text-gray-500 mt-1">Sending Wallets</div>
          </div>
          <div className="rounded-2xl border border-[#ECECEC] bg-[#FCFCFE] p-4 text-center">
            <div className="text-2xl font-bold text-[#03034D]">{walletCounts.receiving}</div>
            <div className="text-[11px] text-gray-500 mt-1">Receiving Wallets</div>
          </div>
          <div className="rounded-2xl border border-[#ECECEC] bg-[#F4F4F7] p-4 text-center">
            <div className="text-2xl font-bold text-[#03034D]">{walletCounts.fueling}</div>
            <div className="text-[11px] text-gray-500 mt-1">Fueling Wallets</div>
          </div>
        </div>
      </div>

      {/* SECTION 3: COIN STATUS */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl p-6 shadow-sm">
        <Switch id="buyEnabled" label="Buy enabled" defaultChecked={buyEnabled} onCheckedChange={(checked) => onChangeInputField("buyEnabled", checked)} />
        <Switch id="sellEnabled" label="Sell enabled" defaultChecked={sellEnabled} onCheckedChange={(checked) => onChangeInputField("sellEnabled", checked)} />
        <PillInput label="Buy decimal places" id="buyPrecision" type="number" min={0} max={8} defaultValue={buyPrecision ?? undefined} onChange={(event) => onChangeInputField("buyPrecision", event.target.valueAsNumber)} />
        <div>
          <label className="block text-[13px] font-semibold text-[#454745] mb-3">
            Coin Status
          </label>
          <Switch
            id="isActive"
            label="Active"
            checked={isActive}
            onCheckedChange={(checked) => {
              setIsActive(checked);
              onChangeInputField("isActive", checked);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCoinDetails;

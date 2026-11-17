import { useEffect, useState } from "react";
import type { CreateSupportedCryptoAndAdminWalletRequestType } from "../../../../schemas/crypto.schema";
import { PillInput } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import { Checkbox } from "../../../ui/checkbox";
import { cryptoServiceApi } from "../../../../api/crypto.api";

interface CoinDetailsProps {
  onChangeInputField: (
    field: keyof CreateSupportedCryptoAndAdminWalletRequestType,
    value: unknown,
  ) => void;
}

const CoinDetails = ({ onChangeInputField }: CoinDetailsProps) => {
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [isStableCoin, setIsStableCoin] = useState(false);
  const [query, setQuery] = useState("");
  const [coins, setCoins] = useState<Array<{ id: string; name: string; symbol: string }>>([]);
  const [selectedCoin, setSelectedCoin] = useState<{ name: string; symbol: string } | null>(null);
  const [searchError, setSearchError] = useState("");
  const [networks, setNetworks] = useState<Array<{ code: string; label: string }>>([]);
  const [networkCode, setNetworkCode] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [networkError, setNetworkError] = useState("");
  useEffect(() => {
    void cryptoServiceApi.getNetworks()
      .then((result) => setNetworks(result.data ?? []))
      .catch(() => setNetworkError("Could not load networks."));
  }, []);

  const searchCoins = async () => {
    try {
      const result = await cryptoServiceApi.searchCoins(query);
      setCoins(result.data ?? []);
      setSearchError(result.data?.length ? "" : "No coins found.");
    } catch {
      setSearchError("Could not search for coins. Try again.");
    }
  };

  const selectCoin = (coin: { id: string; name: string; symbol: string }) => {
    onChangeInputField("coinGeckoId", coin.id);
    onChangeInputField("name", coin.name);
    onChangeInputField("symbol", coin.symbol);
    setSelectedCoin(coin);
    setCoins([]);
  };

  const addNetwork = async () => {
    try {
      const result = await cryptoServiceApi.createNetwork(networkCode, networkName);
      if (result.data) {
        setNetworks((items) => [...items, result.data]);
        setNetworkCode("");
        setNetworkName("");
        setNetworkError("");
      }
    } catch {
      setNetworkError("Could not create network. Check the code and try again.");
    }
  };

  const handleNetworkToggle = (networkValue: string) => {
    const updated = selectedNetworks.includes(networkValue)
      ? selectedNetworks.filter((n) => n !== networkValue)
      : [...selectedNetworks, networkValue];
    setSelectedNetworks(updated);
    onChangeInputField("networks", updated);
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: SUPPORTED CRYPTO */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[#0E0F0C]">Supported Crypto</h3>
          <p className="text-xs text-gray-500 mt-1">Configure basic metadata and active networks for the new cryptocurrency.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-x-8">
          <div className="sm:col-span-2">
            <PillInput label="Find coin" id="coin-search" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedCoin(null); setCoins([]); onChangeInputField("coinGeckoId", ""); }} />
            <button type="button" className="mt-2 rounded-lg bg-[#03034D] px-4 py-2 text-white" onClick={searchCoins}>Search</button>
            {searchError && <p>{searchError}</p>}
            {selectedCoin && <p>Selected: {selectedCoin.name} ({selectedCoin.symbol})</p>}
            {coins.map((coin) => <button type="button" key={coin.id} className="block w-full rounded-lg p-2 text-left hover:bg-gray-100" onClick={() => selectCoin(coin)}>{coin.name} ({coin.symbol}) <span className="text-gray-500">{coin.id}</span></button>)}
          </div>
          <PillInput
            label="Coin Name"
            placeholder="e.g. Bitcoin"
            id="name"
            value={selectedCoin?.name ?? ""}
            disabled
          />
          <PillInput
            label="Symbol"
            placeholder="e.g. BTC"
            id="symbol"
            value={selectedCoin?.symbol ?? ""}
            disabled
          />
        </div>

        <div className="space-y-3">
          <label className="block text-[13px] font-medium text-[#454745]">
            Supported Networks
          </label>
          <div className="flex flex-wrap gap-4">
            {networks.map((opt) => (
              <Checkbox
                key={opt.code}
                id={`network-${opt.code}`}
                label={opt.label}
                checked={selectedNetworks.includes(opt.code)}
                onCheckedChange={() => handleNetworkToggle(opt.code)}
              />
            ))}
          </div>
          <PillInput label="New network code" id="network-code" value={networkCode} onChange={(event) => setNetworkCode(event.target.value.toUpperCase())} />
          <PillInput label="New network name" id="network-name" value={networkName} onChange={(event) => setNetworkName(event.target.value)} />
          <button type="button" className="rounded-lg bg-[#03034D] px-4 py-2 text-white" onClick={addNetwork}>Add network</button>
          {networkError && <p>{networkError}</p>}
        </div>
      </div>

      {selectedNetworks.length > 0 && (
        <div className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6 text-sm text-indigo-900">
          Wallets for this coin (sending, receiving, and fueling) are configured separately after
          creation. Once this coin is saved, go to{" "}
          <span className="font-semibold">Admin Wallets</span> in the sidebar to add and manage
          its wallets.
        </div>
      )}

      {/* SECTION 2: COIN METADATA & STATUS */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Switch id="buyEnabled" label="Buy enabled" defaultChecked onCheckedChange={(checked) => onChangeInputField("buyEnabled", checked)} />
        <div>
          <PillInput label="Buy decimal places" id="buyPrecision" type="number" min={0} max={8} onChange={(event) => onChangeInputField("buyPrecision", Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : -1)} />
          <p className="text-sm text-gray-600">Use the smallest number of decimal places supported across the selected networks.</p>
        </div>
        <p>New networks can be used for buys. Sell support and address validation require separate setup.</p>
        <div>
          <label className="block text-[13px] font-semibold text-[#454745] mb-3">
            Active Status
          </label>
          <Switch
            id="isActive"
            label="Active"
            defaultChecked
            onCheckedChange={(checked) => onChangeInputField("isActive", checked)}
          />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-[#454745] mb-3">
            Stable Coin
          </label>
          <Switch
            id="isStableCoin"
            label="Stable Coin"
            checked={isStableCoin}
            onCheckedChange={(checked) => {
              setIsStableCoin(checked);
              onChangeInputField("isStableCoin", checked);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoinDetails;

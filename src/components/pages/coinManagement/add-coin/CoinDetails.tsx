import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { CreateSupportedCryptoAndAdminWalletRequestType } from "../../../../schemas/crypto.schema";
import { PillInput } from "../../../ui/input";
import { Switch } from "../../../ui/switch";
import { Checkbox } from "../../../ui/checkbox";
import { cryptoServiceApi } from "../../../../api/crypto.api";
import { QUERY_KEYS } from "../../../../queries/querries.keys";
import { LoadingSpinner } from "../../../global/LoadingSpinner";

const COIN_SEARCH_MIN_LENGTH = 2;
const COIN_SEARCH_DEBOUNCE_MS = 400;
const COIN_SEARCH_MAX_RETRIES = 3;
const RATE_LIMIT_STATUS = 429;
const COIN_SEARCH_RETRY_BASE_MS = 1000;

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
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<{ name: string; symbol: string } | null>(null);
  const [networks, setNetworks] = useState<Array<{ code: string; label: string }>>([]);
  const [networkCode, setNetworkCode] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [networkError, setNetworkError] = useState("");
  const trimmedQuery = query.trim();
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(trimmedQuery), COIN_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  const searchEnabled = !selectedCoin && trimmedQuery.length >= COIN_SEARCH_MIN_LENGTH && trimmedQuery === debouncedQuery;
  const coinSearch = useQuery({
    queryKey: [QUERY_KEYS.CRYPTO.SEARCH_COIN_PROVIDER, debouncedQuery],
    queryFn: async ({ signal }) => {
      const result = await cryptoServiceApi.searchCoins(debouncedQuery, signal);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: searchEnabled,
    retry: (failureCount, error) => failureCount < COIN_SEARCH_MAX_RETRIES && axios.isAxiosError(error) && error.response?.status === RATE_LIMIT_STATUS,
    retryDelay: (attempt) => COIN_SEARCH_RETRY_BASE_MS * 2 ** attempt,
    staleTime: 60_000,
  });
  useEffect(() => {
    void cryptoServiceApi.getNetworks()
      .then((result) => setNetworks(result.data ?? []))
      .catch(() => setNetworkError("Could not load networks."));
  }, []);

  const selectCoin = (coin: { id: string; name: string; symbol: string }) => {
    onChangeInputField("coinGeckoId", coin.id);
    onChangeInputField("name", coin.name);
    onChangeInputField("symbol", coin.symbol);
    setSelectedCoin(coin);
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-x-8">
          <div className="sm:col-span-2">
            <PillInput label="Find coin" id="coin-search" value={query} onChange={(e) => { setQuery(e.target.value); setSelectedCoin(null); onChangeInputField("coinGeckoId", ""); }} />
            {searchEnabled && coinSearch.isFetching && <LoadingSpinner size="sm" message="Searching coins" />}
            {searchEnabled && coinSearch.isError && <p>Could not search for coins. Try again.</p>}
            {searchEnabled && coinSearch.isSuccess && !coinSearch.data?.length && <p>No coins found.</p>}
            {selectedCoin && <p>Selected: {selectedCoin.name} ({selectedCoin.symbol})</p>}
            {searchEnabled && coinSearch.data?.map((coin) => <button type="button" key={coin.id} className="block w-full rounded-lg p-2 text-left hover:bg-gray-100" onClick={() => selectCoin(coin)}>{coin.name} ({coin.symbol}) <span className="text-gray-500">{coin.id}</span></button>)}
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
          <label className="block text-sm font-medium text-[#454745]">
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
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-sm text-indigo-900">
          Configure sending, receiving, and fueling wallets under{" "}
          <span className="font-semibold">Admin Wallets</span> after saving.
        </div>
      )}

      {/* SECTION 2: COIN METADATA & STATUS */}
      <div className="bg-white border border-[#E9E7E2] rounded-3xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Switch id="buyEnabled" label="Buy enabled" defaultChecked onCheckedChange={(checked) => onChangeInputField("buyEnabled", checked)} />
        <Switch id="sellEnabled" label="Sell enabled" checked={false} disabled />
        <div>
          <PillInput label="Precision" id="buyPrecision" type="number" min={0} max={8} onChange={(event) => onChangeInputField("buyPrecision", Number.isFinite(event.target.valueAsNumber) ? event.target.valueAsNumber : -1)} />
          <p className="text-xs text-gray-500 mt-1">Set the lowest supported precision across selected networks.</p>
        </div>
        <p className="text-xs text-gray-500">Sell support and address validation require separate backend configuration.</p>
        <div>
          <label className="block text-sm font-semibold text-[#454745] mb-3">
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
          <label className="block text-sm font-semibold text-[#454745] mb-3">
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

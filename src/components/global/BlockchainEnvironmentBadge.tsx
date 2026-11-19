import { BLOCKCHAIN_ENVIRONMENT } from "../../util/enum";
import { useCryptoQuery } from "../../queries/crypto.querries";

interface BlockchainEnvironmentBadgeProps {
  environment?: "testnet" | "mainnet";
  className?: string;
}

export const BlockchainEnvironmentBadge = ({
  environment,
  className = "",
}: BlockchainEnvironmentBadgeProps) => {
  const { allSupportedCrypto } = useCryptoQuery();
  const currentEnv =
    environment ?? allSupportedCrypto?.[0]?.blockchainEnvironment;

  if (!currentEnv) return null;

  const isMainnet = currentEnv === BLOCKCHAIN_ENVIRONMENT.MAINNET;

  if (isMainnet) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 shadow-xs ${className}`}
        title="Active blockchain mode: Mainnet"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Mainnet
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 shadow-xs ${className}`}
      title="Active blockchain mode: Testnet"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      Testnet
    </span>
  );
};

export default BlockchainEnvironmentBadge;

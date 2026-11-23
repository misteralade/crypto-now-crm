export interface WalletFilters {
  min: string;
  max: string;
  purpose: string;
  status: string;
}

export const EMPTY_WALLET_FILTERS: WalletFilters = {
  min: "",
  max: "",
  purpose: "",
  status: "",
};

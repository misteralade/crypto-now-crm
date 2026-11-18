import { Fragment } from "react";
import CopyDetails, { CopyButton } from "../../../global/CopyDetails.tsx";
import { Building2, Wallet } from "lucide-react";

interface PaymentAccountDetailsProps {
  type: 'BUY' | 'SELL';
  hasBankAccount: boolean | null;
  accountName: string | undefined;
  accountNumber: string | undefined;
  bankName: string | undefined;
  isDeleted?: boolean;
  hasCryptoWallet: boolean | null;
  walletAddress: string | undefined;
  network: string | undefined;
  cryptoName: string | undefined;
  cryptoSymbol: string | undefined;
}

const PaymentAccountDetails = ({
  type,
  hasBankAccount,
  accountName,
  accountNumber,
  bankName,
  isDeleted,
  hasCryptoWallet,
  walletAddress,
  network,
  cryptoName,
  cryptoSymbol,
}: PaymentAccountDetailsProps) => {
  return (
    <Fragment>
      {type === 'SELL' && hasBankAccount ? (
        <div className={`bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 ${isDeleted ? 'bg-rose-50/30' : ''}`}>
          <div className="flex justify-between items-center pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Customer Payout Bank</h2>

              </div>
            </div>
            {isDeleted && (
              <span className="px-2 py-0.5 text-2xs font-bold uppercase tracking-wider rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                Deleted Account
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bank Name</p>
              <p className="text-sm font-bold text-slate-900 truncate" title={bankName}>{bankName || '-'}</p>
            </div>
            
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
              <div className="mb-1 flex items-center gap-1">
                <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Account Number</p>
                {accountNumber && <CopyButton text={accountNumber} iconClassName="w-3.5 h-3.5" ariaLabel="Copy account number" />}
              </div>
              <p className="text-sm font-mono text-slate-700">{accountNumber || '-'}</p>
            </div>

            <div className="col-span-1 sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-100/80">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Holder</p>
              <p className="text-sm font-bold text-slate-900 truncate">{accountName || '-'}</p>
            </div>
          </div>
        </div>
      ) : type === 'BUY' && hasCryptoWallet ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex justify-between items-center pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">Customer Crypto Destination</h2>

              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Wallet Address</p>
              <div className="flex items-center gap-2">
                <CopyDetails text={walletAddress || ''} wrap={true} className="!max-w-full font-mono text-xs font-semibold text-slate-900" iconClassName="!w-4 !h-4" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
                <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Network</p>
                <p className="text-xs font-bold text-slate-900">{network || '-'}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
                <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Coin</p>
                <p className="text-xs font-bold text-slate-900">{cryptoName} ({cryptoSymbol})</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default PaymentAccountDetails;


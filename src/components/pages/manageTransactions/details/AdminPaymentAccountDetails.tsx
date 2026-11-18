import { Fragment } from "react";
import CopyDetails, { CopyButton } from "../../../global/CopyDetails.tsx";
import { Landmark, ShieldCheck } from "lucide-react";

interface AdminPaymentAccountDetailsProps {
  type: 'BUY' | 'SELL';
  hasBankAccount: boolean | null;
  accountName: string | undefined;
  accountNumber: string | undefined;
  bankName: string | undefined;
  hasCryptoWallet: boolean | null;
  walletAddress: string | undefined;
  network: string | undefined;
  cryptoName: string | undefined;
  cryptoSymbol: string | undefined;
}

const AdminPaymentAccountDetails = ({
  type,
  hasBankAccount,
  accountName,
  accountNumber,
  bankName,
  hasCryptoWallet,
  walletAddress,
  network,
  cryptoName,
  cryptoSymbol,
}: AdminPaymentAccountDetailsProps) => {
  return (
    <Fragment>
      {type === 'SELL' && hasCryptoWallet ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Platform Custody Wallet</h2>
              <p className="text-2xs text-slate-500">Inbound custodial receiver for sell deposit</p>
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
                <p className="text-xs font-bold text-slate-900">
                  {cryptoName} ({cryptoSymbol})
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : type === 'BUY' && hasBankAccount ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">Platform Bank Account</h2>
              <p className="text-2xs text-slate-500">Inbound fiat payment receiving account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Bank Name</p>
              <p className="text-sm font-bold text-slate-900 truncate">{bankName || '-'}</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
              <div className="mb-1 flex items-center gap-1">
                <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Account Number</p>
                {accountNumber && <CopyButton text={accountNumber} iconClassName="w-3.5 h-3.5" ariaLabel="Copy account number" />}
              </div>
              <p className="text-sm font-mono text-slate-700">{accountNumber || '-'}</p>
            </div>
            <div className="col-span-1 sm:col-span-2 p-3 rounded-lg bg-slate-50 border border-slate-100/80">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Account Name</p>
              <p className="text-sm font-bold text-slate-900 truncate">{accountName || '-'}</p>
            </div>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default AdminPaymentAccountDetails;

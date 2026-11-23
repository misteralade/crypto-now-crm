import { ExternalLink } from 'lucide-react';
import type { SweepBatchSummary } from '../../../api/sweep.api';
import { getBtcTransactionExplorerUrl } from '../../../util/blockchain.util';

type Props = {
  transactions: SweepBatchSummary[];
  environment?: string;
  formatAmount: (amount: number) => string;
};

export default function BtcSweepTransactions({ transactions, environment, formatAmount }: Props) {
  const multipleTransactions = transactions.length > 1;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h3 className="text-lg font-bold text-[#03034D]">Transaction details</h3>
      <div className="mt-4 divide-y divide-gray-100">
        {transactions.map((transaction, index) => {
          const explorerUrl = getBtcTransactionExplorerUrl(transaction.txHash, environment);
          return (
            <div key={transaction.batchIndex} id={`sweep-transaction-${transaction.batchIndex}`} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">
                  {multipleTransactions && `Transaction ${index + 1}: `}
                  {transaction.walletCount} {transaction.walletCount === 1 ? 'wallet' : 'wallets'}
                </p>
                {explorerUrl ? (
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#575AE5] hover:underline">
                    View transaction <ExternalLink size={12} />
                  </a>
                ) : (
                  <span className="text-xs text-gray-500">Transaction link unavailable</span>
                )}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-4 text-sm sm:max-w-md">
                <div>
                  <dt className="text-xs text-gray-500">Amount sent</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-[#03034D]">{formatAmount(transaction.netAmount)} BTC</dd>
                </div>
                <div>
                  <dt className="text-xs text-gray-500">Network fee</dt>
                  <dd className="mt-1 font-semibold tabular-nums text-[#03034D]">{formatAmount(transaction.feeAmount)} BTC</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}

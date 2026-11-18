import CopyDetails from '../../../global/CopyDetails';
import type { SearchTransactionsResponse } from '../../../../types/response.payload.types';

interface TransactionContextProps {
  transaction: SearchTransactionsResponse;
}

const TransactionContext = ({ transaction }: TransactionContextProps) => {
  const InfoBlock = ({ title, bank, account, number, logo }: { title: string; bank?: string; account?: string; number?: string; logo?: string }) => (
    <div className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
      <div className="flex items-center gap-2">
        {logo && <img src={logo} alt="" className="h-8 w-8 shrink-0 rounded-full object-contain" />}
        <div className="min-w-0">{bank && <div className="text-sm font-medium text-gray-900">{bank}</div>}{account && <div className="text-xs text-gray-600">{account}</div>}</div>
      </div>
      {number && <div className="mt-2"><CopyDetails text={number} className="!max-w-full" iconClassName="!w-4 !h-4" /></div>}
    </div>
  );

  const WalletBlock = ({ title, address }: { title: string; address?: string }) => (
    <div className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
      {address && <CopyDetails text={address} wrap={true} className="!max-w-full" iconClassName="!w-4 !h-4" />}
    </div>
  );

  const isBuy = transaction.type === 'BUY';

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="space-y-3">
        {isBuy && transaction.userBankAccount && (
          <InfoBlock
            title="Money From"
            bank={transaction.userBankAccount.bank?.name}
            account={transaction.userBankAccount.accountName}
            number={transaction.userBankAccount.accountNumber}
            logo={transaction.userBankAccount.bank?.logoUrl}
          />
        )}

        {isBuy && transaction.adminBankAccount && (
          <InfoBlock
            title="Received At"
            bank={transaction.adminBankAccount.bank?.name}
            account={transaction.adminBankAccount.accountHolderName}
            number={transaction.adminBankAccount.accountNumber}
            logo={transaction.adminBankAccount.bank?.logoUrl}
          />
        )}

        {isBuy && transaction.walletAddress && (
          <WalletBlock title="Crypto To" address={transaction.walletAddress} />
        )}

        {!isBuy && transaction.walletAddress && (
          <WalletBlock title="Crypto From" address={transaction.walletAddress} />
        )}

        {!isBuy && transaction.userBankAccount && (
          <InfoBlock
            title="Paid To"
            bank={transaction.userBankAccount.bank?.name}
            account={transaction.userBankAccount.accountName}
            number={transaction.userBankAccount.accountNumber}
            logo={transaction.userBankAccount.bank?.logoUrl}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionContext;


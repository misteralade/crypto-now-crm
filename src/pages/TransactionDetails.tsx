import { Fragment, useState } from "react";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import {useTransactionDetailsPage} from "../hooks/pages/useTransactionDetailsPage.ts";
import PageHeader from "../components/global/pageHeader.tsx";
import {LoadingSpinner} from "../components/global/LoadingSpinner.tsx";
import TransactionOverview from "../components/pages/manageTransactions/details/TransactionOverview.tsx";
import CryptoCurrencyInfo from "../components/pages/manageTransactions/details/CryptoCurrencyInfo.tsx";
import PaymentAccountDetails from "../components/pages/manageTransactions/details/PaymentAccountDetails.tsx";
import AdminPaymentAccountDetails from "../components/pages/manageTransactions/details/AdminPaymentAccountDetails.tsx";
import TransactionHash from "../components/pages/manageTransactions/details/TransactionHash.tsx";
import type {CryptoNetworkType} from "../schemas/enum.schema.ts";
import TransactionReceipts from "../components/pages/manageTransactions/details/TransactionReceipts.tsx";
import CopyDetails from "../components/global/CopyDetails.tsx";
import TransactionDetailsUserProfile
  from "../components/pages/manageTransactions/details/TransactionDetailsUserProfile.tsx";
import TransactionDetailsPipeline from "../components/pages/manageTransactions/details/TransactionDetailsPipeline.tsx";
import TransactionContext from "../components/pages/manageTransactions/details/TransactionContext.tsx";
import { formatCompact } from "../util/asset-precision";
import { RefreshCw, Play, QrCode, FileText, AlertCircle, Fingerprint } from "lucide-react";
import LedgerEntriesSection from "../components/pages/manageTransactions/details/LedgerEntriesSection.tsx";
import ConfirmModal from "../components/global/ConfirmModal.tsx";
import IdentifierCard from "../components/pages/manageTransactions/details/IdentifierCard.tsx";

const TransactionDetails = () => {
  const {
    // 🧩 Values
    transactionInfo: transaction,
    loadingTransactionInfo,
    ledgerEntries,
    retryingConfirmation,
    forcingPayout,
    
    // ⚙️ Functions
    handleRetryDepositConfirmation,
    handleForceTriggerPayout,
  } = useTransactionDetailsPage();

  const [showForcePayoutConfirmModal, setShowForcePayoutConfirmModal] = useState(false);
  const canRetryConfirmation =
    transaction?.type === "SELL" &&
    ["DEPOSIT_DETECTED", "PENDING_CONFIRMATION"].includes(
      transaction?.status ?? ""
    );
  const canForcePayout =
    transaction?.type === "SELL" &&
    transaction?.status !== "COMPLETED" &&
    !!transaction?.userBankAccount;
  
  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Transaction Details"
        subtitle={transaction?.sessionId ? `Order: ${transaction.sessionId.slice(0, 16)}...` : 'Comprehensive order breakdown'}
        mobileActionsRight
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {canRetryConfirmation && (
              <button
                type="button"
                onClick={() => handleRetryDepositConfirmation(transaction?.sessionId)}
                disabled={retryingConfirmation}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 h-8.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retryingConfirmation ? 'animate-spin' : ''}`} />
                <span>{retryingConfirmation ? "Retrying..." : "Retry Confirmation"}</span>
              </button>
            )}
            {canForcePayout && (
              <button
                type="button"
                onClick={() => setShowForcePayoutConfirmModal(true)}
                disabled={forcingPayout}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 h-8.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{forcingPayout ? "Triggering..." : "Trigger Payout"}</span>
              </button>
            )}
          </div>
        }
      />
      <div className="p-4 sm:p-6 mx-auto">
        {loadingTransactionInfo ? (
          <LoadingSpinner size={"lg"} fullScreen={true} message={"Loading transaction details..."} />
        ) : transaction ? (
          <Fragment>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Main Content - Left Side */}
              <div className="lg:col-span-2 space-y-5">
                {/* Transaction Overview */}
                <TransactionOverview
                  type={transaction.type}
                  amountCrypto={Number(transaction.amountCrypto)}
                  symbol={transaction.cryptocurrency?.symbol || 'CRYPTO'}
                  currency={transaction.currency}
                  amountFiat={Number(transaction.amountFiat || 0)}
                  amountFiatNGN={Number(transaction.amountFiatNGN || 0)}
                  exchangeRateDisplay={
                    transaction.exchangeRate && Number(transaction.amountCrypto) > 0
                      ? transaction.currency === 'USD'
                        ? `1 ${transaction.cryptocurrency?.symbol || 'CRYPTO'} = $ ${formatCompact(Number(transaction.exchangeRate.rate), "USD", 2)}`
                        : `1 ${transaction.cryptocurrency?.symbol || 'CRYPTO'} = ₦ ${formatCompact(Number(transaction.exchangeRate.rate) * Number(transaction.exchangeRate.platformRate), "NGN", 2)}`
                      : Number(transaction.amountCrypto) > 0
                        ? transaction.currency === 'USD'
                          ? `1 ${transaction.cryptocurrency?.symbol || 'CRYPTO'} = $ ${formatCompact(Number(transaction.amountFiat) / Number(transaction.amountCrypto), "USD", 2)}`
                          : `1 ${transaction.cryptocurrency?.symbol || 'CRYPTO'} = ₦ ${formatCompact(Number(transaction.amountFiatNGN || 0) / Number(transaction.amountCrypto), "NGN", 2)}`
                        : '-'
                  }
                  status={transaction.status}
                  confirmationCount={transaction.confirmationCount}
                />

                {/* Transaction Context Flow */}
                <TransactionContext transaction={transaction} />

                {/* Cryptocurrency Info */}
                {transaction.cryptocurrency && (
                  <CryptoCurrencyInfo
                    logoUrl={transaction.cryptocurrency.logoUrl || ''}
                    symbol={transaction.cryptocurrency.symbol}
                    name={transaction.cryptocurrency.name}
                  />
                )}
                
                {/* User Bank Account And/Or Crypto Wallet Details */}
                <PaymentAccountDetails
                  type={transaction.type}
                  hasBankAccount={transaction.userBankAccount ? true : false}
                  accountName={transaction.userBankAccount?.accountName}
                  accountNumber={transaction.userBankAccount?.accountNumber}
                  bankName={transaction.userBankAccount?.bank?.name}
                  isDeleted={transaction.userBankAccount?.isDeleted}
                  hasCryptoWallet={transaction?.userCryptoWallet ? true : false}
                  walletAddress={transaction.userCryptoWallet?.walletAddress}
                  network={transaction.userCryptoWallet?.network}
                  cryptoName={transaction.cryptocurrency?.name}
                  cryptoSymbol={transaction.cryptocurrency?.symbol}
                />
                
                {/* Admin Bank Account And/Or Crypto Wallet Details */}
                <AdminPaymentAccountDetails
                  type={transaction.type}
                  hasBankAccount={transaction?.adminBankAccount ? true : false}
                  accountName={transaction.adminBankAccount?.accountHolderName}
                  accountNumber={transaction.adminBankAccount?.accountNumber}
                  bankName={transaction.adminBankAccount?.bank?.name}
                  hasCryptoWallet={transaction?.adminCryptoWallet ? true : false}
                  walletAddress={transaction.adminCryptoWallet?.walletAddress}
                  network={transaction.adminCryptoWallet?.network}
                  cryptoName={transaction.cryptocurrency?.name}
                  cryptoSymbol={transaction.cryptocurrency?.symbol}
                />
                
                {/* Transaction Hash */}
                {transaction.cryptoTxHash && (
                  <TransactionHash
                    cryptoTxHash={transaction.cryptoTxHash}
                    network={transaction.adminCryptoWallet?.network as CryptoNetworkType}
                    walletAddress={transaction?.adminCryptoWallet?.walletAddress || ''}
                  />
                )}

                {/* Custodial Deposit Address (Sell) */}
                {transaction.type === "SELL" && transaction.depositAddress ? (
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                    <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Custodial Deposit Address</h2>
                        <p className="text-2xs text-slate-500">Inbound crypto deposit target</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100/80">
                      <CopyDetails
                        text={transaction.depositAddress}
                        wrap={true}
                        className="!max-w-full font-mono text-xs font-semibold text-slate-900"
                        iconClassName="!w-4 !h-4"
                      />
                    </div>
                  </div>
                ) : null}
                
                {/* Bank Transfer Reference */}
                {transaction.bankTransferReference && (
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                    <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Bank Transfer Reference</h2>
                        <p className="text-2xs text-slate-500">Payment matching identifier</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100/80">
                      <p className="font-mono text-xs font-bold text-slate-900">{transaction.bankTransferReference}</p>
                      <CopyDetails text={transaction.bankTransferReference} className="!max-w-[400px]" iconClassName="!w-4 !h-4" />
                    </div>
                  </div>
                )}
                
                {/* Payment Receipts */}
                {transaction.type === "BUY" && (
                  <TransactionReceipts
                    receiptImageUrl={transaction.receiptImageUrl}
                    adminPaymentReceiptUrl={transaction.adminPaymentReceiptUrl}
                  />
                )}
                
                {/* Notes */}
                {(transaction.userNotes || transaction.adminNotes || transaction.internalNotes) && (
                  <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                    <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 tracking-tight">Audit & Session Notes</h2>
                        <p className="text-2xs text-slate-500">Customer remarks and internal compliance memos</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {transaction.userNotes && (
                        <div className="p-3.5 bg-blue-50/70 border border-blue-100/80 rounded-lg">
                          <p className="text-2xs font-bold uppercase tracking-wider text-blue-900 mb-1">User Notes</p>
                          <p className="text-xs text-blue-800">{transaction.userNotes}</p>
                        </div>
                      )}
                      {transaction.adminNotes && (
                        <div className="p-3.5 bg-purple-50/70 border border-purple-100/80 rounded-lg">
                          <p className="text-2xs font-bold uppercase tracking-wider text-purple-900 mb-1">Admin Notes</p>
                          <p className="text-xs text-purple-800">{transaction.adminNotes}</p>
                        </div>
                      )}
                      {transaction.internalNotes && (
                        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-lg">
                          <p className="text-2xs font-bold uppercase tracking-wider text-slate-700 mb-1">Internal Notes</p>
                          <p className="text-xs text-slate-600">{transaction.internalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Failure Reason */}
                {transaction.failureReason && (
                  <div className="bg-white rounded-xl border border-rose-200 shadow-xs p-5">
                    <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-rose-100">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-rose-900 tracking-tight">Exception Reason</h2>
                        <p className="text-2xs text-rose-500">Reason reported by automated settlement gateway</p>
                      </div>
                    </div>
                    <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-lg">
                      <p className="text-xs font-medium text-rose-800">{transaction.failureReason}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-5">
                {/* User Profile */}
                {transaction.user && (
                  <TransactionDetailsUserProfile
                    userId={transaction.userId}
                    firstName={transaction.profile?.firstName || ''}
                    lastName={transaction.profile?.lastName || ''}
                    email={transaction.user?.email || ''}
                    phone={transaction?.profile?.phoneNumber || ''}
                    profileImageUrl={transaction.profile?.profileImg || ''}
                  />
                )}
                
                {/* Timeline */}
                <TransactionDetailsPipeline
                  createdAt={transaction.createdAt}
                  updatedAt={transaction.updatedAt}
                  processedAt={transaction.processedAt || undefined}
                  processedByFirstName={transaction.processor?.firstName || undefined}
                  processedByLastName={transaction.processor?.lastName || undefined}
                />
                
                {/* Session Info & Identifiers */}
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
                  <div className="flex items-center gap-2.5 pb-3.5 mb-3.5 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Fingerprint className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 tracking-tight">Identifiers & Metadata</h2>
                      <p className="text-2xs text-slate-500">System reference keys</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <IdentifierCard label="Session ID" value={transaction.sessionId} />
                    <IdentifierCard label="Transaction ID" value={transaction.id} />
                    {transaction.rateSnapshot && (
                      <IdentifierCard label="Rate Snapshot" value={JSON.stringify(transaction.rateSnapshot, null, 2)} formatted />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <LedgerEntriesSection ledgerEntries={ledgerEntries} />
            </div>
          </Fragment>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center text-slate-400 text-sm">
            No transaction details available.
          </div>
        )}
      </div>
      <ConfirmModal
        open={showForcePayoutConfirmModal}
        actionType="proceed"
        onClose={() => setShowForcePayoutConfirmModal(false)}
        onConfirm={async () => {
          setShowForcePayoutConfirmModal(false);
          await handleForceTriggerPayout(transaction?.sessionId);
        }}
        message="This will force the payout pipeline to run even if the transaction is not in the normal payout state. Confirm only if you intend to proceed."
        confirmText={forcingPayout ? "Triggering..." : "Force payout"}
      />
    </AuthenticatedLayout>
  )
}

export default TransactionDetails;

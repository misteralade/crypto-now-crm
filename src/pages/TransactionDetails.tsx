import { Fragment, useState, type ReactNode } from "react";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import { useTransactionDetailsPage } from "../hooks/pages/useTransactionDetailsPage.ts";
import PageHeader from "../components/global/pageHeader.tsx";
import { LoadingSpinner } from "../components/global/LoadingSpinner.tsx";
import TransactionOverview from "../components/pages/manageTransactions/details/TransactionOverview.tsx";
import PaymentAccountDetails from "../components/pages/manageTransactions/details/PaymentAccountDetails.tsx";
import AdminPaymentAccountDetails from "../components/pages/manageTransactions/details/AdminPaymentAccountDetails.tsx";
import TransactionHash from "../components/pages/manageTransactions/details/TransactionHash.tsx";
import type { CryptoNetworkType, TransactionStatusType } from "../schemas/enum.schema.ts";
import TransactionReceipts from "../components/pages/manageTransactions/details/TransactionReceipts.tsx";
import CopyDetails from "../components/global/CopyDetails.tsx";
import TransactionDetailsUserProfile from "../components/pages/manageTransactions/details/TransactionDetailsUserProfile.tsx";
import TransactionDetailsPipeline from "../components/pages/manageTransactions/details/TransactionDetailsPipeline.tsx";
import TransactionContext from "../components/pages/manageTransactions/details/TransactionContext.tsx";
import { formatCompact } from "../util/asset-precision";
import { RefreshCw, Play, QrCode, FileText, AlertCircle, Fingerprint, Upload } from "lucide-react";
import LedgerEntriesSection from "../components/pages/manageTransactions/details/LedgerEntriesSection.tsx";
import ConfirmModal from "../components/global/ConfirmModal.tsx";
import IdentifierCard from "../components/pages/manageTransactions/details/IdentifierCard.tsx";
import TransactionStatusPicker from "../components/pages/manageTransactions/TransactionStatusPicker.tsx";
import TransactionActivityLog from "../components/pages/manageTransactions/details/TransactionActivityLog.tsx";
import ReceiptViewer from "../components/global/ReceiptViewer.tsx";
import type { UpdateTransactionStatusRequestType } from "../schemas/transaction.schema.ts";
import { TRANSACTION_STATUS } from "../util/enum.ts";
import { TRANSACTION_STATUS_SCOPE } from "../util/constants.util.ts";

const TransactionDetails = () => {
  const {
    transactionInfo: transaction,
    loadingTransactionInfo,
    ledgerEntries,
    retryingConfirmation,
    forcingPayout,
    updatingStatus,
    lockingTransaction,
    transactionLocked,
    handleRetryDepositConfirmation,
    handleForceTriggerPayout,
    handleUpdateTransaction,
    handleUploadReceipt,
  } = useTransactionDetailsPage();
  const [showForcePayoutConfirmModal, setShowForcePayoutConfirmModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<TransactionStatusType>();
  const [adminNotes, setAdminNotes] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string>();
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string>();
  const [receiptName, setReceiptName] = useState<string>();

  const canRetryConfirmation = transaction?.type === TRANSACTION_STATUS_SCOPE.SELL && (transaction.status === TRANSACTION_STATUS.DEPOSIT_DETECTED || transaction.status === TRANSACTION_STATUS.PENDING_CONFIRMATION);
  const canForcePayout = transaction?.type === TRANSACTION_STATUS_SCOPE.SELL && transaction.status !== TRANSACTION_STATUS.COMPLETED && !!transaction.userBankAccount;

  const uploadReceipt = async (file?: File) => {
    if (!file || file.size > 5 * 1024 * 1024) return;
    const validTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!validTypes.includes(file.type)) return;
    const uploaded = await handleUploadReceipt(file);
    if (uploaded) {
      setReceiptUrl(uploaded.url);
      setReceiptPreviewUrl(uploaded.signedUrl);
      setReceiptName(file.name);
    }
  };

  const saveStatus = async () => {
    if (!selectedStatus || !transaction) return;
    const payload: UpdateTransactionStatusRequestType = { status: selectedStatus };
    if (adminNotes.trim()) payload.adminNotes = adminNotes.trim();
    if (receiptUrl) payload.adminPaymentReceiptUrl = receiptUrl;
    const response = await handleUpdateTransaction(transaction.sessionId, payload);
    if (response?.success) {
      setSelectedStatus(undefined);
      setAdminNotes("");
      setReceiptUrl(undefined);
      setReceiptPreviewUrl(undefined);
      setReceiptName(undefined);
    }
  };

  return (
    <AuthenticatedLayout>
      <PageHeader title="Transaction Details" />
      <div className="mx-auto p-4 sm:p-6">
        {loadingTransactionInfo ? <LoadingSpinner size="lg" fullScreen message="Loading transaction details..." /> : transaction ? (
          <Fragment>
            <div className="space-y-5">
              <TransactionOverview
                type={transaction.type}
                amountCrypto={Number(transaction.amountCrypto)}
                symbol={transaction.cryptocurrency?.symbol || "CRYPTO"}
                logoUrl={transaction.cryptocurrency?.logoUrl}
                currency={transaction.currency}
                amountFiat={Number(transaction.amountFiat || 0)}
                amountFiatNGN={Number(transaction.amountFiatNGN || 0)}
                exchangeRateDisplay={transaction.exchangeRate && Number(transaction.amountCrypto) > 0
                  ? transaction.currency === "USD"
                    ? `1 ${transaction.cryptocurrency?.symbol || "CRYPTO"} = $ ${formatCompact(Number(transaction.exchangeRate.rate), "USD", 2)}`
                    : `1 ${transaction.cryptocurrency?.symbol || "CRYPTO"} = ₦ ${formatCompact(Number(transaction.exchangeRate.rate) * Number(transaction.exchangeRate.platformRate), "NGN", 2)}`
                  : Number(transaction.amountCrypto) > 0
                    ? transaction.currency === "USD"
                      ? `1 ${transaction.cryptocurrency?.symbol || "CRYPTO"} = $ ${formatCompact(Number(transaction.amountFiat) / Number(transaction.amountCrypto), "USD", 2)}`
                      : `1 ${transaction.cryptocurrency?.symbol || "CRYPTO"} = ₦ ${formatCompact(Number(transaction.amountFiatNGN || 0) / Number(transaction.amountCrypto), "NGN", 2)}`
                    : "-"}
                status={transaction.status}
                confirmationCount={transaction.confirmationCount}
              />

              <div className="grid gap-5 xl:grid-cols-2">
                {transaction.user && <TransactionDetailsUserProfile userId={transaction.userId} firstName={transaction.user?.profile?.firstName || ""} lastName={transaction.user?.profile?.lastName || ""} email={transaction.user.email || ""} phone={transaction.user?.profile?.phoneNumber || ""} profileImageUrl={transaction.user?.profile?.profileImg || ""} />}
                <TransactionDetailsPipeline createdAt={transaction.createdAt} updatedAt={transaction.updatedAt} processedAt={transaction.processedAt || undefined} processedByFirstName={transaction.processor?.firstName || undefined} processedByLastName={transaction.processor?.lastName || undefined} />
              </div>

              <TransactionContext transaction={transaction} />

              <div className="grid gap-5 xl:grid-cols-2">
                <PaymentAccountDetails type={transaction.type} hasBankAccount={!!transaction.userBankAccount} accountName={transaction.userBankAccount?.accountName} accountNumber={transaction.userBankAccount?.accountNumber} bankName={transaction.userBankAccount?.bank?.name} isDeleted={transaction.userBankAccount?.isDeleted} hasCryptoWallet={!!transaction.userCryptoWallet} walletAddress={transaction.userCryptoWallet?.walletAddress} network={transaction.userCryptoWallet?.network} cryptoName={transaction.cryptocurrency?.name} cryptoSymbol={transaction.cryptocurrency?.symbol} />
              </div>

              {(transaction.cryptoTxHash || transaction.depositAddress || transaction.bankTransferReference) && <div className="grid gap-5 xl:grid-cols-2">
                {transaction.cryptoTxHash && <TransactionHash cryptoTxHash={transaction.cryptoTxHash} network={transaction.adminCryptoWallet?.network as CryptoNetworkType} walletAddress={transaction.adminCryptoWallet?.walletAddress || ""} />}
                {transaction.type === "SELL" && transaction.depositAddress && <DetailCard title="Custodial Deposit Address" icon={<QrCode size={16} />}><CopyDetails text={transaction.depositAddress} wrap className="!max-w-full font-mono" /></DetailCard>}
                {transaction.type === "BUY" && transaction.bankTransferReference && <DetailCard title="Bank Transfer Reference" icon={<FileText size={16} />}><CopyDetails text={transaction.bankTransferReference} wrap className="!max-w-full font-mono" /></DetailCard>}
              </div>}

                {transaction.type === TRANSACTION_STATUS_SCOPE.BUY && <TransactionReceipts receiptImageUrl={transaction.receiptImageUrl} adminPaymentReceiptUrl={transaction.adminPaymentReceiptUrl} />}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div><h2 className="text-sm font-semibold text-slate-900">Transaction controls</h2></div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {canRetryConfirmation && <button type="button" onClick={() => handleRetryDepositConfirmation(transaction.sessionId)} disabled={retryingConfirmation} className="inline-flex h-9 items-center gap-2 rounded-lg bg-amber-600 px-3 text-xs font-semibold text-white disabled:opacity-50"><RefreshCw size={14} className={retryingConfirmation ? "animate-spin" : ""} />{retryingConfirmation ? "Retrying..." : "Retry confirmation"}</button>}
                    {canForcePayout && <button type="button" onClick={() => setShowForcePayoutConfirmModal(true)} disabled={forcingPayout} className="inline-flex h-9 items-center gap-2 rounded-lg bg-rose-600 px-3 text-xs font-semibold text-white disabled:opacity-50"><Play size={14} />{forcingPayout ? "Triggering..." : "Trigger payout"}</button>}
                  </div>
                </header>
                <div className="grid gap-4 lg:grid-cols-2">
                  <TransactionStatusPicker transactionType={transaction.type} currentStatus={transaction.status} selectedStatus={selectedStatus} onSelectStatus={setSelectedStatus} onSave={saveStatus} isSaving={updatingStatus} canSave={transactionLocked && !lockingTransaction} />
                  <label className="block space-y-1.5"><span className="text-xs font-medium text-slate-600">Admin note (optional)</span><textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} maxLength={500} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600" placeholder="Add a note with this status update" /></label>
                </div>
                {transaction.type === TRANSACTION_STATUS_SCOPE.BUY && <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 md:grid-cols-2 md:items-center">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-blue-700"><Upload size={16} />Upload admin payment receipt<input type="file" accept="image/png,image/jpeg,application/pdf" className="sr-only" onChange={(event) => { void uploadReceipt(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
                  {receiptPreviewUrl ? <ReceiptViewer url={receiptPreviewUrl} label={receiptName || "New payment receipt"} /> : transaction.adminPaymentReceiptUrl ? <ReceiptViewer url={transaction.adminPaymentReceiptUrl} label="Admin payment receipt" /> : null}
                </div>}
                {lockingTransaction && <p className="mt-3 text-xs text-slate-500">Preparing transaction controlsâ€¦</p>}
              </section>

              {(transaction.userNotes || transaction.adminNotes || transaction.internalNotes || transaction.failureReason) && <div className="grid gap-5 xl:grid-cols-2">
                {(transaction.userNotes || transaction.adminNotes || transaction.internalNotes) && <DetailCard title="Transaction notes" icon={<FileText size={16} />}><div className="space-y-3">{transaction.userNotes && <p className="text-sm text-slate-700"><span className="font-medium">Customer:</span> {transaction.userNotes}</p>}{transaction.adminNotes && <p className="text-sm text-slate-700"><span className="font-medium">Admin:</span> {transaction.adminNotes}</p>}{transaction.internalNotes && <p className="text-sm text-slate-700"><span className="font-medium">Internal:</span> {transaction.internalNotes}</p>}</div></DetailCard>}
                {transaction.failureReason && <DetailCard title="Exception reason" icon={<AlertCircle size={16} />}><p className="text-sm text-rose-800">{transaction.failureReason}</p></DetailCard>}
              </div>}

              <TransactionActivityLog activities={transaction.transactionActivities || []} />
              <LedgerEntriesSection ledgerEntries={ledgerEntries} />

              <div className="grid items-start gap-5 xl:grid-cols-2">
                <AdminPaymentAccountDetails type={transaction.type} hasBankAccount={!!transaction.adminBankAccount} accountName={transaction.adminBankAccount?.accountHolderName} accountNumber={transaction.adminBankAccount?.accountNumber} bankName={transaction.adminBankAccount?.bank?.name} hasCryptoWallet={!!transaction.adminCryptoWallet} walletAddress={transaction.adminCryptoWallet?.walletAddress} network={transaction.adminCryptoWallet?.network} cryptoName={transaction.cryptocurrency?.name} cryptoSymbol={transaction.cryptocurrency?.symbol} />
                <details className="group rounded-xl border border-slate-200 bg-white shadow-xs">
                <summary className="flex cursor-pointer list-none items-center gap-3 p-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><Fingerprint size={16} /></span>
                  <span><span className="block text-sm font-semibold text-slate-900">Identifiers &amp; Metadata</span></span>
                  <span className="ml-auto text-xs text-blue-600 group-open:hidden">Show</span><span className="ml-auto hidden text-xs text-blue-600 group-open:inline">Hide</span>
                </summary>
                <div className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-2">
                  <IdentifierCard label="Session ID" value={transaction.sessionId} />
                  <IdentifierCard label="Transaction ID" value={transaction.id} />
                  {transaction.rateSnapshot && <div className="md:col-span-2"><IdentifierCard label="Rate Snapshot" value={JSON.stringify(transaction.rateSnapshot, null, 2)} formatted /></div>}
                </div>
                </details>
              </div>
            </div>
          </Fragment>
        ) : <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-400">No transaction details available.</div>}
      </div>
      <ConfirmModal open={showForcePayoutConfirmModal} actionType="proceed" onClose={() => setShowForcePayoutConfirmModal(false)} onConfirm={async () => { setShowForcePayoutConfirmModal(false); await handleForceTriggerPayout(transaction?.sessionId); }} message="This will force the payout pipeline to run even if the transaction is not in the normal payout state. Confirm only if you intend to proceed." confirmText={forcingPayout ? "Triggering..." : "Force payout"} />
    </AuthenticatedLayout>
  );
};

const DetailCard = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
    <header className="mb-4 flex items-center gap-2.5 border-b border-slate-100 pb-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</span><div><h2 className="text-sm font-semibold text-slate-900">{title}</h2></div></header>
    {children}
  </section>
);

export default TransactionDetails;


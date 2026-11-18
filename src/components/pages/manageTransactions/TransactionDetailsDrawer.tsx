import { Fragment, useState, useEffect } from "react";
import { Upload, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { formatCompact } from "../../../util/asset-precision";
import momentClient from "../../../util/moment";
import CopyDetails from "../../global/CopyDetails";
import ReceiptViewer from "../../global/ReceiptViewer.tsx";
import { StatusBadge } from "../../global/StatusBadge";
import { setTransactionDetailUpdateField } from "../../../redux/transaction-management.slice";
import TransactionStatusPicker from "./TransactionStatusPicker";
import type { TransactionStatusType } from "../../../schemas/enum.schema";
import type { SearchTransactionsResponse } from "../../../types/response.payload.types";
import type { UpdateTransactionStatusRequestType } from "../../../schemas/transaction.schema";
import type { ChangeEvent } from "react";
import LabeledPillInput from "../../global/LabeledPillInput";
import type { RootState } from "../../../store";
import { Skeleton } from "../../global/Skeleton";
import ConfirmModal from "../../global/ConfirmModal";
import TransactionDetailsUserProfile from "./details/TransactionDetailsUserProfile";
import PaymentAccountDetails from "./details/PaymentAccountDetails";
import AdminPaymentAccountDetails from "./details/AdminPaymentAccountDetails";
import TransactionContext from "./details/TransactionContext";
import LedgerEntriesSection from "./details/LedgerEntriesSection";
import TransactionActivityLog from "./details/TransactionActivityLog";

interface TransactionDetailsDrawerProps {
  isOpen: boolean;
  onClose: (value?: string) => void;
  transaction?: SearchTransactionsResponse | undefined | null;
  loading?: boolean;
  handleTransactionUpdateField: (
    field: keyof UpdateTransactionStatusRequestType,
    value: UpdateTransactionStatusRequestType[keyof UpdateTransactionStatusRequestType]
  ) => void;
  handleTransactionUpdate: () => Promise<{ success: boolean; message: string } | null>;
  handleTransactionReceiptUpload: (file: File) => Promise<string>;
  handleRetryDepositConfirmation: (sessionId?: string) => Promise<void>;
  handleForceTriggerPayout: (sessionId?: string) => Promise<void>;
  retryingConfirmation: boolean;
  forcingPayout: boolean;
  isSavingStatus: boolean;
}

const TransactionDetailsDrawer = ({
  isOpen,
  onClose,
  transaction,
  loading,
  handleTransactionUpdateField,
  handleTransactionUpdate,
  handleTransactionReceiptUpload,
  handleRetryDepositConfirmation,
  handleForceTriggerPayout,
  retryingConfirmation,
  forcingPayout,
  isSavingStatus,
}: TransactionDetailsDrawerProps) => {
  const dispatch = useDispatch();
  const updatePayload = useSelector(
    (state: RootState) => state.transactionManagement.details.update
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<
    TransactionStatusType | undefined
  >(undefined);
  const [showForcePayoutConfirmModal, setShowForcePayoutConfirmModal] =
    useState(false);

  // Pre-fill update form from server when drawer opens so existing note is shown
  useEffect(() => {
    if (isOpen && transaction) {
      dispatch(
        setTransactionDetailUpdateField({
          field: "adminNotes",
          value: transaction.adminNotes ?? "",
        })
      );
    }
  }, [dispatch, isOpen, transaction]);

  // Reset transient drawer state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStatus(undefined);
      setUploadedFile(null);
      setPreviewUrl(undefined);
    }
  }, [isOpen]);

  const renderSkeletons = () => (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200/80 bg-white p-5 space-y-4 shadow-xs">
        <Skeleton height="h-4" width="w-32" rounded="md" className="mb-4" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex justify-between items-center">
            <Skeleton height="h-4" width="w-24" rounded="md" />
            <Skeleton height="h-4" width="w-40" rounded="md" />
          </div>
        ))}
      </section>
      <Skeleton height="h-9" width="w-48" rounded="md" />
      <section className="mt-4 space-y-3">
        <Skeleton height="h-5" width="w-40" rounded="md" />
        <div className="flex flex-wrap gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="h-8" width="w-28" rounded="md" />
          ))}
        </div>
      </section>
      <Skeleton height="h-24" width="w-full" rounded="lg" />
      <Skeleton height="h-10" width="w-full" rounded="md" />
    </div>
  );

  // Hide system-generated lock entries from the activity feed.
  const visibleTransactionActivities = transaction?.transactionActivities ?? [];
  const userBankName = transaction?.userBankAccount?.bank?.name;
  const adminBankName = transaction?.adminBankAccount?.bank?.name;

  // Explicit rate: 1 crypto = fiat (variable by transaction currency)
  const getExchangeRateDisplay = (): string => {
    if (!transaction) return "-";
    const symbol = transaction.cryptocurrency?.symbol ?? "";
    if (!symbol) return "-";
    const currency = transaction.currency;
    if (transaction.exchangeRate) {
      const rate = Number(transaction.exchangeRate.rate);
      const platformRate = Number(transaction.exchangeRate.platformRate);
      if (currency === "USD") {
        return `1 ${symbol} = $ ${formatCompact(rate, "USD", 2)}`;
      }
      return `1 ${symbol} = ₦ ${formatCompact(platformRate * rate, "NGN", 2)}`;
    }
    const amountCrypto = Number(transaction.amountCrypto);
    if (amountCrypto <= 0) return "-";
    if (currency === "USD") {
      const val = Number(transaction.amountFiat) / amountCrypto;
      return `1 ${symbol} = $ ${formatCompact(val, "USD", 2)}`;
    }
    const val = Number(transaction.amountFiatNGN || 0) / amountCrypto;
    return `1 ${symbol} = ₦ ${formatCompact(val, "NGN", 2)}`;
  };

  const canRetryConfirmation =
    transaction?.type === "SELL" &&
    ["DEPOSIT_DETECTED", "PENDING_CONFIRMATION"].includes(
      transaction?.status ?? ""
    );
  const canForcePayout =
    transaction?.type === "SELL" &&
    transaction?.status !== "COMPLETED" &&
    !!transaction?.userBankAccount;

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", pdf: "application/pdf" };
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || validTypes[extension] !== file.type) {
      alert("Please upload only PNG, JPG, JPEG, or PDF files");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const signedUrl = await handleTransactionReceiptUpload(file);
    setUploadedFile(file);
    setPreviewUrl(signedUrl);
  };

  const removeFile = () => {
    dispatch(
      setTransactionDetailUpdateField({
        field: "adminPaymentReceiptUrl",
        value: undefined,
      })
    );
    setUploadedFile(null);
    setPreviewUrl(undefined);
  };

  return (
    <div
      className={`fixed inset-0 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div className="absolute inset-0 bg-black/5" onClick={() => onClose()} />
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[520px] lg:w-[570px] bg-slate-50/70 border-l border-slate-200 shadow-xl p-5 sm:p-6 overflow-y-auto transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
          <div className="text-slate-900 font-bold text-base tracking-tight">
            Transaction Order Details
          </div>
          <button
            onClick={() => onClose()}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {loading || !transaction ? (
          renderSkeletons()
        ) : (
          <div className="space-y-4">
            {/* Order Details */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
              <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100">
                Order Summary
              </h3>
              <div className="flex flex-col gap-y-3 text-xs text-slate-800">
                {/* Transaction ID */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-4">
                  <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
                    Transaction ID
                  </div>
                  <div className="w-full sm:w-auto flex justify-end font-mono text-2xs">
                    <CopyDetails
                      text={transaction.sessionId}
                      wrap={true}
                      className="!max-w-full sm:!max-w-[280px]"
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="flex justify-between items-center">
                  <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Type</div>
                  <div className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider ${transaction.type === 'BUY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'}`}>
                    {transaction.type}
                  </div>
                </div>

                {/* Amount */}
                <div className="flex justify-between items-center">
                  <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Amount</div>
                  <div className="font-bold text-xs text-slate-900 tabular-nums">
                    {transaction.type === "BUY" ? (
                      <Fragment>
                        ₦ {Number(transaction.amountFiatNGN).toLocaleString()}
                      </Fragment>
                    ) : (
                      <Fragment>
                        {transaction.amountCrypto}{" "}
                        {transaction.cryptocurrency
                          ? transaction.cryptocurrency.symbol
                          : ""}
                      </Fragment>
                    )}
                  </div>
                </div>

                {/* Initiation Date */}
                <div className="flex justify-between items-center">
                  <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Date</div>
                  <div className="font-semibold text-xs text-slate-700">
                    {momentClient.formatToNormalisedDateAndTime(
                      transaction.createdAt
                    )}
                  </div>
                </div>

                {/* Exchange Rate */}
                <div className="flex justify-between items-center">
                  <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                    Exchange Rate
                  </div>
                  <div className="font-semibold text-xs text-slate-900">
                    {getExchangeRateDisplay()}
                  </div>
                </div>

                {/* User Amount to Receive */}
                <div className="flex justify-between items-center">
                  <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                    User will receive
                  </div>
                  <div className="font-bold text-xs text-slate-900 tabular-nums">
                    {transaction.type === "BUY" ? (
                      <Fragment>
                        {transaction.amountCrypto}{" "}
                        {transaction.cryptocurrency
                          ? transaction.cryptocurrency.symbol
                          : ""}{" "}
                        (₦{" "}
                        {formatCompact(Number(transaction.amountFiatNGN), "NGN")})
                      </Fragment>
                    ) : (
                      <Fragment>
                        ₦ {Number(transaction.amountFiatNGN).toLocaleString()} (
                        ${formatCompact(Number(transaction.usdAmount), "USD")})
                      </Fragment>
                    )}
                  </div>
                </div>

                {/* Transaction Status */}
                <div className="flex justify-between items-center">
                  <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Status</div>
                  <StatusBadge status={transaction.status} />
                </div>

                {/* Confirmations if SELL order */}
                {transaction.type === "SELL" && (
                  <div className="flex justify-between items-center">
                    <div className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Confirmations</div>
                    <div className="font-bold text-xs text-slate-900">
                      {transaction.confirmationCount !== undefined ? transaction.confirmationCount : 0}
                    </div>
                  </div>
                )}

                {transaction.failureReason && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/70 px-3.5 py-2.5">
                    <div className="text-2xs font-bold text-rose-700 uppercase tracking-wider">Reason</div>
                    <p className="mt-1 text-xs leading-relaxed text-rose-900">
                      {transaction.failureReason}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <section className="grid gap-4">
                <TransactionDetailsUserProfile
                  userId={transaction.user?.id ?? transaction.userId}
                  firstName={transaction.profile?.firstName ?? ""}
                  lastName={transaction.profile?.lastName ?? ""}
                  email={transaction.user?.email ?? transaction.email ?? ""}
                  phone={transaction.profile?.phoneNumber ?? undefined}
                  profileImageUrl={transaction.profile?.profileImg}
                />

                <TransactionContext transaction={transaction} />

                <PaymentAccountDetails
                  type={transaction.type}
                  hasBankAccount={!!transaction.userBankAccount}
                  accountName={transaction.userBankAccount?.accountName}
                  accountNumber={transaction.userBankAccount?.accountNumber}
                  bankName={userBankName}
                  isDeleted={transaction.userBankAccount?.isDeleted}
                  hasCryptoWallet={!!transaction.userCryptoWallet}
                  walletAddress={transaction.userCryptoWallet?.walletAddress}
                  network={transaction.userCryptoWallet?.network}
                  cryptoName={transaction.cryptocurrency?.name}
                  cryptoSymbol={transaction.cryptocurrency?.symbol}
                />

                <AdminPaymentAccountDetails
                  type={transaction.type}
                  hasBankAccount={!!transaction.adminBankAccount}
                  accountName={transaction.adminBankAccount?.accountHolderName}
                  accountNumber={transaction.adminBankAccount?.accountNumber}
                  bankName={adminBankName}
                  hasCryptoWallet={!!transaction.adminCryptoWallet}
                  walletAddress={transaction.adminCryptoWallet?.walletAddress}
                  network={transaction.adminCryptoWallet?.network}
                  cryptoName={transaction.cryptocurrency?.name}
                  cryptoSymbol={transaction.cryptocurrency?.symbol}
                />
              </section>

              {(transaction.type === "SELL" && transaction.depositAddress) ||
              (transaction.type === "BUY" && transaction.bankTransferReference) ? (
                <section className="grid gap-4">
                  {transaction.type === "SELL" && transaction.depositAddress && (
                    <div className="rounded-lg bg-white shadow-sm p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Custodial Deposit Address
                      </h2>
                      <CopyDetails
                        text={transaction.depositAddress}
                        className="!max-w-[700px]"
                        iconClassName="!w-8 !h-8"
                        wrap={true}
                      />
                    </div>
                  )}

                  {transaction.type === "BUY" &&
                    transaction.bankTransferReference && (
                      <div className="rounded-lg bg-white shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                          Bank Transfer Reference
                        </h2>
                        <CopyDetails
                          text={transaction.bankTransferReference}
                          className="!max-w-[700px]"
                          iconClassName="!w-8 !h-8"
                          wrap={true}
                        />
                      </div>
                    )}
                </section>
              ) : null}

              {(canRetryConfirmation || canForcePayout) && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-2xs">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    {canRetryConfirmation && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRetryDepositConfirmation(transaction.sessionId)
                        }
                        disabled={retryingConfirmation}
                        className="inline-flex flex-1 items-center justify-center rounded-lg bg-amber-600 px-3.5 h-8.5 text-xs font-semibold text-white shadow-2xs hover:bg-amber-700 disabled:opacity-60 cursor-pointer"
                      >
                        {retryingConfirmation
                          ? "Retrying..."
                          : "Retry Confirmation"}
                      </button>
                    )}

                    {canForcePayout && (
                      <button
                        type="button"
                        onClick={() => setShowForcePayoutConfirmModal(true)}
                        disabled={forcingPayout}
                        className="inline-flex flex-1 items-center justify-center rounded-lg bg-rose-600 px-3.5 h-8.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 disabled:opacity-60 cursor-pointer"
                      >
                        {forcingPayout ? "Triggering..." : "Trigger Payout"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {transaction.type === "BUY" && transaction.receiptImageUrl && (
                <div className="mt-4"><ReceiptViewer url={transaction.receiptImageUrl} label="Uploaded receipt" /></div>
              )}
            <TransactionActivityLog activities={visibleTransactionActivities} />

            

            <LedgerEntriesSection ledgerEntries={transaction.ledgerEntries} />

            {(transaction.userNotes ||
              transaction.adminNotes ||
              transaction.internalNotes) && (
              <section className="rounded-lg bg-white shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Notes
                </h2>
                <div className="space-y-4">
                  {transaction.userNotes && (
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-900 mb-1">
                        User Notes
                      </p>
                      <p className="text-sm text-blue-800">
                        {transaction.userNotes}
                      </p>
                    </div>
                  )}
                  {transaction.adminNotes && (
                    <div className="rounded-lg bg-purple-50 p-4">
                      <p className="text-sm font-medium text-purple-900 mb-1">
                        Admin Notes
                      </p>
                      <p className="text-sm text-purple-800">
                        {transaction.adminNotes}
                      </p>
                    </div>
                  )}
                  {transaction.internalNotes && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Internal Notes
                      </p>
                      <p className="text-sm text-gray-700">
                        {transaction.internalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Admin Upload transaction receipt */}
            <section>
              {transaction.type === "BUY" && (
                <section className="mt-4">
                  <div className="mt-6 bg-[#F0F0FF] p-4 border border-[#ECECEC] rounded-2xl">
                    <h3 className="text-[14px] font-semibold text-[#828282] mb-4">
                      Upload payment receipt
                    </h3>

                    <div className="space-y-4">
                      {/* Upload Button */}
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#03034D] rounded-lg cursor-pointer hover:bg-[#E8E8FF] transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-[#03034D]" />
                          <p className="text-sm text-[#03034D] font-medium">
                            Click to upload file
                          </p>
                          <p className="text-xs text-[#828282] mt-1">
                            PNG, JPG, JPEG or PDF (MAX. 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/jpg,application/pdf"
                          onChange={handleImageUpload}
                        />
                      </label>

                      {uploadedFile && previewUrl ? (
                        <div><ReceiptViewer url={previewUrl} label={uploadedFile.name} /><button type="button" onClick={removeFile} className="mt-2 text-sm text-red-600">Remove</button></div>
                      ) : transaction.adminPaymentReceiptUrl ? <ReceiptViewer url={transaction.adminPaymentReceiptUrl} label="Admin payment receipt" /> : null}
                    </div>
                  </div>
                </section>
              )}

              <TransactionStatusPicker
                transactionType={transaction.type}
                currentStatus={transaction.status}
                selectedStatus={selectedStatus}
                onSelectStatus={(status) => {
                  handleTransactionUpdateField("status", status);
                  setSelectedStatus(status);
                }}
                onSave={async () => {
                  const response = await handleTransactionUpdate();
                  if (response?.success) setSelectedStatus(undefined);
                }}
                isSaving={isSavingStatus}
              />
            </section>

            {/* Notes */}
            <section>
              <LabeledPillInput
                label="Transaction note (Optional)"
                placeholder="Add a note"
                value={
                  updatePayload?.adminNotes ?? transaction?.adminNotes ?? ""
                }
                onChange={(e) =>
                  handleTransactionUpdateField("adminNotes", e.target.value)
                }
              />
            </section>

          </div>
        )}
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
      </aside>
    </div>
  );
};

export default TransactionDetailsDrawer;

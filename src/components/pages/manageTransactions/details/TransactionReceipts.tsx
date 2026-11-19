import ReceiptViewer from "../../../global/ReceiptViewer.tsx";

export default function TransactionReceipts({ receiptImageUrl, adminPaymentReceiptUrl }: { receiptImageUrl?: string; adminPaymentReceiptUrl?: string }) {
  if (!receiptImageUrl && !adminPaymentReceiptUrl) return null;
  return <div className="min-w-0 rounded-lg bg-white p-4 shadow-sm sm:p-5"><h2 className="crm-section-heading mb-4 font-semibold">Payment receipts</h2><div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
    {receiptImageUrl && <ReceiptViewer url={receiptImageUrl} label="User receipt" />}
    {adminPaymentReceiptUrl && <ReceiptViewer url={adminPaymentReceiptUrl} label="Admin receipt" />}
  </div></div>;
}


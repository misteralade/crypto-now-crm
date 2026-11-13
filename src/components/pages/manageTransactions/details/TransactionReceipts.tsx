import ReceiptViewer from "../../../global/ReceiptViewer.tsx";

export default function TransactionReceipts({ receiptImageUrl, adminPaymentReceiptUrl }: { receiptImageUrl?: string; adminPaymentReceiptUrl?: string }) {
  if (!receiptImageUrl && !adminPaymentReceiptUrl) return null;
  return <div className="rounded-lg bg-white p-6 shadow-sm"><h2 className="mb-4 text-xl font-semibold">Payment receipts</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {receiptImageUrl && <ReceiptViewer url={receiptImageUrl} label="User receipt" />}
    {adminPaymentReceiptUrl && <ReceiptViewer url={adminPaymentReceiptUrl} label="Admin receipt" />}
  </div></div>;
}

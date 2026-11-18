import {useDispatch} from "react-redux";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "@tanstack/react-router";
import {clearTransactionDetailSessionId, setTransactionDetailSessionId } from "../../redux/transaction-management.slice";
import {useTransactionQuery} from "../../queries/transaction.query.ts";
import {ROUTES} from "../../util/constants.util.ts";
import type { UpdateTransactionStatusRequestType } from "../../schemas/transaction.schema.ts";

export const useTransactionDetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams({ from: '/dashboard/transaction/$id' })
  
  const {
    transactionInfo,
    loadingTransactionInfo,
    refetchTransactionInfo,
    adminRetryDepositConfirmationMutation,
    adminForceTriggerPayoutMutation,
    adminUpdateTransactionMutation,
    adminUploadTransactionReceiptMutation,
    adminLockTransactionMutation,
  } = useTransactionQuery({ sessionId: id });
  const [lockingTransaction, setLockingTransaction] = useState(false);
  const [transactionLocked, setTransactionLocked] = useState(false);
  const lockTransaction = adminLockTransactionMutation.mutateAsync;
  
  useEffect(() => {
    if (id) {
      dispatch(setTransactionDetailSessionId(id))
      setLockingTransaction(true);
      setTransactionLocked(false);
      void lockTransaction(id).then((result) => {
        setTransactionLocked(result.success);
      }).catch(() => {
        // The picker is still visible, but save remains disabled until lock succeeds.
      }).finally(() => setLockingTransaction(false));
    }
  }, [id, dispatch, lockTransaction]);

  const handleRetryDepositConfirmation = async (sessionId?: string) => {
    if (!sessionId) return;

    const res = await adminRetryDepositConfirmationMutation.mutateAsync(sessionId);
    if (res?.success) {
      await refetchTransactionInfo();
    }
  };

  const handleForceTriggerPayout = async (sessionId?: string) => {
    if (!sessionId) return;

    const res = await adminForceTriggerPayoutMutation.mutateAsync({
      sessionId,
      forceProceed: true,
    });

    if (res?.success) {
      await refetchTransactionInfo();
    }
  };

  const handleUpdateTransaction = (sessionId: string, payload: UpdateTransactionStatusRequestType) =>
    adminUpdateTransactionMutation.mutateAsync({ sessionId, payload });

  const handleUploadReceipt = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return adminUploadTransactionReceiptMutation.mutateAsync(formData);
  };
  
  const goBack = () => {
    dispatch(clearTransactionDetailSessionId());
    if (window.history.length > 1) {
      window.history.back()
      return
    }
    navigate({ to: ROUTES.TRANSACTIONS })
  }
  
  return {
    // 🧩 Values
    transactionInfo,
    loadingTransactionInfo,
    ledgerEntries: transactionInfo?.ledgerEntries || [],
    retryingConfirmation: adminRetryDepositConfirmationMutation.isPending,
    forcingPayout: adminForceTriggerPayoutMutation.isPending,
    updatingStatus: adminUpdateTransactionMutation.isPending,
    lockingTransaction,
    transactionLocked,
    
    // ⚙️ Functions
    goBack,
    handleRetryDepositConfirmation,
    handleForceTriggerPayout,
    handleUpdateTransaction,
    handleUploadReceipt,
  }
}

import {useDispatch} from "react-redux";
import {useEffect} from "react";
import {useNavigate, useParams} from "@tanstack/react-router";
import {clearTransactionDetailSessionId, setTransactionDetailSessionId } from "../../redux/transaction-management.slice";
import {useTransactionQuery} from "../../queries/transaction.query.ts";
import {ROUTES} from "../../util/constants.util.ts";

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
  } = useTransactionQuery({ sessionId: id });
  
  useEffect(() => {
    if (id) {
      dispatch(setTransactionDetailSessionId(id))
    }
  }, [id, dispatch]);

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
    
    // ⚙️ Functions
    goBack,
    handleRetryDepositConfirmation,
    handleForceTriggerPayout,
  }
}

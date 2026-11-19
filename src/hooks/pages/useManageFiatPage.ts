import {useCallback, useEffect, useMemo, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { bankServiceApi } from "../../api/bank.api";
import { QUERY_KEYS } from "../../queries/querries.keys";
import type { RootState } from "../../store";
import type { AdminBankAccountResponsePayload } from "../../types/response.payload.types";
import {useBankQuery} from "../../queries/bank.querries";
import { usePayoutAutoApprovalLimitQuery } from "../../queries/settings.querries";
import {
  clearSelectedBankId,
  clearCreateBankField,
  setCreateBankField, setSearchFiatField,
  setSelectedBankId,
} from '../../redux/fiat.slice'
import type {CreateBankAccountRequestType} from "../../schemas/bank.schema";
import {debounce} from "../../util/debouce.util.ts";
import {TIME_IN_MILLISECONDS} from "../../util/constants.util.ts";
import { toast } from "react-toastify";

export const useManageFiatPage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const payload = useSelector((state: RootState) => state.fiat.bank.createBank);
  const [editingAccount, setEditingAccount] = useState<AdminBankAccountResponsePayload>();
  const {
    // 🧩 Values
    platformBankAccounts,
    loadingPlatformBankAccounts,
    platformSupportedBanks,
    loadingPlatformSupportedBanks,
    searchedSupportedBanks,
    loadingSearchedSupportedBanks,

    // Mutations
    makeAdminBankAccountDefaultMutation,
    adminDeleteBankAccountMutation,
    adminCreateBankAccountMutation,
  } = useBankQuery();
  const {
    payoutAutoApprovalLimitQuery,
    updatePayoutAutoApprovalLimitMutation,
  } = usePayoutAutoApprovalLimitQuery();
  
  const [searchQuery, setSearchQuery] = useState('')
  const [payoutAutoApprovalLimitInput, setPayoutAutoApprovalLimitInput] = useState("");
  
  const [openBankModal, setOpenBankModal] = useState(false)

  useEffect(() => {
    const threshold = payoutAutoApprovalLimitQuery.data?.thresholdNgn;

    if (typeof threshold === "number" && Number.isFinite(threshold)) {
      setPayoutAutoApprovalLimitInput(String(threshold));
    }
  }, [payoutAutoApprovalLimitQuery.data?.thresholdNgn]);

  const handleMakeDefault = async (id: string) => {
    dispatch(setSelectedBankId(id));
    await makeAdminBankAccountDefaultMutation.mutateAsync();
    dispatch(clearSelectedBankId());
  }

  const handleDeleteBank = async (id: string) => {
    dispatch(setSelectedBankId(id));
    await adminDeleteBankAccountMutation.mutateAsync();
    dispatch(clearSelectedBankId());
  }

  const handleAdminCreateBank = async () => {
    try {
      if (editingAccount) {
        if (!payload.bankId || !payload.accountNumber || !payload.accountHolderName) return;
        const result = await bankServiceApi.adminUpdatePlatformBankAccount(editingAccount.id, { bankId: payload.bankId, accountNumber: payload.accountNumber });
        if (!result.success) { toast.error(result.message); return; }
        toast.success(result.message);
        await Promise.all([queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BANK.PLATFORM_BANK_ACCOUNTS] }), queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BANK.SEARCHED_SUPPORTED_BANKS] })]);
        handleCloseBankModal();
        return;
      }
      await adminCreateBankAccountMutation.mutateAsync();
      // Only close modal on successful creation (handleCloseBankModal already clears the form)
      handleCloseBankModal();
    } catch (error) {
      if (editingAccount) toast.error("Could not update bank account. Please try again.");
      // Error is already handled in the mutation's onError callback
      // Don't close modal on error so user can fix and retry
    }
  }
  
  const handleCreateBankField = useCallback((field: keyof CreateBankAccountRequestType, value: CreateBankAccountRequestType[keyof CreateBankAccountRequestType]) => {
    dispatch(setCreateBankField({
      field,
      value
    }))
  }, [dispatch]);
  
  const handleSearchChange = useMemo(() => {
    const debouncedUpdate = debounce(
      (query: string) => {
        dispatch(setSearchFiatField({
          field: "searchQuery",
          value: query
        }))
      },
      TIME_IN_MILLISECONDS.FIVE_HUNDRED_MILLISECONDS
    );
    
    return (query: string) => {
      setSearchQuery(query);
      debouncedUpdate(query);
    };
  }, [dispatch]);

  const handlePayoutAutoApprovalLimitChange = (value: string) => {
    setPayoutAutoApprovalLimitInput(value);
  };

  const handleSavePayoutAutoApprovalLimit = async () => {
    const parsedThreshold = Number(
      payoutAutoApprovalLimitInput.replace(/,/g, ""),
    );

    if (!Number.isFinite(parsedThreshold) || parsedThreshold <= 0) {
      toast.error("Enter a valid payout approval limit.");
      return;
    }

    await updatePayoutAutoApprovalLimitMutation.mutateAsync(parsedThreshold);
  };
  
  const handleOpenBankModal = () => {
    dispatch(clearCreateBankField());
    setEditingAccount(undefined);
    setOpenBankModal(true);
  };

  const handleEditBank = (account: AdminBankAccountResponsePayload) => {
    dispatch(clearCreateBankField());
    dispatch(setCreateBankField({ field: 'bankId', value: account.bank.id }));
    dispatch(setCreateBankField({ field: 'accountNumber', value: account.accountNumber }));
    dispatch(setCreateBankField({ field: 'accountHolderName', value: '' }));
    setEditingAccount(account);
    setOpenBankModal(true);
  };

  const handleCloseBankModal = () => {
    setOpenBankModal(false);
    dispatch(clearCreateBankField());
  };

  return {
    // 🧩 Values
    platformBankAccounts,
    loadingPlatformBankAccounts,
    openBankModal,
    editingAccount,
    platformSupportedBanks,
    loadingPlatformSupportedBanks,
    searchQuery,
    searchedSupportedBanks,
    loadingSearchedSupportedBanks,
    payoutAutoApprovalLimitQuery,
    payoutAutoApprovalLimitInput,
    savingPayoutAutoApprovalLimit:
      updatePayoutAutoApprovalLimitMutation.isPending,

    // ⚙️ Functions
    handleOpenBankModal,
    handleEditBank,
    handleCloseBankModal,
    handleMakeDefault,
    handleDeleteBank,
    handleCreateBankField,
    handleAdminCreateBank,
    handleSearchChange,
    handlePayoutAutoApprovalLimitChange,
    handleSavePayoutAutoApprovalLimit,
  }
}

import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMatchRoute } from "@tanstack/react-router";
import { toast } from "react-toastify";
import {ROUTES, TIME_IN_MILLISECONDS} from '../util/constants.util.ts'
import { QUERY_KEYS } from './querries.keys.js'
import { type RootState, store } from "../store";
import { disputeServiceApi } from "../api/dispute.api.ts";
import type { AxiosServerError, MessageAttachment } from '../types/response.payload.types.ts';
import { transactionServiceApi } from "../api/transaction.api.ts";
import type { SearchTransactionsRequestType } from "../schemas/transaction.schema.ts";
import { searchTransactionsInitialState } from "../redux/states/initial-transaction-management.states.ts";
import { clearDisputeMessageAttachments, clearDisputeMessageText } from "../redux/dispute.slice.ts";

export const useDisputeQuery = () => {
  const dispatch = useDispatch();
  const matchRoute = useMatchRoute();
  const queryClient = useQueryClient();
  const search = useSelector((state: RootState) => state.dispute.manage.search);
  const detailsId = useSelector((state: RootState) => state.dispute.details.id);
  const editId = useSelector((state: RootState) => state.dispute.edit.id);

  const isDisputeDetails = !!matchRoute({ to: ROUTES.DISPUTE_DETAILS });
  const isEditDispute = !!matchRoute({ to: ROUTES.EDIT_DISPUTE });
  const activeDisputeId = isDisputeDetails ? detailsId : isEditDispute ? editId : (detailsId || editId);
  
  const { data: searchDispute, isLoading: loadingSearchDispute } = useQuery({
    queryKey: [QUERY_KEYS.DISPUTE.ADMIN_SEARCH_DISPUTES, search],
    queryFn: async () => {
      const { data, success } = await disputeServiceApi.adminSearchDisputes(search);
      
      if (success) {
        return data;
      }
      
      return null;
    },
    enabled: !!(matchRoute({ to: ROUTES.DISPUTES })) && !!search,
  });
  
  const { data: disputeMessages, isLoading: loadingDisputeMessages } = useQuery({
    queryKey: [QUERY_KEYS.DISPUTE.DISPUTE_MESSAGES, activeDisputeId],
    queryFn: async () => {
      if (!activeDisputeId) return [];
      
      const { data, success } = await disputeServiceApi.getDisputeMessages(activeDisputeId);
      
      if (success && Array.isArray(data)) {
        return data;
      }
      
      return [];
    },
    enabled: (isDisputeDetails || isEditDispute) && !!activeDisputeId,
    refetchInterval: TIME_IN_MILLISECONDS.TEN_SECONDS,
  });
  
  const { data: disputeDetails, isLoading: loadingDisputeDetails } = useQuery({
    queryKey: [QUERY_KEYS.DISPUTE.DISPUTE_DETAILS, detailsId],
    queryFn: async () => {
      if (!detailsId) return null;
      
      const { data, success } = await disputeServiceApi.getDisputeDetails(detailsId);
      
      if (success) {
        return data;
      }
      
      return null;
    },
    enabled: isDisputeDetails && !!detailsId,
  });
  
  const { data: editDisputeDetails, isLoading: loadingEditDisputeDetails } = useQuery({
    queryKey: [QUERY_KEYS.DISPUTE.DISPUTE_DETAILS, editId],
    queryFn: async () => {
      if (!editId) return null;
      
      const { data, success } = await disputeServiceApi.getDisputeDetails(editId);
      
      if (success) {
        return data;
      }
      
      return null;
    },
    enabled: isEditDispute && !!editId,
  });
  
  const { data: transactionDetails, isLoading: loadingTransactionDetails } = useQuery({
    queryKey: [QUERY_KEYS.DISPUTE.SEARCH_TRANSACTIONS_DISPUTE_DETAILS],
    queryFn: async () => {
      const payload: SearchTransactionsRequestType = {
        ...searchTransactionsInitialState,
        sessionId: (store.getState() as RootState).dispute.edit.transactionId || undefined,
        includeUser: true,
        includeUserBankAccount: true,
        includeUserCryptoWallet: true,
        includeCryptoCurrency: true,
        includeProcessedBy: true,
      }
      
      const { data, success } = await transactionServiceApi.searchTransactions(payload);
      
      if (success) {
        return data.transactions[0];
      }
      
      return null;
    },
    enabled: !!matchRoute({ to: ROUTES.EDIT_DISPUTE }),
  });
  
  const adminSendDisputeMutation = useMutation({
    mutationKey: [QUERY_KEYS.DISPUTE.ADMIN_SEND_DISPUTE_MESSAGE],
    mutationFn: async (payload?: { disputeId?: string; message?: string; attachments?: Array<MessageAttachment> }) => {
      const disputeId = payload?.disputeId || activeDisputeId || (store.getState() as RootState).dispute.details.id;
      const message = payload?.message !== undefined ? payload.message : ((store.getState() as RootState).dispute.details.message.text || '');
      const attachments = payload?.attachments !== undefined ? payload.attachments : (((store.getState() as RootState).dispute.details.message.attachments as Array<MessageAttachment>) || []);
      
      if (!disputeId) {
        throw new Error("Dispute ID is required to send a dispute message.");
      }
      
      if (!message.trim() && (!attachments || attachments.length === 0)) {
        throw new Error("Dispute message or attachment is required to send a message.");
      }
      
      toast.loading(`Sending message...`, { toastId: QUERY_KEYS.DISPUTE.ADMIN_SEND_DISPUTE_MESSAGE });
      return await disputeServiceApi.sendDisputeMessage(disputeId, message.trim(), attachments || []);
    },
    onSuccess: ({ message }) => {
      toast.dismiss(QUERY_KEYS.DISPUTE.ADMIN_SEND_DISPUTE_MESSAGE);
      dispatch(clearDisputeMessageText());
      dispatch(clearDisputeMessageAttachments());
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISPUTE.DISPUTE_MESSAGES]
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.DISPUTE.DISPUTE_DETAILS]
      });
      toast.success(message || "Message sent successfully");
    },
    onError: ( error: AxiosServerError ) => {
      toast.dismiss(QUERY_KEYS.DISPUTE.ADMIN_SEND_DISPUTE_MESSAGE);
      const { response } = error;
      const message = response ? response.data.error.message : 'Failed to send dispute message. Please try again.'
      toast.error(message);
    },
  });
  
  const updateDisputeStatusMutation = useMutation({
    mutationKey: [QUERY_KEYS.DISPUTE.UPDATE_DISPUTE_STATUS],
    mutationFn: async () => {
      toast.loading(`Update dispute status...`);
      const disputeId = (store.getState() as RootState).dispute.edit.id
      const status = (store.getState() as RootState).dispute.edit.statusModal.status;
      const note = (store.getState() as RootState).dispute.edit.statusModal.note;
      const resolution = (store.getState() as RootState).dispute.edit.statusModal.resolution;
      
      if (!status || !disputeId) {
        throw new Error("Dispute status missing");
      }
      
      return await disputeServiceApi.updateDisputeStatus(disputeId as string, status, note, resolution);
    },
    onSuccess: ({ success, message}) => {
      toast.dismiss();
      if (success) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    },
    onError: ( error: AxiosServerError ) => {
      toast.dismiss();
      const { response } = error;
      const message = response ? response.data.error.message : 'Failed to update dispute status'
      toast.error(message);
    },
  })
  
  return {
    // 🧩 Values
    searchDispute,
    loadingSearchDispute,
    disputeMessages,
    loadingDisputeMessages,
    disputeDetails,
    loadingDisputeDetails,
    editDisputeDetails,
    loadingEditDisputeDetails,
    transactionDetails,
    loadingTransactionDetails,
    
    // Mutations
    adminSendDisputeMutation,
    updateDisputeStatusMutation,
  };
};

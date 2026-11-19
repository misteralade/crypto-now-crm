import {useEffect} from "react";
import {useDispatch} from "react-redux";
import {useNavigate, useParams} from "@tanstack/react-router";
import {useDisputeQuery} from "../../queries/dispute.querries.ts";
import {clearDisputeDetailsId, setDisputeDetailsId} from "../../redux/dispute.slice.ts";
import {ROUTES} from "../../util/constants.util.ts";

export const useDisputeDetailsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { disputeMessages, loadingDisputeMessages, disputeDetails, loadingDisputeDetails, adminSendDisputeMutation } = useDisputeQuery();
  
  const { id } = useParams({ from: '/dashboard/dispute/$id' });
  
  useEffect(() => {
    if (id) {
      dispatch(setDisputeDetailsId(id));
    }
    return () => {
      dispatch(clearDisputeDetailsId());
    };
  }, [id, dispatch]);
  
  const goBack = () => {
    navigate({ to: ROUTES.DISPUTES });
  };

  const navigateToEdit = () => {
    if (id) {
      navigate({ to: `/dashboard/disputes/edit/${id}` });
    }
  };
  
  return {
    // 🧩 Values
    id,
    disputeMessages,
    loadingDisputeMessages,
    disputeDetails,
    loadingDisputeDetails,
    
    // ⚙️ Functions
    adminSendDisputeMutation,
    goBack,
    navigateToEdit,
  };
};

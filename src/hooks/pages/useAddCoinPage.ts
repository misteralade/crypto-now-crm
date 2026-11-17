import {useNavigate} from "@tanstack/react-router";
import { useEffect } from "react";
import { useDispatch } from 'react-redux'
import { ROUTES } from '../../util/constants.util.ts'
import { useCryptoQuery } from '../../queries/crypto.querries.js'
import {clearAddCoin, setAddCoinField} from "../../redux/coin-management.slice";
import type { CreateSupportedCryptoAndAdminWalletRequestType } from '../../schemas/crypto.schema'

export const useAddCoinPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { uploadCryptoLogoIconMutation, createCryptoCurrencyMutation } = useCryptoQuery()

  useEffect(() => { dispatch(clearAddCoin()); }, [dispatch]);

  const goBack = () => navigate({ to: ROUTES.COIN_MANAGEMENT })

  const saveCoin = async () => {
    const { success } = await createCryptoCurrencyMutation.mutateAsync()

     
    if (success) {
      navigate({ to: ROUTES.COIN_MANAGEMENT })
    }
  }
  
  const handleCreateCoinInputChange = (field: keyof CreateSupportedCryptoAndAdminWalletRequestType, value: any ) => {
    dispatch(setAddCoinField({
      field,
      value,
    }))
  }

  return {
    // 🧩 Values

    // Mutation
    uploadCryptoLogoIconMutation,

    // ⚙️ Functions
    saveCoin,
    goBack,
    handleCreateCoinInputChange,
  }
}

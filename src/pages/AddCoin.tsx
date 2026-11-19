import { useAddCoinPage } from '../hooks/pages/useAddCoinPage'
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import PageHeader from "../components/global/pageHeader.tsx";
import UploadCoinIcon from "../components/pages/coinManagement/UploadCoinIcon.tsx";
import CoinDetails from "../components/pages/coinManagement/add-coin/CoinDetails.tsx";
import TradeLimits from "../components/pages/coinManagement/add-coin/TradeLimits.tsx";
import OptionalFields from "../components/pages/coinManagement/add-coin/OptionalFields.tsx";

const AddCoin = () => {
  const {
    // 🧩 Values

    // Mutation
    uploadCryptoLogoIconMutation,

    // ⚙️ Functions
    saveCoin,
    goBack,
    handleCreateCoinInputChange,
  } = useAddCoinPage()

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Add New Coin"
        subtitle="Configure network parameters, trade limits, and market details"
      />

      <div className="px-4 sm:px-6 pb-8 max-w-4xl">
        <UploadCoinIcon
          onChangeInputField={handleCreateCoinInputChange}
          uploadCryptoLogoIcon={uploadCryptoLogoIconMutation}
        />
        
        <CoinDetails onChangeInputField={handleCreateCoinInputChange} />
        
        <TradeLimits onChangeInputField={handleCreateCoinInputChange} />
        
        <OptionalFields onChangeInputField={handleCreateCoinInputChange} />
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6 pt-5 border-t border-slate-200">
          <button
            onClick={goBack}
            className="h-9 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs w-full sm:w-auto transition-colors cursor-pointer touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={saveCoin}
            className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs w-full sm:w-auto transition-colors cursor-pointer touch-manipulation"
          >
            Save Coin
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default AddCoin

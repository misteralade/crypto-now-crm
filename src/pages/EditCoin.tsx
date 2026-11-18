import {Fragment} from "react";
import {useEditCoinPage} from "../hooks/pages/useEditCoinPage";
import {LoadingSpinner} from "../components/global/LoadingSpinner.tsx";
import PageHeader from "../components/global/pageHeader.tsx";
import UploadCoinIcon from "../components/pages/coinManagement/UploadCoinIcon.tsx";
import EditCoinDetails from "../components/pages/coinManagement/edit-coin/CoinDetails.tsx";
import EditTradeLimits from "../components/pages/coinManagement/edit-coin/EditTradeLimits.tsx";
import EditOptionalFields from "../components/pages/coinManagement/edit-coin/EditOptionalFields.tsx";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";

const EditCoin = () => {
  const {
    // 🧩 Values
    adminCryptoDetails,
    loadingAdminCryptoDetails,

    // ⚙️ Functions
    uploadCryptoLogoIconMutation,
    handleEditCoinInputChange,
    goBack,
    handleUpdateCrypto,
  } = useEditCoinPage();
  
  return (
    <AuthenticatedLayout>
      <div className="p-6 mx-auto">
        {loadingAdminCryptoDetails ? (
          <Fragment>
            <div className="flex items-center justify-center min-h-[80vh]">
              <LoadingSpinner size="lg" message="Loading Coin Details..." fullScreen={false}/>
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <PageHeader
              title={`Edit ${adminCryptoDetails?.name || 'Coin'}`}
              subtitle="Update network parameters, trade limits, and market details"
            />

            <div className="px-4 sm:px-6 pb-8 max-w-4xl">
              <UploadCoinIcon
                oldImgUrl={adminCryptoDetails?.logoUrl}
                onChangeInputField={handleEditCoinInputChange}
                uploadCryptoLogoIcon={uploadCryptoLogoIconMutation}
              />

              <EditCoinDetails
                key={adminCryptoDetails?.id}
                cryptoId={adminCryptoDetails?.id || ''}
                onChangeInputField={handleEditCoinInputChange}
                name={adminCryptoDetails?.name || ''}
                symbol={adminCryptoDetails?.symbol || ''}
                networks={adminCryptoDetails?.networks ?? []}
                active={adminCryptoDetails?.isActive || false}
                buyEnabled={adminCryptoDetails?.buyEnabled ?? false}
                sellEnabled={adminCryptoDetails?.sellEnabled ?? false}
                buyPrecision={adminCryptoDetails?.buyPrecision ?? null}
                adminCryptoWallets={adminCryptoDetails?.adminCryptoWallets ?? []}
                blockchainEnvironment={adminCryptoDetails?.blockchainEnvironment as "testnet" | "mainnet"}
              />

              <EditTradeLimits
                cryptoId={adminCryptoDetails?.id || ''}
                symbol={adminCryptoDetails?.symbol || ''}
                buyAt={adminCryptoDetails?.buyRate}
                sellAt={adminCryptoDetails?.sellRate}
                minAmount={adminCryptoDetails?.minTransactionLimit}
                maxAmount={adminCryptoDetails?.maxTransactionLimit}
                minAmountAnonymous={adminCryptoDetails?.minTradeAmountForAnonymous}
                maxAmountAnonymous={adminCryptoDetails?.maxTradeAmountForAnonymous}
                onChangeInputField={handleEditCoinInputChange}
              />
              
              <EditOptionalFields
                description={adminCryptoDetails?.description || ''}
                website={adminCryptoDetails?.websiteUrl || ''}
                whitePaper={adminCryptoDetails?.whitepaperUrl || ''}
                onChangeInputField={handleEditCoinInputChange}
              />
            </div>
          </Fragment>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-end items-center gap-3 mt-6 pt-5 border-t border-slate-200">
          <button
            onClick={goBack}
            className="h-9 px-4 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs w-full sm:w-auto transition-colors cursor-pointer touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateCrypto}
            className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs w-full sm:w-auto transition-colors cursor-pointer touch-manipulation"
          >
            Update Coin
          </button>
        </div>
      </div>
    </AuthenticatedLayout>
  )
}

export default EditCoin;

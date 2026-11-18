import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useCoinManagementPage } from "../hooks/pages/useCoinManagementPage";
import {
  SearchSupportedCryptoColumn,
  SearchSupportedCryptoDataRow,
} from "../components/tables/CoinManagementTables";
import Table from "../components/table";
import PageHeader from "../components/global/pageHeader.tsx";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";
import ConfirmModal from "../components/global/ConfirmModal.tsx";
import CoinDetailsModal from "../components/pages/coinManagement/CoinDetailsModal.tsx";

const CoinManagement = () => {
  const {
    // 🧩 Values
    query,
    supportedCrypto,
    loadingSupportedCrypto,
    deleteCoinModal,
    selectedCoin,

    // ⚙️ Functions
    openAddCoin,
    handleCoinSearchChange,
    handleViewCoinDetails,
    handleOpenCoinDetails,
    handleCloseCoinDetails,
    handleDisableCoin,
    handleDeleteCryptoCurrency,
    toggleDeleteCoinModal,
    handleConfirmDeleteCryptoCurrency,
  } = useCoinManagementPage();

  const columns = useMemo(
    () =>
      SearchSupportedCryptoColumn(
        handleViewCoinDetails,
        handleDeleteCryptoCurrency,
        handleDisableCoin,
      ),
    [],
  );

  const data = useMemo(
    () => SearchSupportedCryptoDataRow(supportedCrypto?.supportedCryptos) ?? [],
    [supportedCrypto?.supportedCryptos, loadingSupportedCrypto],
  );

  useNavbarSearch(
    useMemo(
      () => ({
        placeholder: "Search coin name, symbol...",
        value: query,
        onChange: handleCoinSearchChange,
      }),
      [query, handleCoinSearchChange]
    )
  );

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Coin Management"
        actions={
          <button
            onClick={openAddCoin}
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-manipulation whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Coin</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table
            data={data}
            columns={columns}
            loading={loadingSupportedCrypto}
            onRowClick={(row) => handleOpenCoinDetails(row.id)}
          />
        </div>
      </div>

      <ConfirmModal
        open={deleteCoinModal}
        actionType="delete"
        onClose={toggleDeleteCoinModal}
        onConfirm={handleConfirmDeleteCryptoCurrency}
        message="Are you sure you want to delete this coin?"
        confirmText="Delete Coin"
      />

      <CoinDetailsModal
        coin={selectedCoin}
        open={selectedCoin !== null}
        onClose={handleCloseCoinDetails}
      />
    </AuthenticatedLayout>
  );
};

export default CoinManagement;

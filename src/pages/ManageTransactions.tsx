import { useMemo } from "react";
import { Filter, RefreshCcw } from "lucide-react";
import PageHeader from "../components/global/pageHeader.tsx";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";
import { cn } from "../lib/utils";
import {
  TransactionsManagementColumn,
  TransactionsManagementDataRow,
} from "../components/tables/TransactionsManagementTables.tsx";
import { useTransactionsTable } from "../hooks/tables/useTransactionsTable.ts";
import Table from "../components/table.tsx";
import TableFooter from "../components/tables/TableFooter.tsx";
import ManageTransactionFilterModal from "../components/pages/manageTransactions/ManageTransactionFilterModal.tsx";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import TransactionDetailsDrawer from "../components/pages/manageTransactions/TransactionDetailsDrawer.tsx";
import { useManageTransactionsPage } from "../hooks/pages/useManageTransactionsPage";

const ManageTransactions = () => {
  const {
    // 🧩 Values
    searchTransactions,
    loadingSearchTransactions,
    allSupportedCrypto,
    loadingAllSupportedCrypto,
    transactionDetail,
    loadingTransactionDetails,
    showTransactionDetails,

    // ⚙️ Functions
    handleSortBy,
    handleShowTransactionDetails,
    handleTransactionUpdateField,
    handleTransactionUpdate,
    handleTransactionReceiptUpload,
    handleRetryDepositConfirmation,
    handleForceTriggerPayout,
    retryingConfirmation,
    forcingPayout,
    handlePageSizeChange: updatePageSize,
    isFetchingTransactions,
    filteredUserId,
    filteredUserName,
    clearUserFilter,
  } = useManageTransactionsPage();

  const {
    // 🧩 Values
    pageSize,
    query,
    showFilter,
    fromDate,
    toDate,
    minAmountRange,
    maxAmountRange,
    selectedCryptoId,
    selectedStatus,

    // ⚙️ Functions
    handlePageChange,
    handlePageSizeChange,
    toggleApplyFilter,
    handleSearchQuery,
    handleFromDate,
    handleToDate,
    handleMinAmountRange,
    handleMaxAmountRange,
    handleSelectedCryptoId,
    handleSelectedStatus,
    handleViewTransactionDetails,
    resetSearchFilter,
  } = useTransactionsTable({
    timeline: "all",
  });

  useNavbarSearch(
    useMemo(
      () => ({
        placeholder: "Search transaction by session ID, amount...",
        value: query,
        onChange: handleSearchQuery,
      }),
      [query, handleSearchQuery]
    )
  );

  const handleRefreshTransactions = () => {
    resetSearchFilter();
  };

  const columns = useMemo(
    () =>
      TransactionsManagementColumn(
        handleSortBy,
        handleShowTransactionDetails,
        handleViewTransactionDetails,
      ),
    [
      handleSortBy,
      handleShowTransactionDetails,
      handleViewTransactionDetails,
    ],
  );

  const data = useMemo(
    () =>
      TransactionsManagementDataRow(
        !loadingSearchTransactions ? searchTransactions?.transactions : [],
      ) || [],
    [searchTransactions?.transactions, loadingSearchTransactions],
  );

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Transactions"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleApplyFilter}
              className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 active:scale-98 cursor-pointer touch-manipulation"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <span>Filter</span>
            </button>

            <button
              onClick={handleRefreshTransactions}
              disabled={!!isFetchingTransactions}
              className="inline-flex h-8.5 items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 disabled:opacity-50 active:scale-98 cursor-pointer touch-manipulation"
              title="Refresh Transactions"
            >
              <RefreshCcw
                className={cn("h-3.5 w-3.5 text-slate-500", isFetchingTransactions && "animate-spin")}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 pb-6 space-y-3">
        {filteredUserId && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2 text-xs text-blue-900">
            <span>
              Showing transactions for <strong className="font-semibold">{filteredUserName ?? "this user"}</strong> only
            </span>
            <button
              type="button"
              onClick={clearUserFilter}
              className="font-medium text-blue-600 hover:underline cursor-pointer"
            >
              Clear filter
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Transactions Table */}
          <div className="overflow-hidden">
            <Table
              data={data}
              columns={columns}
              loading={loadingSearchTransactions}
              onRowClick={(row) => handleShowTransactionDetails(row.id)}
            />
          </div>

          <div className="px-4 py-3 bg-white border-t border-slate-100">
            <TableFooter
              currentPage={searchTransactions?.page || 1}
              totalPages={searchTransactions?.totalPages || 1}
              pageSize={pageSize}
              totalItems={searchTransactions?.count || 100}
              onPageChange={handlePageChange}
              onPageSizeChange={(size: number) => {
                handlePageSizeChange(size);
                updatePageSize(size);
              }}
            />
          </div>
        </div>

        {/* Filter Modal */}
        <ManageTransactionFilterModal
          isOpen={showFilter}
          onClose={toggleApplyFilter}
          onReset={resetSearchFilter}
          fromDate={fromDate}
          toDate={toDate}
          minAmountRange={minAmountRange}
          maxAmountRange={maxAmountRange}
          handleFromDate={handleFromDate}
          handleToDate={handleToDate}
          handleMinAmountRange={handleMinAmountRange}
          handleMaxAmountRange={handleMaxAmountRange}
          supportedCryptos={
            !loadingAllSupportedCrypto ? allSupportedCrypto : []
          }
          selectedCryptoId={selectedCryptoId}
          handleSelectedCryptoId={handleSelectedCryptoId}
          selectedStatus={selectedStatus}
          handleSelectedStatus={handleSelectedStatus}
        />

        {/* Transaction Details Drawer */}
        <TransactionDetailsDrawer
          isOpen={showTransactionDetails}
          onClose={handleShowTransactionDetails}
          transaction={transactionDetail}
          loading={loadingTransactionDetails}
          handleTransactionUpdateField={handleTransactionUpdateField}
          handleTransactionUpdate={handleTransactionUpdate}
          handleTransactionReceiptUpload={handleTransactionReceiptUpload}
          handleRetryDepositConfirmation={handleRetryDepositConfirmation}
          handleForceTriggerPayout={handleForceTriggerPayout}
          retryingConfirmation={retryingConfirmation}
          forcingPayout={forcingPayout}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default ManageTransactions;

import { useMemo } from 'react'
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import { useDisputesPage } from "../hooks/pages/useDisputesPage.ts";
import { DisputeManagementColumn, DisputeManagementDataRow } from "../components/tables/DisputesTable.tsx";
import Table from "../components/table.tsx";
import TableFooter from "../components/tables/TableFooter.tsx";
import PageHeader from "../components/global/pageHeader.tsx";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";

const Disputes = () => {
  const {
    // 🧩 Values
    searchDispute,
    loadingSearchDispute,
    pageSize,
    searchQuery,
    
    // ⚙️ Functions
    handleViewDisputeDetails,
    handleNavigateToTransactionPage,
    handleSortByField,
    handleNavigateToEditDisputePage,
    handlePageSizeChange,
    handlePageChange,
    handleSearchChange,
  } = useDisputesPage();
  
  const columns = useMemo(() => DisputeManagementColumn(handleViewDisputeDetails, handleSortByField, handleNavigateToTransactionPage, handleNavigateToEditDisputePage),
    [
      handleViewDisputeDetails,
      handleSortByField,
      handleNavigateToTransactionPage,
      handleNavigateToEditDisputePage,
    ]
  );
  const data = useMemo(() => DisputeManagementDataRow(searchDispute?.disputes || []), [searchDispute, loadingSearchDispute]);

  useNavbarSearch(
    useMemo(
      () => ({
        placeholder: "Search disputes...",
        value: searchQuery,
        onChange: handleSearchChange,
      }),
      [searchQuery, handleSearchChange]
    )
  );
  
  return (
    <AuthenticatedLayout>
      <PageHeader title="Disputes" />

      <div className="px-4 sm:px-6 pb-6 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table data={data} columns={columns} loading={loadingSearchDispute} />
          
          <TableFooter
            currentPage={searchDispute?.page || 1}
            totalPages={searchDispute?.totalPages || 1}
            pageSize={pageSize}
            totalItems={searchDispute?.count || 100}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  )
}


export default Disputes;

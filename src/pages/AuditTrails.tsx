import { useMemo } from 'react'
import { Filter } from 'lucide-react'
import { useAuditTrailsPage } from '../hooks/pages/useAuditTrailsPage'
import TableFooter from '../components/tables/TableFooter'
import Table from "../components/table";
import { SearchAuditLogDataColumn, SearchAuditLogDataRow } from '../components/tables/AuditLogsTable';
import PageHeader from '../components/global/pageHeader'
import AuditTrailsFilterModal from '../components/pages/auditTrails/AuditTrailsFilterModal';
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";

const AuditTrails = () => {
  const {
    // 🧩 Values
    searchAuditLog,
    loadingSearchAuditLog,
    pageSize,
    showFilter,
    searchQuery,
    fromDate,
    toDate,
    selectedDeviceType,
    selectedStatus,
    selectedUserType,

    // ⚙️ Functions
    handlePageSizeChange,
    handlePageChange,
    toggleApplyFilter,
    resetSearchFilter,
    handleFromDate,
    handleToDate,
    handleSelectedSuccess,
    handleSelectedUserType,
    handleSelectedDeviceType,
    handleSearchChange,
  } = useAuditTrailsPage()

  const columns = useMemo(() => SearchAuditLogDataColumn, [])
  
  const data = useMemo(
    () =>
       
    SearchAuditLogDataRow(searchAuditLog?.logs ? searchAuditLog.logs : []) ||
      [],
    [searchAuditLog?.logs, loadingSearchAuditLog],
  )

  useNavbarSearch(
    useMemo(
      () => ({
        placeholder: "Search audit trails...",
        value: searchQuery || '',
        onChange: handleSearchChange,
      }),
      [searchQuery, handleSearchChange]
    )
  )

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Audit Trails"
        actions={
          <button
            onClick={toggleApplyFilter}
            className="inline-flex cursor-pointer hover:bg-slate-50 items-center justify-center gap-1.5 h-8.5 px-3 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs text-xs font-semibold text-slate-700 shrink-0 active:scale-98"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table data={data} columns={columns} loading={loadingSearchAuditLog} />
          
          <TableFooter
            currentPage={searchAuditLog?.page || 1}
            totalPages={searchAuditLog?.totalPages || 1}
            pageSize={pageSize}
            totalItems={searchAuditLog?.count || 100}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
        
        <AuditTrailsFilterModal
          isOpen={showFilter}
          fromDate={fromDate}
          toDate={toDate}
          selectedStatus={selectedStatus}
          selectedDeviceType={selectedDeviceType}
          selectedUserType={selectedUserType}
          onClose={toggleApplyFilter}
          onReset={resetSearchFilter}
          handleFromDate={handleFromDate}
          handleToDate={handleToDate}
          handleSelectedSuccess={handleSelectedSuccess}
          handleSelectedUserType={handleSelectedUserType}
          handleSelectedDeviceType={handleSelectedDeviceType}
        />
      </div>
    </AuthenticatedLayout>
  )
}

export default AuditTrails;

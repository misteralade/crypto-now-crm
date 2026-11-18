import { useMemo } from 'react'
import { Filter } from 'lucide-react'
import { useNotificationsPage } from "../hooks/pages/useNotificationsPage";
import { NotificationsDataColumn, NotificationsDataRow } from "../components/tables/NotificationsTables";
import Table from "../components/table";
import TableFooter from "../components/tables/TableFooter";
import PageHeader from "../components/global/pageHeader";
import NotificationFilterModal from "../components/pages/notifications/NotificationFilterModal.tsx";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";

const NotificationsPage = () => {
  const {
    // 🧩 Values
    searchNotification,
    loadingSearchNotification,
    pageSize,
    fromDate,
    toDate,
    searchQuery,
    showFilterModal,

    // ⚙️ Functions
    handleViewTransactionDetails,
    handlePageChange,
    handlePageSizeChange,
    handleFromDate,
    handleToDate,
    resetSearchFilter,
    toggleShowFilterModal,
    handleSearchChange,
  } = useNotificationsPage();

  const columns = useMemo(() => NotificationsDataColumn(handleViewTransactionDetails), [ handleViewTransactionDetails ],)

  const data = useMemo(
     
    () => NotificationsDataRow(!loadingSearchNotification ? searchNotification?.notifications : []) || [],
    [searchNotification?.notifications, loadingSearchNotification],
  )

  useNavbarSearch(
    useMemo(
      () => ({
        placeholder: "Search notifications...",
        value: searchQuery || "",
        onChange: handleSearchChange,
      }),
      [searchQuery, handleSearchChange]
    )
  )

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Notifications"
        actions={
          <button
            onClick={toggleShowFilterModal}
            className="inline-flex cursor-pointer hover:bg-slate-50 items-center justify-center gap-1.5 h-8.5 px-3 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs text-xs font-semibold text-slate-700 shrink-0 active:scale-98"
          >
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table
            data={data}
            columns={columns}
            loading={loadingSearchNotification}
          />
          
          <TableFooter
            currentPage={searchNotification?.page || 1}
            totalPages={searchNotification?.totalPages || 1}
            pageSize={pageSize}
            totalItems={searchNotification?.count || 100}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
        
        <NotificationFilterModal
          isOpen={showFilterModal}
          onClose={toggleShowFilterModal}
          onReset={resetSearchFilter}
          fromDate={fromDate}
          toDate={toDate}
          handleFromDate={handleFromDate}
          handleToDate={handleToDate}
        />
      </div>
    </AuthenticatedLayout>
  )
}

export default NotificationsPage;

import { useMemo } from "react";
import { Filter } from "lucide-react";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";
import { useUsersPage } from "../hooks/pages/useUsersPage";
import {
  AdminSearchUserColumn,
  AdminSearchUserDataRow,
} from "../components/tables/UserManagementTables";
import Table from "../components/table";
import TableFooter from "../components/tables/TableFooter";
import UsersFilterModal from "../components/pages/users/UsersFilterModal.tsx";
import UserTransactionDetailsDrawer from "../components/pages/users/UsersTransactionDetailsDrawer.tsx";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import PageHeader from "../components/global/pageHeader";

const Users = () => {
  const {
    // Values
    adminSearchUsers,
    loadingAdminSearchUsers,
    detailsOpen,
    filterOpen,
    createdAtFrom,
    createdAtTo,
    userProfileSummary,
    loadingUserProfileSummary,
    pageSize,
    searchQuery,
    statusFilter,
    hasDisputeFilter,

    // ⚙️ Functions
    toggleFilter,
    handleChangeCreatedAtFrom,
    handleChangeCreatedAtTo,
    handleResetFilters,
    handleStatusFilterChange,
    handleHasDisputeChange,
    handleCloseDetails,
    handleUpdateUserStatus,
    handleResetUserPassword,
    handlePageSizeChange,
    handlePageChange,
    handleSearchChange,
    handleNavigateToUserDetails,
    handleNavigateToTransactionHistory,
  } = useUsersPage();

  const columns = useMemo(
    () =>
      AdminSearchUserColumn(
        handleNavigateToTransactionHistory,
        handleUpdateUserStatus,
        handleResetUserPassword
      ),
    [
      handleNavigateToTransactionHistory,
      handleUpdateUserStatus,
      handleResetUserPassword,
    ]
  );

  const data = useMemo(
    () =>
      AdminSearchUserDataRow(
        !loadingAdminSearchUsers ? adminSearchUsers?.users : []
      ),
    [loadingAdminSearchUsers, adminSearchUsers?.users]
  );

  useNavbarSearch(
    useMemo(
      () => ({
        placeholder: "Search users by name, email, phone or ID...",
        value: searchQuery || "",
        onChange: handleSearchChange,
      }),
      [searchQuery, handleSearchChange]
    )
  );

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Users"
        actions={
          <button
            className="inline-flex cursor-pointer hover:bg-slate-50 items-center justify-center gap-1.5 h-8.5 px-3 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs text-xs font-semibold text-slate-700 active:scale-98"
            onClick={toggleFilter}
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
            loading={loadingAdminSearchUsers}
            onRowClick={(row) => handleNavigateToUserDetails(row.id)}
          />

          <TableFooter
            currentPage={adminSearchUsers?.page || 1}
            totalPages={adminSearchUsers?.totalPages || 1}
            pageSize={pageSize}
            totalItems={adminSearchUsers?.count || 100}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>

        {/* Drawers / Modals */}
        <UserTransactionDetailsDrawer
          open={detailsOpen}
          loading={loadingUserProfileSummary}
          data={userProfileSummary}
          onClose={handleCloseDetails}
        />

        <UsersFilterModal
          open={filterOpen}
          createdAtFrom={createdAtFrom}
          createdAtTo={createdAtTo}
          statusFilter={statusFilter}
          hasDisputeFilter={hasDisputeFilter}
          onClose={toggleFilter}
          onReset={handleResetFilters}
          handleChangeCreatedAtFrom={handleChangeCreatedAtFrom}
          handleChangeCreatedAtTo={handleChangeCreatedAtTo}
          handleStatusFilterChange={handleStatusFilterChange}
          handleHasDisputeChange={handleHasDisputeChange}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default Users;

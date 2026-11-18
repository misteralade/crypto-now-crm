import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Filter, Plus } from 'lucide-react'
import {useManageAdminPage} from "../hooks/pages/useManageAdminPage";
import {SearchAdminDataColumn, SearchAdminDataRow} from "../components/tables/AdminManagementTables";
import Table from "../components/table";
import TableFooter from "../components/tables/TableFooter";
import PageHeader from '../components/global/pageHeader';
import CreateAdminModal from '../components/pages/manageAdmins/CreateAdminModal.tsx';
import CreateNewPermissionsModal from '../components/pages/manageAdmins/CreateNewPermissionModals.tsx';
import ManageAdminFilterModal from "../components/pages/manageAdmins/ManageAdminFilterModal.tsx";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import ConfirmModal from "../components/global/ConfirmModal.tsx";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";
import { getLoggedInAdminId } from '../util/auth.util';
import { ROUTES } from '../util/constants.util';

const ManageAdmins = () => {
  const {
    // 🧩 Values
    showAddNewRole,
    showAddNewAdmin,
    searchQuery,
    showFilter,
    allPermissions,
    selectedPermissions,
    createAdmin,
    allRoles,
    loadingAllRoles,
    fromDate,
    toDate,
    selectedRoleId,
    searchedAdmins,
    loadingSearchedAdmins,
    pageSize,
    showDeleteAdminModal,


    // ⚙️ Functions
    toggleAddNewRoleModal,
    toggleAddNewAdmin,
    toggleFilter,
    handleSearchChange,
    handleSelectPermission,
    handleCreateNewRole,
    handleRoleNameChange,
    handleRoleDescriptionChange,
    handleCreateAdminFieldChange,
    handleCreateAdmin,
    handleFromDateChange,
    handleToDateChange,
    handleSelectedRoleIdChange,
    handleResetFilters,
    handleUpdateAdminStatus,
    handlePageChange,
    handlePageSizeChange,
    handleDeleteAdmin,
    toggleDeleteAdminModal,
    handleConfirmDeleteAdmin,
  } = useManageAdminPage();
  const navigate = useNavigate();

  const currentAdminId = useMemo(() => getLoggedInAdminId(), []);

  const columns = useMemo(
    () =>
      SearchAdminDataColumn(
        handleUpdateAdminStatus,
        handleDeleteAdmin,
        currentAdminId,
      ),
    [
      handleUpdateAdminStatus,
      handleDeleteAdmin,
      currentAdminId,
    ],
  );

  const data = useMemo(
    () => SearchAdminDataRow(!loadingSearchedAdmins ? searchedAdmins?.admins : []),
    [loadingSearchedAdmins, searchedAdmins?.admins],
  )

  const handleViewAdminDetails = (adminId: string) => {
    navigate({ to: ROUTES.ADMIN_DETAILS.replace('$adminId', adminId) })
  }

  useNavbarSearch(
    useMemo(
      () => ({
        placeholder: "Search admins...",
        value: searchQuery || '',
        onChange: handleSearchChange,
      }),
      [searchQuery, handleSearchChange]
    )
  )

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Admins"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFilter}
              className="inline-flex cursor-pointer hover:bg-slate-50 items-center justify-center gap-1.5 h-8.5 px-3 border border-slate-200 rounded-lg transition-colors bg-white shadow-2xs text-xs font-semibold text-slate-700 shrink-0 active:scale-98"
            >
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Filter</span>
            </button>
            <button
              onClick={toggleAddNewRoleModal}
              className="h-8.5 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer active:scale-98"
            >
              Add Role
            </button>
            <button
              onClick={toggleAddNewAdmin}
              className="inline-flex items-center gap-1.5 h-8.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer active:scale-98"
            >
              <Plus size={15} />
              <span>Add Admin</span>
            </button>
          </div>
        }
      />

      <div className="px-4 sm:px-6 pb-6">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <Table
            data={data}
            columns={columns}
            loading={loadingSearchedAdmins}
            onRowClick={(row) => handleViewAdminDetails(row.id)}
          />
          
          <TableFooter
            currentPage={searchedAdmins?.page || 1}
            totalPages={searchedAdmins?.totalPages || 1}
            pageSize={pageSize}
            totalItems={searchedAdmins?.count || 100}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
        
        <CreateAdminModal
          open={showAddNewAdmin}
          roles={allRoles || []}
          createAdmin={createAdmin}
          onClose={toggleAddNewAdmin}
          handleCreateAdminFieldChange={handleCreateAdminFieldChange}
          onCreate={handleCreateAdmin}
        />
        
        <CreateNewPermissionsModal
          open={showAddNewRole}
          permissions={allPermissions || []}
          selectedPermissions={selectedPermissions}
          onClose={toggleAddNewRoleModal}
          onCreate={handleCreateNewRole}
          handleSelectPermission={handleSelectPermission}
          handleRoleName={handleRoleNameChange}
          handleRoleDescription={handleRoleDescriptionChange}
        />
        
        <ManageAdminFilterModal
          isOpen={showFilter}
          onClose={toggleFilter}
          onReset={handleResetFilters}
          fromDate={fromDate}
          toDate={toDate}
          handleFromDate={handleFromDateChange}
          handleToDate={handleToDateChange}
          roles={!loadingAllRoles ? allRoles : []}
          selectedRoleId={selectedRoleId}
          handleSelectedRole={handleSelectedRoleIdChange}
        />
      </div>
      
      <ConfirmModal
        open={showDeleteAdminModal}
        actionType="delete"
        onClose={toggleDeleteAdminModal}
        onConfirm={handleConfirmDeleteAdmin}
        message="Are you sure you want to delete this admin?"
        confirmText="Delete Admin"
      />
    </AuthenticatedLayout>
  )
}

export default ManageAdmins;

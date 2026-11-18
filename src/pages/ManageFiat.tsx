import PageHeader from "../components/global/pageHeader";
import { Plus } from "lucide-react";
import { useManageFiatPage } from "../hooks/pages/useManageFiatPage";
import AccountCard from "../components/pages/manageFiat/AccountCard.tsx";
import BankDetailsModal from "../components/pages/manageFiat/BankDetailsModal.tsx";
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import { useNavbarSearch } from "../layout/navbar-search-context.tsx";
import { Input } from "../components/ui/input";

const ManageFiat = () => {
  const {
    // 🧩 Values
    openBankModal,
    editingAccount,
    platformSupportedBanks,
    loadingPlatformSupportedBanks,
    searchQuery,
    searchedSupportedBanks,
    loadingSearchedSupportedBanks,
    payoutAutoApprovalLimitQuery,
    payoutAutoApprovalLimitInput,
    savingPayoutAutoApprovalLimit,

    // ⚙️ Functions
    handleOpenBankModal,
    handleEditBank,
    handleCloseBankModal,
    handleMakeDefault,
    handleDeleteBank,
    handleCreateBankField,
    handleAdminCreateBank,
    handleSearchChange,
    handlePayoutAutoApprovalLimitChange,
    handleSavePayoutAutoApprovalLimit,
  } = useManageFiatPage();

  const currentPayoutLimit = payoutAutoApprovalLimitQuery.data?.thresholdNgn;

  useNavbarSearch({
    placeholder: "Search bank or account name...",
    value: searchQuery,
    onChange: handleSearchChange,
  });

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Manage Fiat"
        subtitle="Commercial settlement accounts and automated payout approval ceilings"
        actions={
          <button
            onClick={handleOpenBankModal}
            className="h-8.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5 transition-colors cursor-pointer touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Bank Account</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 pb-8 space-y-4">
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">
                Payout Review Controls
              </div>
              <h2 className="mt-1 text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Automated Settlement Threshold
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Customer sell payouts exceeding this ceiling require administrative sign-off before dispatch.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-600 shadow-2xs">
              <div className="font-semibold text-slate-500">Active Threshold</div>
              <div className="mt-0.5 text-lg font-bold text-slate-900 tabular-nums">
                ₦{Number(currentPayoutLimit).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <Input
              label="Auto-approval ceiling (NGN)"
              type="text"
              inputMode="decimal"
              value={payoutAutoApprovalLimitInput}
              onChange={(e) =>
                handlePayoutAutoApprovalLimitChange(e.target.value)
              }
              placeholder="e.g. 1000000"
              className="mb-0"
            />
            <button
              type="button"
              onClick={handleSavePayoutAutoApprovalLimit}
              disabled={savingPayoutAutoApprovalLimit}
              className="h-10 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer touch-manipulation"
            >
              {savingPayoutAutoApprovalLimit ? "Saving..." : "Save Threshold"}
            </button>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row w-full items-start sm:items-center gap-3 justify-between mt-6 mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Disbursement Accounts
            </h3>
            <p className="text-xs text-slate-500">Connected bank accounts for local Naira disbursements</p>
          </div>
        </div>

        {/* cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!loadingSearchedSupportedBanks &&
            searchedSupportedBanks?.banks &&
            searchedSupportedBanks?.banks?.map((account, index) => (
              <AccountCard
                key={account.id}
                account={account}
                index={index}
                onMakeDefault={handleMakeDefault}
                onDelete={handleDeleteBank}
                onEdit={handleEditBank}
              />
            ))}

          <button
            type="button"
            className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400 p-6 flex flex-col items-center justify-center min-h-[160px] transition-all cursor-pointer group touch-manipulation"
            onClick={handleOpenBankModal}
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 flex items-center justify-center transition-colors mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600">Add Bank Account</span>
            <span className="text-[11px] text-slate-400 mt-0.5">Connect a new commercial payout account</span>
          </button>
        </section>

        {/* Modals */}
        <BankDetailsModal
          open={openBankModal}
          isEditing={!!editingAccount}
          supportedBanks={
            !loadingPlatformSupportedBanks ? platformSupportedBanks : []
          }
          handleCreateBankField={handleCreateBankField}
          onClose={handleCloseBankModal}
          onConfirm={handleAdminCreateBank}
        />
      </div>
    </AuthenticatedLayout>
  );
};
export default ManageFiat;

import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Plus, Trash2, Edit2, AlertTriangle, ShieldCheck, RefreshCcw } from 'lucide-react';
import AuthenticatedLayout from '../layout/AuthenticatedLayout.tsx';
import PageHeader from '../components/global/pageHeader.tsx';
import { PillInput } from '../components/ui/input';
import { PillSelect } from '../components/ui/select';
import { useKycQuery } from '../queries/kyc.querries';
import {
  setCreateKycTierLimitField,
  setUpdateKycTierLimitField,
  setUpdateKycTierLimitId,
  setDeleteKycTierLimitId,
  clearCreateKycTierLimit,
  clearUpdateKycTierLimit,
  clearDeleteKycTierLimitId,
} from '../redux/kyc-tier-limit.slice';
import type { RootState } from '../store';
import type { KycTierType } from '../schemas/kyc.schema';

const boolOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

const TIER_LABELS: Record<KycTierType, string> = {
  GUEST: 'Guest: unverified users',
  VERIFIED: 'Verified: full verification',
};

const tierOptions = [
  { value: 'GUEST', label: 'Guest: unverified users' },
  { value: 'VERIFIED', label: 'Verified: full verification' },
];

const KycTierLimits = () => {
  const dispatch = useDispatch();
  const { create: createForm, update: updateFormState } = useSelector((s: RootState) => s.kycTierLimit);
  const updateForm = updateFormState;
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const {
    kycTierLimits,
    loadingKycTierLimits,
    createKycTierLimitMutation,
    updateKycTierLimitMutation,
    deleteKycTierLimitMutation,
  } = useKycQuery();

  const groupedLimits = useMemo(() => {
    if (!kycTierLimits) return {} as Record<KycTierType, any[]>;
    return kycTierLimits.reduce((acc: any, limit: any) => {
      if (!acc[limit.kycTier]) acc[limit.kycTier] = [];
      acc[limit.kycTier].push(limit);
      return acc;
    }, {} as Record<KycTierType, any[]>);
  }, [kycTierLimits]);

  function handleCreate() {
    createKycTierLimitMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res.success) {
          setIsCreateModalOpen(false);
          dispatch(clearCreateKycTierLimit());
        }
      },
    });
  }

  function handleUpdate() {
    updateKycTierLimitMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res.success) {
          setIsEditModalOpen(false);
          dispatch(clearUpdateKycTierLimit());
        }
      },
    });
  }

  function handleDelete() {
    deleteKycTierLimitMutation.mutate(undefined, {
      onSuccess: (res) => {
        if (res.success) {
          setIsDeleteModalOpen(false);
          dispatch(clearDeleteKycTierLimitId());
        }
      },
    });
  }

  function openEditModal(limit: any) {
    dispatch(setUpdateKycTierLimitId(limit.id));
    dispatch(setUpdateKycTierLimitField({ field: 'kycTier', value: limit.kycTier }));
    dispatch(setUpdateKycTierLimitField({ field: 'currencyCode', value: limit.currencyCode }));
    dispatch(setUpdateKycTierLimitField({ field: 'minTransactionAmount', value: limit.minTransactionAmount }));
    dispatch(setUpdateKycTierLimitField({ field: 'maxTransactionAmount', value: limit.maxTransactionAmount }));
    dispatch(setUpdateKycTierLimitField({ field: 'dailyLimit', value: limit.dailyLimit }));
    dispatch(setUpdateKycTierLimitField({ field: 'monthlyLimit', value: limit.monthlyLimit }));
    dispatch(setUpdateKycTierLimitField({ field: 'maxPayoutAttempts', value: limit.maxPayoutAttempts }));
    dispatch(setUpdateKycTierLimitField({ field: 'isActive', value: limit.isActive }));
    dispatch(setUpdateKycTierLimitField({ field: 'requiredConfirmationsBTC', value: limit.requiredConfirmationsBTC }));
    dispatch(setUpdateKycTierLimitField({ field: 'requiredConfirmationsSOL', value: limit.requiredConfirmationsSOL }));
    dispatch(setUpdateKycTierLimitField({ field: 'requiredConfirmationsTRC20', value: limit.requiredConfirmationsTRC20 }));
    
    setIsEditModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    dispatch(clearCreateKycTierLimit());
  }

  function closeEditModal() {
    setIsEditModalOpen(false);
    dispatch(clearUpdateKycTierLimit());
  }

  function openDeleteModal(id: string) {
    dispatch(setDeleteKycTierLimitId(id));
    setIsDeleteModalOpen(true);
  }

  function closeDeleteModal() {
    setIsDeleteModalOpen(false);
    dispatch(clearDeleteKycTierLimitId());
  }

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="KYC Tier Limits"
        actions={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Add Limit</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 pb-6 space-y-6">
        {loadingKycTierLimits ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCcw className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-slate-500 text-xs font-medium">Loading tier limits...</p>
          </div>
        ) : !kycTierLimits || kycTierLimits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-slate-200 p-6 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-slate-900 font-semibold text-sm">No tier limits configured</p>
            <p className="text-slate-500 text-xs mt-1">Add a limit for one of the KYC tiers.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Plus size={16} />
              <span>Add Limit</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8 pb-12">
            {(['GUEST', 'VERIFIED'] as KycTierType[]).map((tier) => (
              <section key={tier} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <h2 className="text-base font-bold text-slate-900 capitalize">{TIER_LABELS[tier]}</h2>
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">
                    {groupedLimits[tier]?.length || 0} config{groupedLimits[tier]?.length === 1 ? '' : 's'}
                  </span>
                </div>

                {!groupedLimits[tier] || groupedLimits[tier].length === 0 ? (
                  <div className="p-5 bg-white rounded-xl border border-slate-200/80 text-center">
                    <p className="text-slate-500 text-xs italic">No limits defined for this tier yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groupedLimits[tier].map((limit: any) => (
                      <div
                        key={limit.id}
                        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all hover:border-blue-400 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                              {limit.currencyCode}
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900">{limit.currencyCode} Limits</h3>
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-semibold ${limit.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${limit.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {limit.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => openEditModal(limit)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit limit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => openDeleteModal(limit.id)}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete limit"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-100">
                          <div className="space-y-0.5">
                            <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Trans. Range</p>
                            <p className="text-xs font-bold text-slate-900 font-mono">
                              {limit.minTransactionAmount} - {limit.maxTransactionAmount} <span className="text-2xs font-normal text-slate-500">{limit.currencyCode}</span>
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Periodic Limits</p>
                            <p className="text-xs font-bold text-slate-900 font-mono">
                              Day: {limit.dailyLimit} | Mo: {limit.monthlyLimit}
                            </p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Payout Retries</p>
                            <p className="text-xs font-semibold text-slate-900">Max {limit.maxPayoutAttempts} attempts</p>
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider">Confirms (BTC/SOL/TRC)</p>
                            <p className="text-xs font-mono font-bold text-slate-900">
                              {limit.requiredConfirmationsBTC} / {limit.requiredConfirmationsSOL} / {limit.requiredConfirmationsTRC20}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-xl w-full max-w-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Add KYC Tier Limit</h3>
                <button
                  onClick={closeCreateModal}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <PillSelect
                  label="KYC Tier"
                  options={tierOptions}
                  value={createForm.kycTier}
                  onValueChange={(v) => dispatch(setCreateKycTierLimitField({ field: 'kycTier', value: v as any }))}
                />
                <PillInput
                  label="Currency Code"
                  placeholder="e.g. NGN"
                  value={createForm.currencyCode}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'currencyCode', value: e.target.value.toUpperCase() }))}
                />
                <PillInput
                  label="Min Transaction Amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={createForm.minTransactionAmount}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'minTransactionAmount', value: e.target.value }))}
                />
                <PillInput
                  label="Max Transaction Amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={createForm.maxTransactionAmount}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'maxTransactionAmount', value: e.target.value }))}
                />
                <PillInput
                  label="Daily Limit"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={createForm.dailyLimit}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'dailyLimit', value: e.target.value }))}
                />
                <PillInput
                  label="Monthly Limit"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={createForm.monthlyLimit}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'monthlyLimit', value: e.target.value }))}
                />
                <PillInput
                  label="Max Payout Attempts"
                  type="text"
                  inputMode="numeric"
                  placeholder="3"
                  value={createForm.maxPayoutAttempts}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'maxPayoutAttempts', value: e.target.value }))}
                />
                <PillSelect
                  label="Status"
                  options={boolOptions}
                  value={String(createForm.isActive)}
                  onValueChange={(v) => dispatch(setCreateKycTierLimitField({ field: 'isActive', value: v === 'true' }))}
                />
                <PillInput
                  label="BTC Confirmations"
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={createForm.requiredConfirmationsBTC}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'requiredConfirmationsBTC', value: e.target.value }))}
                />
                <PillInput
                  label="SOL Confirmations"
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={createForm.requiredConfirmationsSOL}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'requiredConfirmationsSOL', value: e.target.value }))}
                />
                <PillInput
                  label="TRC20 Confirmations"
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={createForm.requiredConfirmationsTRC20}
                  onChange={(e) => dispatch(setCreateKycTierLimitField({ field: 'requiredConfirmationsTRC20', value: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={createKycTierLimitMutation.isPending}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {createKycTierLimitMutation.isPending ? 'Creating...' : 'Create Tier Limit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-xl w-full max-w-xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Edit KYC Tier Limit</h3>
                <button
                  onClick={closeEditModal}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
                <PillSelect
                  label="KYC Tier"
                  options={tierOptions}
                  value={updateForm.data.kycTier ?? ''}
                  onValueChange={(v) => dispatch(setUpdateKycTierLimitField({ field: 'kycTier', value: v as any }))}
                />
                <PillInput
                  label="Currency Code"
                  placeholder="e.g. NGN"
                  value={updateForm.data.currencyCode ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'currencyCode', value: e.target.value.toUpperCase() }))}
                />
                <PillInput
                  label="Min Transaction Amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={updateForm.data.minTransactionAmount ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'minTransactionAmount', value: e.target.value }))}
                />
                <PillInput
                  label="Max Transaction Amount"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={updateForm.data.maxTransactionAmount ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'maxTransactionAmount', value: e.target.value }))}
                />
                <PillInput
                  label="Daily Limit"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={updateForm.data.dailyLimit ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'dailyLimit', value: e.target.value }))}
                />
                <PillInput
                  label="Monthly Limit"
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={updateForm.data.monthlyLimit ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'monthlyLimit', value: e.target.value }))}
                />
                <PillInput
                  label="Max Payout Attempts"
                  type="text"
                  inputMode="numeric"
                  placeholder="3"
                  value={updateForm.data.maxPayoutAttempts ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'maxPayoutAttempts', value: e.target.value }))}
                />
                <PillSelect
                  label="Status"
                  options={boolOptions}
                  value={updateForm.data.isActive !== undefined ? String(updateForm.data.isActive) : 'true'}
                  onValueChange={(v) => dispatch(setUpdateKycTierLimitField({ field: 'isActive', value: v === 'true' }))}
                />
                <PillInput
                  label="BTC Confirmations"
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={updateForm.data.requiredConfirmationsBTC ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'requiredConfirmationsBTC', value: e.target.value }))}
                />
                <PillInput
                  label="SOL Confirmations"
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={updateForm.data.requiredConfirmationsSOL ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'requiredConfirmationsSOL', value: e.target.value }))}
                />
                <PillInput
                  label="TRC20 Confirmations"
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={updateForm.data.requiredConfirmationsTRC20 ?? ''}
                  onChange={(e) => dispatch(setUpdateKycTierLimitField({ field: 'requiredConfirmationsTRC20', value: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updateKycTierLimitMutation.isPending}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
                >
                  {updateKycTierLimitMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-xl w-full max-w-sm p-5 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900">Delete Tier Limit</h3>
                <button
                  onClick={closeDeleteModal}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200/60 p-3 rounded-lg mb-4">
                <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={16} />
                <p className="text-rose-800 text-xs font-medium leading-relaxed">
                  Are you sure you want to delete this limit? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={closeDeleteModal}
                  className="h-8 px-3 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteKycTierLimitMutation.isPending}
                  className="h-8 px-3 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 shadow-xs"
                >
                  {deleteKycTierLimitMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default KycTierLimits;

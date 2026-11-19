import { useState } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import AuthenticatedLayout from '../layout/AuthenticatedLayout';
import PageHeader from '../components/global/pageHeader';
import { PillInput } from '../components/ui/input';
import { PillSelect } from '../components/ui/select';
import { useCurrencyQuery } from '../queries/currency.querries';
import type { SupportedCurrencyResponsePayload } from '../types/response.payload.types';

// ─── Types ───────────────────────────────────────────────────────────────────

type CreateForm = {
  name: string;
  code: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
};

type EditForm = {
  id: string;
  name: string;
  code: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
};

const EMPTY_CREATE: CreateForm = {
  name: '',
  code: '',
  description: '',
  logoUrl: '',
  isActive: true,
};

const boolOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

// ─── Component ───────────────────────────────────────────────────────────────

const SupportedCurrencies = () => {
  const {
    // 🧩 Values
    currencies,
    loadingCurrencies,

    // ⚙️ Functions
    createCurrencyMutation,
    updateCurrencyMutation,
    deleteCurrencyMutation,
  } = useCurrencyQuery();

  // Local form state — no Redux, no persistence issues
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_CREATE);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SupportedCurrencyResponsePayload | null>(null);

  // ─── Create ─────────────────────────────────────────────────────────────

  const openCreateModal = () => { setCreateForm(EMPTY_CREATE); setIsCreateModalOpen(true); };
  const closeCreateModal = () => { setIsCreateModalOpen(false); setCreateForm(EMPTY_CREATE); };

  const handleCreate = () => {
    createCurrencyMutation.mutate(
      {
        name: createForm.name,
        code: createForm.code,
        description: createForm.description || undefined,
        logoUrl: createForm.logoUrl || undefined,
        isActive: createForm.isActive,
      },
      { onSuccess: closeCreateModal }
    );
  };

  // ─── Edit ────────────────────────────────────────────────────────────────

  const openEditModal = (currency: SupportedCurrencyResponsePayload) => {
    setEditForm({
      id: currency.id,
      name: currency.name,
      code: currency.code,
      description: currency.description ?? '',
      logoUrl: currency.logoUrl ?? '',
      isActive: currency.isActive,
    });
  };

  const closeEditModal = () => setEditForm(null);

  const handleUpdate = () => {
    if (!editForm) return;
    updateCurrencyMutation.mutate(
      {
        id: editForm.id,
        payload: {
          name: editForm.name,
          code: editForm.code,
          description: editForm.description || undefined,
          logoUrl: editForm.logoUrl || undefined,
          isActive: editForm.isActive,
        },
      },
      { onSuccess: closeEditModal }
    );
  };

  // ─── Delete ──────────────────────────────────────────────────────────────

  const openDeleteModal = (currency: SupportedCurrencyResponsePayload) => setDeleteTarget(currency);
  const closeDeleteModal = () => setDeleteTarget(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCurrencyMutation.mutate(deleteTarget.id, { onSuccess: closeDeleteModal });
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <AuthenticatedLayout>
      <PageHeader 
        title="Supported Currencies" 
        actions={
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Add Currency</span>
          </button>
        }
      />

      <div className="px-4 sm:px-6 pb-6 space-y-4">
        {/* Heading row */}
        <div className="flex w-full items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            System Currencies
            {currencies && (
              <span className="ml-2 text-xs text-slate-500 font-medium">
                ({currencies.length})
              </span>
            )}
          </h2>
        </div>

        {/* Grid */}
        {loadingCurrencies ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {!currencies || currencies.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 text-xs">
                No currencies configured yet. Click "+ Add Currency" to create one.
              </div>
            ) : (
              currencies.map((currency) => (
                <div
                  key={currency.id}
                  className="rounded-xl border border-slate-200/80 bg-white p-5 flex flex-col gap-4 hover:border-blue-400 hover:shadow-xs transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {currency.logoUrl ? (
                        <img
                          src={currency.logoUrl}
                          alt={currency.name}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center">
                          {currency.code.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{currency.name}</p>
                        <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{currency.code}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-2xs font-semibold uppercase tracking-wider ${
                        currency.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${currency.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {currency.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {currency.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{currency.description}</p>
                  )}

                  <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-3 mt-auto">
                    <button
                      onClick={() => openEditModal(currency)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Edit currency"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(currency)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete currency"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Create Modal ─────────────────────────────────────────────────── */}
        {isCreateModalOpen && (
          <Modal
            title="Add Currency"
            onClose={closeCreateModal}
            onConfirm={handleCreate}
            confirmLabel={createCurrencyMutation.isPending ? 'Creating...' : 'Create Currency'}
            confirmDisabled={createCurrencyMutation.isPending}
          >
            <CurrencyForm
              name={createForm.name}
              code={createForm.code}
              description={createForm.description}
              logoUrl={createForm.logoUrl}
              isActive={createForm.isActive}
              onChange={(field, value) => setCreateForm((prev) => ({ ...prev, [field]: value }))}
            />
          </Modal>
        )}

        {/* ── Edit Modal ───────────────────────────────────────────────────── */}
        {editForm && (
          <Modal
            title={`Edit ${editForm.name}`}
            onClose={closeEditModal}
            onConfirm={handleUpdate}
            confirmLabel={updateCurrencyMutation.isPending ? 'Saving...' : 'Save Changes'}
            confirmDisabled={updateCurrencyMutation.isPending}
          >
            <CurrencyForm
              name={editForm.name}
              code={editForm.code}
              description={editForm.description}
              logoUrl={editForm.logoUrl}
              isActive={editForm.isActive}
              onChange={(field, value) =>
                setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev))
              }
            />
          </Modal>
        )}

        {/* ── Delete Modal ─────────────────────────────────────────────────── */}
        {deleteTarget && (
          <Modal
            title="Delete Currency"
            onClose={closeDeleteModal}
            onConfirm={handleDelete}
            confirmLabel={deleteCurrencyMutation.isPending ? 'Deleting...' : 'Delete'}
            confirmDisabled={deleteCurrencyMutation.isPending}
            confirmDestructive
          >
            <p className="text-slate-600 text-xs leading-relaxed">
              Are you sure you want to delete <strong>{deleteTarget.name}</strong> ({deleteTarget.code})? This action cannot be undone.
            </p>
          </Modal>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default SupportedCurrencies;

// ─── CurrencyForm ─────────────────────────────────────────────────────────────

type CurrencyFormProps = {
  name: string;
  code: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
  onChange: (field: 'name' | 'code' | 'description' | 'logoUrl' | 'isActive', value: any) => void;
};

function CurrencyForm({ name, code, description, logoUrl, isActive, onChange }: CurrencyFormProps) {
  return (
    <div className="grid grid-cols-1 gap-1">
      <PillInput
        label="Currency Name"
        placeholder="e.g. Nigerian Naira"
        value={name}
        onChange={(e) => onChange('name', e.target.value)}
      />
      <PillInput
        label="Currency Code"
        placeholder="e.g. NGN"
        maxLength={3}
        value={code}
        onChange={(e) => onChange('code', e.target.value.toUpperCase())}
      />
      <PillInput
        label="Description (optional)"
        placeholder="Short description"
        value={description}
        onChange={(e) => onChange('description', e.target.value)}
      />
      <PillInput
        label="Logo URL (optional)"
        placeholder="https://..."
        value={logoUrl}
        onChange={(e) => onChange('logoUrl', e.target.value)}
      />
      <PillSelect
        label="Status"
        options={boolOptions}
        value={String(isActive)}
        onValueChange={(v) => onChange('isActive', v === 'true')}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmDisabled?: boolean;
  confirmDestructive?: boolean;
};

function Modal({ title, children, onClose, onConfirm, confirmLabel, confirmDisabled, confirmDestructive }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-xl w-full max-w-md p-5 sm:p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {children}

        <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`h-9 px-4 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 ${
              confirmDestructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

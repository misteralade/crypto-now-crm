import { Fragment, useEffect, useRef, useState } from 'react'
import { Pencil, X } from 'lucide-react'
import type { SupportedPlatformBankAccountResponse, UserBankAccountResponsePayload } from '../../../../types/response.payload.types'
import { bankServiceApi } from '../../../../api/bank.api'

interface BankDetailsSectionProps {
  bankDetails: Array<UserBankAccountResponsePayload> | undefined
  loading?: boolean
  banks: SupportedPlatformBankAccountResponse[]
  onUpdateAccount: (accountId: string, payload: { bankId: string; accountNumber: string }) => Promise<boolean>
}

const BankDetailsSection = ({ bankDetails, loading = false, banks, onUpdateAccount }: BankDetailsSectionProps) => {
  const [accountToEdit, setAccountToEdit] = useState<UserBankAccountResponsePayload | null>(null)
  const [bankId, setBankId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [verifiedName, setVerifiedName] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [checking, setChecking] = useState(false)
  const [saving, setSaving] = useState(false)
  const lookupVersion = useRef(0)

  const verifyAccount = async (number: string, selectedBankId: string) => {
    const version = ++lookupVersion.current
    setVerifiedName('')
    setLookupError('')
    setChecking(false)
    if (number.length !== 10 || !selectedBankId) return
    setChecking(true)
    try {
      const { data, success, message } = await bankServiceApi.lookupAccountName(number, selectedBankId)
      if (lookupVersion.current !== version) return
      if (success && data.accountName) setVerifiedName(data.accountName)
      else setLookupError(message || 'Could not verify these bank details. Check the bank and account number.')
    } catch {
      if (lookupVersion.current === version) setLookupError('Could not verify these bank details. Check the bank and account number.')
    } finally {
      if (lookupVersion.current === version) setChecking(false)
    }
  }

  useEffect(() => {
    if (!accountToEdit) return
    const activeLookupVersion = lookupVersion
    setBankId(accountToEdit.bank.id)
    setAccountNumber(accountToEdit.accountNumber)
    document.body.style.overflow = 'hidden'
    void verifyAccount(accountToEdit.accountNumber, accountToEdit.bank.id)
    return () => {
      activeLookupVersion.current++
      document.body.style.overflow = 'unset'
    }
  }, [accountToEdit])

  const closeEdit = () => setAccountToEdit(null)

  const saveEdit = async () => {
    if (!accountToEdit || !verifiedName || checking || accountNumber.length !== 10 || !bankId) return
    setSaving(true)
    try {
      if (await onUpdateAccount(accountToEdit.id, { bankId, accountNumber })) closeEdit()
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-[#0E0F0C] mb-6">Bank Details</h2>
        <div className="text-center py-8 text-[#667085]">Loading bank details...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-[#0E0F0C] mb-6">Bank Details</h2>
      
      {!bankDetails || bankDetails.length === 0 ? (
        <div className="text-center py-8 text-[#667085]">
          No bank details available.
        </div>
      ) : (
        <div className="space-y-4">
          {bankDetails.map((bank, index) => (
            <Fragment key={`${bank.id}-${index}`}>
              <div className={`p-4 border rounded-lg relative ${index === 0 ? 'border-t' : ''} ${index === bankDetails.length - 1 ? 'border-y' : 'border-t'} ${bank.isDeleted ? 'bg-red-50/30 border-red-100' : ''}`}>
                <div className="flex items-center justify-end gap-2 absolute top-4 right-4">
                  {!bank.isDeleted && (
                    <button type="button" onClick={() => setAccountToEdit(bank)} aria-label={`Edit ${bank.bank?.name || 'bank'} account`} className="rounded-md p-1.5 text-blue-700 hover:bg-blue-50" title="Edit bank account">
                      <Pencil size={14} />
                    </button>
                  )}
                  {bank.isDefault && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                      Default
                    </span>
                  )}
                  {bank.isDeleted && (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 border border-red-200">
                      Deleted
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#667085] mb-2">
                      Account Name
                    </label>
                    <div className={`font-medium ${bank.isDeleted ? 'text-red-900' : 'text-[#0E0F0C]'}`}>
                      {bank.accountName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#667085] mb-2">
                      Bank Name
                    </label>
                    <div className={`font-medium ${bank.isDeleted ? 'text-red-900' : 'text-[#0E0F0C]'}`}>
                      {bank.bank?.name}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#667085] mb-2">
                      Account Number
                    </label>
                    <div className={`font-medium ${bank.isDeleted ? 'text-red-900' : 'text-[#0E0F0C]'}`}>
                      {bank.accountNumber}
                    </div>
                  </div>
                </div>
              </div>
            </Fragment>
          ))}
        </div>
      )}

      {accountToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-user-bank-title">
          <button type="button" className="absolute inset-0 cursor-default" aria-label="Close edit bank account" onClick={closeEdit} />
          <section className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <header className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h3 id="edit-user-bank-title" className="text-lg font-semibold text-slate-900">Edit customer bank account</h3>
                <p className="mt-1 text-sm text-slate-500">Verify the account details before saving.</p>
              </div>
              <button type="button" onClick={closeEdit} aria-label="Close modal" className="rounded-md p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </header>
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Bank</span>
                <select value={bankId} onChange={(event) => { setBankId(event.target.value); void verifyAccount(accountNumber, event.target.value) }} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15">
                  <option value="">Select a bank</option>
                  {banks.map((bank) => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Account number</span>
                <input value={accountNumber} inputMode="numeric" autoComplete="off" onChange={(event) => { const value = event.target.value.replace(/\D/g, '').slice(0, 10); setAccountNumber(value); void verifyAccount(value, bankId) }} className="h-11 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15" />
              </label>
              {(checking || verifiedName || lookupError) && <div className="rounded-lg border border-slate-200 bg-slate-50 p-3" aria-live="polite"><p className="text-xs text-slate-500">Verified account name</p><p className={`mt-1 text-sm ${lookupError ? 'text-rose-600' : 'text-slate-800'}`}>{checking ? 'Checking account details...' : lookupError || verifiedName}</p></div>}
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button type="button" onClick={closeEdit} className="h-10 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={saveEdit} disabled={!verifiedName || checking || saving || accountNumber.length !== 10 || !bankId} className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">{saving ? 'Saving...' : 'Save changes'}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default BankDetailsSection;

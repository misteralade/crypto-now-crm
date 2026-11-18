import type { AdminBankAccountResponsePayload } from '../../../types/response.payload.types'
import { Pencil } from 'lucide-react'

interface AccountCardProps {
  account: AdminBankAccountResponsePayload
  index: number
  onMakeDefault: (index: string) => void
  onDelete: (index: string) => void
  onEdit: (account: AdminBankAccountResponsePayload) => void
}

const AccountCard = ({
  account,
  index,
  onMakeDefault,
  onDelete,
  onEdit,
}: AccountCardProps) => {
  return (
    <section className="relative p-4 rounded-xl border border-[#ECECEC] bg-white shadow-sm overflow-hidden">
      {/* Translucent Bank Logo Background */}
      {account.bank?.logoUrl && (
        <div
          className="absolute inset-0 opacity-5 bg-no-repeat bg-right bg-contain pointer-events-none"
          style={{
            backgroundImage: `url(${account.bank?.logoUrl})`,
            backgroundPosition: 'right 20px center',
          }}
        />
      )}

      {/* Content - positioned above the background */}
      <div className="relative z-10">
        <button type="button" onClick={() => onEdit(account)} aria-label="Edit bank account" className="absolute right-0 top-0 rounded-lg p-2 text-blue-700 hover:bg-blue-50"><Pencil size={16} /></button>
        <div className="pr-8 text-base font-semibold text-[#0E0F0C]">
          {account.label || `Account ${index + 1}`}{' '}
          {account.isDefault ? 'â€“ Default' : ''}
        </div>
        <div className="mt-4 space-y-3 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[#828282]">Account Name</div>
            <div className="min-w-0 break-words text-right text-[#101828] font-medium">
              {account.accountHolderName || '--'}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="text-[#828282]">Account Number</div>
            <div className="text-[#101828] font-medium">
              {account.accountNumber || '--'}
            </div>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="text-[#828282]">Bank Name</div>
            <div className="min-w-0 break-words text-right text-[#101828] font-medium">
              {account.bank?.name || '--'}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-4">
          <div className="flex items-center gap-4">
            {!account.isDefault && (
              <button
                className="text-[#03034D] text-xs font-semibold hover:opacity-80"
                onClick={() => onMakeDefault(account.id || '')}
              >
                Make as default
              </button>
            )}
            <button
              className="text-[#EB5757] text-xs font-semibold hover:opacity-80"
              onClick={() => onDelete(account.id)}
            >
              Delete
            </button>
          </div>
          {/*<button*/}
          {/*  className="px-4 py-2 rounded-full bg-[#03034D] text-white text-xs font-semibold hover:opacity-80"*/}
          {/*  onClick={() => onEdit(index)}*/}
          {/*>*/}
          {/*  Edit*/}
          {/*</button>*/}
        </div>
      </div>
    </section>
  )
}

export default AccountCard

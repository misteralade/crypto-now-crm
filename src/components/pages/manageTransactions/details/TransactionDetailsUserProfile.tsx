import { Fragment } from 'react'
import { CopyButton } from '../../../global/CopyDetails.tsx'
import { ROUTES } from '../../../../util/constants.util.ts'
import { User, ExternalLink, Phone } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface TransactionDetailsUserProfileProps {
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  profileImageUrl?: string
}

const TransactionDetailsUserProfile = ({
  userId,
  firstName,
  lastName,
  email,
  phone,
}: TransactionDetailsUserProfileProps) => {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Verified Customer'
  const initial = (firstName || lastName || email || 'U').charAt(0).toUpperCase()

  return (
    <Fragment>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Customer Profile</h2>
            </div>
          </div>

          <a
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors"
            href={`${ROUTES.TRANSACTIONS}?userId=${userId}`}
          >
            <span>Orders</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-blue-50">
            {initial}
          </div>

          <div className="min-w-0 flex-1">
            <Link to={ROUTES.USERS_DETAILS} params={{ userId }} className="block text-xs sm:text-sm font-bold text-slate-900 tracking-tight truncate hover:text-blue-600">
              {fullName}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <p className="text-xs text-slate-500 truncate" title={email}>
                {email || 'No email provided'}
              </p>
              {email ? <CopyButton text={email} iconClassName="w-3 h-3" /> : null}
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-2.5 border-t border-slate-100">
          {phone ? (
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                Phone
              </span>
              <div className="flex items-center gap-1 font-semibold text-slate-700 truncate">
                <a href={`tel:${phone}`} className="hover:text-blue-600 transition-colors">
                  {phone}
                </a>
                <CopyButton text={phone} iconClassName="w-3 h-3" />
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </Fragment>
  )
}

export default TransactionDetailsUserProfile

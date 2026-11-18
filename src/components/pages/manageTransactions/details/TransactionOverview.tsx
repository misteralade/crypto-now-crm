import { Fragment } from 'react'
import { formatNumber } from '../../../../util/index.util.ts'
import { formatCompact } from '../../../../util/asset-precision'
import { StatusBadge } from '../../../global/StatusBadge.tsx'
import { Coins, ArrowLeftRight, CheckCircle2, TrendingUp } from 'lucide-react'

interface TransactionOverviewProps {
  type: 'BUY' | 'SELL'
  amountCrypto: number
  symbol: string
  logoUrl?: string
  currency: string
  amountFiat: number
  amountFiatNGN: number
  status: string
  exchangeRateDisplay: string
  confirmationCount?: number
}

const TransactionOverview = ({
  type,
  amountCrypto,
  symbol,
  logoUrl,
  amountFiatNGN,
  exchangeRateDisplay,
  status,
  confirmationCount,
}: TransactionOverviewProps) => {
  return (
    <Fragment>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              {logoUrl ? <img src={logoUrl} alt={`${symbol} logo`} className="h-7 w-7 object-contain" /> : <Coins className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">Transaction Overview</h2>

            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Fiat Value */}
          <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
              Fiat Settlement
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums truncate">
              â‚¦{formatCompact(amountFiatNGN, 'NGN', 2)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">NGN Equivalent</p>
          </div>

          {/* Card 2: Crypto Amount */}
          <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
              Crypto Amount
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums truncate" title={`${amountCrypto} ${symbol}`}>
              {formatNumber(amountCrypto)} <span className="text-xs font-semibold text-slate-600">{symbol}</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Asset Traded</p>
          </div>

          {/* Card 3: Exchange Rate */}
          <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
              <ArrowLeftRight className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">Rate</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={exchangeRateDisplay}>
              {exchangeRateDisplay || 'N/A'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Locked Rate</p>
          </div>

          {/* Card 4: Confirmations or Type */}
          {type === 'SELL' ? (
            <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Confirmations</span>
              </div>
              <p className="text-base sm:text-lg font-bold text-slate-900 tabular-nums truncate">
                {confirmationCount ?? 0}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Block receipts</p>
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-slate-50/90 border border-slate-100 flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate mb-1">
                <TrendingUp className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Order Type</span>
              </div>
              <p className="text-sm sm:text-base font-bold text-blue-600 truncate">
                BUY ORDER
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Customer Purchasing</p>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  )
}

export default TransactionOverview


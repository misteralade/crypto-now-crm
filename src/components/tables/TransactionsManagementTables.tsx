import { ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'
import momentClient from '../../util/moment'
import {
  TableDate,
  TableStatus,
  mapTransactionStatus,
} from '../table'
import type { TableColumn } from '../table'
import type {
  SearchTransactionsResponse,
  UsersWithTopTransactionVolume,
} from '../../types/response.payload.types'
import type { SearchTransactionsRequestType } from '../../schemas/transaction.schema'

const formatCryptoAmountUpTo4Decimals = (amount: number | string | undefined, symbol?: string) => {
  if (amount === undefined || amount === null || amount === "") return "0"
  const num = Number(amount)
  const factor = 10000
  const rounded = Math.ceil(num * factor) / factor
  return `${rounded} ${symbol ? symbol.toUpperCase() : ""}`.trim()
}

type TransactionSummaryRow = {
  sessionId: string
  user: string
  userEmail: string
  type: string
  cryptoSymbol: string
  amount: string
  amountCrypto: string
  date: Date | string
  status: string
}

type TransactionManagementRow = {
  id: string
  type: string
  amount: string
  date: string
  status: string
  action?: string
}

// Dashboard Tables Start
export const UsersWithTopTransactionColumn = (
  handleViewTransaction: (sessionId: string) => void,
): Array<TableColumn<TransactionSummaryRow>> => [
  {
    key: 'sessionId',
    header: 'Transaction ID',
    render: (value, row) => (
      <button
        onClick={() => handleViewTransaction(row.sessionId)}
        className="font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group cursor-pointer"
        title={String(value)}
      >
        <span className="truncate max-w-[120px] sm:max-w-[150px]">
          {String(value).slice(0, 10)}...{String(value).slice(-4)}
        </span>
        <ArrowUpRight size={13} className="text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </button>
    ),
  },
  {
    key: 'user',
    header: 'Customer',
    render: (value, row) => (
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
          {String(value || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 text-xs truncate max-w-[130px]">{value}</p>
          <p className="text-2xs text-slate-400 truncate max-w-[130px]">{row.userEmail}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'type',
    header: 'Type & Asset',
    render: (value, row) => (
      <div className="flex items-center gap-1.5">
        <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider ${value === 'BUY' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'}`}>
          {value}
        </span>
        <span className="text-xs font-bold text-slate-700">{row.cryptoSymbol}</span>
      </div>
    ),
  },
  {
    key: 'amount',
    header: 'Fiat Amount',
    render: (value) => (
      <span className="text-xs font-bold text-slate-900 tabular-nums">
        {value}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => {
      const { displayText, variant } = mapTransactionStatus(String(value));
      return <TableStatus status={displayText} variant={variant} />;
    },
  },
  {
    key: 'date',
    header: 'Date',
    render: (value) => <TableDate date={value as Date} />,
  },
  {
    key: 'action',
    header: 'Action',
    render: (_, row) => (
      <button
        className="h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-semibold text-xs transition-colors cursor-pointer"
        onClick={() => handleViewTransaction(row.sessionId)}
      >
        View
      </button>
    ),
  },
]

export const UsersWithTopTransactionDataRow = (
  data: Array<UsersWithTopTransactionVolume> | undefined,
) => {
  const rowItems: Array<TransactionSummaryRow> = []

  if (!data) {
    return rowItems
  }

  data.forEach((item: UsersWithTopTransactionVolume) => {
    rowItems.push({
      sessionId: item.sessionId,
      user: `${item.userFirstName || ''} ${item.userLastName || ''}`.trim() || 'Anonymous User',
      userEmail: item.userEmail || '',
      type: item.type,
      cryptoSymbol: item.cryptoSymbol || 'USDT',
      amount: `₦${Number(item.amountFiat || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      amountCrypto: item.amountCrypto,
      date: item.createdAt,
      status: item.status,
    })
  })

  return rowItems
}
// Dashboard Tables End

// Start Transactions Management Tables
export const TransactionsManagementColumn = (
  handleSortBy: (columnKey: string) => void,
  handleViewTransactionDetails: (sessionId: string) => void,
  sortModel: SearchTransactionsRequestType['sortModel'],
): Array<TableColumn<TransactionManagementRow>> => [
  {
    key: 'id',
    header: (
      <div className="py-2.5 text-left text-xs font-semibold text-slate-600">
        Session ID
      </div>
    ),
    render: (value) => (
      <div
        className="py-2 pr-2 font-mono text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 group cursor-pointer"
        onClick={() => handleViewTransactionDetails(value)}
        title={String(value)}
      >
        <span className="truncate max-w-[130px] sm:max-w-[160px]">
          {String(value).slice(0, 10)}...{String(value).slice(-4)}
        </span>
        <ArrowUpRight size={13} className="text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
      </div>
    ),
  },
  {
    key: 'type',
    header: (
      <button
        type="button"
        onClick={() => handleSortBy('type')}
        aria-pressed={sortModel?.colId === 'type'}
        className="py-2.5 text-left text-xs font-semibold text-slate-600 hover:cursor-pointer inline-flex items-center gap-1"
      >
        <span>Type</span>
        {sortModel?.colId === 'type' && sortModel.orderBy === 'ASC' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className={`w-3.5 h-3.5 ${sortModel?.colId === 'type' ? 'text-blue-600' : 'text-slate-400'}`} />}
      </button>
    ),
    render: (value) => {
      const isBuy = String(value).toUpperCase().startsWith('BUY')
      const asset = String(value).replace(/^(BUY|SELL)\s*[-–]?\s*/i, '').trim()
      return (
        <div className="py-2 flex items-center gap-1.5 whitespace-nowrap">
          <span className={`px-2 py-0.5 rounded text-2xs font-bold uppercase tracking-wider ${isBuy ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-blue-50 text-blue-700 border border-blue-200/60'}`}>
            {isBuy ? 'BUY' : 'SELL'}
          </span>
          {asset && <span className="text-xs font-semibold text-slate-700">{asset}</span>}
        </div>
      )
    },
  },
  {
    key: 'amount',
    header: (
      <div className="py-2.5 text-left text-xs font-semibold text-slate-600">
        Crypto Amount
      </div>
    ),
    render: (value) => (
      <span className="py-2 text-xs sm:text-sm font-semibold text-slate-900 tabular-nums whitespace-nowrap">
        {value}
      </span>
    ),
  },
  {
    key: 'date',
    header: (
      <button
        type="button"
        aria-pressed={sortModel?.colId === 'createdAt'}
        className="py-2.5 text-left text-xs font-semibold text-slate-600 hover:cursor-pointer inline-flex items-center gap-1"
        onClick={() => handleSortBy('createdAt')}
      >
        <span>Date</span>
        {sortModel?.colId === 'createdAt' && sortModel.orderBy === 'ASC' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className={`w-3.5 h-3.5 ${sortModel?.colId === 'createdAt' ? 'text-blue-600' : 'text-slate-400'}`} />}
      </button>
    ),
    render: (value) => (
      <span className="py-2 text-xs text-slate-500 whitespace-nowrap tabular-nums">
        {value}
      </span>
    ),
  },
  {
    key: 'status',
    header: (
      <button
        type="button"
        aria-pressed={sortModel?.colId === 'status'}
        className="py-2.5 text-left text-xs font-semibold text-slate-600 hover:cursor-pointer inline-flex items-center gap-1"
        onClick={() => handleSortBy('status')}
      >
        <span>Status</span>
        {sortModel?.colId === 'status' && sortModel.orderBy === 'ASC' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className={`w-3.5 h-3.5 ${sortModel?.colId === 'status' ? 'text-blue-600' : 'text-slate-400'}`} />}
      </button>
    ),
    render: (value) => {
      const { displayText, variant } = mapTransactionStatus(value)
      return (
        <div className="py-2">
          <TableStatus status={displayText} variant={variant} />
        </div>
      )
    },
  },
  {
    key: 'action',
    header: (
      <div className="py-2.5 text-right text-xs font-semibold text-slate-600">
        Action
      </div>
    ),
    render: (_, row) => (
      <div className="py-2 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleViewTransactionDetails(row.id)
          }}
          className="h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 font-semibold text-xs transition-colors cursor-pointer touch-manipulation inline-flex items-center gap-1"
        >
          <span>Details</span>
          <ArrowUpRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    ),
  },
]

export const TransactionsManagementDataRow = (
  data: Array<SearchTransactionsResponse> | undefined,
) => {
  const rowItems: Array<TransactionManagementRow> = []

  if (!data) {
    return rowItems
  }

  data.forEach((item: SearchTransactionsResponse) => {
    rowItems.push({
      id: item.sessionId,
      type: `${item.type} ${item.cryptocurrency ? `- ${item.cryptocurrency.symbol}` : ''}`,
      amount: formatCryptoAmountUpTo4Decimals(item.amountCrypto, item.cryptocurrency?.symbol),
      date: momentClient.formatToNormalisedDateAndTime(item.createdAt),
      status: item.status,
    })
  })

  return rowItems
}
// End Transactions Management Tables

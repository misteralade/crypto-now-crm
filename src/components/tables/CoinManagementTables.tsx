import { Fragment, useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import {formatCompact} from "../../util/asset-precision";
import momentClient from "../../util/moment";
import {StatusColumn} from "./global";
import type { SearchSupportedCryptoData } from "../../types/response.payload.types";
import type { TableColumn } from '../table'

const NetworkTags = ({ networks }: { networks: string[] }) => {
  if (!networks || networks.length === 0) return <span className="text-[11px] text-slate-400">-</span>
  return (
    <div className="flex flex-wrap gap-1">
      {networks.map((n) => (
        <span
          key={n}
          className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/60"
        >
          {n}
        </span>
      ))}
    </div>
  )
}

const ActionsMenu = ({
  row,
  onEditClick,
  handleDeleteCryptoCurrency,
  onDisableCoin,
}: {
  row: any
  onEditClick: (id: string) => void
  handleDeleteCryptoCurrency: (id: string) => void
  onDisableCoin: (id: string, status: boolean) => void
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-200/90 py-1 overflow-hidden text-xs">
          <button
            onClick={(e) => { e.stopPropagation(); onEditClick(row.id); setOpen(false) }}
            className="w-full text-left px-3.5 py-2 font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Edit Coin
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDisableCoin(row.id, row.status); setOpen(false) }}
            className="w-full text-left px-3.5 py-2 font-medium text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
          >
            {row.status ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteCryptoCurrency(row.id); setOpen(false) }}
            className="w-full text-left px-3.5 py-2 font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export const SearchSupportedCryptoColumn = (
  onEditClick: (id: string) => void,
  handleDeleteCryptoCurrency: (id: string) => void,
  onDisableCoin: (id: string, status: boolean) => void,
): Array<TableColumn> => [
  {
    key: 'coin',
    header: 'Coin',
    className: 'font-medium text-gray-900',
    render: (value, row) => (
      <Fragment>
        <div className="w-full flex items-center justify-between space-x-3">
          <div>
            <img
              src={row.logoUrl}
              alt={row.symbol}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <div className="text-left text-sm font-medium text-gray-500">
            <span className="flex items-center gap-2">
              <span className="font-medium text-[12px] text-[#667085]">
                {value}
              </span>
            </span>
          </div>
        </div>
      </Fragment>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    className: 'font-medium text-gray-900',
    render: (value) => (
      <Fragment>
        <StatusColumn status={String(value)} />
      </Fragment>
    ),
  },
  {
    key: 'operations',
    header: 'Operations',
    className: 'font-medium text-gray-900',
    render: (value) => (
      <Fragment>
        <span className="font-medium text-[12px] text-[#667085]">{value}</span>
      </Fragment>
    ),
  },
  {
    key: 'networks',
    header: 'Networks',
    className: 'font-medium text-gray-900',
    render: (value) => (
      <Fragment>
        <NetworkTags networks={value as string[]} />
      </Fragment>
    ),
  },
  {
    key: 'tradeLimit',
    header: 'Trade limit (min - max)',
    className: 'font-medium text-gray-900',
    render: (value) => (
      <Fragment>
        <span className="font-medium text-[12px] text-[#667085] flex items-center gap-2">
          <span>{value}</span>
        </span>
      </Fragment>
    ),
  },
  {
    key: 'tradeLimitAnonymous',
    header: 'Trade limit (min - max) - Anonymous',
    className: 'font-medium text-gray-900',
    render: (value) => (
      <Fragment>
        <span className="font-medium text-[12px] text-[#667085] flex items-center gap-2">
          <span>{value}</span>
        </span>
      </Fragment>
    ),
  },
  {
    key: 'createdAt',
    header: 'Supported From',
    className: 'font-medium text-gray-900',
    render: (value) => (
      <Fragment>
        <span className="font-medium text-[12px] text-[#667085] flex items-center gap-2">
          <span>{value}</span>
        </span>
      </Fragment>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    render: (_value, row) => (
      <ActionsMenu
        row={row}
        onEditClick={onEditClick}
        handleDeleteCryptoCurrency={handleDeleteCryptoCurrency}
        onDisableCoin={onDisableCoin}
      />
    ),
  },
]

export const SearchSupportedCryptoDataRow = (data: Array<SearchSupportedCryptoData> | undefined) => {
  const rowItems: Array<any> = [];

  if (!data) {
    return rowItems;
  }

  data.map((item: SearchSupportedCryptoData) => {
    rowItems.push({
      id: item.id,
      coin: item.symbol,
      operations: item.buyEnabled ? (item.sellEnabled ? 'Buy & Sell' : 'Buy') : (item.sellEnabled ? 'Sell' : 'None'),
      networks: item.networks,
      tradeLimit: `${formatCompact(Number(item.minTransactionLimit), item.symbol)} ${item.symbol} - ${formatCompact(Number(item.maxTransactionLimit), item.symbol)} ${item.symbol}`,
      tradeLimitAnonymous: `${formatCompact(Number(item.minTradeAmountForAnonymous), item.symbol)} ${item.symbol} - ${formatCompact(Number(item.maxTradeAmountForAnonymous), item.symbol)} ${item.symbol}`,
      logoUrl: item.logoUrl,
      status: item.isActive,
      createdAt: momentClient.formatToNormalisedDateAndTime(item.createdAt),
    });

    return;
  });

  return rowItems;
};

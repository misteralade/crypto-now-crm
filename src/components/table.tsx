/* eslint-disable react-refresh/only-export-components */
import { useState, type ChangeEvent, type FC, type ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'
import type { UserStatusVariant } from '../types/global.types.ts'

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface TableColumn<T extends Record<string, any> = Record<string, any>> {
  key: string
  header: ReactNode
  render?: (value: any, row: T) => ReactNode
  className?: string
  headerClassName?: string
}

export interface TableProps<T extends Record<string, any> = Record<string, any>> {
  data: Array<T>
  columns: Array<TableColumn<T>>
  className?: string
  tableClassName?: string
  emptyMessage?: string
  onRowClick?: (row: T) => void
  selectable?: boolean
  onSelectionChange?: (selectedRowIndexes: Array<number>) => void
  renderCheckbox?: (opts: {
    checked: boolean
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    index?: number
  }) => ReactNode
  emptyIllustrationSrc?: string
  emptyTitle?: string
  emptySubtitle?: string
  theadClassName?: string
  headerRowClassName?: string
  headerCellClassName?: string
  bodyClassName?: string
  rowClassName?: string
  loading?: boolean;
  cellClassNameResolver?: (args: {
    columnKey: string
    row: T
    index: number
  }) => string
}

type StatusVariant =
  | 'completed'
  | 'pending'
  | 'error'
  | 'processing'
  | 'expired'
  | 'failed'

// ============================================================================
// Utility Functions
// ============================================================================

export const mapTransactionStatus = (
  status: string,
): { displayText: string; variant: StatusVariant } => {
  const statusMap: Record<
    string,
    { displayText: string; variant: StatusVariant }
  > = {
    AWAITING_PAYMENT: { displayText: 'Pending', variant: 'pending' },
    IN_REVIEW: { displayText: 'In Review', variant: 'processing' },
    COMPLETED: { displayText: 'Completed', variant: 'completed' },
    INITIATED: { displayText: 'Pending', variant: 'pending' },
    FAILED: { displayText: 'Failed', variant: 'failed' },
    EXPIRED: { displayText: 'Expired', variant: 'expired' },
    REFUNDED: { displayText: 'Refunded', variant: 'completed' },
    PENDING_CONFIRMATION: { displayText: 'Pending Confirmation', variant: 'pending' },
    ERROR: { displayText: 'Error', variant: 'error' },
  }

  return statusMap[status] || { displayText: status, variant: 'pending' }
}

// ============================================================================
// Main Table Component
// ============================================================================

export default function Table<T extends Record<string, any> = Record<string, any>>({
  data,
  columns,
  className = '',
  tableClassName = '',
  emptyMessage = 'No data available',
  onRowClick,
  selectable = false,
  onSelectionChange,
  renderCheckbox,
  emptyIllustrationSrc,
  emptyTitle,
  emptySubtitle,
  loading,
  theadClassName = 'bg-[#F0F4FA] border-b border-slate-200/80',
  headerRowClassName = '',
  headerCellClassName = '',
  bodyClassName = 'divide-y divide-slate-100',
  rowClassName = '',
  cellClassNameResolver,
}: TableProps<T>) {
  const [selectedIndexes, setSelectedIndexes] = useState<Array<number>>([])

  const toggleAll = () => {
    const all: Array<number> =
      selectedIndexes.length === data.length ? [] : data.map((_, i) => i)
    setSelectedIndexes(all)
    onSelectionChange?.(all)
  }

  const toggleOne = (index: number) => {
    setSelectedIndexes((prev) => {
      const exists = prev.includes(index)
      const next = exists ? prev.filter((i) => i !== index) : [...prev, index]
      onSelectionChange?.(next)
      return next
    })
  }

  // ========================================================================
  // Render Skeleton Loader
  // ========================================================================
  if (loading) {
    return (
      <div className={`bg-white rounded-2xl overflow-hidden ${className}`}>
        <div className="min-w-0 overflow-x-auto overscroll-x-contain" tabIndex={0} aria-label="Scrollable table">
          <table className={`w-full ${tableClassName}`}>
            <thead className="bg-[#F8F8FF] border-b border-[#ECECEC]">
              <tr>
                {selectable && <th className="px-4 py-3 w-10"><div className="h-4 w-4 rounded bg-[#ECECEC] animate-pulse" /></th>}
                {columns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left">
                    <div className="h-3 rounded-full bg-[#ECECEC] animate-pulse" style={{ width: `${Math.floor(Math.random() * 40) + 40}%` }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5FF]">
              {Array.from({ length: 6 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {selectable && <td className="px-4 py-4"><div className="h-4 w-4 rounded bg-[#F0F0FF] animate-pulse" /></td>}
                  {columns.map((col, colIdx) => (
                    <td key={col.key} className="px-4 py-4">
                      <div
                        className="h-3.5 rounded-full animate-pulse"
                        style={{
                          width: colIdx === 0 ? '60%' : colIdx === 1 ? '80%' : `${Math.floor(Math.random() * 30) + 30}%`,
                          backgroundColor: rowIdx % 2 === 0 ? '#F0F0FF' : '#F5F5FF',
                          animationDelay: `${rowIdx * 80}ms`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // ========================================================================
  // Render Empty State
  // ========================================================================

  if (data.length === 0) {
    return (
      <div
        className={`bg-white rounded-2xl border border-[#ECECEC] ${className}`}
      >
        <div className="p-12 text-center">
          {emptyIllustrationSrc ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={emptyIllustrationSrc}
                alt="Empty state"
                className="w-48 h-48 object-contain"
              />
              {emptyTitle && (
                <p className="text-gray-900 text-lg font-medium">
                  {emptyTitle}
                </p>
              )}
              {emptySubtitle ? (
                <p className="text-gray-500 text-sm">{emptySubtitle}</p>
              ) : (
                <p className="text-gray-500 text-sm">{emptyMessage}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">{emptyMessage}</p>
          )}
        </div>
      </div>
    )
  }



  // ========================================================================
  // Render Table
  // ========================================================================

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden ${className}`}>
      <div className="min-w-0 overflow-x-auto overscroll-x-contain" tabIndex={0} aria-label="Scrollable table">
        <table className={`w-full text-left border-collapse ${tableClassName}`}>
          <thead className={theadClassName}>
            <tr className={headerRowClassName}>
              {selectable ? (
                <th className="px-3 py-3 w-10">
                  {renderCheckbox ? (
                    renderCheckbox({
                      checked:
                        selectedIndexes.length === data.length &&
                        data.length > 0,
                      onChange: toggleAll,
                    })
                  ) : (
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={
                        selectedIndexes.length === data.length &&
                        data.length > 0
                      }
                      onChange={toggleAll}
                    />
                  )}
                </th>
              ) : null}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-3.5 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider ${headerCellClassName} ${column.headerClassName || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={bodyClassName}>
            {data.map((row, index) => (
              <tr
                key={index}
                className={cn(
                  'transition-colors hover:bg-slate-50/80',
                  onRowClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-inset',
                  rowClassName,
                )}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => {
                  if (!onRowClick) return
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onRowClick(row)
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {selectable && (
                  <td
                    className="px-2 py-3 sm:px-6 sm:py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {renderCheckbox ? (
                      renderCheckbox({
                        checked: selectedIndexes.includes(index),
                        index,
                        onChange: (e: ChangeEvent<HTMLInputElement>) => {
                          e.stopPropagation()
                          toggleOne(index)
                        },
                      })
                    ) : (
                      <input
                        type="checkbox"
                        aria-label={`Select row ${index + 1}`}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedIndexes.includes(index)}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleOne(index)
                        }}
                      />
                    )}
                  </td>
                )}
                {columns.map((column) => {
                  const value = row[column.key]
                  const defaultTextClass = column.className
                    ? column.className
                    : ['type', 'amount', 'date'].includes(column.key)
                      ? '!text-[#667085]'
                      : ''
                  const resolvedCellClass = cellClassNameResolver
                    ? cellClassNameResolver({
                        columnKey: column.key,
                        row,
                        index,
                      })
                    : ''
                  return (
                    <td
                      key={column.key}
                      className={`px-2 py-3 text-sm sm:px-4 sm:py-5 ${defaultTextClass} ${resolvedCellClass}`}
                    >
                      {column.render
                        ? column.render(value, row)
                        : value == null
                          ? ''
                          : String(value)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

export const TableLink: FC<{
  href?: string
  children: ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-1 text-gray-900 transition-colors font-medium"
  >
    <span>{children}</span>
    <ExternalLink size={14} className="text-gray-400" />
  </button>
)

export const TableAmount: FC<{
  amount: string | number
  currency?: string
}> = ({ amount, currency = '₦' }) => (
  <span className="font-medium text-gray-600 tabular-nums whitespace-nowrap">
    {currency}
    {typeof amount === 'number' ? amount.toLocaleString() : amount}
  </span>
)

export const TableDate: FC<{
  date: string | Date
}> = ({ date }) => {
  const formatDate = (input: string | Date) => {
    const d = new Date(input)
    return d
      .toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(',', ' -')
  }

  return <span className="text-gray-600 whitespace-nowrap tabular-nums">{formatDate(date)}</span>
}

export const TableStatus: FC<{
  status: string
  variant?: StatusVariant
}> = ({ status, variant = 'pending' }) => {
  const variants: Record<StatusVariant, string> = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    pending: 'bg-amber-50 text-amber-700 border-amber-200/70',
    error: 'bg-rose-50 text-rose-700 border-rose-200/70',
    processing: 'bg-blue-50 text-blue-700 border-blue-200/70',
    expired: 'bg-slate-100 text-slate-700 border-slate-200/70',
    failed: 'bg-rose-50 text-rose-700 border-rose-200/70',
  }

  const dotColors: Record<StatusVariant, string> = {
    completed: 'bg-emerald-500',
    pending: 'bg-amber-500',
    error: 'bg-rose-500',
    processing: 'bg-blue-500',
    expired: 'bg-slate-400',
    failed: 'bg-rose-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider rounded-md border ${variants[variant]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />
      {status}
    </span>
  )
}

export const UserStatusBadge: FC<{
  status: UserStatusVariant
}> = ({ status }) => {
  if (!status || typeof status !== 'string') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider rounded-md border bg-slate-100 text-slate-600 border-slate-200/70">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        Unknown
      </span>
    )
  }

  const variants: Record<UserStatusVariant, string> = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200/70',
    SUSPENDED: 'bg-amber-50 text-amber-700 border-amber-200/70',
    BANNED: 'bg-rose-50 text-rose-700 border-rose-200/70',
    DELETED: 'bg-slate-100 text-slate-600 border-slate-200/70',
  }

  const dotColors: Record<UserStatusVariant, string> = {
    ACTIVE: 'bg-emerald-500',
    PENDING: 'bg-amber-500',
    SUSPENDED: 'bg-amber-500',
    BANNED: 'bg-rose-500',
    DELETED: 'bg-slate-400',
  }

  const normalizedStatus = status.toUpperCase() as UserStatusVariant
  const variant = variants[normalizedStatus] || variants.DELETED
  const dotColor = dotColors[normalizedStatus] || dotColors.DELETED

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider rounded-md border ${variant}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      {status}
    </span>
  )
}

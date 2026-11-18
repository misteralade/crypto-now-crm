import {Fragment} from "react";
import CopyDetails, {ClickableDetails} from "../global/CopyDetails.tsx";
import { ChevronDown } from "lucide-react";
import {DisputeStatusBadge} from "../global/StatusBadge.tsx";
import type { TableColumn } from "../table.tsx";
import type {AdminSearchDisputes} from "../../types/response.payload.types.ts";
import {formatCompact} from "../../util/asset-precision";
import momentClient from "../../util/moment.ts";

export const DisputeManagementColumn = (
  handleViewDisputeDetails: (disputeId: string) => void,
  handleSortBy: (columnKey: string) => void,
  handleNavigateToTransactionPage: (sessionId: string) => void,
  handleNavigateToEditDisputePage: (disputeId: string) => void,
): Array<TableColumn> => [
  {
    key: 'id',
    header: (
      <Fragment>
        <div className="py-2.5 text-left text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <span>Dispute ID</span>
          </span>
        </div>
      </Fragment>
    ),
    render: (value) => (
      <div className="py-2.5 text-xs text-slate-900 font-mono">
        <CopyDetails text={value} className="!max-w-[180px]" iconClassName="h-4 w-4"/>
      </div>
    ),
  },
  {
    key: 'initiator',
    header: (
      <div
        className="py-2.5 text-left text-xs font-semibold text-slate-600 hover:cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <span>User (Initiator)</span>
        </span>
      </div>
    ),
    render: (value) => <span className="py-2.5 text-xs text-slate-700 font-medium">{value}</span>,
  },
  {
    key: 'transactionId',
    header: (
      <div className="py-2.5 text-left text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-2">
          <span>Transaction ID</span>
        </span>
      </div>
    ),
    render: (value) => (
      <div className="py-2.5 text-xs text-slate-900 font-mono">
        <ClickableDetails text={value} className="!max-w-[140px]" onClick={handleNavigateToTransactionPage}/>
      </div>
    ),
  },
  {
    key: 'amount',
    header: (
      <div className="py-2.5 text-left text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-2">
          <span>Amount</span>
        </span>
      </div>
    ),
    render: (value) => (
      <span className="py-2.5 text-xs font-semibold text-slate-900 tabular-nums">₦ {value}</span>
    ),
  },
  {
    key: 'date',
    header: (
      <Fragment>
        <div className="py-2.5 text-left text-xs font-semibold !min-w-[140px] text-slate-600">
          <span className="flex items-center gap-2">
            <span>Date</span>
            <ChevronDown
              className="text-slate-400 h-3.5 w-3.5 cursor-pointer"
              onClick={() => handleSortBy('createdAt')}
            />
          </span>
        </div>
      </Fragment>
    ),
    render: (value) => (
      <Fragment>
        <span className="py-2.5 text-xs text-slate-500 !min-w-[140px]">{value}</span>
      </Fragment>
    ),
  },
  {
    key: 'status',
    header: (
      <Fragment>
        <div className="py-2.5 text-left text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <span>Status</span>
            <ChevronDown
              className="text-slate-400 h-3.5 w-3.5 cursor-pointer"
              onClick={() => handleSortBy('status')}
            />
          </span>
        </div>
      </Fragment>
    ),
    render: (value) => {
      return <DisputeStatusBadge status={value}/>
    },
  },
  {
    key: 'action',
    header: (
      <Fragment>
        <div className="py-2.5 text-right text-xs font-semibold text-slate-600">
          <span>Action</span>
        </div>
      </Fragment>
    ),
    render: (_, row) => (
      <Fragment>
        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
          <button
            className="h-7 px-2.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
            onClick={() => handleViewDisputeDetails(row.id)}
          >
            View
          </button>
          
          <button
            className="h-7 px-2.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            onClick={() => handleNavigateToEditDisputePage(row.id)}
          >
            Edit
          </button>
        </div>
      </Fragment>
    ),
  },
]

export const DisputeManagementDataRow = (
  data: Array<AdminSearchDisputes> | undefined,
) => {
  const rowItems: Array<any> = []
  
  if (!data) {
    return rowItems
  }
  
  data.map((item: AdminSearchDisputes) => {
    rowItems.push({
      id: item.id,
      initiator: item?.creator ? `${item.creator.profile?.firstName} ${item.creator.profile?.lastName}` : 'Anonymous',
      transactionId: item.transaction.sessionId,
      amount: formatCompact(Number(item.transaction.amountFiatNGN), "NGN"),
      date: momentClient.formatToTransactionInitiationDate(item.createdAt),
      status: item.status,
    })
    
    return
  })
  
  return rowItems
}
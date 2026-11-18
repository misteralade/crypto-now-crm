import {StatusColumn} from "./global";
import type {TableColumn} from "../table";
import type {SearchAdminResponsePayload} from "../../types/response.payload.types.ts";

type SearchAdminTableRow = {
  id: string
  name: string
  username: string
  email: string
  role: string
  status: boolean
}

export const SearchAdminDataColumn = (
  currentAdminId?: string | null,
): Array<TableColumn> => [
  {
    key: 'id',
    header: 'Admin ID',
    render: (value) => (
      <span className="overflow-hidden text-sm whitespace-nowrap text-ellipsis tabular-nums text-[#101828]">
        {value}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Name',
    render: (value, row) => (
      <div className="min-w-0">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-[#101828]">
          {value}{' '}
          {row.id === currentAdminId && <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-blue-700">You</span>}
        </p>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    render: (value) => (
      <span className="overflow-hidden text-[#101828] text-sm whitespace-nowrap text-ellipsis truncate block">
        {value}
      </span>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    render: (value) => (
      <span className="overflow-hidden text-ellipsis truncate block text-[#667085] text-sm font-medium whitespace-nowrap">
        {value}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    render: (value) => (
      <StatusColumn status={String(value)} />
    ),
  },

]

export const SearchAdminDataRow = (
  data: Array<SearchAdminResponsePayload> | undefined,
) => {
  const rowItems: Array<SearchAdminTableRow> = []

  if (!data) {
    return rowItems
  }

  data.map((item: SearchAdminResponsePayload) => {
    rowItems.push({
      id: item.id,
      name: `${item.firstName} ${item.lastName}`,
      username: item.username,
      email: item.email,
      role: item.adminRoles[0]?.role?.name || 'N/A',
      status: item.active,
    })

    return
  })

  return rowItems
}

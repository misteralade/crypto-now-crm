import { Fragment, useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import CopyDetails from "../global/CopyDetails";
import { UserStatusBadge } from "../table";
import type { AdminSearchUsersResponsePayload } from "../../types/response.payload.types";
import type { UserStatusVariant } from "../../types/global.types";
import type { TableColumn } from "../table";

const ActionsMenu = ({
  row,
  handleNavigateToTransactionHistory,
  handleUpdateUserStatus,
  handleResetUserPassword,
}: {
  row: any;
  handleNavigateToTransactionHistory: (userId: string) => void;
  handleUpdateUserStatus: (userId: string, status: UserStatusVariant) => void;
  handleResetUserPassword: (userId: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = row.status?.toLowerCase() === "active";

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-[#667085]" />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNavigateToTransactionHistory(row.id);
              setOpen(false);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            View Transactions
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUpdateUserStatus(row.id, isActive ? "SUSPENDED" : "ACTIVE");
              setOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 text-xs font-semibold ${
              isActive
                ? "text-rose-600 hover:bg-rose-50"
                : "text-amber-600 hover:bg-amber-50"
            } transition-colors`}
          >
            {isActive ? "Suspend User" : "Activate User"}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResetUserPassword(row.id);
              setOpen(false);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Reset Password
          </button>
        </div>
      )}
    </div>
  );
};

// Start Admin View Users Table Columns
export const AdminSearchUserColumn = (
  handleNavigateToTransactionHistory: (userId: string) => void,
  handleUpdateUserStatus: (userId: string, status: UserStatusVariant) => void,
  handleResetUserPassword: (userId: string) => void
): Array<TableColumn> => [
  {
    key: "id",
    header: "User ID",
    className: "font-medium text-slate-900 font-mono text-xs",
    render: (value) => (
      <Fragment>
        <div className="text-xs text-slate-900 font-mono">
          <CopyDetails
            text={value}
            className="font-medium !w-[110px]"
            iconClassName="!h-4 !w-4 text-slate-400 hover:text-slate-600"
          />
        </div>
      </Fragment>
    ),
  },
  {
    key: "name",
    header: "Name",
    render: (value, row) => {
      const displayName = value || "User";
      const initial = displayName.charAt(0).toUpperCase();
      return (
        <div className="flex items-center gap-2.5">
          {row.imgUrl ? (
            <img
              src={row.imgUrl}
              alt={displayName}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[11px] flex items-center justify-center shrink-0">
              {initial}
            </div>
          )}
          <span className="font-semibold text-xs text-slate-900">
            {displayName}
          </span>
        </div>
      );
    },
  },
  {
    key: "email",
    header: "Email",
    render: (value) => (
      <div className="text-[13px] text-[#667085]">{value}</div>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (value) => {
      return <UserStatusBadge status={value as UserStatusVariant} />;
    },
  },
  {
    key: "lastLogin",
    header: "Last Login",
    render: (value) => (
      <div className="text-[13px] text-[#667085]">
        {value ? (
          <div className="flex flex-col">
            <span className="font-medium text-[#101828]">
              {new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-[11px] text-[#9A9A9A]">
              {new Date(value).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
        ) : (
          <span className="text-[#9A9A9A]">Never</span>
        )}
      </div>
    ),
  },
  {
    key: "action",
    header: "Actions",
    render: (_, row) => (
      <ActionsMenu
        row={row}
        handleNavigateToTransactionHistory={handleNavigateToTransactionHistory}
        handleUpdateUserStatus={handleUpdateUserStatus}
        handleResetUserPassword={handleResetUserPassword}
      />
    ),
  },
];

export const AdminSearchUserDataRow = (
  data: Array<AdminSearchUsersResponsePayload> | undefined
) => {
  const rowItems: Array<any> = [];

  if (!data) {
    return rowItems;
  }

  data.map((item: AdminSearchUsersResponsePayload) => {
    const fullName = [item.profile?.firstName, item.profile?.lastName]
      .filter((n) => Boolean(n) && n !== "null")
      .join(" ")
      .trim() || item.user.email?.split("@")[0] || "User";

    rowItems.push({
      id: item.user.id,
      name: fullName,
      imgUrl: item.profile?.profileImg,
      email: item.user.email,
      status: item.user.status,
      // amount: Number(item.totalVolume),
      lastLogin: item.user.lastLogin,
    });

    return;
  });

  return rowItems;
};
// End Admin View Users Table Columns

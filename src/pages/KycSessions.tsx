import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import AuthenticatedLayout from "../layout/AuthenticatedLayout";
import PageHeader from "../components/global/pageHeader";
import TableFooter from "../components/tables/TableFooter";
import { useNavbarSearch } from "../layout/navbar-search-context";
import { useKycSessionQuery } from "../queries/kyc-session.querries";
import {
  setKycSessionLimit,
  setKycSessionPage,
  setKycSessionStatusFilter,
  setKycSessionUserIdFilter,
} from "../redux/kyc-session.slice";
import type { RootState } from "../store";
import type { KycSessionStep } from "../types/kyc-session.types";
import { ROUTES } from "../util/constants.util";

const STEP_LABELS: Record<KycSessionStep, string> = {
  "Not Started": "Not Started",
  submitted: "Submitted",
  "In Progress": "In Progress",
  "In Review": "In Review",
  Resubmitted: "Resubmitted",
  Approved: "Approved",
  Declined: "Declined",
  Expired: "Expired",
  Abandoned: "Abandoned",
  archived: "Archived",
};

const STEP_STYLES: Record<
  KycSessionStep,
  { bg: string; dot: string; textColor: string; border: string }
> = {
  "Not Started": {
    bg: "bg-slate-100",
    dot: "bg-slate-400",
    textColor: "text-slate-600",
    border: "border-slate-200",
  },
  submitted: {
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    textColor: "text-amber-700",
    border: "border-amber-200/60",
  },
  "In Progress": {
    bg: "bg-blue-50",
    dot: "bg-blue-500",
    textColor: "text-blue-700",
    border: "border-blue-200/60",
  },
  "In Review": {
    bg: "bg-indigo-50",
    dot: "bg-indigo-500",
    textColor: "text-indigo-700",
    border: "border-indigo-200/60",
  },
  Resubmitted: {
    bg: "bg-blue-50",
    dot: "bg-blue-500",
    textColor: "text-blue-700",
    border: "border-blue-200/60",
  },
  Approved: {
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    textColor: "text-emerald-700",
    border: "border-emerald-200/60",
  },
  Declined: {
    bg: "bg-rose-50",
    dot: "bg-rose-500",
    textColor: "text-rose-700",
    border: "border-rose-200/60",
  },
  Expired: {
    bg: "bg-slate-100",
    dot: "bg-slate-400",
    textColor: "text-slate-600",
    border: "border-slate-200",
  },
  Abandoned: {
    bg: "bg-slate-100",
    dot: "bg-slate-400",
    textColor: "text-slate-600",
    border: "border-slate-200",
  },
  archived: {
    bg: "bg-slate-100",
    dot: "bg-slate-400",
    textColor: "text-slate-600",
    border: "border-slate-200",
  },
};

const STATUS_FILTER_OPTIONS: {
  value: KycSessionStep | undefined;
  label: string;
}[] = [
  { value: undefined, label: "All Statuses" },
  { value: "In Progress", label: "In Progress" },
  { value: "Declined", label: "Declined" },
  { value: "Approved", label: "Approved" },
  { value: "submitted", label: "Submitted" },
  { value: "Not Started", label: "Not Started" },
  { value: "archived", label: "Archived" },
];

function KycStepBadge({ step }: { step: KycSessionStep }) {
  const style = STEP_STYLES[step] ?? STEP_STYLES["Not Started"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg} ${style.textColor} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {STEP_LABELS[step]}
    </span>
  );
}

const KycSessions = () => {
  const dispatch = useDispatch();
  const { page, limit, statusFilter, userIdFilter } = useSelector(
    (s: RootState) => s.kycSession.list
  );
  const [searchInput, setSearchInput] = useState(userIdFilter);

  const { useAdminGetSessions } = useKycSessionQuery();
  const { data, isLoading } = useAdminGetSessions({
    page,
    limit,
    status: statusFilter,
    userId: userIdFilter || undefined,
  });

  function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    dispatch(setKycSessionUserIdFilter(searchInput.trim()));
  }

  useNavbarSearch({
    placeholder: "Search KYC by User ID...",
    value: searchInput,
    onChange: (val) => {
      setSearchInput(val);
      if (!val.trim()) {
        dispatch(setKycSessionUserIdFilter(""));
      }
    },
    onSubmit: handleSearch,
  });

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="KYC Sessions"
        actions={
          <div className="w-[160px]">
            <select
              value={statusFilter ?? ""}
              onChange={(e) =>
                dispatch(
                  setKycSessionStatusFilter(
                    e.target.value === "" ? undefined : (e.target.value as KycSessionStep)
                  )
                )
              }
              className="w-full h-8.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-2xs"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="px-4 sm:px-6 pb-6 space-y-3">
        {userIdFilter && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2 text-xs text-blue-900">
            <span>Filtered by: <strong className="font-semibold">{userIdFilter}</strong></span>
            <button
              onClick={() => {
                setSearchInput("");
                dispatch(setKycSessionUserIdFilter(""));
              }}
              className="font-medium text-blue-600 hover:underline cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#F0F4FA] border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="text-left px-4 py-3">Applicant</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Doc Result</th>
                  <th className="text-left px-4 py-3">Face Result</th>
                  <th className="text-left px-4 py-3">Retries</th>
                  <th className="text-left px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading sessions...
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  (!data?.sessions || data.sessions.length === 0) && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-2">
                          <ShieldCheck className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-700 text-sm">No KYC sessions found</p>
                          <p className="text-slate-400 text-xs">Sessions will appear here once users initiate verification.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                {data?.sessions?.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {session.user?.profile
                            ? `${session.user.profile.firstName} ${session.user.profile.lastName}`
                            : "User"}
                        </p>
                        <p className="text-slate-500 text-[11px] truncate max-w-[180px]">
                          {session.user?.email ?? session.userId}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <KycStepBadge step={session.currentStep} />
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold capitalize text-[11px] ${
                          session.documentVerificationStatus === "approved"
                            ? "text-emerald-700"
                            : session.documentVerificationStatus === "rejected"
                            ? "text-rose-600"
                            : session.documentVerificationStatus === "error"
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {session.documentVerificationStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold capitalize text-[11px] ${
                          session.faceMatchStatus === "approved"
                            ? "text-emerald-700"
                            : session.faceMatchStatus === "rejected"
                            ? "text-rose-600"
                            : session.faceMatchStatus === "error"
                            ? "text-amber-600"
                            : "text-slate-400"
                        }`}
                      >
                        {session.faceMatchStatus || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums">
                      {session.identityVerificationAttempts} / {session.identityVerificationAttemptsRemaining} left
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={ROUTES.KYC_SESSION_DETAIL.replace("$id", session.id)}
                        className="inline-flex items-center h-7 px-2.5 rounded-md text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <TableFooter
            currentPage={data?.page || 1}
            totalPages={data?.totalPages || 1}
            pageSize={limit}
            totalItems={data?.count ?? data?.sessions?.length ?? 0}
            onPageChange={(p) => dispatch(setKycSessionPage(p))}
            onPageSizeChange={(sz) => dispatch(setKycSessionLimit(sz))}
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default KycSessions;

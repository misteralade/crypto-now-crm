import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MessageSquareText, Star } from "lucide-react";
import { API_KIT } from "../api";
import AuthenticatedLayout from "../layout/AuthenticatedLayout";
import PageHeader from "../components/global/pageHeader";
import Table, { type TableColumn } from "../components/table";
import TableFooter from "../components/tables/TableFooter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Link } from "@tanstack/react-router";
import { ROUTES } from "../util/constants.util";

const PERIOD = { DAY: "day", WEEK: "week", MONTH: "month" } as const;
const PAGE_SIZE = 20;
type Period = typeof PERIOD[keyof typeof PERIOD];
type ReviewMessage = { id: string; rating: number; message: string; createdAt: string; userId: string | null; email: string | null };
type Summary = { count: number; average: number; trend: Array<{ period: string; count: number; average: number }>; messages: ReviewMessage[]; messageCount: number; page: number };

const columns: TableColumn<ReviewMessage>[] = [
  { key: "createdAt", header: "Date", headerClassName: "w-44 whitespace-nowrap", className: "w-44 whitespace-nowrap", render: (value: string) => <span className="text-xs text-slate-600 tabular-nums">{new Date(value).toLocaleString()}</span> },
  { key: "email", header: "Customer", headerClassName: "whitespace-nowrap", className: "whitespace-nowrap", render: (email: string | null, review) => email ? (review.userId ? <Link to={ROUTES.USERS_DETAILS} params={{ userId: review.userId }} className="text-xs font-medium text-blue-600 hover:underline">{email}</Link> : <span className="text-xs text-slate-600">{email}</span>) : <span className="text-xs text-slate-400">Unavailable</span> },
  { key: "rating", header: "Rating", headerClassName: "w-28 whitespace-nowrap", className: "w-28 whitespace-nowrap", render: (value: number) => <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold tabular-nums text-amber-700"><Star size={13} className="shrink-0" fill="currentColor" aria-hidden="true" /><span>{value} / 5</span></span> },
  { key: "message", header: "Message", render: (value: string) => <div className="max-w-[32rem] overflow-x-auto whitespace-nowrap text-sm leading-relaxed text-slate-700" tabIndex={0}>{value}</div>, className: "min-w-[240px] w-full" },
];

export default function Reviews() {
  const [period, setPeriod] = useState<Period>(PERIOD.DAY);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["reviews", period, page],
    queryFn: async () => {
      const response = await API_KIT.get<{ data: Summary }>("/review/admin/summary", { params: { period, page } });
      return response.data.data;
    },
  });
  const chart = data?.trend.map((point) => ({ ...point, date: new Date(point.period).toLocaleDateString() }));
  const totalPages = Math.max(1, Math.ceil((data?.messageCount ?? 0) / PAGE_SIZE));

  return (
    <AuthenticatedLayout>
      <PageHeader title="Reviews" subtitle="Customer ratings and feedback" />
      <div className="space-y-4 px-4 pb-6 sm:px-6">
        {isError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">Could not load reviews. <button type="button" className="font-semibold underline" onClick={() => void refetch()}>Try again</button></div>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryCard label="Average rating" value={isLoading || isError ? "–" : data?.count ? data.average.toFixed(1) : "–"} suffix="/ 5" icon={<Star size={17} />} />
          <SummaryCard label="Total reviews" value={isLoading || isError ? "–" : (data?.count ?? 0).toLocaleString()} icon={<MessageSquareText size={17} />} />
        </div>

        <section className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="crm-section-heading font-bold text-slate-900">Reviews over time</h2><p className="mt-1 text-xs text-slate-500">Review count and average rating</p></div>
            <div className="flex items-center gap-2"><span className="text-xs font-medium text-slate-500">Group by</span>
              <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
                <SelectTrigger aria-label="Group reviews by" className="h-9 w-28 rounded-lg border-slate-200 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value={PERIOD.DAY}>Day</SelectItem><SelectItem value={PERIOD.WEEK}>Week</SelectItem><SelectItem value={PERIOD.MONTH}>Month</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          {isLoading ? <p className="py-12 text-center text-sm text-slate-500">Loading reviews...</p> : !isError && chart?.length ? (
            <div className="mt-5 h-64 min-w-0 sm:h-72"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chart} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#edf2f7" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis yAxisId="count" allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={42} /><YAxis yAxisId="rating" orientation="right" domain={[0, 5]} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} width={28} />
              <Tooltip /><Bar yAxisId="count" dataKey="count" name="Reviews" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={36} /><Line yAxisId="rating" dataKey="average" name="Average rating" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart></ResponsiveContainer></div>
          ) : !isError && <p className="py-12 text-center text-sm text-slate-500">No reviews yet.</p>}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-5"><h2 className="crm-section-heading font-bold text-slate-900">Review messages</h2><p className="mt-1 text-xs text-slate-500">Written feedback from customers</p></div>
          {!isError && <><Table data={data?.messages ?? []} columns={columns} loading={isLoading} emptyMessage="No review messages yet." className="!rounded-none !border-0 !shadow-none" tableClassName="min-w-[720px]" />
            <TableFooter currentPage={page} totalPages={totalPages} pageSize={PAGE_SIZE} totalItems={data?.messageCount ?? 0} onPageChange={setPage} showPageSize={false} /></>}
        </section>
      </div>
    </AuthenticatedLayout>
  );
}

function SummaryCard({ label, value, suffix, icon }: { label: string; value: string; suffix?: string; icon: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">{icon}</span><p className="text-xs font-semibold text-slate-500">{label}</p></div><p className="mt-4 text-2xl font-bold tabular-nums text-slate-900">{value} {suffix && <span className="text-sm font-medium text-slate-400">{suffix}</span>}</p></div>;
}

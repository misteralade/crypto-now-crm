import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { API_KIT } from "../api";
import AuthenticatedLayout from "../layout/AuthenticatedLayout";
import PageHeader from "../components/global/pageHeader";

const PERIOD = { DAY: "day", WEEK: "week", MONTH: "month" } as const;
type Period = typeof PERIOD[keyof typeof PERIOD];
type Summary = { count: number; average: number; trend: Array<{ period: string; count: number; average: number }>; messages: Array<{ id: string; rating: number; message: string; createdAt: string }>; messageCount: number; page: number };

export default function Reviews() {
  const [period, setPeriod] = useState<Period>(PERIOD.DAY);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useQuery({ queryKey: ["reviews", period, page], queryFn: async () => {
    const response = await API_KIT.get<{ data: Summary }>("/review/admin/summary", { params: { period, page } });
    return response.data.data;
  }});
  const chart = data?.trend.map((point) => ({ ...point, date: new Date(point.period).toLocaleDateString() }));
  return <AuthenticatedLayout><PageHeader title="Reviews" /><div className="px-4 sm:px-6 pb-6 space-y-5">
    {isError && <p role="alert" className="text-red-700">Could not load reviews. Please try again.</p>}
    <div className="grid gap-4 sm:grid-cols-2"><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">Average rating</p><p className="mt-2 text-3xl font-bold">{data?.count ? data.average.toFixed(1) : "–"} <span className="text-base text-slate-500">/ 5</span></p></div><div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">Total reviews</p><p className="mt-2 text-3xl font-bold">{data?.count ?? 0}</p></div></div>
    <section className="rounded-xl border bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Reviews over time</h2><p className="text-sm text-slate-500">Number of reviews and average rating</p></div><label className="text-sm">Group by <select aria-label="Group reviews by" value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="ml-2 rounded-lg border p-2"><option value={PERIOD.DAY}>Day</option><option value={PERIOD.WEEK}>Week</option><option value={PERIOD.MONTH}>Month</option></select></label></div>
      {isLoading ? <p className="py-10 text-sm">Loading reviews...</p> : chart?.length ? <div className="h-72 mt-5"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chart}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis yAxisId="count" allowDecimals={false} /><YAxis yAxisId="rating" orientation="right" domain={[0, 5]} /><Tooltip /><Bar yAxisId="count" dataKey="count" name="Reviews" fill="#6366f1" /><Line yAxisId="rating" dataKey="average" name="Average rating" stroke="#d97706" /></ComposedChart></ResponsiveContainer></div> : <p className="py-10 text-sm text-slate-500">No reviews yet.</p>}
    </section>
    <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Review messages</h2><div className="overflow-x-auto"><table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-2">Date</th><th className="p-2">Rating</th><th className="p-2">Message</th></tr></thead><tbody>{data?.messages.map((review) => <tr key={review.id} className="border-b"><td className="p-2 whitespace-nowrap">{new Date(review.createdAt).toLocaleString()}</td><td className="p-2 whitespace-nowrap">{review.rating} / 5</td><td className="p-2 whitespace-pre-wrap break-words">{review.message}</td></tr>)}</tbody></table></div>{!isLoading && !data?.messages.length && <p className="py-5 text-sm text-slate-500">No review messages yet.</p>}<div className="mt-4 flex items-center gap-3 text-sm"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><span>Page {page}</span><button disabled={!data || page * 20 >= data.messageCount} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div></section>
  </div></AuthenticatedLayout>;
}

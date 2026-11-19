import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  TransactionTypeByPercentage,
  WeeklyTransactionVolumeTrend,
} from '../../../types/response.payload.types'
import { Fragment } from 'react'
import { LoadingSpinner } from "../../global/LoadingSpinner.tsx";

const COLORS = ['#2563EB', '#10B981']

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

interface VolumeTrendProps {
  loading: boolean
  data: WeeklyTransactionVolumeTrend[]
}

const DEFAULT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const VolumeTrend = ({ loading, data }: VolumeTrendProps) => {
  const hasRealData = Array.isArray(data) && data.length > 0

  const lineData = hasRealData
    ? data.map((item) => ({
        date: item.dateLabel,
        value: Number((toFiniteNumber(item.totalFiatVolume) / 1_000_000).toFixed(2)),
      }))
    : DEFAULT_DAYS.map((day) => ({ date: day, value: 0 }))

  const maxValue = Math.max(...lineData.map((d) => d.value), 0)
  const yDomain = [0, maxValue > 0 ? Math.ceil(maxValue * 1.25) : 5]

  return (
    <Fragment>
      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 min-h-[280px] flex items-center justify-center">
          <LoadingSpinner size="md" message="Loading volume trend..."/>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Volume Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Transaction settlement volume in millions (₦)</p>
            </div>
            {!hasRealData && (
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Baseline (No trades this period)
              </span>
            )}
          </div>

          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={lineData}
                margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'DM Sans' }}
                  tickMargin={10}
                  padding={{ left: 12, right: 8 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'DM Sans' }}
                  domain={yDomain}
                  tickFormatter={(value) => `${value}M`}
                  tickMargin={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    padding: '8px 12px',
                    fontFamily: 'DM Sans',
                  }}
                  labelStyle={{ color: '#E2E8F0', fontSize: '11px', marginBottom: '2px', fontWeight: 600 }}
                  itemStyle={{ color: '#60A5FA', fontSize: '13px', fontWeight: 700 }}
                  formatter={(value: number | undefined) => [`₦${value != null ? value : 0}M`, 'Volume']}
                  cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fill="url(#areaFill)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Fragment>
  )
}

interface PieGraphProps {
  loading: boolean
  data: TransactionTypeByPercentage[]
}

export const PieGraph = ({ loading, data }: PieGraphProps) => {
  const hasItems = Array.isArray(data) && data.length > 0
  const hasValues = hasItems && data.some((i) => toFiniteNumber(i.percentage) > 0)

  const pieData = hasValues
    ? data.map(
        (item: TransactionTypeByPercentage): { name: string; value: number } => ({
          name: item.type,
          value: toFiniteNumber(item.percentage),
        }),
      )
    : [
        { name: 'BUY', value: 0 },
        { name: 'SELL', value: 0 },
      ]

  const chartData = hasValues
    ? pieData
    : [
        { name: 'Inactive', value: 100 },
      ]

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 h-full flex flex-col justify-between">
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">Buy vs Sell Split</h2>
        <p className="text-xs text-slate-500 mt-0.5">Customer transaction type breakdown</p>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <Fragment>
          <div className="flex items-center justify-around gap-4 my-auto">
            <div className="w-40 h-40 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={hasValues ? 3 : 0}
                    cornerRadius={hasValues ? 6 : 0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={hasValues ? COLORS[index % COLORS.length] : '#E2E8F0'}
                      />
                    ))}
                  </Pie>
                  {hasValues && (
                    <Tooltip
                      separator=""
                      formatter={(value) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontFamily: 'DM Sans',
                      }}
                      labelStyle={{ color: '#E2E8F0', fontSize: '11px' }}
                      itemStyle={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 600 }}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3.5">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-slate-500 font-medium capitalize">{entry.name}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 ml-4.5 leading-tight tabular-nums">
                    {entry.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          {!hasValues && (
            <p className="text-2xs text-center text-slate-400 mt-2 font-medium">
              No trades completed in selected timeframe
            </p>
          )}
        </Fragment>
      )}
    </div>
  )
}

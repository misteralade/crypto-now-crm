import { useMemo, useState } from 'react'
import {useDashboardPage} from "../hooks/pages/useDashboardPage";
import { formatCompact } from '../util/asset-precision';
import { UsersWithTopTransactionColumn, UsersWithTopTransactionDataRow } from '../components/tables/TransactionsManagementTables';
import type {TransactionTypeByPercentage, WeeklyTransactionVolumeTrend } from '../types/response.payload.types';
import type {TimelineFilter} from "../types/global.types";
import PageHeader from '../components/global/pageHeader';
import BlockchainEnvironmentBadge from '../components/global/BlockchainEnvironmentBadge';
import ShortSummaryCard from '../components/global/ShortSummaryCard';
import {PieGraph, VolumeTrend} from '../components/pages/dashboard/graphComponents';
import Table from "../components/table.tsx";
import TableFooter from '../components/tables/TableFooter';
import AuthenticatedLayout from "../layout/AuthenticatedLayout.tsx";
import { TrendingUp, Hash, Users, UserCheck, ListFilter, ArrowUpRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SummaryCardSkeleton } from '../components/global/Skeleton';
import { useNavigate } from '@tanstack/react-router';
import { ROUTES } from '../util/constants.util';

import PendingPayoutsCard from '../components/pages/dashboard/PendingPayoutsCard';
import InReviewTransactionsCard from '../components/pages/dashboard/InReviewTransactionsCard';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { PERMISSIONS } from '../util/permissions.util';

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAdminAuth();
  const canViewTransactions = hasPermission(PERMISSIONS.TRANSACTION.VIEW);
  const canViewUsers = hasPermission(PERMISSIONS.USER.VIEW);
  const {
    // States
    transactionVolume,
    loadingTransactionVolume,
    transactionCount,
    loadingTransactionCount,
    weeklyUserSummary,
    loadingWeeklyUserSummary,
    selectedTimeline,
    transactionTypeByPercentage,
    loadingTransactionTypeByPercentage,
    transactionVolumeTrend,
    loadingTransactionVolumeTrend,
    usersWithTopTransactionVolume,
    loadingUsersWithTopTransactionVolume,
    adminTransactionStats,
    loadingAdminTransactionStats,
    retryingPayouts,
    handleViewInReviewTransactions,
    
    // ⚙️ Functions
    handleSelectedTimelineChange,
    handleViewTransactionDetails,
    handleRetryAllPendingPayouts,
    handleViewPendingPayouts,
  } = useDashboardPage()

  const [tablePage, setTablePage] = useState(1);
  const [tableLimit, setTableLimit] = useState(5);
  
  const numberOfTransactionsDisplay = !loadingTransactionCount
    ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(transactionCount || 0)
    : '0'
  const columns = useMemo(() => UsersWithTopTransactionColumn(handleViewTransactionDetails), [ handleViewTransactionDetails ])
  const rawData = useMemo(
    () => UsersWithTopTransactionDataRow(usersWithTopTransactionVolume) ?? [],
    [usersWithTopTransactionVolume],
  )

  const paginatedData = useMemo(() => {
    const startIndex = (tablePage - 1) * tableLimit;
    return rawData.slice(startIndex, startIndex + tableLimit);
  }, [rawData, tablePage, tableLimit]);
  
  const timelineLabels: Record<string, string> = {
    week: 'vs last week',
    month: 'vs last month',
    year: 'vs last year',
    all: 'all time',
  }

  const formatCount = (value: number | undefined | null) => {
    const safeValue = Number.isFinite(value ?? NaN) ? Number(value) : 0
    return safeValue.toLocaleString('en-US')
  }

  return (
    <AuthenticatedLayout>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of exchange operations, liquidity, and settlement activity"
        badge={<BlockchainEnvironmentBadge />}
        actions={
          <Select value={selectedTimeline} onValueChange={(v) => handleSelectedTimelineChange(v as TimelineFilter)}>
            <SelectTrigger className="w-[130px] h-8.5 rounded-lg border-slate-200 shadow-2xs text-xs font-semibold text-slate-700 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="px-4 sm:px-6 space-y-5">
        {/* 4-Column Balanced KPI Metric Cards (SilverLogix standard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {canViewTransactions && (loadingTransactionVolume ? <SummaryCardSkeleton /> : (
            <ShortSummaryCard
              title="Total Volume"
              value={`₦${formatCompact(Number(transactionVolume?.totalFiatVolume || 0), "NGN")}`}
              time={timelineLabels[selectedTimeline] || ''}
              trend={{ value: 14, up: true }}
              theme="purple"
              icon={<TrendingUp className="w-5 h-5" />}
            />
          ))}

          {canViewTransactions && (loadingTransactionCount ? <SummaryCardSkeleton /> : (
            <ShortSummaryCard
              title="Total Transactions"
              value={numberOfTransactionsDisplay}
              time={timelineLabels[selectedTimeline] || ''}
              trend={{ value: 8, up: true }}
              theme="blue"
              icon={<Hash className="w-5 h-5" />}
            />
          ))}

          {canViewUsers && (loadingWeeklyUserSummary ? <SummaryCardSkeleton /> : (
            <ShortSummaryCard
              title="Active Users"
              value={formatCount(weeklyUserSummary?.activeUsersCount ?? 0)}
              time={timelineLabels[selectedTimeline] || ''}
              trend={{ value: 6, up: true }}
              theme="emerald"
              icon={<UserCheck className="w-5 h-5" />}
            />
          ))}

          {canViewUsers && (loadingWeeklyUserSummary ? <SummaryCardSkeleton /> : (
            <ShortSummaryCard
              title="New Users"
              value={formatCount(weeklyUserSummary?.newUsersCount ?? 0)}
              time={timelineLabels[selectedTimeline] || ''}
              trend={{ value: 3, up: true }}
              theme="amber"
              icon={<Users className="w-5 h-5" />}
            />
          ))}
        </div>

        {/* Operational Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {canViewUsers && (
            <PendingPayoutsCard
              count={weeklyUserSummary?.pendingPayoutsCount || 0}
              loading={loadingWeeklyUserSummary}
              onRetry={handleRetryAllPendingPayouts}
              onView={handleViewPendingPayouts}
              retrying={retryingPayouts}
            />
          )}

          {canViewTransactions && (
            <InReviewTransactionsCard
              count={adminTransactionStats?.inReview || 0}
              loading={loadingAdminTransactionStats}
              onView={handleViewInReviewTransactions}
            />
          )}
        </div>

        {/* Charts Section */}
        {canViewTransactions && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <VolumeTrend
                loading={loadingTransactionVolumeTrend}
                data={transactionVolumeTrend as Array<WeeklyTransactionVolumeTrend>}
              />
            </div>
            <div>
              <PieGraph
                loading={loadingTransactionTypeByPercentage}
                data={transactionTypeByPercentage as Array<TransactionTypeByPercentage>}
              />
            </div>
          </div>
        )}

        {/* High Value Transactions Table */}
        {canViewTransactions && (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ListFilter className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 tracking-tight">Recent High Value Transactions</h2>
                  <p className="text-2xs text-slate-500">Top customer trades and settlement volume</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate({ to: ROUTES.TRANSACTIONS })}
                  className="h-8 px-3 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View All Orders</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            <Table data={paginatedData} columns={columns} loading={loadingUsersWithTopTransactionVolume} />

            <TableFooter
              currentPage={tablePage}
              totalPages={Math.max(1, Math.ceil(rawData.length / tableLimit))}
              totalItems={rawData.length}
              pageSize={tableLimit}
              onPageChange={setTablePage}
              onPageSizeChange={(newSize: number) => {
                setTableLimit(newSize);
                setTablePage(1);
              }}
            />
          </div>
        )}

        {!canViewTransactions && !canViewUsers && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-10 text-center text-slate-400 text-sm">
            You don't have permission to view any dashboard data yet.
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  )
}

export default Dashboard;

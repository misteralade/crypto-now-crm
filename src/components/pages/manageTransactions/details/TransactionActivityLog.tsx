import { useMemo, useState } from "react";
import { Activity, ChevronDown, ChevronUp, Edit2, Eye, Play, RefreshCw } from "lucide-react";
import type { TransactionActivities } from "../../../../types/response.payload.types";
import { TRANSACTION_ACTIVITY_ACTIONS } from "../../../../util/constants.util.ts";
import momentClient from "../../../../util/moment";

interface TransactionActivityLogProps {
  activities: TransactionActivities[];
}

const TransactionActivityLog = ({ activities }: TransactionActivityLogProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});
  const visibleActivities = useMemo(
    () => activities.filter(({ action }) => action !== TRANSACTION_ACTIVITY_ACTIONS.ADMIN_LOCK_TRANSACTION),
    [activities],
  );

  if (visibleActivities.length === 0) return null;

  return (
    <section className="rounded-xl border border-[#E9EBF8] bg-[#F8F9FE] p-5 shadow-xs">
      <header className="mb-4 flex items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#EBF8FF] p-1.5 text-[#3182CE]"><Activity size={16} /></div>
          <h2 className="text-sm font-semibold text-slate-800">Activity log</h2>
        </div>
        <span className="rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-xs text-slate-500">
          {visibleActivities.length} {visibleActivities.length === 1 ? "activity" : "activities"}
        </span>
      </header>

      <div className="space-y-3">
        {(isExpanded ? visibleActivities : visibleActivities.slice(0, 3)).map((activity) => {
          const isStatusUpdate = activity.action === TRANSACTION_ACTIVITY_ACTIONS.UPDATE_TRANSACTION_STATUS;
          const isPayout = activity.action === TRANSACTION_ACTIVITY_ACTIONS.FORCE_TRIGGER_PAYOUT || activity.action === TRANSACTION_ACTIVITY_ACTIONS.ADMIN_RETRY_PENDING_PAYOUT;
          const isRetry = activity.action === TRANSACTION_ACTIVITY_ACTIONS.RETRY_DEPOSIT_CONFIRMATION;
          const Icon = isStatusUpdate ? Edit2 : isPayout ? Play : isRetry ? RefreshCw : Eye;
          const isMessageExpanded = !!expandedMessages[activity.id];
          const hasLongMessage = activity.message.length > 110;
          const message = hasLongMessage && !isMessageExpanded ? `${activity.message.slice(0, 110)}...` : activity.message;
          const actionLabel = activity.action.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());

          return (
            <article key={activity.id} className="rounded-lg border border-slate-200 border-l-4 border-l-blue-500 bg-white p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-medium text-slate-800">
                  <Icon size={15} className="text-blue-600" />
                  {actionLabel}
                </h3>
                <time className="text-xs text-slate-400">{momentClient.formatToNormalisedDateAndTime(activity.createdAt)}</time>
              </div>
              <p className="mt-2 break-words text-sm leading-relaxed text-slate-600">{message}</p>
              {hasLongMessage && (
                <button
                  type="button"
                  onClick={() => setExpandedMessages((previous) => ({ ...previous, [activity.id]: !previous[activity.id] }))}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  {isMessageExpanded ? <>Show less <ChevronUp size={13} /></> : <>Show more <ChevronDown size={13} /></>}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {visibleActivities.length > 3 && (
        <button type="button" onClick={() => setIsExpanded((previous) => !previous)} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          {isExpanded ? <>Show fewer activities <ChevronUp size={15} /></> : <>View all {visibleActivities.length} activities <ChevronDown size={15} /></>}
        </button>
      )}
    </section>
  );
};

export default TransactionActivityLog;

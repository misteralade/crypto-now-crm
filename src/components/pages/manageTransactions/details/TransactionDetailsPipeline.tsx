import {Fragment} from "react";
import momentClient from "../../../../util/moment.ts";
import { GitCommit, Clock, CheckCircle } from "lucide-react";

interface TransactionDetailsPipelineProps {
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date | undefined;
  processedByFirstName?: string;
  processedByLastName?: string;
}

const TransactionDetailsPipeline = ({
  createdAt,
  updatedAt,
  processedAt,
  processedByFirstName,
  processedByLastName,
}: TransactionDetailsPipelineProps) => {
  return (
    <Fragment>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Timeline & Processing</h2>
            <p className="text-2xs text-slate-500">Lifecycle execution timestamps and operators</p>
          </div>
        </div>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          <div className="relative">
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Order Initiated</p>
              <p className="text-2xs text-slate-500 mt-0.5">
                {momentClient.formatToNormalisedDateAndTime(createdAt)}
              </p>
            </div>
          </div>

          {processedAt && (
            <div className="relative">
              <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white">
                <CheckCircle className="w-2.5 h-2.5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">Settlement Processed</p>
                <p className="text-2xs text-slate-500 mt-0.5">
                  {momentClient.formatToNormalisedDateAndTime(processedAt)}
                </p>
                {(processedByFirstName || processedByLastName) && (
                  <p className="text-2xs text-blue-600 font-medium mt-0.5">
                    Operator: {processedByFirstName} {processedByLastName}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="relative">
            <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-slate-400 text-white flex items-center justify-center ring-4 ring-white">
              <GitCommit className="w-2.5 h-2.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Latest Status Update</p>
              <p className="text-2xs text-slate-500 mt-0.5">
                {momentClient.formatToNormalisedDateAndTime(updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}

export default TransactionDetailsPipeline;
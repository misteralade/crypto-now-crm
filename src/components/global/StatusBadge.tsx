import clsx from "clsx";
import { transactionStatusStyles } from "../../util/constants.util.ts";
import {disputePriorityStyles, disputeResolutionStyles, disputeStatusStyles} from "../../util/dispute.constants.util.ts";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const variant = transactionStatusStyles[status.toUpperCase()] ?? {
    text: status,
    bg: "bg-gray-50",
    dot: "bg-gray-400",
    textColor: "text-gray-700",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold",
        variant.bg,
        variant.textColor
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", variant.dot)} />
      {variant.text}
    </span>
  );
};

export const DisputeStatusBadge = ({ status }: StatusBadgeProps) => {
  const variant = disputeStatusStyles[status.toUpperCase()] ?? {
    text: status,
    bg: "bg-gray-50",
    dot: "bg-gray-400",
    textColor: "text-gray-700",
  };
  
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold",
        variant.bg,
        variant.textColor
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", variant.dot)} />
      {variant.text}
    </span>
  );
};

export const DisputeResolutionBadge = ({ resolution }: { resolution: string }) => {
  const variant = disputeResolutionStyles[resolution.toUpperCase()] ?? {
    text: resolution,
    bg: "bg-gray-50",
    dot: "bg-gray-400",
    textColor: "text-gray-700",
  };
  
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold",
        variant.bg,
        variant.textColor
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", variant.dot)} />
      {variant.text}
    </span>
  );
};

export const DisputePriorityBadge = ({ priority }: { priority: string }) => {
  const variant = disputePriorityStyles[priority.toUpperCase()] ?? {
    text: priority,
    bg: "bg-gray-50",
    dot: "bg-gray-400",
    textColor: "text-gray-700",
  };
  
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-2xs font-semibold",
        variant.bg,
        variant.textColor
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", variant.dot)} />
      {variant.text}
    </span>
  );
};

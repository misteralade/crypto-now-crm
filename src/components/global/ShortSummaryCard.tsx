import { type ReactNode } from "react";

type ColorTheme = "blue" | "emerald" | "amber" | "purple";

interface ShortSummaryCardProps {
  title: string;
  value: string;
  time?: string;
  icon?: ReactNode;
  trend?: { value: number; up: boolean };
  theme?: ColorTheme;
}

const themeStyles: Record<ColorTheme, { iconBg: string; text: string; stroke: string }> = {
  blue: {
    iconBg: "bg-blue-50 text-blue-600",
    text: "text-blue-600",
    stroke: "#3B82F6",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600",
    text: "text-emerald-600",
    stroke: "#10B981",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600",
    text: "text-amber-600",
    stroke: "#F59E0B",
  },
  purple: {
    iconBg: "bg-purple-50 text-purple-600",
    text: "text-purple-600",
    stroke: "#8B5CF6",
  },
};

const ShortSummaryCard = ({
  title,
  value,
  time = "vs last period",
  icon,
  trend,
  theme = "blue",
}: ShortSummaryCardProps) => {
  const currentTheme = themeStyles[theme] || themeStyles.blue;
  const isUp = trend?.up ?? true;

  return (
    <div className="bg-white rounded-xl p-4 sm:p-4.5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow duration-150 flex flex-col justify-between">
      {/* Top row: Icon + Label & Big Value */}
      <div className="flex items-start gap-3.5 mb-3">
        {icon && (
          <div className={`w-11 h-11 rounded-lg ${currentTheme.iconBg} flex items-center justify-center shrink-0 shadow-2xs`}>
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-slate-500 tracking-tight truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5 tabular-nums">
            {value}
          </p>
        </div>
      </div>

      {/* Bottom row: Trend badge + Sparkline */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {trend ? (
            <span className={`inline-flex items-center gap-0.5 ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span>{isUp ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-400 font-normal ml-0.5">{time}</span>
            </span>
          ) : (
            <span className="text-slate-400 font-normal">{time}</span>
          )}
        </div>

        {/* Micro Sparkline Curve */}
        <div className="w-16 h-5 shrink-0 opacity-80">
          <svg viewBox="0 0 64 20" className="w-full h-full overflow-visible" fill="none">
            <path
              d={isUp 
                ? "M2 17 C 12 16, 20 12, 30 14 C 40 16, 48 6, 62 3" 
                : "M2 4 C 14 6, 22 14, 32 11 C 42 8, 50 16, 62 18"
              }
              stroke={currentTheme.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ShortSummaryCard;

import { CopyButton } from "../../../global/CopyDetails.tsx";

interface IdentifierCardProps {
  label: string;
  value: string;
  formatted?: boolean;
}

const IdentifierCard = ({ label, value, formatted = false }: IdentifierCardProps) => (
  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
    <div className="mb-1 flex items-center gap-1">
      <p className="text-2xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
      <CopyButton text={value} iconClassName="w-3.5 h-3.5" ariaLabel={`Copy ${label.toLowerCase()}`} />
    </div>
    {formatted ? (
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-700">{value}</pre>
    ) : (
      <p className="break-all font-mono text-xs leading-relaxed text-slate-700">{value}</p>
    )}
  </div>
);

export default IdentifierCard;

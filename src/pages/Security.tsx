import AuthenticatedLayout from "../layout/AuthenticatedLayout";
import PageHeader from "../components/global/pageHeader";
import { ShieldCheck, Mail, Smartphone, Key } from "lucide-react";
import { useOwnAdminProfileQuery } from "../queries/auth.query";

const SecurityPage = () => {
  const { data: profile } = useOwnAdminProfileQuery();
  return (
  <AuthenticatedLayout>
    <PageHeader title="Security & Authentication" />

    <div className="px-4 sm:px-6 pb-8 max-w-3xl space-y-4">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Two-Factor Authentication</h3>
              {profile && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {profile.twoFactorEnabled ? "Active" : "Off"}
              </span>}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {profile && (profile.twoFactorEnabled
                ? "A verification code is sent to your email when you sign in."
                : "A verification code is not required when you sign in.")}
            </p>
          </div>
        </div>

        {profile?.twoFactorEnabled && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <Mail className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wide">Method</p>
              <p className="text-xs font-semibold text-slate-900 truncate">Email Verification Code</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <Key className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="min-w-0">
              <p className="text-2xs font-semibold text-slate-500 uppercase tracking-wide">Code Lifespan</p>
              <p className="text-xs font-semibold text-slate-900">10 Minutes Expiration</p>
            </div>
          </div>
        </div>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Session Security</h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Manage your active sessions and device tokens. Sign out of other sessions when using shared devices.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Session activity is logged in the audit trails for compliance.
          </span>
          <button
            type="button"
            className="h-10 sm:h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors shrink-0"
          >
            Review Active Sessions
          </button>
        </div>
      </div>
    </div>
  </AuthenticatedLayout>
  );
};

export default SecurityPage;

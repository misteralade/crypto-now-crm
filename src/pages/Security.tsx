import AuthenticatedLayout from "../layout/AuthenticatedLayout";

const SecurityPage = () => (
  <AuthenticatedLayout>
    <div className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold mb-6">Security</h2>
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-6">
        <h3 className="text-[15px] font-semibold text-[#0E0F0C]">Two-factor authentication</h3>
        <p className="text-[13px] text-[#9A9A9A] mt-1">A verification code is required every time you sign in. We send it to your email address.</p>
      </div>
    </div>
  </AuthenticatedLayout>
);
export default SecurityPage;

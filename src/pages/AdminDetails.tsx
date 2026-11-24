import { Fragment, useState } from 'react'
import { ArrowLeft, BadgeCheck, CalendarClock, Mail, ShieldUser, User } from 'lucide-react'
import AuthenticatedLayout from '../layout/AuthenticatedLayout'
import PageHeader from '../components/global/pageHeader'
import { LoadingSpinner } from '../components/global/LoadingSpinner'
import { useAdminDetailsPage } from '../hooks/pages/useAdminDetailsPage'
import momentClient from '../util/moment'
import ConfirmModal from '../components/global/ConfirmModal'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { PERMISSIONS } from '../util/permissions.util'
import moment from 'moment'
import { useEnableTwoFactorAuthenticationMutation, useOwnAdminProfileQuery } from '../queries/auth.query'

const DetailItem = ({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) => (
  <div className="rounded-2xl border border-[#ECECEC] bg-[#FAFAFF] p-4">
    <p className="text-xs font-semibold uppercase tracking-wide text-[#9A9A9A]">{label}</p>
    <p className="mt-2 break-words text-sm font-medium tabular-nums text-[#101828]">
      {value ?? 'N/A'}
    </p>
  </div>
)

const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
      active ? 'bg-[#ECFDF3] text-[#037847]' : 'bg-[#F2F4F7] text-[#364254]'
    }`}
  >
    <span className={`h-2 w-2 rounded-full ${active ? 'bg-[#14BA6D]' : 'bg-[#6C778B]'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
)

const AdminDetails = () => {
  const {
    adminDetails,
    loadingAdminDetails,
    isCurrentAdmin,
    goBack,
    loadError,
    retry,
    updateStatus,
    deleteAdmin,
  } = useAdminDetailsPage()
  const { hasPermission } = useAdminAuth()
  const { data: ownProfile, isLoading: loadingProfile, isError: profileError, refetch: refreshProfile } = useOwnAdminProfileQuery()
  const enableTwoFactor = useEnableTwoFactorAuthenticationMutation()
  const [showDelete, setShowDelete] = useState(false)

  const fullName = adminDetails
    ? `${adminDetails.firstName} ${adminDetails.lastName}`.trim()
    : 'Admin Details'

  return (
    <AuthenticatedLayout>
      <PageHeader 
        title="Admin Details" 
        subtitle={adminDetails ? `${fullName} - @${adminDetails.username}` : 'Review profile, role, and activity metadata'} 
      />
      <div className="px-4 sm:px-6 pb-6 mx-auto">
        {loadingAdminDetails ? (
          <LoadingSpinner size="lg" fullScreen message="Loading admin details..." />
        ) : adminDetails ? (
          <Fragment>
            {loadError && (
              <div role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Could not refresh these details. <button type="button" className="font-semibold underline" onClick={() => void retry()}>Try again</button>
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
              <section className="rounded-3xl border border-[#ECECEC] bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#F5F5FF] text-[#03034D]">
                      <User className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-sm font-medium uppercase tracking-wide text-[#9A9A9A]">Admin Profile</p>
                      <h3 className="mt-1 text-2xl font-semibold text-[#101828]">{fullName}</h3>
                      <p className="mt-1 text-sm text-[#667085]">@{adminDetails.username}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {isCurrentAdmin && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                        <BadgeCheck className="h-4 w-4" />
                        You
                      </span>
                    )}
                    <StatusPill active={adminDetails.active} />
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DetailItem label="Admin ID" value={adminDetails.id} />
                  <DetailItem label="Username" value={adminDetails.username} />
                  <DetailItem label="First Name" value={adminDetails.firstName} />
                  <DetailItem label="Last Name" value={adminDetails.lastName} />
                  <DetailItem label="Email" value={adminDetails.email} />
                  <DetailItem label="Created At" value={momentClient.formatToNormalisedDateAndTime(adminDetails.createdAt)} />
                  <DetailItem label="Role Count" value={adminDetails.adminRoles.length} />
                </div>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-[#ECECEC] pt-5">
                  {hasPermission(PERMISSIONS.ADMIN.WRITE) && (
                    <button type="button" disabled={isCurrentAdmin || updateStatus.isPending || deleteAdmin.isPending}
                      onClick={() => updateStatus.mutate(!adminDetails.active)}
                      title={isCurrentAdmin ? 'You cannot change your own status' : undefined}
                      className="rounded-xl border border-[#F3CACA] px-4 py-2 text-sm font-medium text-[#C93636] disabled:cursor-not-allowed disabled:opacity-50">
                      {updateStatus.isPending ? 'Saving...' : adminDetails.active ? 'Suspend' : 'Unsuspend'}
                    </button>
                  )}
                  {hasPermission(PERMISSIONS.ADMIN.DELETE) && (
                    <button type="button" disabled={isCurrentAdmin || updateStatus.isPending || deleteAdmin.isPending}
                      onClick={() => setShowDelete(true)} title={isCurrentAdmin ? 'You cannot delete yourself' : undefined}
                      className="rounded-xl bg-[#EF4444] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">
                      Delete
                    </button>
                  )}
                </div>
              </section>

              <aside className="space-y-6">
                {isCurrentAdmin && (
                  <section className="rounded-3xl border border-[#ECECEC] bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-[#F5F5FF] text-[#03034D]">
                        <ShieldUser className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-[#101828]">Two-factor authentication</h4>
                        <p className="text-sm text-[#667085]">Receive a code by email when you sign in.</p>
                      </div>
                    </div>
                    <div className="mt-5">
                      {loadingProfile ? (
                        <p className="text-sm text-[#667085]">Loading security settings...</p>
                      ) : profileError || !ownProfile ? (
                        <p className="text-sm text-red-600">Could not load security settings. <button type="button" onClick={() => void refreshProfile()} className="font-semibold underline">Try again</button></p>
                      ) : ownProfile.twoFactorEnabled ? (
                        <p className="text-sm font-semibold text-emerald-700">Enabled</p>
                      ) : (
                        <button type="button" disabled={enableTwoFactor.isPending} onClick={() => enableTwoFactor.mutate()} className="rounded-xl bg-[#03034D] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">
                          {enableTwoFactor.isPending ? 'Enabling...' : 'Enable two-factor authentication'}
                        </button>
                      )}
                    </div>
                  </section>
                )}
                <section className="rounded-3xl border border-[#ECECEC] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[#F5F5FF] text-[#03034D]">
                      <ShieldUser className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#101828]">Roles</h4>
                      <p className="text-sm text-[#667085]">Assigned roles</p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {adminDetails.adminRoles.length > 0 ? (
                      adminDetails.adminRoles.map((role) => (
                        <span
                          key={role.id}
                          className="inline-flex items-center rounded-full bg-[#F5F5FF] px-3 py-1 text-sm font-medium text-[#03034D]"
                        >
                          {role.role.name}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[#667085]">No roles assigned.</p>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-[#ECECEC] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[#F5F5FF] text-[#03034D]">
                      <CalendarClock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#101828]">Activity</h4>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <DetailItem label="Created" value={momentClient.formatToNormalisedDateAndTime(adminDetails.createdAt)} />
                    <DetailItem
                      label="Last Active"
                      value={adminDetails.lastActive && moment(adminDetails.lastActive).isValid()
                        ? momentClient.formatToNormalisedDateAndTime(adminDetails.lastActive)
                        : 'Never'}
                    />
                  </div>
                </section>

                <section className="rounded-3xl border border-[#ECECEC] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-[#F5F5FF] text-[#03034D]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-[#101828]">Contact</h4>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <DetailItem label="Email" value={adminDetails.email} />
                    <DetailItem label="Username" value={`@${adminDetails.username}`} />
                    <DetailItem label="Admin ID" value={adminDetails.id} />
                  </div>
                </section>
              </aside>
            </div>
          </Fragment>
        ) : loadError ? (
          <div className="rounded-3xl border border-dashed border-[#D7D7E7] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#101828]">Could not load admin details</p>
            <button type="button" onClick={() => void retry()} className="mt-6 rounded-full bg-[#03034D] px-5 py-2.5 text-sm font-medium text-white">Try again</button>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#D7D7E7] bg-white p-10 text-center shadow-sm">
            <p className="text-lg font-semibold text-[#101828]">Admin not found</p>
            <p className="mt-2 text-sm text-[#667085]">The selected admin may have been removed or the link is invalid.</p>
            <button
              type="button"
              onClick={goBack}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#03034D] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Management
            </button>
          </div>
        )}
      </div>
      <ConfirmModal open={showDelete} actionType="delete" onClose={() => setShowDelete(false)}
        onConfirm={() => { if (!deleteAdmin.isPending) deleteAdmin.mutate() }}
        message="Are you sure you want to delete this admin?" confirmText="Delete Admin" />
    </AuthenticatedLayout>
  )
}

export default AdminDetails

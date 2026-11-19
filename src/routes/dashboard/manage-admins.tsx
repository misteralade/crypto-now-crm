import { createFileRoute, Outlet, useChildMatches } from '@tanstack/react-router'
import ManageAdmins from '../../pages/ManageAdmins.tsx'

function ManageAdminsRouteComponent() {
  const childMatches = useChildMatches()
  if (childMatches && childMatches.length > 0) {
    return <Outlet />
  }
  return <ManageAdmins />
}

export const Route = createFileRoute('/dashboard/manage-admins')({
  component: ManageAdminsRouteComponent,
})

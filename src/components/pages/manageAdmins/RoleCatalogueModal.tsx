import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, X } from 'lucide-react'
import { adminServiceApi } from '../../../api/admin.api'
import { QUERY_KEYS } from '../../../queries/querries.keys'

export default function RoleCatalogueModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: roles, isLoading, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN.ROLE_CATALOGUE],
    enabled: open,
    queryFn: async () => {
      const result = await adminServiceApi.getRoleCatalogue()
      if (!result.success) throw new Error(result.message)
      return result.data
    },
  })

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="role-catalogue-title"
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 id="role-catalogue-title" className="text-lg font-semibold text-slate-900">Admin roles</h2>
            <p className="mt-1 text-sm text-slate-500">See what each role can access.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
        </div>
        <div className="space-y-3 overflow-y-auto p-5 sm:p-6">
          {isLoading && <p className="text-sm text-slate-500">Loading roles...</p>}
          {isError && <p role="alert" className="text-sm text-red-700">Could not load roles. <button type="button" onClick={() => void refetch()} className="font-semibold underline">Try again</button></p>}
          {roles?.length === 0 && <p className="text-sm text-slate-500">No roles available.</p>}
          {roles?.map((role) => (
            <details key={role.id} className="group rounded-xl border border-slate-200 bg-white">
              <summary className="flex cursor-pointer list-none items-start gap-3 p-4">
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{role.name}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{role.isBuiltIn ? 'Built-in' : 'Custom'}</span>
                  </span>
                  {role.description && <span className="mt-1 block text-sm text-slate-600">{role.description}</span>}
                  <span className="mt-2 block text-xs text-slate-500">{role.permissions.length} permissions</span>
                </span>
                <ChevronDown size={18} className="mt-1 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-slate-100 px-4 py-3">
                {role.permissions.length === 0 ? <p className="text-sm text-slate-500">No permissions assigned.</p> : (
                  <ul className="divide-y divide-slate-100">
                    {role.permissions.map((permission) => (
                      <li key={permission.id} className="py-2 first:pt-0 last:pb-0">
                        <p className="break-words text-xs font-semibold text-slate-800">{permission.code.replace(/_/g, ' ')}</p>
                        {permission.description && <p className="mt-0.5 text-xs text-slate-500">{permission.description}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}

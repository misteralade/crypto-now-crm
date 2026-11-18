import { useMemo } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { adminServiceApi } from '../../api/admin.api'
import { ROUTES } from '../../util/constants.util'
import { QUERY_KEYS } from '../../queries/querries.keys'
import { getLoggedInAdminId } from '../../util/auth.util'
import type { AdminSearchAdminsResponse } from '../../types/response.payload.types'

export const useAdminDetailsPage = () => {
  const navigate = useNavigate()
  const { adminId } = useParams({ from: '/dashboard/manage-admins/$adminId' })
  const currentAdminId = useMemo(() => getLoggedInAdminId(), [])
  const queryClient = useQueryClient()

  const { data: adminDetails, isLoading: loadingAdminDetails, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN.GET_ADMIN_DETAILS, adminId],
    queryFn: async () => {
      const { data, success, message } = await adminServiceApi.searchAdmin({
        id: adminId,
        includeRole: true,
        page: 1,
        size: 1,
      })

      if (!success) throw new Error(message)
      return data.admins.find((admin) => admin.id === adminId) ?? null
    },
    enabled: !!adminId,
    initialData: () => queryClient
      .getQueriesData<AdminSearchAdminsResponse>({ queryKey: [QUERY_KEYS.ADMIN.SEARCH_ADMINS] })
      .flatMap(([, data]) => data ? data.admins : [])
      .find((admin) => admin.id === adminId),
    initialDataUpdatedAt: 0,
  })

  const updateStatus = useMutation({
    mutationFn: (active: boolean) => adminServiceApi.updateAdminActiveStatus(adminId, active),
    onSuccess: async ({ success, message }) => {
      if (!success) { toast.error(message); return }
      toast.success(message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN.GET_ADMIN_DETAILS, adminId] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN.SEARCH_ADMINS] }),
      ])
    },
    onError: (error) => toast.error(error.message),
  })

  const deleteAdmin = useMutation({
    mutationFn: () => adminServiceApi.adminSoftDeleteAdmin(adminId),
    onSuccess: async ({ success, message }) => {
      if (!success) { toast.error(message); return }
      toast.success(message)
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN.SEARCH_ADMINS] })
      queryClient.removeQueries({ queryKey: [QUERY_KEYS.ADMIN.GET_ADMIN_DETAILS, adminId] })
      navigate({ to: ROUTES.MANAGE_ADMINS })
    },
    onError: (error) => toast.error(error.message),
  })

  const goBack = () => {
    if (window.history.length > 1) {
      window.history.back()
      return
    }

    navigate({ to: ROUTES.MANAGE_ADMINS })
  }

  return {
    adminId,
    currentAdminId,
    adminDetails,
    loadingAdminDetails,
    loadError: isError,
    retry: refetch,
    updateStatus,
    deleteAdmin,
    isCurrentAdmin: adminDetails?.id === currentAdminId,
    goBack,
  }
}

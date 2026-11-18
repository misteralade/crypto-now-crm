import { useOwnAdminProfileQuery } from "../queries/auth.query";
import { PERMISSIONS } from "../util/permissions.util";
import { LOCAL_STORAGE_KEYS } from "../util/constants.util";

export function useAdminAuth() {
  const { data: profile, isLoading } = useOwnAdminProfileQuery();

  const isSuperAdmin = (() => {
    if (profile?.role?.toLowerCase()?.includes("super")) return true;
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) return false;
      const base64 = token.split(".")[1];
      if (!base64) return false;
      const payload = JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
      return (
        payload?.role?.toLowerCase()?.includes("super") ||
        payload?.type === "ADMIN"
      );
    } catch {
      return false;
    }
  })();

  const permissions = profile?.permissions || [];
  const hasPermission = (permission: string) => isSuperAdmin || permissions.includes(permission);
  const hasAnyPermission = (required?: string[]) =>
    isSuperAdmin || !required || required.length === 0 || required.some((permission) => permissions.includes(permission));

  return {
    adminEmail: profile?.email || "",
    role: profile?.role || (isSuperAdmin ? "Super Admin" : ""),
    permissions,
    hasPermission,
    hasAnyPermission,
    canManageAdmins: hasPermission(PERMISSIONS.ADMIN.VIEW),
    loading: isLoading,
  };
}

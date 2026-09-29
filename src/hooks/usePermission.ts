import { useAuth } from "../app/providers/AuthProvider";

export function usePermission(permission: string): boolean {
  const auth = useAuth();

  return Array.isArray(auth.permissions)
    ? auth.permissions.includes(permission)
    : false;
}
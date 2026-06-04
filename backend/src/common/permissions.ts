// Definición canónica de permisos del sistema, con forma { módulo: acción[] }.
// Fuente única de verdad: la usan auth (para SUPERADMIN), el seed y los guards.
// NO importar nada de NestJS aquí: este archivo también lo consume prisma/seed.ts
// (ts-node, fuera del contexto de Nest). El espejo del cliente vive en
// mobile/src/store/authStore.ts (paquete separado, mantener en sync manualmente).

export const ALL_PERMISSIONS = {
  eventos: ['ver', 'crear', 'editar', 'eliminar'],
  entrevistas: ['ver', 'crear', 'editar', 'eliminar'],
  francos: ['ver', 'crear', 'editar', 'eliminar'],
  clientes: ['ver', 'crear', 'editar', 'eliminar'],
  inventario: ['ver', 'crear', 'editar', 'eliminar'],
  ingresos: ['ver'],
  demostraciones: ['ver'],
  usuarios: ['ver', 'crear', 'editar', 'eliminar'],
} as const;

export type PermissionsMap = Record<string, string[]>;

interface PermissionUser {
  role?: string;
  permissions?: PermissionsMap;
}

/**
 * Resuelve si un usuario puede ejecutar `action` sobre `module`.
 * Los SUPERADMIN siempre tienen acceso total.
 */
export function userHasPermission(
  user: PermissionUser | undefined | null,
  module: string,
  action: string,
): boolean {
  if (!user) return false;
  if (user.role === 'SUPERADMIN') return true;
  const perms = user.permissions?.[module];
  return Array.isArray(perms) && perms.includes(action);
}

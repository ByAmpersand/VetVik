import type { Role as ApiRole } from '../../api/types';

export type AppRole = 'client' | 'doctor' | 'admin' | 'superadmin';

export interface AppUser {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
  isProtected?: boolean;
}

const SUPER_ADMIN_ID = '00000000-0000-0000-0000-000000000001';

export function apiRoleToAppRole(role: ApiRole): AppRole {
  switch (role) {
    case 'Owner':
      return 'client';
    case 'Doctor':
      return 'doctor';
    case 'Admin':
      return 'admin';
    case 'SuperAdmin':
      return 'superadmin';
    default:
      return 'client';
  }
}

export function appRoleToApiRole(role: AppRole): ApiRole {
  switch (role) {
    case 'client':
      return 'Owner';
    case 'doctor':
      return 'Doctor';
    case 'admin':
      return 'Admin';
    case 'superadmin':
      return 'SuperAdmin';
  }
}

export function roleHomePath(role: AppRole): string {
  switch (role) {
    case 'client':
      return '/client';
    case 'doctor':
      return '/doctor';
    case 'admin':
    case 'superadmin':
      return '/admin';
  }
}

export function canAccessPath(role: AppRole, pathname: string): boolean {
  if (pathname.startsWith('/client') || pathname.startsWith('/owner')) {
    return role === 'client';
  }
  if (pathname.startsWith('/doctor')) {
    return role === 'doctor';
  }
  if (pathname.startsWith('/admin')) {
    return role === 'admin' || role === 'superadmin';
  }
  return true;
}

export function canManageDoctors(role: AppRole): boolean {
  return role === 'admin' || role === 'superadmin';
}

export function canManageAdmins(role: AppRole): boolean {
  return role === 'superadmin';
}

export function roleLabel(role: AppRole): string {
  switch (role) {
    case 'client':
      return 'Client';
    case 'doctor':
      return 'Doctor';
    case 'admin':
      return 'Admin';
    case 'superadmin':
      return 'Super Admin';
  }
}

export function isSuperAdmin(user: AppUser): boolean {
  return user.role === 'superadmin' || user.userId === SUPER_ADMIN_ID;
}

export function canDeleteUser(actor: AppUser, target: AppUser): boolean {
  if (target.isProtected || isSuperAdmin(target)) {
    return false;
  }
  if (target.role === 'admin') {
    return canManageAdmins(actor);
  }
  if (target.role === 'doctor') {
    return canManageDoctors(actor);
  }
  return false;
}

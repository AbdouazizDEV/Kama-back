export enum UserRole {
  LOCATAIRE = 'LOCATAIRE',
  PROPRIETAIRE = 'PROPRIETAIRE',
  ETUDIANT = 'ETUDIANT',
  ADMIN = 'ADMIN',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.LOCATAIRE]: 1,
  [UserRole.ETUDIANT]: 1,
  [UserRole.PROPRIETAIRE]: 2,
  [UserRole.ADMIN]: 3,
};

export function hasPermission(
  userRole: UserRole,
  requiredRole: UserRole
): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

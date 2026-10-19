export function homeFor(role) {
  return role === 'Resident' ? '/resident' : '/staff';
}
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    project_manager: 'Project Manager',
    team_member: 'Team Member',
    finance: 'Finance',
    admin: 'Admin',
  };
  return roleMap[role] || role;
}

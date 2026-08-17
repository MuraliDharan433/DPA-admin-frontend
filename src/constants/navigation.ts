import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  GraduationCap,
  UserPlus,
  Inbox,
  BookOpen,
  CalendarRange,
  Briefcase,
  Users,
  FileBarChart,
  ShieldCheck,
  Settings,
  Building2,
  FileText,
  CalendarClock,
  ClipboardList,
} from 'lucide-react';
import type { PermissionKey } from './permissions';
import { PERMISSIONS } from './permissions';

export interface NavItem {
  label: string;
  to?: string;
  icon?: LucideIcon;
  permission?: PermissionKey;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Students',
    icon: GraduationCap,
    permission: PERMISSIONS.STUDENTS_VIEW,
    children: [
      { label: 'All Students', to: '/students', icon: GraduationCap },
      { label: 'Add Student', to: '/students/new', icon: UserPlus, permission: PERMISSIONS.STUDENTS_CREATE },
      { label: 'Mock Sessions', to: '/mock-sessions', icon: ClipboardList, permission: PERMISSIONS.MOCK_VIEW },
    ],
  },
  {
    label: 'Enquiries',
    icon: Inbox,
    permission: PERMISSIONS.ENQUIRIES_VIEW,
    children: [
      { label: 'All Enquiries', to: '/enquiries' },
      { label: 'New', to: '/enquiries?status=NEW' },
      { label: 'Follow-ups', to: '/enquiries/follow-ups', icon: CalendarClock },
      { label: 'Converted', to: '/enquiries?status=CONVERTED' },
    ],
  },
  { label: 'Courses', to: '/courses', icon: BookOpen, permission: PERMISSIONS.COURSES_VIEW },
  { label: 'Batches', to: '/batches', icon: CalendarRange, permission: PERMISSIONS.BATCHES_VIEW },
  {
    label: 'Placements',
    icon: Briefcase,
    permission: PERMISSIONS.PLACEMENTS_VIEW,
    children: [
      { label: 'Students', to: '/placements' },
      { label: 'Companies', to: '/companies', icon: Building2 },
      { label: 'Applications', to: '/applications', icon: FileText },
      { label: 'Interviews', to: '/interviews', icon: CalendarClock },
    ],
  },
  { label: 'Users', to: '/users', icon: Users, permission: PERMISSIONS.USERS_VIEW },
  { label: 'Reports', to: '/reports', icon: FileBarChart, permission: PERMISSIONS.REPORTS_VIEW },
  { label: 'Audit Logs', to: '/audit-logs', icon: ShieldCheck, permission: PERMISSIONS.AUDIT_LOGS_VIEW },
  { label: 'Settings', to: '/settings', icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
];

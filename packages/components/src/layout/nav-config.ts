import {
  FiBriefcase,
  FiUsers,
  FiCreditCard,
  type IconType,
} from '../icons';

export type NavItem = {
  label: string;
  href: string;
  icon: IconType;
  /** Hardcoded badge (e.g. open count) shown next to the label. */
  badge?: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'Jobs', href: '/jobs', icon: FiBriefcase, badge: '12' },
  { label: 'Reporters', href: '/reporters', icon: FiUsers },
  { label: 'Payments', href: '/payments', icon: FiCreditCard, badge: '3' },
];

import { LucideIcon } from 'lucide-react';

export type TabKey = 'work-orders' | 'parts' | 'faq' | 'clients';

export interface NavItem {
  key: TabKey;
  label: string;
  icon: LucideIcon;
}

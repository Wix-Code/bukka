import type { ComponentType } from "react";
import {
  Home2,
  Book1,
  Bag2,
  Notification,
  Card,
  Setting2,
} from "iconsax-react";

export type IconComponent = ComponentType<{
  size?: string | number;
  color?: string;
  variant?: "Linear" | "Bold" | "Broken" | "Bulk" | "Outline" | "TwoTone";
}>;

export type NavItem = {
  label: string;
  href: string;
  icon: IconComponent;
};

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: Home2 },
  { label: "Menu", href: "/dashboard/menu", icon: Book1 },
  { label: "Orders", href: "/dashboard/orders", icon: Bag2 },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    icon: Notification,
  },
  { label: "Billing", href: "/dashboard/billing", icon: Card },
  { label: "Settings", href: "/dashboard/settings", icon: Setting2 },
];

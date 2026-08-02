import {
  Building2,
  LayoutDashboard,
  MapPin,
  Store,
  Users,
  ContactRound,
  Wrench,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { ModuleCode } from "@/lib/permissions";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  moduleCode?: ModuleCode;
};

export const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Cities",
    href: "/cities",
    icon: MapPin,
    moduleCode: "cities",
  },
  {
    title: "Stores",
    href: "/stores",
    icon: Store,
    moduleCode: "stores",
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
    moduleCode: "users",
  },
  {
    title: "Customers",
    href: "/customers",
    icon: ContactRound,
    moduleCode: "customers",
  },
  {
    title: "Service Types",
    href: "/service-types",
    icon: Wrench,
    moduleCode: "service-types",
  },
  {
    title: "Services",
    href: "/services",
    icon: ClipboardList,
    moduleCode: "services",
  },
];

export const applicationInfo = {
  name: "Store Admin",
  shortName: "SA",
  icon: Building2,
};

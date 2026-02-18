"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  BarChart3,
  Settings,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  {
    label: "Reports",
    icon: BarChart3,
    children: [
      { href: "/reports/income-spending", label: "Income & Spending", icon: PieChart },
      { href: "/reports/net-worth", label: "Net Worth", icon: TrendingUp },
    ],
  },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 bg-white border-r border-surface-tertiary h-screen sticky top-0">
      <div className="p-5 pb-3">
        <Link href="/" className="text-xl font-bold text-brand-500">
          Meerly
        </Link>
        <p className="text-xs text-muted mt-0.5">Finance Tracker</p>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1">
        {navItems.map((item) =>
          "children" in item ? (
            <div key={item.label} className="pt-3">
              <p className="px-3 pb-1 text-xs font-semibold text-muted uppercase tracking-wider">
                {item.label}
              </p>
              {item.children!.map((child) => (
                <NavItem
                  key={child.href}
                  href={child.href}
                  label={child.label}
                  icon={child.icon}
                  active={pathname === child.href}
                />
              ))}
            </div>
          ) : (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          )
        )}
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
        active
          ? "bg-brand-50 text-brand-700"
          : "text-muted-foreground hover:bg-surface-secondary hover:text-gray-900"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

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
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/reports", label: "Reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-base-200 w-52 min-h-screen flex flex-col border-r border-base-300">
      {/* Logo */}
      <div className="px-4 pt-4 pb-3">
        <Link href="/" className="text-xl font-bold text-primary tracking-tight">
          Meerly
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-3 border-t border-base-300" />

      {/* Nav */}
      <ul className="menu menu-sm flex-1 px-2 pt-2">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={active ? "active font-medium" : ""}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="mx-3 border-t border-base-300" />
      <ul className="menu menu-sm px-2 py-2">
        <li>
          <Link
            href="/settings"
            className={pathname.startsWith("/settings") ? "active font-medium" : ""}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
}

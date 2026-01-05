"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DASHBOARD_MENU, DASHBOARD_MENU_ICONS } from "./AdminShell";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <aside
      className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-gray-600 text-white transform transition-transform duration-300 ease-in-out
      ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
    >
      {/* Logo / Title */}
      <div className="h-16 flex items-center px-6 border-b border-gray-500 font-semibold text-lg">
        Admin Panel
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-1">
        {DASHBOARD_MENU.map((item) => {
          const Icon = DASHBOARD_MENU_ICONS[item.icon];
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${active ? "bg-gray-500" : "hover:bg-gray-500"}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

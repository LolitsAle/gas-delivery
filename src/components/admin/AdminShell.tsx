"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import {
  House,
  DollarSign,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Mail,
  Users,
  Info,
  Gift,
} from "lucide-react";

export const DASHBOARD_MENU_ICONS = {
  House,
  DollarSign,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Mail,
  Users,
  Info,
  Gift,
} as const;

export interface IDashboardMenu {
  name: string;
  icon: keyof typeof DASHBOARD_MENU_ICONS;
  href: string;
}

export const DASHBOARD_MENU: IDashboardMenu[] = [
  { name: "Dashboard", icon: "House", href: "/admin" },

  // ===== VẬN HÀNH =====
  { name: "Đơn Hàng", icon: "ShoppingCart", href: "/admin/orders" },
  // { name: "Shipper", icon: "Users", href: "/admin/shippers" },

  // ===== KHÁCH HÀNG =====
  { name: "Khách Hàng", icon: "Users", href: "/admin/users" },
  // { name: "Bếp Khách Hàng", icon: "Info", href: "/admin/stoves" },

  // ===== HÀNG HÓA =====
  { name: "Sản Phẩm", icon: "ShoppingBag", href: "/admin/products" },
  { name: "Danh Mục", icon: "ShoppingBag", href: "/admin/categories" },

  // ===== ĐIỂM & KHUYẾN MÃI =====
  { name: "Khuyến Mãi", icon: "DollarSign", href: "/admin/promotions" },
  // { name: "Shop Quà Tặng", icon: "Gift", href: "/admin/reward-shop" },

  // ===== HỆ THỐNG =====
  // { name: "Cài Đặt Hệ Thống", icon: "Settings", href: "/admin/settings" },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">{children}</div>
        </main>
      </div>
    </div>
  );
}

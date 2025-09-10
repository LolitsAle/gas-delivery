/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  DollarSign,
  House,
  Info,
  Mail,
  Menu,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";

const ICONS = {
  House,
  DollarSign,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Mail,
  Users,
  Info,
};

interface IDashboardMenu {
  name: string;
  icon: string;
  href: string;
}

const DASHBOARD_MENU: IDashboardMenu[] = [
  {
    name: "Trang Chủ",
    icon: "House",
    href: "/admin",
  },
  {
    name: "Đơn Hàng",
    icon: "DollarSign",
    href: "/admin/orders",
  },
  {
    name: "Kho Gas",
    icon: "Info",
    href: "/admin/ware-house",
  },
  {
    name: "Sản Phẩm",
    icon: "ShoppingBag",
    href: "/admin/products",
  },
  {
    name: "Khách Hàng",
    icon: "Users",
    href: "/admin/users",
  },
];

function Sidebar() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarItems, setSidebarItems] = useState(DASHBOARD_MENU);
  const pathname = usePathname();

  return (
    <div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="h-full bg-[#1e1e1e] backdrop-blur-md p-4 flex flex-col border-r border-[#2f2f2f]">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="ml-1 p-2 rounded-full hover:bg-[#2f2f2f] transition-colors max-w-fit cursor-pointer"
        >
          <Menu size={24} />
        </button>
        <nav className="mt-8 flex-grow ">
          {sidebarItems.map((item) => {
            const IconComponent = ICONS[item.icon as keyof typeof ICONS];
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center p-3.5 text-sm font-medium rounded-lg hover:bg-[#2f2f2f] transition-colors mb-2 ${
                    pathname === item.href ? "bg-[#2f2f2f]" : ""
                  }`}
                >
                  <IconComponent size={20} style={{ minWidth: "20px" }} />
                  {isSidebarOpen && (
                    <span className="ml-4 whitespace-nowrap">{item.name}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;

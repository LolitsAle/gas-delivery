"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import AdminOrderCard from "./AdminOrderCard";
import AdminOrderTable from "./AdminOrderTable";
import EditUserDrawer from "./EditUserDrawer";

type Order = any;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Users
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const handleViewUser = (order: any) => {
    setSelectedOrder(order);
    setOpenDrawer(true);
  };

  const loadOrders = async () => {
    try {
      const res = await apiFetchAuth("/api/admin/orders");
      setOrders(res);
    } catch (err) {
      console.error("Load orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "READY":
        return "bg-indigo-100 text-indigo-700";
      case "DELIVERING":
        return "bg-purple-100 text-purple-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "";
    }
  };

  if (loading) return <div className="p-6">Đang tải đơn hàng...</div>;

  return (
    <div className="p-[2vw] md:p-[4vw]">
      {/* ================= MOBILE ================= */}
      <div className="md:hidden flex flex-col gap-[3vw]">
        {orders.map((order) => (
          <AdminOrderCard
            key={order.id}
            order={order}
            onViewUser={handleViewUser}
          />
        ))}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block">
        <AdminOrderTable orders={orders} getStatusColor={getStatusColor} />
      </div>
      {selectedOrder && (
        <EditUserDrawer
          open={openDrawer}
          selectedOrder={selectedOrder}
          onClose={() => setOpenDrawer(false)}
        />
      )}
    </div>
  );
}

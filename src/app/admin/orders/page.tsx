"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { useCurrentUser } from "@/components/context/CurrentUserContext";
import AdminOrderCard from "./AdminOrderCard";
import AdminOrderTable from "./AdminOrderTable";
import EditUserDrawer from "./EditUserDrawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

type Order = {
  id: string;
  status: OrderStatus;
  shipperId?: string | null;
};

type AssigneeUser = {
  id: string;
  name?: string | null;
  nickname?: string | null;
  phoneNumber: string;
  role: "ADMIN" | "STAFF";
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["READY", "CANCELLED"],
  READY: ["DELIVERING", "CANCELLED"],
  DELIVERING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Users
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  // READY -> DELIVERING popup
  const [shipperDialogOpen, setShipperDialogOpen] = useState(false);
  const [shipperUsers, setShipperUsers] = useState<AssigneeUser[]>([]);
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");
  const [assigningType, setAssigningType] = useState<"ME" | "PICK">("ME");
  const [pendingDeliveryOrderId, setPendingDeliveryOrderId] = useState<string | null>(null);
  const { currentUser } = useCurrentUser();

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

  const loadShipperUsers = async () => {
    try {
      const res = await apiFetchAuth("/api/admin/users?limit=50");
      const users = (res?.users || []).filter(
        (user: any) => user.role === "STAFF" || user.role === "ADMIN",
      );
      setShipperUsers(users);
    } catch (err) {
      console.error("Load shipper users failed", err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadShipperUsers();
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

  const getAvailableTransitions = (status: OrderStatus) => {
    return allowedTransitions[status] || [];
  };

  const updateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
    shipperId?: string,
  ) => {
    setUpdatingId(orderId);
    try {
      await apiFetchAuth(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
          shipperId,
        }),
      });

      await loadOrders();
    } catch (err) {
      console.error("Update order status failed", err);
      alert("Cập nhật trạng thái thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeStatus = async (order: Order, nextStatus: OrderStatus) => {
    if (order.status === "READY" && nextStatus === "DELIVERING") {
      setPendingDeliveryOrderId(order.id);
      setAssigningType("ME");
      setSelectedShipperId("");
      setShipperDialogOpen(true);
      return;
    }

    await updateOrderStatus(order.id, nextStatus);
  };

  const availableShipperOptions = useMemo(() => {
    return shipperUsers.filter((user) => user.id !== currentUser?.id);
  }, [shipperUsers, currentUser?.id]);

  const handleConfirmAssignShipper = async () => {
    if (!pendingDeliveryOrderId) return;

    const shipperId = assigningType === "ME" ? currentUser?.id : selectedShipperId;

    if (!shipperId) {
      alert("Vui lòng chọn shipper");
      return;
    }

    await updateOrderStatus(pendingDeliveryOrderId, "DELIVERING", shipperId);
    setShipperDialogOpen(false);
    setPendingDeliveryOrderId(null);
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
            onChangeStatus={handleChangeStatus}
            getAvailableTransitions={getAvailableTransitions}
            isUpdating={updatingId === order.id}
          />
        ))}
      </div>

      {/* ================= DESKTOP ================= */}
      <div className="hidden md:block">
        <AdminOrderTable
          orders={orders}
          getStatusColor={getStatusColor}
          onChangeStatus={handleChangeStatus}
          getAvailableTransitions={getAvailableTransitions}
          updatingId={updatingId}
        />
      </div>
      {selectedOrder && (
        <EditUserDrawer
          open={openDrawer}
          selectedOrder={selectedOrder}
          onClose={() => setOpenDrawer(false)}
        />
      )}

      <Dialog open={shipperDialogOpen} onOpenChange={setShipperDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn shipper cho đơn giao</DialogTitle>
            <DialogDescription>
              Đơn READY chuyển sang DELIVERING bắt buộc phải gán shipper.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Button
              variant={assigningType === "ME" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setAssigningType("ME")}
            >
              Chọn tôi ({currentUser?.name || currentUser?.phoneNumber || "-"})
            </Button>

            <Button
              variant={assigningType === "PICK" ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => setAssigningType("PICK")}
            >
              Chọn từ danh sách STAFF/ADMIN
            </Button>

            {assigningType === "PICK" && (
              <Select value={selectedShipperId} onValueChange={setSelectedShipperId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn shipper" />
                </SelectTrigger>
                <SelectContent>
                  {availableShipperOptions.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {(user.name || user.nickname || "Không tên") +
                        ` - ${user.phoneNumber} (${user.role})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShipperDialogOpen(false);
                setPendingDeliveryOrderId(null);
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleConfirmAssignShipper}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

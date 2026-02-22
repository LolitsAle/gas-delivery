"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  dismissToast,
  showToastError,
  showToastLoading,
  showToastSuccess,
} from "@/lib/helper/toast";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

type PaginationData = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type DateFilterPreset = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "DATE";

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

const FILTER_STORAGE_KEY = "admin-orders-filter-v1";

const getFilterRange = (preset: DateFilterPreset, dateValue: string) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (preset === "DATE") {
    if (!dateValue) return null;
    const selectedDate = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) return null;
    return {
      from: selectedDate.toISOString(),
      to: new Date(`${dateValue}T23:59:59.999`).toISOString(),
    };
  }

  if (preset === "TODAY") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (preset === "THIS_WEEK") {
    const day = start.getDay();
    const offset = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - offset);
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  end.setMonth(start.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
};

const getPaginationItems = (page: number, totalPages: number) => {
  if (totalPages <= 1) return [1];
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);

  return [...pages]
    .filter((value) => value >= 1 && value <= totalPages)
    .sort((a, b) => a - b);
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [selectedPreset, setSelectedPreset] = useState<DateFilterPreset>("TODAY");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  // Users
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  // READY -> DELIVERING popup
  const [shipperDialogOpen, setShipperDialogOpen] = useState(false);
  const [shipperUsers, setShipperUsers] = useState<AssigneeUser[]>([]);
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");
  const [assigningType, setAssigningType] = useState<"ME" | "PICK">("ME");
  const [pendingDeliveryOrderId, setPendingDeliveryOrderId] = useState<
    string | null
  >(null);
  const { currentUser } = useCurrentUser();

  const handleViewUser = (order: any) => {
    setSelectedOrder(order);
    setOpenDrawer(true);
  };

  const loadOrders = useCallback(async (targetPage: number = pagination.page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(targetPage));
      params.set("limit", String(pagination.limit));
      params.set("includeCompleted", showCompleted ? "true" : "false");

      const range = getFilterRange(selectedPreset, selectedDate);
      if (range) {
        params.set("from", range.from);
        params.set("to", range.to);
      }

      const res = await apiFetchAuth(`/api/admin/orders?${params.toString()}`);
      setOrders(res.orders || []);
      setPagination(
        res.pagination || {
          page: 1,
          limit: pagination.limit,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Load orders failed", err);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, pagination.page, selectedDate, selectedPreset, showCompleted]);

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
    const rawFilter = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (rawFilter) {
      try {
        const parsed = JSON.parse(rawFilter);
        if (parsed?.selectedPreset) setSelectedPreset(parsed.selectedPreset);
        if (typeof parsed?.selectedDate === "string") setSelectedDate(parsed.selectedDate);
        if (typeof parsed?.showCompleted === "boolean") setShowCompleted(parsed.showCompleted);
      } catch (error) {
        console.error("Invalid filter state", error);
      }
    }

    loadShipperUsers();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ selectedPreset, selectedDate, showCompleted }),
    );
    loadOrders(1);
  }, [loadOrders, selectedDate, selectedPreset, showCompleted]);

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
    const loading = showToastLoading("Đang cập nhật thông tin đơn hàng...");
    try {
      await apiFetchAuth(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: {
          status: nextStatus,
          shipperId,
        },
      });

      await loadOrders();
      dismissToast(loading);
      showToastSuccess("Cập nhật đơn hàng thành công!");
    } catch (err) {
      console.error("Update order status failed", err);
      dismissToast(loading);
      showToastError("Cập nhật đơn hàng thất bại");
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

    const shipperId =
      assigningType === "ME" ? currentUser?.id : selectedShipperId;

    if (!shipperId) {
      alert("Vui lòng chọn shipper");
      return;
    }

    await updateOrderStatus(pendingDeliveryOrderId, "DELIVERING", shipperId);
    setShipperDialogOpen(false);
    setPendingDeliveryOrderId(null);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > pagination.totalPages || nextPage === pagination.page) {
      return;
    }
    loadOrders(nextPage);
  };

  const pageItems = getPaginationItems(pagination.page, pagination.totalPages);

  if (loading) return <div className="p-6">Đang tải đơn hàng...</div>;

  return (
    <div className="p-[2vw] md:p-[4vw]">
      <div className="mb-4 rounded-xl border p-3 md:p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={selectedPreset === "TODAY" ? "default" : "outline"}
            onClick={() => setSelectedPreset("TODAY")}
          >
            Hôm nay
          </Button>
          <Button
            size="sm"
            variant={selectedPreset === "THIS_WEEK" ? "default" : "outline"}
            onClick={() => setSelectedPreset("THIS_WEEK")}
          >
            Tuần này
          </Button>
          <Button
            size="sm"
            variant={selectedPreset === "THIS_MONTH" ? "default" : "outline"}
            onClick={() => setSelectedPreset("THIS_MONTH")}
          >
            Tháng này
          </Button>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedPreset("DATE");
            }}
            className="w-[180px]"
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Switch checked={showCompleted} onCheckedChange={setShowCompleted} />
          <span>Hiển thị đơn đã hoàn thành</span>
        </div>
      </div>

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

      <div className="mt-4 space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Tổng {pagination.total} đơn hàng
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(pagination.page - 1);
                }}
                className={pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {pageItems.map((page, index) => {
              const previous = pageItems[index - 1];
              return (
                <div key={`item-${page}`} className="flex items-center">
                  {previous && page - previous > 1 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  <PaginationItem>
                    <PaginationLink
                      href="#"
                      isActive={pagination.page === page}
                      onClick={(e) => {
                        e.preventDefault();
                        goToPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                </div>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goToPage(pagination.page + 1);
                }}
                className={
                  pagination.page >= pagination.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
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
              <Select
                value={selectedShipperId}
                onValueChange={setSelectedShipperId}
              >
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

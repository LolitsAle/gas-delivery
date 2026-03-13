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
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  dismissToast,
  showToastError,
  showToastLoading,
  showToastSuccess,
} from "@/lib/helper/toast";
import { CalendarDays, ChevronDown } from "lucide-react";
import { ORDER_SOCKET_PATH } from "@/lib/socket/orderEvents";
import { playAdminSound } from "@/lib/helper/adminAudioManager";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERING"
  | "UNPAID"
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
  CONFIRMED: ["DELIVERING", "CANCELLED"],
  DELIVERING: ["UNPAID", "COMPLETED"],
  UNPAID: ["COMPLETED", "CANCELLED"],
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
    const offset = day === 0 ? 6 : day - 1; // Monday as week start
    start.setDate(start.getDate() - offset);
    start.setHours(0, 0, 0, 0);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  // THIS_MONTH
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

const presetLabel: Record<DateFilterPreset, string> = {
  TODAY: "Hôm nay",
  THIS_WEEK: "Tuần này",
  THIS_MONTH: "Tháng này",
  DATE: "Ngày cụ thể",
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

  const [selectedPreset, setSelectedPreset] =
    useState<DateFilterPreset>("TODAY");
  const [selectedDate, setSelectedDate] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  // UI: expandable for date
  const [openAdvanced, setOpenAdvanced] = useState(false);

  // Users
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  // CONFIRMED -> DELIVERING popup
  const [shipperDialogOpen, setShipperDialogOpen] = useState(false);
  const [shipperUsers, setShipperUsers] = useState<AssigneeUser[]>([]);
  const [selectedShipperId, setSelectedShipperId] = useState<string>("");
  const [assigningType, setAssigningType] = useState<"ME" | "PICK">("ME");
  const [pendingDeliveryOrderId, setPendingDeliveryOrderId] = useState<
    string | null
  >(null);

  const [hydrated, setHydrated] = useState(false);

  const { currentUser } = useCurrentUser();

  const handleViewUser = (order: any) => {
    setSelectedOrder(order);
    setOpenDrawer(true);
  };

  const loadOrders = useCallback(
    async (targetPage: number = 1) => {
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

        const res = await apiFetchAuth(
          `/api/admin/orders?${params.toString()}`,
        );

        setOrders(res.orders || []);
        setPagination(
          res.pagination || {
            page: targetPage,
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
    },
    [pagination.limit, selectedDate, selectedPreset, showCompleted],
  );

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
    // 1) load shipper users
    loadShipperUsers();

    // 2) hydrate filters from localStorage
    try {
      const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);

        const preset = (parsed?.selectedPreset ?? "TODAY") as DateFilterPreset;
        const date =
          typeof parsed?.selectedDate === "string" ? parsed.selectedDate : "";
        const completed =
          typeof parsed?.showCompleted === "boolean"
            ? parsed.showCompleted
            : false;

        setSelectedPreset(preset);
        setSelectedDate(date);
        setShowCompleted(completed);

        if (preset === "DATE") setOpenAdvanced(true);
      }
    } catch (error) {
      console.error("Invalid filter state", error);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ selectedPreset, selectedDate, showCompleted }),
    );
  }, [hydrated, selectedPreset, selectedDate, showCompleted]);

  useEffect(() => {
    if (!hydrated) return;
    loadOrders(1);
  }, [hydrated, loadOrders, selectedPreset, selectedDate, showCompleted]);

  // ===== WS realtime =====
  useEffect(() => {
    if (!hydrated) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(
      `${protocol}://${window.location.host}${ORDER_SOCKET_PATH}`,
    );

    socket.onmessage = async (event) => {
      try {
        const payload = JSON.parse(event.data) as { type?: string };

        // refresh current page
        loadOrders(pagination.page);

        if (payload?.type === "ORDER_CREATED") {
          const ok = await playAdminSound();

          if (!ok) {
            // audio chưa được bật hoặc bị chặn => nhắc user bấm nút "Bật âm thanh" trên layout admin
            // (nếu bạn có toast info thì dùng info, ở đây dùng success nhẹ cũng được)
            showToastSuccess(
              "Có đơn mới! (Bấm nút 🔕 Bật âm thanh ở thanh admin để nghe thông báo)",
            );
          }
        }
      } catch (error) {
        console.error("Cannot parse realtime payload", error);
      }
    };

    socket.onerror = (e) => {
      console.error("WS error", e);
    };

    return () => {
      socket.close();
    };
  }, [hydrated, loadOrders, pagination.page]);

  const getAvailableTransitions = (status: OrderStatus) => {
    return allowedTransitions[status] || [];
  };

  const updateOrderStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
    shipperId?: string,
  ) => {
    setUpdatingId(orderId);
    const loadingToast = showToastLoading(
      "Đang cập nhật thông tin đơn hàng...",
    );
    try {
      await apiFetchAuth(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: {
          status: nextStatus,
          shipperId,
        },
      });

      await loadOrders();
      dismissToast(loadingToast);
      showToastSuccess("Cập nhật đơn hàng thành công!");
    } catch (err) {
      console.error("Update order status failed", err);
      dismissToast(loadingToast);
      showToastError("Cập nhật đơn hàng thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleChangeStatus = async (order: Order, nextStatus: OrderStatus) => {
    if (order.status === "CONFIRMED" && nextStatus === "DELIVERING") {
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
    if (loading) return;
    if (
      nextPage < 1 ||
      nextPage > pagination.totalPages ||
      nextPage === pagination.page
    ) {
      return;
    }
    loadOrders(nextPage);
  };

  const pageItems = getPaginationItems(pagination.page, pagination.totalPages);

  const onChangePreset = (value: DateFilterPreset) => {
    setSelectedPreset(value);

    if (value !== "DATE") {
      setSelectedDate("");
      setOpenAdvanced(false);
      return;
    }

    setOpenAdvanced(true);
  };

  return (
    <div className="p-[2vw] md:p-[4vw]">
      {/* FILTER */}
      <div className="mb-4 rounded-xl border p-3 md:p-4">
        <Collapsible open={openAdvanced} onOpenChange={setOpenAdvanced}>
          {/* ROW 1 */}
          <div className="flex items-center gap-3">
            <Select value={selectedPreset} onValueChange={onChangePreset}>
              <SelectTrigger className="h-9 w-42.5 md:w-50 font-medium">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 opacity-80" />
                  <SelectValue placeholder="Thời gian" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODAY">{presetLabel.TODAY}</SelectItem>
                <SelectItem value="THIS_WEEK">
                  {presetLabel.THIS_WEEK}
                </SelectItem>
                <SelectItem value="THIS_MONTH">
                  {presetLabel.THIS_MONTH}
                </SelectItem>
                <SelectItem value="DATE">{presetLabel.DATE}</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 text-sm whitespace-nowrap">
              <Switch
                trackClassName={showCompleted ? "bg-green-500" : "bg-red-500"}
                thumbClassName="bg-white"
                checked={showCompleted}
                onCheckedChange={setShowCompleted}
              />
              <span className="text-black">
                {!showCompleted ? "Ẩn" : "Hiện"} hoàn thành
              </span>
            </label>

            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-auto h-9 w-9 border-2 border-gray-400 rounded-md"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    openAdvanced ? "rotate-180" : ""
                  }`}
                />
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* ROW 2 */}
          <CollapsibleContent className="pt-3">
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedPreset("DATE");
                }}
                disabled={selectedPreset !== "DATE"}
                className="h-9 w-42.5 md:w-50"
              />

              {selectedPreset === "DATE" && selectedDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate("")}
                >
                  Xoá
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* ORDERS WRAPPER */}
      <div className="relative">
        {/* MOBILE */}
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

        {/* DESKTOP */}
        <div className="hidden md:block">
          <AdminOrderTable
            orders={orders}
            onChangeStatus={handleChangeStatus}
            onViewUser={handleViewUser}
            getAvailableTransitions={getAvailableTransitions}
            updatingId={updatingId}
          />
        </div>

        {/* LOADING OVERLAY */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
            <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 shadow-sm">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
              <span className="text-sm font-medium">Đang tải…</span>
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
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
                className={
                  pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
                }
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
              Đơn CONFIRMED chuyển sang DELIVERING bắt buộc phải gán shipper.
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

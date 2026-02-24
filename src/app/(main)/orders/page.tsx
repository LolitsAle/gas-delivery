"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { useCurrentUser } from "@/components/context/CurrentUserContext";
import OrdersHeader from "./OrdersHeader";
import OrdersContent from "./OrdersContent";
import ConfirmModal from "@/components/main/ConfirmModal";
import { showToastError, showToastSuccess } from "@/lib/helper/toast";

type Order = any;

const STATUS_STYLE_MAP: Record<string, { text: string; className: string }> = {
  PENDING: {
    text: "Đang chờ",
    className: "bg-yellow-100 text-yellow-700",
  },
  CONFIRMED: {
    text: "Đã xác nhận",
    className: "bg-blue-100 text-blue-700",
  },
  DELIVERING: {
    text: "Đang giao",
    className: "bg-purple-100 text-purple-700",
  },
  UNPAID: {
    text: "Chưa thanh toán",
    className: "bg-orange-100 text-orange-700",
  },
  COMPLETED: {
    text: "Hoàn thành",
    className: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    text: "Đã huỷ",
    className: "bg-red-100 text-red-700",
  },
};

export default function OrdersPage() {
  const { currentUser } = useCurrentUser();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [showFilter, setShowFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    stoveId: "ALL",
    status: "ALL",
    timeRange: "ALL",
    sort: "desc",
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        limit: "10",
        sort: filters.sort,
      };

      if (filters.timeRange !== "ALL") {
        params.timeRange = filters.timeRange;
      }

      if (filters.stoveId !== "ALL") {
        params.stoveId = filters.stoveId;
      }

      if (filters.status !== "ALL") {
        params.status = filters.status;
      }

      const query = new URLSearchParams(params).toString();

      const res = await apiFetchAuth(`/api/user/me/orders?${query}`);

      setOrders(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error("Fetch orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page < 1) return;
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleStatusClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    if (selectedOrder.status !== "PENDING") {
      showToastError("Không thể hủy đơn", {
        description: "Đơn đã được xử lý. Vui lòng gọi nhân viên để được hỗ trợ.",
      });
      setSelectedOrder(null);
      return;
    }

    setCancelLoading(true);
    try {
      await apiFetchAuth(`/api/user/me/orders/${selectedOrder.id}/status`, {
        method: "PATCH",
        body: {
          status: "CANCELLED",
          cancelledReason: "Cancelled by customer",
        },
      });

      showToastSuccess("Đã hủy đơn thành công");
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      showToastError("Hủy đơn thất bại", {
        description: error?.message || "Vui lòng thử lại sau",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const isPendingOrder = selectedOrder?.status === "PENDING";

  return (
    <div className="h-screen flex flex-col bg-gas-green-50">
      {/* HEADER */}
      <div className="p-2 shrink-0">
        <OrdersHeader
          currentUser={currentUser}
          showFilter={showFilter}
          setShowFilter={() => {
            if (showFilter)
              setFilters({
                stoveId: "ALL",
                status: "ALL",
                timeRange: "ALL",
                sort: "desc",
              });
            setShowFilter((prev) => !prev);
          }}
          filters={filters}
          handleFilterChange={handleFilterChange}
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          STATUS_STYLE_MAP={STATUS_STYLE_MAP}
        />
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto scroll-smooth overscroll-contain px-[5vw] pt-2 pb-[30vw] no-scrollbar bg-gas-green-50">
        <OrdersContent
          orders={orders}
          loading={loading}
          STATUS_STYLE_MAP={STATUS_STYLE_MAP}
          onStatusClick={handleStatusClick}
        />
      </div>

      <ConfirmModal
        open={!!selectedOrder}
        title={isPendingOrder ? "Xác nhận hủy đơn" : "Đơn không thể hủy"}
        description={
          isPendingOrder
            ? "Bạn có chắc muốn hủy đơn này không?"
            : "Đơn đã qua trạng thái chờ. Vui lòng gọi điện cho nhân viên để được hỗ trợ hủy đơn."
        }
        confirmText={isPendingOrder ? "Hủy đơn" : "Đã hiểu"}
        cancelText="Đóng"
        loading={cancelLoading}
        onCancel={() => setSelectedOrder(null)}
        onConfirm={
          isPendingOrder ? handleCancelOrder : () => setSelectedOrder(null)
        }
      />
    </div>
  );
}

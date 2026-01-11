"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, Trash } from "lucide-react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import OrderModal from "./components/OrderModal";
import { Order } from "./constants";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const [openCreate, setOpenCreate] = useState(false);
  const [orderEditing, setOrderEditing] = useState<Order | null>(null);

  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  /* =====================
     FETCH ORDERS
  ====================== */
  const fetchOrders = () => {
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (status !== "all") params.set("status", status);
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    apiFetchAuth<{ orders: Order[]; total: number }>(
      `/api/admin/orders?${params.toString()}`
    ).then((res) => {
      setOrders(res.orders);
      setTotal(res.total);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
  }, [query, status, page]);

  const totalOrders = useMemo(() => orders.length, [orders]);

  /* =====================
     DELETE ORDER
  ====================== */
  const confirmDeleteOrder = (order: Order) => {
    if (order.status === "DELIVERING" || order.status === "COMPLETED") {
      alert("Không thể xóa đơn hàng đang giao hoặc đã hoàn thành");
      return;
    }
    setOrderToDelete(order);
  };

  const executeDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      setDeleting(true);
      await apiFetchAuth(`/api/admin/orders/${orderToDelete.id}`, {
        method: "DELETE",
      });

      setOrderToDelete(null);
      setOrderEditing(null);
      setPage(1);
      fetchOrders();
    } catch (err: any) {
      alert(err.message || "Không thể xóa đơn hàng");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-4">Đang tải...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* =====================
          FILTER BAR
      ====================== */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-50">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã đơn hoặc SĐT"
            className="input w-full pl-9"
          />
        </div>

        <button onClick={() => setOpenCreate(true)} className="btn-primary">
          + Tạo đơn mới
        </button>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="DELIVERING">Đang giao</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        <div className="text-sm text-gray-500">Tổng: {totalOrders}</div>
      </div>

      {/* =====================
          TABLE
      ====================== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Bếp</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Thời gian</th>
              <th className="p-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}</td>
                <td className="p-3">
                  {o.user.nickname || "Ẩn danh"}
                  <div className="text-xs text-gray-500">
                    {o.user.phoneNumber}
                  </div>
                </td>
                <td className="p-3">{o.stove?.address || "—"}</td>
                <td className="p-3 font-medium">
                  {o.totalPrice.toLocaleString()}₫
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                    {o.status}
                  </span>
                </td>
                <td className="p-3 text-xs">
                  {new Date(o.createdAt).toLocaleString()}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setOrderToDelete(o)}
                    className="icon-btn"
                  >
                    <Trash size={16} />
                  </button>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => setOrderEditing(o)}
                    className="icon-btn"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Không có đơn hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* =====================
          PAGINATION
      ====================== */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-gray-500">
          Trang {page} / {Math.max(1, Math.ceil(total / limit))} — Tổng {total}{" "}
          đơn
        </div>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Trước
          </button>

          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* =====================
          CREATE MODAL
      ====================== */}
      <OrderModal
        open={openCreate}
        mode="create"
        onClose={() => setOpenCreate(false)}
        onSuccess={() => {
          setPage(1);
          fetchOrders();
        }}
      />

      {/* =====================
          EDIT MODAL
      ====================== */}
      {orderEditing && (
        <OrderModal
          open={true}
          mode="edit"
          orderId={orderEditing.id}
          initialData={{
            user: orderEditing.user,
            stove: orderEditing.stove,
            items: orderEditing.items.map((i) => ({
              product: i.product,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            })),
            status: orderEditing.status,
          }}
          onClose={() => setOrderEditing(null)}
          onSuccess={() => {
            setOrderEditing(null);
            fetchOrders();
          }}
        />
      )}

      {/* =====================
          DELETE CONFIRM
      ====================== */}
      {orderToDelete && (
        <ConfirmModal
          title="Xóa đơn hàng"
          description={`Bạn có chắc chắn muốn xóa đơn ${orderToDelete.id.slice(
            0,
            8
          )}? Hành động này không thể hoàn tác.`}
          confirmText="Xóa đơn"
          cancelText="Hủy"
          loading={deleting}
          onCancel={() => !deleting && setOrderToDelete(null)}
          onConfirm={executeDeleteOrder}
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Stove,
  User,
  OrderDraftItem,
  SelectUser,
  SelectStove,
  SelectProduct,
  OrderStatus,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_COLOR,
  isOrderEditable,
} from "../constants";
import { apiFetchAuth } from "@/lib/api/apiClient";

/* =========================
   TYPES
========================= */

type Mode = "create" | "edit";

interface OrderFormProps {
  open: boolean;
  mode: Mode;

  // edit only
  orderId?: string;
  initialData?: {
    user: User;
    stove: Stove | null | undefined;
    items: OrderDraftItem[];
    status: OrderStatus;
    note?: string;
  };

  onSuccess: () => void;
  onClose: () => void;
}

/* =========================
   COMPONENT
========================= */

export default function OrderModal({
  open,
  mode,
  orderId,
  initialData,
  onSuccess,
  onClose,
}: OrderFormProps) {
  const isEdit = mode === "edit";
  const status = initialData?.status ?? OrderStatus.CONFIRMED;
  const editable = !isEdit || isOrderEditable(status);

  const [userSearch, setUserSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedStove, setSelectedStove] = useState<Stove | null>(null);
  const [autoCreateStove, setAutoCreateStove] = useState(false);

  const [items, setItems] = useState<OrderDraftItem[]>([]);

  const [users, setUsers] = useState<SelectUser[]>([]);
  const [stoves, setStoves] = useState<SelectStove[]>([]);
  const [products, setProducts] = useState<SelectProduct[]>([]);

  const [stoveAddress, setStoveAddress] = useState("");
  const [stoveNote, setStoveNote] = useState("");

  /* =========================
     INIT EDIT DATA
  ========================= */

  useEffect(() => {
    if (!open || !isEdit || !initialData || !initialData.stove) return;

    setSelectedUser(initialData.user);
    setSelectedStove(initialData.stove);
    setItems(initialData.items);
    setAutoCreateStove(false);
    setStoveNote(initialData.note || "");
  }, [open, isEdit, initialData]);

  /* =========================
     FETCH USERS
  ========================= */

  useEffect(() => {
    if (!open || isEdit) return;

    apiFetchAuth<{ users: SelectUser[] }>(
      `/api/admin/users?search=${userSearch}`
    ).then((res) => setUsers(res.users));
  }, [open, userSearch, isEdit]);

  /* =========================
     FETCH STOVES
  ========================= */

  useEffect(() => {
    if (!selectedUser) {
      setStoves([]);
      return;
    }

    apiFetchAuth<{ stoves: SelectStove[] }>(
      `/api/admin/stoves?userId=${selectedUser.id}`
    ).then((res) => setStoves(res.stoves));
  }, [selectedUser]);

  /* =========================
     FETCH PRODUCTS
  ========================= */

  useEffect(() => {
    if (!open || !editable) return;

    apiFetchAuth<{ products: SelectProduct[] }>(
      `/api/admin/products?search=${productSearch}`
    ).then((res) => setProducts(res.products));
  }, [open, productSearch, editable]);

  /* =========================
     TOTAL PRICE
  ========================= */

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
    [items]
  );

  /* =========================
     SUBMIT
  ========================= */

  const submit = async () => {
    const payloadItems = items.map((i) => ({
      productId: i.product.id,
      quantity: i.quantity,
    }));

    if (isEdit) {
      await apiFetchAuth(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        body: {
          items: payloadItems,
          note: stoveNote,
        },
      });
    } else {
      await apiFetchAuth("/api/admin/orders", {
        method: "POST",
        body: {
          userId: selectedUser!.id,
          stove: autoCreateStove
            ? { address: stoveAddress, note: stoveNote }
            : { stoveId: selectedStove!.id, note: stoveNote },
          items: payloadItems,
        },
      });
    }

    onSuccess();
    onClose();
  };

  if (!open) return null;

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-4 space-y-4">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div className="font-semibold text-lg">
            {isEdit ? "Chỉnh sửa đơn hàng" : "Tạo đơn hàng mới"}
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* USER */}
        <div>
          <label className="text-sm font-medium">Khách hàng</label>

          {!isEdit && (
            <>
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc SĐT"
                className="input w-full mb-2"
              />

              <select
                className="input w-full"
                onChange={(e) => {
                  const u = users.find((x) => x.id === e.target.value);
                  setSelectedUser(u || null);
                  setSelectedStove(null);
                }}
              >
                <option value="">-- Chọn khách hàng --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nickname || "Ẩn danh"} – {u.phoneNumber}
                  </option>
                ))}
              </select>
            </>
          )}

          {isEdit && selectedUser && (
            <div className="input bg-gray-100">
              {selectedUser.nickname || "Ẩn danh"} – {selectedUser.phoneNumber}
            </div>
          )}
        </div>

        {/* STOVE */}
        {selectedUser && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Bếp</label>

            {!isEdit && !autoCreateStove && (
              <select
                className="input w-full"
                value={selectedStove?.id || ""}
                onChange={(e) => {
                  const s = stoves.find((x) => x.id === e.target.value);
                  setSelectedStove(s || null);
                }}
              >
                <option value="">-- Chọn bếp --</option>
                {stoves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.address}
                  </option>
                ))}
              </select>
            )}

            {isEdit && selectedStove && (
              <div className="input bg-gray-100">{selectedStove.address}</div>
            )}

            {!isEdit && autoCreateStove && (
              <input
                className="input w-full"
                placeholder="Địa chỉ bếp"
                value={stoveAddress}
                onChange={(e) => setStoveAddress(e.target.value)}
              />
            )}

            {!isEdit && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoCreateStove}
                  onChange={(e) => {
                    setAutoCreateStove(e.target.checked);
                    setSelectedStove(null);
                  }}
                />
                Tạo bếp mới
              </label>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {editable && (
          <div className="space-y-2">
            <div className="font-medium">Sản phẩm</div>

            <input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Tìm sản phẩm"
              className="input w-full"
            />

            <select
              className="input w-full"
              onChange={(e) => {
                const p = products.find((x) => x.id === e.target.value);
                if (!p) return;

                setItems((prev) => {
                  const existed = prev.find((i) => i.product.id === p.id);
                  if (existed) {
                    return prev.map((i) =>
                      i.product.id === p.id
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                    );
                  }
                  return [
                    ...prev,
                    {
                      product: p,
                      quantity: 1,
                      unitPrice: p.currentPrice,
                    },
                  ];
                });

                e.currentTarget.value = "";
              }}
            >
              <option value="">-- Thêm sản phẩm --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName} – {p.currentPrice.toLocaleString()}₫
                </option>
              ))}
            </select>
          </div>
        )}

        {/* ITEMS */}
        <div className="border rounded-md divide-y">
          {items.map((i) => (
            <div
              key={i.product.id}
              className="flex items-center justify-between p-2 gap-2"
            >
              <div className="flex-1">
                <div className="font-medium">{i.product.productName}</div>
                <div className="text-xs text-gray-500">
                  {i.unitPrice.toLocaleString()}₫ / sản phẩm
                </div>
              </div>

              {editable && (
                <div className="flex items-center gap-2">
                  <button
                    className="btn-secondary px-2"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.product.id === i.product.id
                            ? {
                                ...x,
                                quantity: Math.max(1, x.quantity - 1),
                              }
                            : x
                        )
                      )
                    }
                  >
                    −
                  </button>

                  <input
                    type="number"
                    min={1}
                    value={i.quantity}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.product.id === i.product.id
                            ? {
                                ...x,
                                quantity: Math.max(1, Number(e.target.value)),
                              }
                            : x
                        )
                      )
                    }
                    className="input w-16 text-center"
                  />

                  <button
                    className="btn-secondary px-2"
                    onClick={() =>
                      setItems((prev) =>
                        prev.map((x) =>
                          x.product.id === i.product.id
                            ? { ...x, quantity: x.quantity + 1 }
                            : x
                        )
                      )
                    }
                  >
                    +
                  </button>

                  <button
                    className="text-red-500 text-sm ml-2"
                    onClick={() =>
                      setItems((prev) =>
                        prev.filter((x) => x.product.id !== i.product.id)
                      )
                    }
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}

          {items.length === 0 && (
            <div className="p-3 text-sm text-gray-500 text-center">
              Chưa có sản phẩm nào
            </div>
          )}
        </div>

        {/* SUMMARY */}
        <div className="flex justify-between items-center border-t pt-3">
          <div className="text-sm">
            Trạng thái:{" "}
            <span
              className={`px-2 py-1 rounded-full text-xs ${ORDER_STATUS_COLOR[status]}`}
            >
              {ORDER_STATUS_LABEL[status]}
            </span>
          </div>

          <div className="text-lg font-semibold">
            Tổng: {totalPrice.toLocaleString()}₫
          </div>
        </div>

        {/* ACTION */}
        {editable && (
          <button
            className="btn-primary"
            disabled={items.length === 0}
            onClick={submit}
          >
            {isEdit ? "Cập nhật đơn" : "Tạo đơn"}
          </button>
        )}
      </div>
    </div>
  );
}

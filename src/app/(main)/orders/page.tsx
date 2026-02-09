"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiFetchAuth } from "@/lib/api/apiClient";

type Order = any;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await apiFetchAuth("/api/user/me/orders");
        setOrders(data);
      } catch (err) {
        console.error("Fetch orders failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="p-4">Đang tải đơn hàng...</div>;
  }

  if (!orders.length) {
    return <div className="p-4">Bạn chưa có đơn hàng nào.</div>;
  }

  return (
    <div className="p-4 space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="rounded-2xl shadow-sm">
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
                <div className="font-semibold">
                  Bếp: {order.stove?.name || "Không rõ"}
                </div>
              </div>

              <Badge>{order.status}</Badge>
            </div>

            {/* Products */}
            {order.items.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Sản phẩm</div>
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      {item.product.productName} x{item.quantity}
                    </div>
                    <div>
                      {(item.unitPrice * item.quantity).toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Services */}
            {order.serviceItems.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Dịch vụ</div>
                {order.serviceItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      {item.serviceName} x{item.quantity}
                    </div>
                    <div>
                      {(item.unitPrice * item.quantity).toLocaleString()}đ
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <div>Tổng cộng</div>
              <div>{order.totalPrice.toLocaleString()}đ</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

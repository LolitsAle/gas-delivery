"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/helper/helpers";
import OrderCard from "./OrderCard";

type OrdersContentProps = {
  orders: any[];
  loading: boolean;
  STATUS_STYLE_MAP: Record<string, { text: string; className: string }>;
  onStatusClick: (order: any) => void;
};

export default function OrdersContent({
  orders,
  loading,
  STATUS_STYLE_MAP,
  onStatusClick,
}: OrdersContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gas-green-200 border-t-gas-green-600 rounded-full animate-spin" />
          <div className="text-sm text-gas-gray-600 font-medium">
            Đang tải đơn hàng...
          </div>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="text-5xl">📦</div>
          <div className="text-lg font-semibold text-gas-green-800">
            Chưa có đơn hàng nào
          </div>
          <div className="text-sm text-gas-gray-600">
            Khi bạn đặt gas hoặc dịch vụ, đơn hàng sẽ hiển thị tại đây.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[5vw]">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          STATUS_STYLE_MAP={STATUS_STYLE_MAP}
          onStatusClick={onStatusClick}
        />
      ))}
    </div>
  );
}

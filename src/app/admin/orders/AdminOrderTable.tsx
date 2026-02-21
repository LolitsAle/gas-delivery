"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  orders: any[];
  getStatusColor: (status: string) => string;
};

export default function AdminOrderTable({ orders, getStatusColor }: Props) {
  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="p-3">Thời gian</th>
            <th className="p-3">Khách</th>
            <th className="p-3">SĐT</th>
            <th className="p-3">Tổng tiền</th>
            <th className="p-3">Điểm</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Shipper</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t hover:bg-gray-50">
              <td className="p-3">
                {new Date(order.createdAt).toLocaleString()}
              </td>
              <td className="p-3">{order.user?.name || "-"}</td>
              <td className="p-3">{order.user?.phoneNumber}</td>
              <td className="p-3 font-medium">
                {order.totalPrice.toLocaleString()} đ
              </td>
              <td className="p-3">
                <div className="text-xs">
                  {order.pointsUsed > 0 && (
                    <div className="text-red-500">-{order.pointsUsed}</div>
                  )}
                  {order.pointsEarned > 0 && (
                    <div className="text-green-600">+{order.pointsEarned}</div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </td>
              <td className="p-3">{order.shipper?.name || "-"}</td>
              <td className="p-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/admin/orders/${order.id}`)
                  }
                >
                  Xem
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

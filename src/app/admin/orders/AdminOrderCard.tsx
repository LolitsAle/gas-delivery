"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/helper/helpers";
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
} from "lucide-react";

type Order = any;

export default function AdminOrderCard({
  order,
  onViewUser,
}: {
  order: Order;
  onViewUser: (order: Order) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusMap: Record<string, { icon: React.ReactNode; style: string }> = {
    PENDING: {
      icon: <Clock size={14} />,
      style: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    CONFIRMED: {
      icon: <CheckCircle2 size={14} />,
      style: "bg-blue-100 text-blue-700 border-blue-200",
    },
    DELIVERING: {
      icon: <Truck size={14} />,
      style: "bg-purple-100 text-purple-700 border-purple-200",
    },
    DONE: {
      icon: <CheckCircle2 size={14} />,
      style: "bg-green-100 text-green-700 border-green-200",
    },
    CANCELLED: {
      icon: <XCircle size={14} />,
      style: "bg-red-100 text-red-700 border-red-200",
    },
  };

  const status = statusMap[order.status];

  const isBusiness = order?.user?.tags?.includes("BUSINESS");

  return (
    <Card className="rounded-md shadow-sm border border-gas-green-700">
      <CardContent className="p-0">
        {/* HEADER */}
        <div className="flex justify-between items-center p-[3vw] bg-gas-green-600 rounded-t-md">
          <div className="flex items-center gap-2 min-w-0">
            <div className="truncate max-w-[45vw]">
              <div
                className={`font-semibold text-[4.5vw] truncate ${
                  isBusiness ? "text-gas-orange-300" : "text-white"
                }`}
              >
                {order?.user?.name}
              </div>
              {order?.user?.nickname && (
                <div className="text-[3vw] truncate text-white/80">
                  {order.user.nickname}
                </div>
              )}
            </div>

            <button
              onClick={() => onViewUser(order)}
              className="w-8 h-8 flex items-center justify-center rounded-md bg-white active:scale-95 transition"
            >
              <Eye size={16} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              className={`px-2 py-2 rounded-md border ${
                status?.style || "bg-gray-100 text-gray-600 border-gray-200"
              }`}
            >
              {status?.icon}
            </Badge>

            <a
              href={`tel:${order?.user?.phoneNumber}`}
              className="w-9 h-9 flex items-center justify-center rounded-md bg-white text-red-500 shadow active:scale-95 transition"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        {/* BODY */}
        <div className="flex flex-col gap-[2vw] p-[3vw]">
          <div className="text-[3vw] text-white/80 bg-blue-600 w-fit rounded-md px-2">
            Ngày đặt: {formatDateTime(order.createdAt)}
          </div>

          {/* Stove */}
          {order.stoveSnapshot?.quantity > 0 && (
            <div className="bg-gas-green-100 p-[3vw] rounded-md text-sm font-semibold flex justify-between">
              <div>
                {order.stoveSnapshot.productName} x
                {order.stoveSnapshot.quantity}
              </div>
              <div>
                {(
                  order.stoveSnapshot.unitPrice * order.stoveSnapshot.quantity
                ).toLocaleString()}
                đ
              </div>
            </div>
          )}

          {/* Products */}
          {order.items?.length > 0 && (
            <div className="bg-white border border-gas-green-600 p-[3vw] rounded-md space-y-2 text-sm">
              {order.items.map((item: any) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] items-center"
                >
                  <div className="truncate">
                    {item.product?.productName} x{item.quantity}
                  </div>
                  <div className="text-right font-medium tabular-nums">
                    {item.payByPoints
                      ? `${item.unitPointPrice * item.quantity} điểm`
                      : `${(item.unitPrice * item.quantity).toLocaleString()}đ`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Services */}
          {order.serviceItems?.length > 0 && (
            <div className="space-y-2 text-sm">
              {order.serviceItems.map((item: any) => (
                <div key={item.id} className="flex justify-between">
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
        </div>

        {/* TOTAL */}
        <div className="border-t border-gas-green-700 py-3 px-[4vw] text-sm relative">
          <div className="flex justify-between font-semibold">
            <div>Tổng tiền</div>
            <div>{order.totalPrice.toLocaleString()}đ</div>
          </div>

          {expanded && (
            <div className="mt-2 space-y-1">
              {order.pointsUsed > 0 && (
                <div className="flex justify-between text-blue-600">
                  <div>Dùng điểm</div>
                  <div>-{order.pointsUsed} điểm</div>
                </div>
              )}
              {order.pointsEarned > 0 && (
                <div className="flex justify-between text-gas-orange-600">
                  <div>Điểm thưởng</div>
                  <div>+{order.pointsEarned} điểm</div>
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2 w-[8vw] h-[4vw] bg-gas-green-700 flex items-center justify-center text-white rounded-full shadow"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

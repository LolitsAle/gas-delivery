"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/lib/helper/helpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY"
  | "DELIVERING"
  | "COMPLETED"
  | "CANCELLED";

type Order = any;

export default function AdminOrderCard({
  order,
  onViewUser,
  onChangeStatus,
  getAvailableTransitions,
  isUpdating,
}: {
  order: Order;
  onViewUser: (order: Order) => void;
  onChangeStatus: (order: Order, nextStatus: OrderStatus) => Promise<void>;
  getAvailableTransitions: (status: OrderStatus) => OrderStatus[];
  isUpdating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusMeta: Record<
    OrderStatus,
    { label: string; icon: React.ReactNode; style: string }
  > = {
    PENDING: {
      label: "Chờ xác nhận",
      icon: <Clock size={14} />,
      style: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    CONFIRMED: {
      label: "Đã xác nhận",
      icon: <CheckCircle2 size={14} />,
      style: "bg-blue-100 text-blue-700 border-blue-200",
    },
    READY: {
      label: "Sẵn sàng giao",
      icon: <CheckCircle2 size={14} />,
      style: "bg-indigo-100 text-indigo-700 border-indigo-200",
    },
    DELIVERING: {
      label: "Đang giao",
      icon: <Truck size={14} />,
      style: "bg-purple-100 text-purple-700 border-purple-200",
    },
    COMPLETED: {
      label: "Hoàn tất",
      icon: <CheckCircle2 size={14} />,
      style: "bg-green-100 text-green-700 border-green-200",
    },
    CANCELLED: {
      label: "Đã huỷ",
      icon: <XCircle size={14} />,
      style: "bg-red-100 text-red-700 border-red-200",
    },
  };

  const currentStatus = order.status as OrderStatus;
  const status = statusMeta[currentStatus];
  const isBusiness = order?.user?.tags?.includes("BUSINESS");
  const transitions = getAvailableTransitions(order.status);

  return (
    <Card className="rounded-md shadow-sm border border-gas-green-700">
      <CardContent className="p-0">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={transitions.length === 0 || isUpdating}
                  className="disabled:opacity-60"
                >
                  <Badge
                    className={`px-2 py-2 rounded-md border cursor-pointer ${
                      status?.style ||
                      "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {status?.icon}
                      <span>{status?.label}</span>
                    </div>
                  </Badge>
                </button>
              </DropdownMenuTrigger>
              {transitions.length > 0 && (
                <DropdownMenuContent align="end" sideOffset={8}>
                  {transitions.map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() =>
                        onChangeStatus(order, status as OrderStatus)
                      }
                    >
                      {statusMeta[status].label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              )}
            </DropdownMenu>

            <a
              href={`tel:${order?.user?.phoneNumber}`}
              className="w-9 h-9 flex items-center justify-center rounded-md bg-white text-red-500 shadow active:scale-95 transition"
            >
              <Phone size={16} />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-[2vw] p-[3vw]">
          <div className="text-[3vw] text-white/80 bg-blue-600 w-fit rounded-md px-2">
            Ngày đặt: {formatDateTime(order.createdAt)}
          </div>

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

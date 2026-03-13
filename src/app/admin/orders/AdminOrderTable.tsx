"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "DELIVERING"
  | "UNPAID"
  | "COMPLETED"
  | "CANCELLED";

type Order = any;

type Props = {
  orders: any[];
  onChangeStatus: (order: any, nextStatus: OrderStatus) => Promise<void>;
  getAvailableTransitions: (status: OrderStatus) => OrderStatus[];
  onViewUser: (order: Order) => void;
  updatingId: string | null;
};

export default function AdminOrderTable({
  orders,
  onChangeStatus,
  getAvailableTransitions,
  updatingId,
  onViewUser,
}: Props) {
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});

  const toggleRow = (orderId: string) => {
    setOpenRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };
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
    DELIVERING: {
      label: "Đang giao",
      icon: <Truck size={14} />,
      style: "bg-purple-100 text-purple-700 border-purple-200",
    },
    UNPAID: {
      label: "Chưa thanh toán",
      icon: <Clock size={14} />,
      style: "bg-orange-100 text-orange-700 border-orange-200",
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

  const getOrderLineItems = (order: any) => {
    const stoveItems =
      order?.stoveSnapshot?.quantity > 0
        ? [
            {
              id: `stove-${order.stoveSnapshot.id ?? order.id}`,
              name: order.stoveSnapshot.productName || "Sản phẩm bếp",
              quantity: order.stoveSnapshot.quantity || 0,
              unitPrice: order.stoveSnapshot.unitPrice || 0,
              discountPerUnit: order.stoveSnapshot.discountPerUnitSnapshot || 0,
              type: "STOVE",
            },
          ]
        : [];

    const productItems =
      order?.items?.map((item: any) => ({
        id: item.id,
        name: item.product?.productName || "Sản phẩm",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        discountPerUnit: item.discountPerUnitSnapshot || 0,
        payByPoints: item.payByPoints || false,
        unitPointPrice: item.unitPointPrice || 0,
        type: "PRODUCT",
      })) || [];

    const serviceItems =
      order?.serviceItems?.map((item: any) => ({
        id: item.id,
        name: item.serviceName || "Dịch vụ",
        quantity: item.quantity || 0,
        unitPrice: item.unitPrice || 0,
        discountPerUnit: 0,
        type: "SERVICE",
      })) || [];

    return [...stoveItems, ...productItems, ...serviceItems];
  };

  return (
    <div className="overflow-x-auto rounded-2xl border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="w-12 p-3"></th>
            <th className="p-3">Thời gian</th>
            <th className="p-3">Khách</th>
            <th className="p-3">Biệt danh</th>
            <th className="p-3">SĐT</th>
            <th className="p-3">Tổng tiền</th>
            <th className="p-3">Điểm</th>
            <th className="p-3">Trạng thái</th>
            <th className="p-3">Shipper</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => {
            const transitions = getAvailableTransitions(order.status);
            const isOpen = !!openRows[order.id];
            const lineItems = getOrderLineItems(order);
            const colSpan = 10;

            return (
              <Fragment key={order.id}>
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleRow(order.id)}
                  asChild
                >
                  <>
                    <tr className="border-t hover:bg-gray-50">
                      <td className="p-3 align-middle">
                        <CollapsibleTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={cn(
                              "h-8 w-8",
                              isOpen && "bg-gray-100 text-black",
                            )}
                          >
                            {isOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </td>

                      <td className="p-3">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>

                      <td className="p-3">{order.user?.name || "-"}</td>
                      <td className="p-3">{order.user?.nickname || "-"}</td>

                      <td className="p-3">{order.user?.phoneNumber || "-"}</td>

                      <td className="p-3 font-medium">
                        {order.totalPrice.toLocaleString()} đ
                      </td>

                      <td className="p-3">
                        <div className="text-xs">
                          {order.pointsUsed > 0 && (
                            <div className="text-red-500">
                              -{order.pointsUsed}
                            </div>
                          )}
                          {order.pointsEarned > 0 && (
                            <div className="text-green-600">
                              +{order.pointsEarned}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {(() => {
                          const currentStatus = order.status as OrderStatus;
                          const status = statusMeta[currentStatus];

                          if (!status) {
                            return (
                              <div className="inline-flex rounded-md border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                {order.status}
                              </div>
                            );
                          }

                          if (transitions.length > 0) {
                            return (
                              <Select
                                value={currentStatus}
                                onValueChange={(v) =>
                                  onChangeStatus(order, v as OrderStatus)
                                }
                                disabled={updatingId === order.id}
                              >
                                <SelectTrigger className="h-auto w-auto inline-flex p-0 pr-0 border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 [&>svg]:hidden">
                                  <div
                                    className={cn(
                                      "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
                                      status.style,
                                      updatingId === order.id
                                        ? "opacity-60"
                                        : "cursor-pointer",
                                    )}
                                  >
                                    {status.icon}
                                    <SelectValue asChild>
                                      <span>
                                        {updatingId === order.id
                                          ? "Đang đổi..."
                                          : status.label}
                                      </span>
                                    </SelectValue>
                                  </div>
                                </SelectTrigger>

                                <SelectContent
                                  align="start"
                                  position="popper"
                                  sideOffset={6}
                                  className="z-[9999]"
                                >
                                  {transitions.map((s) => (
                                    <SelectItem key={s} value={s}>
                                      <div className="inline-flex items-center gap-2">
                                        {statusMeta[s]?.icon}
                                        <span>{statusMeta[s]?.label ?? s}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }

                          return (
                            <div
                              className={cn(
                                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium",
                                status.style,
                              )}
                            >
                              {status.icon}
                              <span>{status.label}</span>
                            </div>
                          );
                        })()}
                      </td>

                      <td className="p-3">{order.shipper?.name || "-"}</td>

                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewUser(order)}
                        >
                          Xem
                        </Button>
                      </td>
                    </tr>

                    <tr className="border-t-0">
                      <td colSpan={colSpan} className="p-0">
                        <CollapsibleContent asChild>
                          <div
                            className={cn(
                              "grid transition-all duration-300 ease-in-out",
                              isOpen
                                ? "grid-rows-[1fr] opacity-100"
                                : "grid-rows-[0fr] opacity-0",
                            )}
                          >
                            <div className="overflow-hidden">
                              <div className="bg-gray-50 px-4 pb-4 pt-1">
                                <div className="rounded-xl border bg-white overflow-hidden">
                                  <div className="grid grid-cols-12 gap-3 border-b bg-gray-100 px-4 py-3 text-xs font-semibold text-gray-600">
                                    <div className="col-span-6">Sản phẩm</div>
                                    <div className="col-span-2 text-center">
                                      Số lượng
                                    </div>
                                    <div className="col-span-2 text-right">
                                      Đơn giá
                                    </div>
                                    <div className="col-span-2 text-right">
                                      Thành tiền
                                    </div>
                                  </div>

                                  {lineItems.length > 0 ? (
                                    lineItems.map((item) => {
                                      const finalUnitPrice = item.payByPoints
                                        ? item.unitPointPrice || 0
                                        : Math.max(
                                            0,
                                            (item.unitPrice || 0) -
                                              (item.discountPerUnit || 0),
                                          );

                                      const total =
                                        finalUnitPrice * item.quantity;

                                      return (
                                        <div
                                          key={item.id}
                                          className="grid grid-cols-12 gap-3 border-b last:border-b-0 px-4 py-3 text-sm"
                                        >
                                          <div className="col-span-6 min-w-0">
                                            <div className="font-medium truncate">
                                              {item.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {item.type === "STOVE" &&
                                                "Bếp snapshot"}
                                              {item.type === "PRODUCT" &&
                                                "Sản phẩm kèm theo"}
                                              {item.type === "SERVICE" &&
                                                "Dịch vụ"}
                                            </div>
                                          </div>

                                          <div className="col-span-2 text-center tabular-nums">
                                            {item.quantity}
                                          </div>

                                          <div className="col-span-2 text-right tabular-nums">
                                            {item.payByPoints
                                              ? `${finalUnitPrice.toLocaleString()} điểm`
                                              : `${finalUnitPrice.toLocaleString()} đ`}
                                          </div>

                                          <div className="col-span-2 text-right font-medium tabular-nums">
                                            {item.payByPoints
                                              ? `${total.toLocaleString()} điểm`
                                              : `${total.toLocaleString()} đ`}
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <div className="px-4 py-4 text-sm text-gray-500">
                                      Không có sản phẩm trong đơn hàng này.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </td>
                    </tr>
                  </>
                </Collapsible>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

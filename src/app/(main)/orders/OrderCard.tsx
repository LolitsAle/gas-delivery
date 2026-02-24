"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/helper/helpers";
import { ChevronDown, ChevronUp } from "lucide-react";

type OrderCardProps = {
  order: any;
  STATUS_STYLE_MAP: Record<string, { text: string; className: string }>;
  onStatusClick: (order: any) => void;
};

export default function OrderCard({
  order,
  STATUS_STYLE_MAP,
  onStatusClick,
}: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
  };
  const numberOfItems =
    (order.items?.length || 0) + (order.stoveSnapshot?.quantity ? 1 : 0);
  return (
    <Card
      key={order.id}
      className="rounded-md shadow-sm relative border border-gas-green-700"
    >
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex justify-between items-center px-[5vw] bg-gas-green-400 p-[2vw] rounded-t-md">
          <div>
            <div className="font-semibold text-white text-[5vw]">
              {order.stoveSnapshot?.stoveName || "Không rõ"}
            </div>
            <div className="text-xs text-red-600 bg-white px-[2vw] rounded-md">
              {formatDateTime(order.updatedAt)}
            </div>
          </div>

          <Badge
            onClick={() => onStatusClick(order)}
            className={`px-2 py-1 text-xs font-medium rounded-md ${
              STATUS_STYLE_MAP[order.status]?.className ||
              "bg-gray-100 text-gray-700"
            } cursor-pointer`}
          >
            {STATUS_STYLE_MAP[order.status]?.text || order.status}
          </Badge>
        </div>
        {/* Body */}
        <div className="relative flex flex-col p-[3vw] gap-[3vw]">
          <button
            onClick={toggleExpanded}
            className="absolute bottom-0 left-[50%] translate-y-1/2 -translate-x-1/2 w-[7vw] h-[7vw] aspect-square bg-gas-green-600 flex justify-center items-center text-white rounded-full"
          >
            {!expanded ? (
              <ChevronDown size={"5vw"} />
            ) : (
              <ChevronUp size={"5vw"} />
            )}
          </button>
          {!expanded && (
            <div className="flex justify-between items-center">
              <div className="text-gas-green-700 text-sm">
                {numberOfItems} sản phẩm
              </div>
            </div>
          )}
          {expanded && (
            <>
              {order.stoveSnapshot?.quantity && (
                <div className="bg-gas-green-100 p-[2vw] rounded-md">
                  <div className="flex justify-between text-sm font-semibold">
                    <div>
                      {order.stoveSnapshot.productName || "Sản phẩm gas"} x
                      {order.stoveSnapshot.quantity}
                    </div>

                    <div>
                      {(
                        (order.stoveSnapshot.unitPrice || 0) *
                        (order.stoveSnapshot.quantity || 0)
                      ).toLocaleString()}
                      đ
                    </div>
                  </div>
                  {order.stoveSnapshot?.promoChoice === "GIFT_PRODUCT" &&
                    order.stoveSnapshot?.promoProductQuantity && (
                      <div className="flex justify-between text-[3vw] text-gas-orange-900">
                        <div>
                          🎁
                          {order.stoveSnapshot.promoProductName || "Quà tặng"} x
                          {order.stoveSnapshot.promoProductQuantity}
                        </div>

                        <div className="text-green-600">Miễn phí</div>
                      </div>
                    )}
                  {order.stoveSnapshot?.promoChoice === "BONUS_POINT" && (
                    <div className="text-[3vw] text-gas-orange-900">
                      ⭐Cộng 1000 điểm thưởng
                    </div>
                  )}
                  {order.stoveSnapshot?.promoChoice === "DISCOUNT_CASH" && (
                    <div className="text-[3vw] text-gas-green-900">
                      💸Giảm 10,000đ tiền mặt
                    </div>
                  )}
                </div>
              )}

              {order.items?.length > 0 && (
                <div className="bg-white border border-gas-green-600 p-[2vw] rounded-md space-y-2">
                  {order.items.map((item: any) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm"
                    >
                      <div className="min-w-0 truncate">
                        {item.product.productName} x{item.quantity}
                      </div>
                      <div className="whitespace-nowrap text-right font-medium tabular-nums">
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
            </>
          )}
        </div>

        {/* Total */}
        <div className="border-t border-gas-green-700 py-2 px-[3vw] space-y-1 text-sm">
          <div className="flex justify-between font-semibold">
            <div>Tổng tiền</div>
            <div>{order.totalPrice.toLocaleString()}đ</div>
          </div>

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
      </CardContent>
    </Card>
  );
}

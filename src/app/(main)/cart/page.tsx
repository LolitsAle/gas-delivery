"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

type CartItem = {
  id: string;
  quantity: number;
  payByPoints: boolean;
  type: string;
  product: {
    id: string;
    productName: string;
    currentPrice: number;
    pointValue: number;
    tags: string[];
  };
};

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [userPoints, setUserPoints] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserPoints(user.points || 0);
    setItems(user.cart?.items || []);
  }, []);

  const togglePointUsage = (id: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, payByPoints: !i.payByPoints } : i,
      ),
    );
  };

  /* 🧮 TÍNH TỔNG */
  const { totalMoney, totalPoints } = useMemo(() => {
    let money = 0;
    let points = 0;

    items.forEach((i) => {
      if (i.payByPoints) {
        points += i.product.pointValue * i.quantity;
      } else {
        money += i.product.currentPrice * i.quantity;
      }
    });

    return { totalMoney: money, totalPoints: points };
  }, [items]);

  return (
    <div className="min-h-screen bg-white px-[5vw] py-[4vw] space-y-4">
      <h1 className="text-xl font-bold">Giỏ hàng của bạn</h1>

      {/* LIST */}
      <div className="space-y-3">
        {items.map((item) => {
          const canUsePoints = item.product.tags.includes("POINT_EXCHANGABLE");

          return (
            <Card key={item.id} className="rounded-xl shadow-sm">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{item.product.productName}</p>
                    <p className="text-sm text-gray-400">SL: {item.quantity}</p>
                  </div>

                  {/* GIÁ */}
                  <div className="text-right">
                    {item.payByPoints ? (
                      <p className="font-bold text-gas-orange-600">
                        {item.product.pointValue} ⭐
                      </p>
                    ) : (
                      <p className="font-bold">
                        {item.product.currentPrice.toLocaleString()}đ
                      </p>
                    )}
                  </div>
                </div>

                {/* SWITCH DÙNG ĐIỂM */}
                {canUsePoints && (
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm">Dùng điểm</span>
                    <Switch
                      checked={item.payByPoints}
                      onCheckedChange={() => togglePointUsage(item.id)}
                    />
                  </div>
                )}

                {item.type === "PROMO_BONUS" && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    Quà tặng kèm
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* TỔNG */}
      <Card className="rounded-2xl shadow-md border-2 border-black/5">
        <CardContent className="p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tổng tiền</span>
            <span className="font-bold">{totalMoney.toLocaleString()}đ</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Tổng điểm dùng</span>
            <span className="font-bold text-gas-orange-600">
              {totalPoints} ⭐
            </span>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t">
            <span>Điểm hiện có</span>
            <span>{userPoints} ⭐</span>
          </div>
        </CardContent>
      </Card>

      {/* BUTTON THANH TOÁN */}
      <button className="w-full py-4 rounded-2xl bg-gas-green-600 text-white font-bold text-lg mt-2">
        Xác nhận đặt hàng
      </button>
    </div>
  );
}

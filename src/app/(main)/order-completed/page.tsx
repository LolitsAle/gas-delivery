"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gas-green-50 flex flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <div className="mb-6">
        <CheckCircle className="w-20 h-20 text-green-600" />
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold mb-2 text-gas-green-600">
        Đặt hàng thành công 🎉
      </h1>

      {/* Description */}
      <p className="text-sm mb-8 text-gas-orange-700">
        Đơn hàng của bạn đã được ghi nhận. Nhân viên sẽ liên hệ xác nhận trong
        thời gian sớm nhất.
      </p>

      {/* Actions */}
      <div className="w-full space-y-3 flex gap-[2vw] justify-center items-center">
        <Button
          className="mb-0 bg-gas-orange-300"
          onClick={() => router.push("/orders")}
        >
          Xem đơn hàng
        </Button>

        <Button className="bg-gas-green-700" onClick={() => router.push("/")}>
          Về trang chủ
        </Button>
      </div>
    </div>
  );
}

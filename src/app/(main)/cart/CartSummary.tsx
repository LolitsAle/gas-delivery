"use client";

import { useState } from "react";
import { CircleArrowDown, PackageCheck } from "lucide-react";

type CartSummaryProps = {
  userPoints: number;
  totalMoney: number;
  totalPointsUse: number;
  totalPointsEarn: number;
  discountCash: number;
  notEnoughPoints: boolean;
};

export default function CartSummary({
  userPoints,
  totalMoney,
  totalPointsUse,
  totalPointsEarn,
  discountCash,
  notEnoughPoints,
}: CartSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full flex px-[5vw] py-[3vw]">
      <div className="w-full bg-gas-green-600 rounded-sm p-[2vw] flex items-start gap-[2vw]">
        {/* Confirm button */}
        <button className="shrink-0 w-[25vw] h-[25vw] bg-gas-orange-400 rounded-sm flex flex-col gap-[1vw] justify-center items-center font-bold text-white active:bg-gas-orange-600">
          <PackageCheck />
          <span className="text-[4.1vw]">Xác nhận đặt hàng</span>
        </button>

        <div className="text-black w-full text-sm flex flex-col gap-[2vw] h-full">
          <div className="ml-auto w-fit bg-gas-orange-100 rounded-md px-[1vw] py-[0.5vw] shrink-0">
            <span>Điểm hiện có: </span>
            <span className="text-gas-orange-700 font-semibold">
              ⭐{userPoints}
            </span>
          </div>
          <div className="relative bg-white flex flex-col p-[2vw] rounded-sm h-full">
            <div className="flex justify-between items-center w-full">
              Tổng giá <strong>{totalMoney.toLocaleString()}đ</strong>
            </div>
            <div
              className={`flex justify-between items-center w-full transition-all duration-300 pb-[2vw] ${
                expanded ? "border-b border-green-600" : ""
              }`}
            >
              <div>Điểm dùng</div>
              <div className="text-gas-orange-700 font-semibold flex items-center gap-2">
                {notEnoughPoints && (
                  <div className="text-[3vw] text-white bg-red-500 rounded-sm px-[1vw] py-[0.3vw]">
                    Không đủ
                  </div>
                )}
                <span>⭐{totalPointsUse}</span>
              </div>
            </div>
            <div
              className={`overflow-hidden transition-all duration-500 ${
                expanded ? "max-h-75 opacity-100 mt-[2vw]" : "max-h-0 opacity-0"
              }`}
            >
              <div className="flex justify-between items-center text-sm">
                <span>Giảm giá</span>
                <span className="text-green-600">
                  -{discountCash.toLocaleString()}đ
                </span>
              </div>

              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Điểm nhận</span>
                <span>+⭐{totalPointsEarn}</span>
              </div>
            </div>
            {/* Toggle button */}
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="absolute bottom-0 left-1/2 translate-y-1/2 -translate-x-1/2 text-white bg-gas-green-600 p-[1vw] rounded-full"
            >
              <CircleArrowDown
                className={`transition-transform duration-300 ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import SplashScreen from "@/components/main/SplashScreen";
import {
  House,
  Minus,
  PackageCheck,
  Plus,
  Receipt,
  RotateCw,
  Store,
  User,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [gasQuantity, setGasQuantity] = useState(1);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  const onGasQuantityChange = (value: number) => {
    setGasQuantity(value);
  };
  const onGasQuantityIncrease = () => {
    if (gasQuantity < 10) {
      setGasQuantity(gasQuantity + 1);
    }
  };
  const onGasQuantityDecrease = () => {
    if (gasQuantity > 0) {
      setGasQuantity(gasQuantity - 1);
    }
  };
  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className="relative w-screen h-screen bg-[#2B2D31] pt-[2vw] text-[3vw] select-none text-white">
      {/* carousel banner */}
      {/* <div className="h-[28vw] m-auto mt-[1vh] w-[90vw] rounded-2xl bg-white"></div> */}

      {/* order button */}
      <div className="mt-[4vw] flex justify-end items-center w-full pr-[3vw]">
        {" "}
      </div>
      <div className="mt-[1vw] w-screen flex">
        <div className="basis-[40%] flex justify-center items-center z-20">
          <button className="h-[25vw] aspect-square rounded-full text-white cursor-pointer outline-4 outline-none shadow-2xl">
            <span
              className="block h-[25vw] aspect-square rounded-full 
               bg-[radial-gradient(circle_at_center,#FF9900,#FF9900,#FF9900)]
               active:bg-[radial-gradient(circle_at_center,#E47911,#E47911,#E47911)]"
            >
              <div className="flex flex-col gap-[1vw] justify-center items-center h-full w-full font-bold">
                <PackageCheck />
                Đặt Ngay
              </div>
            </span>
          </button>
        </div>
        <div className="relative z-0 h-[29vw] flex-1 flex w-[60%] flex-col border-none border-2 bg-[#232428] -ml-[20.5vw] mr-[5vw] pl-[15vw] py-[2vw] rounded-tr-3xl rounded-br-3xl">
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-[#232428] h-[29vw] w-[29vw] rounded-full aspect-square"></div>
          <div className="w-full mx-[2vw]">
            <div className="flex justify-start items-center mt-[1vw] w-full">
              <h2 className="w-[70%] overflow-hidden overflow-ellipsis text-nowrap text-white font-bold text-[4vw] flex items-center gap-[2vw]">
                Saigon Petro{" "}
                <div className="p-[1vw] rounded-sm bg-white">
                  <RotateCw size="4vw" className="text-black cursor-pointer" />
                </div>
              </h2>
              <div className="w-[30%]">
                <div className="w-full flex justify-center items-center pr-[4vw]">
                  <div className="cursor-pointer">
                    <Minus
                      size="3vw"
                      className="text-white"
                      onClick={onGasQuantityDecrease}
                    />
                  </div>
                  <input
                    className="no-spinner w-[5vw] focus:outline-none focus:ring-0 text-center appearance-text text-white"
                    type="number"
                    value={gasQuantity}
                    onChange={(e) =>
                      onGasQuantityChange(parseInt(e.target.value))
                    }
                  />
                  <div className="cursor-pointer">
                    <Plus
                      size="3vw"
                      className="text-white"
                      onClick={onGasQuantityIncrease}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-gray-800">
              {/* Main discounted price */}
              <div className="flex items-end gap-2">
                <div className="flex flex-col">
                  <span className="line-through text-gray-400 text-[2vw]">
                    {formatVND(350000)}
                  </span>
                  <span className="text-[3vw] font-bold text-green-600">
                    {formatVND(320000)}
                  </span>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-md">
                  -{10}k
                </span>
              </div>
            </div>
            <div className="flex gap-[2vw] my-[3vw]">
              <span className="text-white">Quà khuyến mãi</span>
              <div className="h-[5vw] bg-white rounded-md px-[2vw] cursor-pointer text-black">
                nước rửa chén NET
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* services */}
      {/* <div className="">
        <h3>dịch vụ</h3>
        <div>Sửa bếp</div>
        <div>Sửa máy lọc nước</div>
        <div>phụ tùng bếp</div>
        <div>giao kèm</div>
      </div> */}

      {/* nav bar */}
      <div className="fixed bottom-[4vw] left-1/2 -translate-x-1/2 w-[90vw] flex flex-row bg-[#232428] h-[20vw] rounded-xl text-[3vw] text-white">
        <div className="flex-1 flex gap-2 flex-col justify-center items-center">
          <House size="4vw" className="text-white" />
          <span>Trang chủ</span>
        </div>
        <div className="flex-1 flex gap-2 flex-col justify-center items-center">
          <Receipt size="4vw" className="text-white" />
          <span>Đơn Hàng</span>
        </div>
        <div className="flex-1 flex gap-2 flex-col justify-center items-center">
          <Store size="4vw" className="text-white" />
          <span>Cửa Hàng</span>
        </div>
        <div className="flex-1 flex gap-2 flex-col justify-center items-center">
          <User size="4vw" className="text-white" />
          <span>Cá nhân</span>
        </div>
      </div>
    </div>
  );
}

import {
  Minus,
  PackageCheck,
  Plus,
  RotateCw,
  ShoppingBasket,
} from "lucide-react";
import React, { memo, useState } from "react";

interface Props {}

function OrderSection(props: Props) {
  const {} = props;
  const [gasQuantity, setGasQuantity] = useState(1);

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
    <>
      {/* Order section 2 */}
      <div className="flex justify-between gap-[2vw] items-center mx-[5vw]">
        <div className="bg-gas-orange-900 px-[2vw] py-[2vw] rounded-md flex justify-center items-center gap-[2vw] shadow-md">
          <strong>Bếp:</strong>
          <span>nhà chính</span>
          <div className="rounded-full w-[5vw] h-[5vw] bg-white flex justify-center items-center">
            <RotateCw size="3vw" className="text-red-500 cursor-pointer" />
          </div>
        </div>
        <div className="bg-blue-500 px-[2vw] py-[2vw] rounded-md flex justify-center items-center gap-[2vw] relative shadow-md">
          <ShoppingBasket size="5vw" />
          <div className="absolute top-1/2 left-1/2 z-10">
            <span className="flex items-end justify-center w-[3.5vw] h-[3.5vw] text-[2vw] rounded-full bg-red-600 text-white font-bold">
              1
            </span>
          </div>
        </div>
      </div>
      <div className="mt-[2vw] w-fill text-black mx-[5vw] bg-gas-green-600 rounded-2xl py-[2.5vw] pl-[2.5vw] shadow-md">
        <div className="flex w-full gap-[2vw]">
          <button className="w-[25vw] h-[25vw] bg-gas-orange-400 rounded-2xl flex flex-col gap-[1vw] justify-center items-center font-bold text-white active:bg-gas-orange-600">
            <PackageCheck />
            Đặt Ngay
          </button>

          <div className="h-[25vw] flex-1 ">
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
              <div className="flex items-end gap-2">
                <div className="flex flex-col">
                  <span className="line-through text-gray-200 text-[2vw]">
                    {formatVND(350000)}
                  </span>
                  <span className="text-[3vw] font-bold text-gas-orange-200">
                    {formatVND(320000)}
                  </span>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-md">
                  -{10}k
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(OrderSection);

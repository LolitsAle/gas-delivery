"use client";

import { PackageCheck, Pencil, ShoppingBasket } from "lucide-react";
import React, { memo, useMemo, useState } from "react";
import { StoveWithProducts } from "../context/CurrentUserContext";
import { useRouter } from "next/navigation";
import { Button } from "../admin/Commons";
import UserStoveDrawer from "./userInfo/StoveFormDrawer";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { useCurrentUser } from "../context/CurrentUserContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  dismissToast,
  showToastError,
  showToastLoading,
  showToastSuccess,
} from "@/lib/helper/toast";

function OrderSection() {
  const {
    currentUser: user,
    refreshUser,
    activeStove,
    activeStoveId,
    setActiveStoveId,
  } = useCurrentUser();

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);

  const handleOrderNow = async () => {
    if (!activeStove) return;
    if (!activeStove?.productId) {
      setOpen(true);
      return;
    }

    const loading = showToastLoading("Đang cập nhật giỏ hàng...");

    try {
      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          stoveId: activeStove.id,
          isStoveActive: true,
        },
      });

      await refreshUser();
      dismissToast(loading);
      showToastSuccess("Đã thêm gas từ bếp!");
      router.push("/cart");
    } catch (err) {
      dismissToast(loading);
      showToastError("Cập nhật thất bại!");
    }
  };

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const onCartClick = () => {
    router.push("/cart");
  };

  const handleStoveClick = () => {
    if (!user?.stoves || user.stoves.length <= 1) return;
    setOpenSwitchDialog(true);
  };

  const handleSwitchStove = (stoveId: string) => {
    setActiveStoveId(stoveId);
    setOpenSwitchDialog(false);
  };

  const calculatedPriceText = useMemo(() => {
    if (!activeStove?.defaultProductQuantity || !activeStove?.product)
      return null;

    if (activeStove.defaultProductQuantity === 1) {
      return formatVND(activeStove.product.currentPrice);
    }

    return (
      <div className="flex justify-start items-end gap-[2vw]">
        <span className="text-[4vw]">
          {formatVND(
            activeStove.product.currentPrice *
              activeStove.defaultProductQuantity,
          )}
        </span>
        <span className="block text-[2.8vw] font-normal">
          {formatVND(activeStove.product.currentPrice)} x
          {activeStove.defaultProductQuantity}
        </span>
      </div>
    );
  }, [activeStove]);

  const renderPromo = () => {
    if (!activeStove?.defaultPromoChoice) return null;

    switch (activeStove.defaultPromoChoice) {
      case "DISCOUNT_CASH":
        return (
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-md">
            💸 Giảm tiền mặt
          </span>
        );

      case "BONUS_POINT":
        return (
          <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-md">
            ⭐ Cộng điểm thưởng
          </span>
        );

      case "GIFT_PRODUCT":
        return (
          <div className=" bg-green-50 rounded-lg p-[1vw]">
            <div className="border-l border-gray-200 pl-3">
              <div className="text-[3.5vw] text-black font-semibold">
                Sản phẩm tặng kèm
              </div>
              {activeStove.promoProduct && (
                <div className="flex justify-between mt-[0.5vw] gap-[3vw] text-[3vw] text-gray-700 px-[3vw]">
                  <span className="text-nowrap overflow-hidden text-ellipsis flex-1 w-10">
                    🎁{activeStove.promoProduct.productName}
                  </span>
                  <span className="shrink-0">
                    x{activeStove.defaultProductQuantity}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const cartCount = activeStove?.cart?.items?.length ?? 0;

  return (
    <>
      <div className="flex justify-between gap-[2vw] items-center mx-[5vw]">
        <div
          onClick={handleStoveClick}
          className={`bg-gas-orange-900 px-[3vw] py-[2vw] rounded-md flex justify-center items-center gap-[2vw] shadow-md ${
            user?.stoves?.length && user?.stoves?.length > 1
              ? "cursor-pointer active:scale-95"
              : ""
          }`}
        >
          <strong className="text-white">Bếp:</strong>
          <span className="text-white font-semibold">
            {activeStove?.name ?? "Chưa chọn bếp"}
          </span>
        </div>

        <div
          onClick={onCartClick}
          className="bg-blue-500 px-[2vw] py-[2vw] rounded-md flex justify-center items-center gap-[2vw] relative shadow-md"
        >
          <ShoppingBasket size="5vw" />
          <div className="absolute top-1/2 left-1/2 z-10">
            <span className="flex items-end justify-center w-[3.5vw] h-[3.5vw] text-[2vw] rounded-full bg-red-600 text-white font-bold">
              {cartCount}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-[2vw] w-fill text-black mx-[5vw] bg-gas-green-600 rounded-2xl py-[3vw] px-[3vw] shadow-md">
        <div className="flex w-full gap-[3vw]">
          <button
            onClick={handleOrderNow}
            className="w-[28vw] h-[28vw] bg-gas-orange-400 rounded-2xl flex flex-col gap-[1vw] justify-center items-center font-bold text-white active:bg-gas-orange-600 disabled:opacity-50"
          >
            <PackageCheck />
            Đặt Ngay
          </button>

          <div className="flex-1 flex flex-col gap-[1vw]">
            <div className="flex justify-between items-center">
              <h2 className="text-gas-orange-100 font-bold text-[4vw] flex items-center gap-[2vw]">
                {activeStove?.product?.productName ?? "Chưa cập nhật bếp"}
              </h2>

              <Button
                className="shadow rounded-lg bg-white p-[1.5vw]"
                size="icon"
                variant="ghost"
                onClick={() => setOpen(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-[3vw] font-bold text-white">
              {calculatedPriceText}
            </div>
            <div>{renderPromo()}</div>
          </div>
        </div>
      </div>

      <UserStoveDrawer
        open={open}
        onOpenChange={setOpen}
        stove={activeStove as StoveWithProducts}
      />

      <Dialog open={openSwitchDialog} onOpenChange={setOpenSwitchDialog}>
        <DialogContent className="w-[90vw] max-w-md rounded-2xl p-[5vw]">
          <DialogHeader>
            <DialogTitle>Chọn bếp</DialogTitle>
            <DialogDescription className="sr-only"></DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-[3vw] mt-[2vw]">
            {user?.stoves?.map((s) => {
              const isActive = s.id === activeStoveId;

              return (
                <div
                  key={s.id}
                  onClick={() => handleSwitchStove(s.id)}
                  className={`p-[3vw] rounded-lg border cursor-pointer active:scale-95 transition ${
                    isActive
                      ? "border-gas-green-600 bg-gas-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="font-semibold">{s.name}</div>
                  {s.address && (
                    <div className="text-xs text-gray-500">{s.address}</div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default memo(OrderSection);

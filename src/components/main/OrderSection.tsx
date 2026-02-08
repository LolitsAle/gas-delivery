"use client";

import { PackageCheck, Pencil, ShoppingBasket } from "lucide-react";
import React, { memo, useMemo, useState } from "react";
import {
  StoveWithProducts,
  UserInfoFullContext,
} from "../context/CurrentUserContext";
import { useRouter } from "next/navigation";
import { Button } from "../admin/Commons";
import UserStoveDrawer from "../userInfo/StoveFormDrawer";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { useCurrentUser } from "../context/CurrentUserContext";

interface Props {
  user: UserInfoFullContext | null;
}

function OrderSection(props: Props) {
  const { user } = props;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { refreshUser } = useCurrentUser();

  const boundStove = useMemo(() => {
    if (!user?.cart?.stoveId) return undefined;
    return user.stoves?.find((s) => s.id === user.cart?.stoveId);
  }, [user]);

  const handleOrderNow = async () => {
    if (!boundStove?.productId || !boundStove?.defaultProductQuantity) return;

    try {
      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          items: [
            {
              productId: boundStove.productId,
              quantity: boundStove.defaultProductQuantity,
              payByPoints: false,
              type: "NORMAL_PRODUCT",
            },
          ],
        },
      });

      await refreshUser();

      router.push("/cart");
    } catch (err) {
      console.error("Order now failed", err);
    }
  };

  const formatVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);

  const onCartClick = () => {
    router.push("cart");
  };

  const renderPromo = () => {
    if (!boundStove?.defaultPromoChoice) return null;

    switch (boundStove.defaultPromoChoice) {
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
          <div className="flex flex-col gap-1">
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-md w-fit">
              🎁 Tặng sản phẩm
            </span>
            {boundStove.promoProduct && (
              <span className="text-white text-[3vw]">
                {boundStove.promoProduct.productName}
              </span>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const calculatedPriceText = useMemo(() => {
    if (!boundStove?.defaultProductQuantity || !boundStove?.product)
      return null;
    else if (boundStove?.defaultProductQuantity === 1) {
      return formatVND(boundStove.product.currentPrice);
    }
    return (
      <>
        {formatVND(
          boundStove.product.currentPrice * boundStove.defaultProductQuantity,
        )}
        <span> Đơn giá: {formatVND(boundStove.product.currentPrice)}</span>
      </>
    );
  }, [boundStove]);

  return (
    <>
      {/* Stove info + cart */}
      <div className="flex justify-between gap-[2vw] items-center mx-[5vw]">
        <div className="bg-gas-orange-900 px-[3vw] py-[2vw] rounded-md flex justify-center items-center gap-[2vw] shadow-md">
          <strong className="text-white">Bếp:</strong>
          <span className="text-white font-semibold">
            {boundStove?.name ?? "Chưa chọn bếp"}
          </span>
        </div>

        <div
          onClick={onCartClick}
          className="bg-blue-500 px-[2vw] py-[2vw] rounded-md flex justify-center items-center gap-[2vw] relative shadow-md"
        >
          <ShoppingBasket size="5vw" />
          <div className="absolute top-1/2 left-1/2 z-10">
            <span className="flex items-end justify-center w-[3.5vw] h-[3.5vw] text-[2vw] rounded-full bg-red-600 text-white font-bold">
              {user?.cart?.items?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* ORDER BLOCK */}
      <div className="mt-[2vw] w-fill text-black mx-[5vw] bg-gas-green-600 rounded-2xl py-[3vw] px-[3vw] shadow-md">
        <div className="flex w-full gap-[3vw]">
          <button
            onClick={handleOrderNow}
            disabled={!boundStove?.productId}
            className="w-[25vw] h-[25vw] bg-gas-orange-400 rounded-2xl flex flex-col gap-[1vw] justify-center items-center font-bold text-white active:bg-gas-orange-600 disabled:opacity-50"
          >
            <PackageCheck />
            Đặt Ngay
          </button>
          <div className="flex-1 flex flex-col gap-[1vw]">
            {/* Product name */}
            <div className="flex justify-between items-center">
              <h2 className="text-white font-bold text-[4vw] flex items-center gap-[2vw]">
                {boundStove?.product?.productName ? (
                  <>
                    {boundStove?.product?.productName}
                    {boundStove?.defaultProductQuantity && (
                      <strong className="text-gas-orange-300">
                        x{boundStove.defaultProductQuantity}
                      </strong>
                    )}
                  </>
                ) : (
                  "chưa cập nhật bếp"
                )}
              </h2>
              <Button
                className="shadow rounded-lg bg-white p-[2vw]"
                size="icon"
                variant="ghost"
                onClick={() => setOpen(true)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-[3vw] font-bold text-gas-orange-200">
              {calculatedPriceText}
            </div>

            {/* Promo */}
            <div>{renderPromo()}</div>
          </div>
        </div>
      </div>

      <UserStoveDrawer
        open={open}
        onOpenChange={setOpen}
        stove={boundStove as StoveWithProducts}
      />
    </>
  );
}

export default memo(OrderSection);

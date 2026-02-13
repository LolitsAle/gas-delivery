// app/(main)/store/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import ProductImage from "./ProductImage";
import { apiFetchAuth, apiFetchPublic } from "@/lib/api/apiClient";
import { ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORIES_LIST_KEY, PRODUCTS_LIST_KEY } from "@/constants/constants";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useCurrentUser } from "@/components/context/CurrentUserContext";
import InfoBanner from "@/components/common/InfoBanner";

type Product = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  pointPrice: number;
  categoryId: string;
  categoryName: string;
  description: string;
  tags: string[];
};

type Category = {
  id: string;
  name: string;
  productCount: number;
};

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [modePoint, setModePoint] = useState(false);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const router = useRouter();
  const { currentUser, refreshUser, activeStoveId } = useCurrentUser();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const buyNow = async (product: Product) => {
    if (!activeStove) {
      router.push("/");
      return;
    }
    await setCartItemQuantity(product, quantity);
    router.push("/cart");
  };

  const activeStove = useMemo(() => {
    if (!currentUser || !activeStoveId) return null;
    return currentUser.stoves.find((s) => s.id === activeStoveId) ?? null;
  }, [currentUser, activeStoveId]);

  const openProductDrawer = (p: Product) => {
    setSelectedProduct(p);
    setOpenDrawer(true);

    const existing = activeStove?.cart?.items?.find(
      (i) =>
        i.productId === p.id &&
        i.payByPoints === modePoint &&
        i.type === (modePoint ? "POINT_EXCHANGE" : "NORMAL_PRODUCT"),
    );

    setQuantity(existing?.quantity ?? 1);
  };

  const setCartItemQuantity = async (product: Product, qty: number) => {
    if (!activeStove) return;

    try {
      await apiFetchAuth("/api/user/me/cart", {
        method: "PATCH",
        body: {
          stoveId: activeStove.id,
          items: [
            {
              productId: product.id,
              quantity: qty,
              payByPoints: modePoint,
              type: modePoint ? "POINT_EXCHANGE" : "NORMAL_PRODUCT",
            },
          ],
        },
      });

      await refreshUser();
    } catch (err) {
      console.error("Update cart failed", err);
    }
  };

  /* LOAD PRODUCTS */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const cached = localStorage.getItem(PRODUCTS_LIST_KEY);
        if (cached) {
          setAllProducts(JSON.parse(cached));
          setLoadingProducts(false);
        }
        //  ?excludeBindable=true
        const data = await apiFetchPublic("/api/products");
        console.log("data", data);
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.productName,
          image: p.previewImageUrl,
          price: p.currentPrice,
          pointPrice: p.pointValue,
          categoryId: p.category?.id,
          categoryName: p.category?.name,
          description: p.description,
          tags: p.tags || [],
        }));
        setAllProducts(mapped);
        localStorage.setItem(PRODUCTS_LIST_KEY, JSON.stringify(mapped));
      } catch (err) {
        console.error("Load products failed", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  /* LOAD CATEGORIES */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cached = localStorage.getItem(CATEGORIES_LIST_KEY);
        if (cached) {
          setCategories(JSON.parse(cached));
        }
        const res = await apiFetchPublic(
          "/api/categories?excludeBindable=true",
          { method: "GET" },
        );

        setCategories(res);
        localStorage.setItem(CATEGORIES_LIST_KEY, JSON.stringify(res));
      } catch (err) {
        console.error("Load categories failed", err);
      }
    };

    loadCategories();
  }, []);

  const products = useMemo(() => {
    let list = [...allProducts];
    if (modePoint) {
      list = list.filter(
        (p) =>
          p.tags.includes("PROMO_ELIGIBLE") ||
          p.tags.includes("POINT_EXCHANGABLE"),
      );
    }
    if (category !== "all") {
      list = list.filter((p) => p.categoryId === category);
    }
    if (sort !== "default") {
      list.sort((a, b) => {
        const aPrice = modePoint ? a.pointPrice : a.price;
        const bPrice = modePoint ? b.pointPrice : b.price;
        return sort === "asc" ? aPrice - bPrice : bPrice - aPrice;
      });
    }
    return list;
  }, [allProducts, category, sort, modePoint]);

  const ui = modePoint
    ? {
        primary: "bg-gas-orange-600",
        soft: "bg-gas-orange-100",
        text: "text-gas-orange-700",
        border: "border-gas-orange-300",
      }
    : {
        primary: "bg-gas-green-600",
        soft: "bg-gas-green-100",
        text: "text-gas-green-700",
        border: "border-gas-green-300",
      };

  return (
    <div className={`min-h-screen h-screen flex flex-col bg-white ${ui.text}`}>
      <div
        className={`flex items-end justify-between py-[2.5vw] px-[5vw] shrink-0 ${ui.soft}`}
      >
        <div
          className={`flex justify-center items-center rounded-md bg-white ${ui.border}`}
        >
          <div
            className={`border-r px-[5vw] py-[2vw] text-center ${ui.border}`}
          >
            <p className="text-sm font-bold">Điểm của bạn</p>
            <p className="text-md font-bold">⭐ {currentUser?.points || 0}</p>
          </div>
          <div
            className="relative flex justify-center items-center p-[1vw] m-[2vw] rounded-full"
            onClick={() => router.push("/cart")}
          >
            <ShoppingBasket size={"6vw"} />
            <div className="absolute top-1/2 left-1/2 z-10">
              <div className="flex items-end justify-center w-[3.5vw] h-[3.5vw] text-[2vw] rounded-full bg-red-600 text-white font-bold">
                {activeStove?.cart?.items?.length || 0}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {modePoint ? <span>🎁 Đổi điểm</span> : <span>💵 Tiền mặt</span>}
          <Switch
            checked={modePoint}
            onCheckedChange={setModePoint}
            trackClassName={`${ui.primary}`}
            thumbClassName={`bg-white`}
          />
        </div>
      </div>
      <div
        className={`flex gap-2 overflow-x-auto px-[5vw] py-1 shrink-0 no-scrollbar ${ui.soft}`}
      >
        <button
          onClick={() => setCategory("all")}
          className={`px-3 py-1 rounded-md text-xs whitespace-nowrap border transition ${category === "all" ? `${ui.primary} text-white border-transparent` : `bg-white ${ui.text} ${ui.border}`}`}
        >
          Tất cả
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1 rounded-md text-xs whitespace-nowrap border transition ${category === c.id ? `${ui.primary} text-white border-transparent` : `bg-white ${ui.text} ${ui.border}`}`}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="px-[5vw] shrink-0 flex justify-baseline items-center gap-[2vw] my-[3vw]">
        <span>Sắp xếp theo:</span>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="border-none bg-white" size={"sm"}>
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent className={`${ui.text}`}>
            <SelectItem value="default">Mặc định</SelectItem>
            <SelectItem value="asc">Giá tăng</SelectItem>
            <SelectItem value="desc">Giá giảm</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex-1 overflow-auto px-[2vw] no-scrollbar">
        <div className="grid grid-cols-2 gap-2 mb-[30vw]">
          {loadingProducts ? (
            <p className="col-span-2 text-center text-sm">Đang tải...</p>
          ) : (
            products.map((p) => (
              <Card
                key={p.id}
                onClick={() => openProductDrawer(p)}
                className={`shadow-sm rounded-sm ${ui.border}`}
              >
                <CardContent className="p-0 space-y-1 rounded-sm">
                  <div className="relative w-full">
                    <ProductImage src={p.image || ""} alt={p.name} />
                  </div>

                  <div className="px-[2vw] py-[0.5vw] mb-[2vw]">
                    <p className="text-[4vw] font-medium line-clamp-2 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {p.name}
                    </p>
                    <div className="flex justify-between items-end">
                      <div className="flex-1">
                        <p className="text-xs font-bold text-gas-gray-400">
                          {modePoint
                            ? `${p.pointPrice} ⭐`
                            : `${p.price.toLocaleString()}đ`}
                        </p>

                        <Badge
                          className={`text-[10px] ${ui.soft} ${ui.text} border ${ui.border}`}
                        >
                          {p.categoryName}
                        </Badge>
                      </div>
                      <div
                        className={`${ui.soft} ${ui.text} p-1 rounded-md w-fit h-fit aspect-square`}
                      >
                        <ShoppingBasket />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="rounded-t-2xl max-h-[90vh] overflow-hidden">
          <div className="hidden">
            <DrawerTitle>Chi tiết sản phẩm</DrawerTitle>
          </div>
          {selectedProduct && (
            <div className="px-[5vw] pb-[6vw] space-y-4 mt-[5vw]">
              <div className="flex gap-4">
                <div className="w-[32vw] shrink-0">
                  <ProductImage
                    src={selectedProduct.image || ""}
                    alt={selectedProduct.name}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-bold leading-tight">
                    {selectedProduct.name}
                  </h2>
                  <p className={`text-xl font-extrabold ${ui.text}`}>
                    {modePoint
                      ? `${selectedProduct.pointPrice} ⭐`
                      : `${selectedProduct.price.toLocaleString()}đ`}
                  </p>
                  <Badge
                    className={`${ui.soft} ${ui.text} border ${ui.border}`}
                  >
                    {selectedProduct.categoryName}
                  </Badge>
                </div>
              </div>
              <p className="text-md text-gas-gray-700 leading-relaxed">
                {selectedProduct.description ||
                  "Sản phẩm chất lượng cao, dùng an toàn cho gia đình. Thiết kế phù hợp với nhu cầu sử dụng hằng ngày."}
              </p>
              {selectedProduct.tags.includes("BINDABLE") && (
                <InfoBanner type="warning">
                  <p>
                    Sản phẩm gas yêu cầu bạn phải sở hữu vỏ gas tương ứng để
                    đổi, giá từ <strong>250,000đ</strong> đến{" "}
                    <strong>270,000đ</strong> trên một vỏ.
                  </p>
                  <p>
                    Nếu bạn chưa có vỏ gas, vui lòng thông báo cho nhân viên khi
                    xác nhận đơn.
                  </p>
                </InfoBanner>
              )}
              <div className="flex justify-baseline items-center gap-[4vw]">
                <div className="flex items-center justify-baseline gap-[2vw] border rounded-xl px-4 py-2">
                  <span className="text-sm font-medium">Số lượng</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                      className="w-6 h-6 rounded-full border text-md flex justify-center items-center"
                    >
                      −
                    </button>
                    <span className="text-md font-bold w-6 text-center flex justify-center items-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-6 h-6 rounded-full border text-md flex justify-center items-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                {selectedProduct && quantity > 0 && (
                  <div
                    className={`rounded-xl px-4 py-3 border ${ui.border} ${ui.soft}`}
                  >
                    <div className="flex justify-between text-sm">
                      <span className="font-bold">
                        {modePoint
                          ? `${selectedProduct.pointPrice * quantity} ⭐`
                          : `${(selectedProduct.price * quantity).toLocaleString()}đ`}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {(() => {
                const existing = activeStove?.cart?.items?.find(
                  (i) =>
                    i.productId === selectedProduct.id &&
                    i.payByPoints === modePoint &&
                    i.type ===
                      (modePoint ? "POINT_EXCHANGE" : "NORMAL_PRODUCT"),
                );
                if (!existing) return null;
                return (
                  <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    Sản phẩm đã có trong giỏ: <b>{existing.quantity}</b>
                  </div>
                );
              })()}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() =>
                    selectedProduct &&
                    setCartItemQuantity(selectedProduct, quantity)
                  }
                  className={`flex-2 py-3 rounded-xl font-semibold text-white ${ui.primary}`}
                >
                  {quantity === 0 ? "Xóa khỏi giỏ" : "Thêm vào giỏ"}
                </button>
                <button
                  onClick={() => selectedProduct && buyNow(selectedProduct)}
                  className="flex-2 py-3 rounded-xl font-semibold bg-blue-400 text-white"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

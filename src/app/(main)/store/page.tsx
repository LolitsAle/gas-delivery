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
import { apiFetchPublic } from "@/lib/api/apiClient";
import { ShoppingBasket } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORIES_LIST_KEY, PRODUCTS_LIST_KEY } from "@/constants/constants";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";

type Product = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  pointPrice: number;
  categoryId: string;
  categoryName: string;
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
  const [currentUser, setCurrentUser] = useState<any>();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const router = useRouter();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openDrawer, setOpenDrawer] = useState(false);

  const openProductDrawer = (p: Product) => {
    setSelectedProduct(p);
    setOpenDrawer(true);
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
        const data = await apiFetchPublic("/api/products");
        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.productName,
          image: p.previewImageUrl,
          price: p.currentPrice,
          pointPrice: p.pointValue,
          categoryId: p.category?.id,
          categoryName: p.category?.name,
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
        const res = await apiFetchPublic("/api/categories", { method: "GET" });

        setCategories(res);
        localStorage.setItem(CATEGORIES_LIST_KEY, JSON.stringify(res));
      } catch (err) {
        console.error("Load categories failed", err);
      }
    };

    loadCategories();
  }, []);

  /* LOAD USER */
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) setCurrentUser(JSON.parse(user));
    else router.push("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 🔥 FILTER + SORT LOGIC */
  const products = useMemo(() => {
    let list = [...allProducts];

    // 🎁 MODE ĐIỂM → chỉ lấy sản phẩm PROMO_ELIGIBLE
    if (modePoint) {
      list = list.filter((p) => p.tags.includes("PROMO_ELIGIBLE"));
    }

    // 📂 FILTER CATEGORY
    if (category !== "all") {
      list = list.filter((p) => p.categoryId === category);
    }

    // 💰 SORT
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
      {/* HEADER */}
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
                {currentUser?.cart?.items?.length || 0}
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

      {/* 🔥 CATEGORY TABS */}
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

      {/* SORT */}
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

      {/* PRODUCT GRID */}
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
        <DrawerContent className="rounded-t-2xl ">
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
              <p className="text-sm text-gas-gray-500 leading-relaxed">
                Sản phẩm chất lượng cao, dùng an toàn cho gia đình. Thiết kế phù
                hợp với nhu cầu sử dụng hằng ngày.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  className={`flex-2 py-3 rounded-xl font-semibold text-white ${ui.primary} active:scale-95 transition`}
                >
                  Thêm giỏ
                </button>
                <button className="flex-2 py-3 rounded-xl font-semibold border border-black/10 bg-blue-400 text-white active:scale-95 transition">
                  Mua ngay
                </button>
                <button
                  onClick={() => setOpenDrawer(false)}
                  className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-gray-200 active:scale-95 transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

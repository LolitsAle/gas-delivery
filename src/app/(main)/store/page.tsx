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

type Product = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  pointPrice: number;
  categoryId: string;
  categoryName: string;
};

type Category = {
  id: string;
  name: string;
  productCount: number;
};

export default function ShopPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [modePoint, setModePoint] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>();
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("asc");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await apiFetchPublic("/api/products"); // đúng route của bạn

        if (!Array.isArray(data)) return;

        const mapped: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.productName,
          image: p.previewImageUrl,
          price: p.currentPrice,
          pointPrice: p.pointValue,
          categoryId: p.category?.id,
          categoryName: p.category?.name,
        }));

        setAllProducts(mapped);
      } catch (e) {
        console.error("Load products failed", e);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Load categories failed", e);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  /* Load user points */
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      setCurrentUser(user);
    }
  }, []);

  /* Filter + Sort */
  const products = useMemo(() => {
    let list = [...allProducts];

    // 📂 filter category
    if (category !== "all") {
      list = list.filter((p) => p.categoryId === category);
    }

    // 💰 sort price
    list.sort((a, b) => {
      const aPrice = modePoint ? a.pointPrice : a.price;
      const bPrice = modePoint ? b.pointPrice : b.price;
      return sort === "asc" ? aPrice - bPrice : bPrice - aPrice;
    });

    return list;
  }, [allProducts, category, sort, modePoint]);

  const theme = modePoint
    ? "bg-purple-50 text-purple-700"
    : "bg-orange-50 text-orange-700";

  return (
    <div
      className={`min-h-screen h-screen space-y-4 ${theme} overflow-hidden flex flex-col`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between shrink-0 px-[5vw] py-[2vh]">
        <div>
          <p className="text-sm text-muted-foreground">Điểm của bạn</p>
          <p className="text-xl font-bold">⭐ {currentUser?.points || 0}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs">💵</span>
          <Switch checked={modePoint} onCheckedChange={setModePoint} />
          <span className="text-xs">🎁</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 shrink-0">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>

            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.productCount})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Giá tăng</SelectItem>
            <SelectItem value="desc">Giá giảm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* PRODUCT GRID */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-3 gap-2 mb-[30vw]">
          {loadingProducts ? (
            <p className="col-span-3 text-center text-sm">
              Đang tải sản phẩm...
            </p>
          ) : (
            products.map((p) => {
              const price = modePoint
                ? `${p.pointPrice} ⭐`
                : `${p.price.toLocaleString()}đ`;

              return (
                <Card
                  key={p.id}
                  className="rounded-xl overflow-hidden shadow-sm"
                >
                  <CardContent className="p-2 space-y-1">
                    <div className="relative w-full h-20">
                      <ProductImage src={p.image || ""} alt={p.name} />
                    </div>

                    <p className="text-xs font-medium line-clamp-2">{p.name}</p>

                    <Badge variant="secondary" className="text-[10px]">
                      {p.categoryName}
                    </Badge>

                    <p className="text-xs font-bold">{price}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

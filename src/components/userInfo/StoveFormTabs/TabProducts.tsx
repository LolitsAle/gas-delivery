import { Stove, PromoChoiceType } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TabProducts({
  form,
  setForm,
  bindableProducts,
  promoProducts,
  loadingProducts,
}: any) {
  const isGift = form.defaultPromoChoice === "GIFT_PRODUCT";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Sản phẩm gas mặc định</Label>
          <Select
            value={form.productId ?? ""}
            onValueChange={(v) => setForm({ ...form, productId: v })}
            disabled={loadingProducts}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn sản phẩm" />
            </SelectTrigger>
            <SelectContent>
              {bindableProducts.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Số bình mặc định</Label>
          <Input
            type="number"
            min={1}
            value={form.defaultProductQuantity ?? 1}
            onChange={(e) =>
              setForm({ ...form, defaultProductQuantity: +e.target.value })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Lựa chọn khuyến mãi mặc định</Label>
        <Select
          value={form.defaultPromoChoice ?? ""}
          onValueChange={(v) =>
            setForm({ ...form, defaultPromoChoice: v as PromoChoiceType })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Không chọn" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DISCOUNT_CASH">Giảm tiền</SelectItem>
            <SelectItem value="BONUS_POINT">Tặng điểm</SelectItem>
            <SelectItem value="GIFT_PRODUCT">Quà hiện vật</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isGift && (
        <div className="space-y-2">
          <Label>Sản phẩm quà tặng</Label>
          <Select
            value={form.defaultPromoProductId ?? ""}
            onValueChange={(v) =>
              setForm({ ...form, defaultPromoProductId: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn quà" />
            </SelectTrigger>
            <SelectContent>
              {promoProducts.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

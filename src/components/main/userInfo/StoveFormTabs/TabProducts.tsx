import { PromoChoiceType } from "@prisma/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InfoBanner from "@/components/common/InfoBanner";

type Props = {
  form: any;
  setForm: (v: any) => void;
  bindableProducts: any[];
  promoProducts: any[];
  loadingProducts: boolean;
};

export default function TabProducts({
  form,
  setForm,
  bindableProducts,
  promoProducts,
  loadingProducts,
}: Props) {
  const isGift = form.defaultPromoChoice === "GIFT_PRODUCT";

  return (
    <div className="space-y-4">
      <InfoBanner type="warning">
        <p>
          Sản phẩm gas yêu cầu bạn phải sở hữu vỏ gas tương ứng để đổi, giá từ{" "}
          <strong>250,000đ</strong> đến <strong>270,000đ</strong> trên một vỏ.
        </p>
        <p>
          Nếu bạn chưa có vỏ gas, vui lòng thông báo cho nhân viên khi xác nhận
          đơn.
        </p>
      </InfoBanner>

      {/* Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        <div className="space-y-2 min-w-0">
          <Label>Sản phẩm gas mặc định</Label>
          <Select
            value={form.productId ?? ""}
            onValueChange={(v) => setForm({ ...form, productId: v })}
            disabled={loadingProducts}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn sản phẩm" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              {bindableProducts.map((p: any) => (
                <SelectItem key={p.id} value={p.id} className="truncate">
                  {p.productName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 min-w-0">
          <Label>Số bình mặc định</Label>
          <Input
            type="number"
            min={1}
            className="w-full"
            value={form.defaultProductQuantity ?? 1}
            onChange={(e) =>
              setForm({
                ...form,
                defaultProductQuantity: +e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
        <div className="space-y-2 min-w-0">
          <Label>Khuyến mãi mặc định</Label>
          <Select
            value={form.defaultPromoChoice ?? ""}
            onValueChange={(v) =>
              setForm({
                ...form,
                defaultPromoChoice: v as PromoChoiceType,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Không chọn" className="truncate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DISCOUNT_CASH">Giảm tiền</SelectItem>
              <SelectItem value="BONUS_POINT">Tặng điểm</SelectItem>
              <SelectItem value="GIFT_PRODUCT">Quà hiện vật</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isGift && (
          <div className="space-y-2 min-w-0">
            <Label>Sản phẩm quà tặng</Label>
            <Select
              value={form.defaultPromoProductId ?? ""}
              onValueChange={(v) =>
                setForm({
                  ...form,
                  defaultPromoProductId: v,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn quà" className="truncate" />
              </SelectTrigger>
              <SelectContent>
                {promoProducts.map((p: any) => (
                  <SelectItem key={p.id} value={p.id} className="truncate">
                    {p.productName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

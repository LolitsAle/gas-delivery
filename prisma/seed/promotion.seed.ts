import {
  PrismaClient,
  PromotionConditionType,
  PromotionActionType,
  ProductTag,
} from "@prisma/client";

export async function seedPromotions(prisma: PrismaClient) {
  const now = new Date();

  await prisma.promotion.upsert({
    where: { id: "Giảm 10k mỗi bình gas" },
    update: {},
    create: {
      id: "Giảm 10k mỗi bình gas",
      name: "Giảm 10k mỗi bình gas",
      description: "Tự động giảm 10.000đ cho mỗi sản phẩm gas",
      startAt: now,
      endAt: new Date("2099-12-31"),
      priority: 10,
      conditions: {
        create: [
          {
            type: PromotionConditionType.PRODUCT_TAG,
            value: ProductTag.BINDABLE,
          },
        ],
      },
      actions: {
        create: [
          {
            type: PromotionActionType.DISCOUNT_AMOUNT,
            value: 10_000,
          },
        ],
      },
    },
  });

  console.log("🎁 Promotions seeded");
}

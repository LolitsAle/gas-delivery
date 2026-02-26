import {
  PrismaClient,
  PromotionActionType,
  PromotionConditionType,
} from "@prisma/client";

export async function seedPromotions(prisma: PrismaClient) {
  const now = new Date();

  const promo1Start = new Date(now);
  const promo1End = new Date(now);
  promo1End.setMonth(promo1End.getMonth() + 3);

  const promo2Start = new Date(now);
  promo2Start.setMonth(promo2Start.getMonth() + 3);
  const promo2End = new Date(promo2Start);
  promo2End.setMonth(promo2End.getMonth() + 3);

  await prisma.promotion.deleteMany({});

  await prisma.promotion.create({
    data: {
      name: "Giảm 20.000đ cho gas bindable",
      description: "Áp dụng cho sản phẩm gas có tag BINDABLE",
      startAt: promo1Start,
      endAt: promo1End,
      isActive: true,
      priority: 20,
      conditions: {
        create: [
          {
            type: PromotionConditionType.PRODUCT_TAG,
            value: "BINDABLE",
          },
        ],
      },
      actions: {
        create: [
          {
            type: PromotionActionType.DISCOUNT_AMOUNT,
            value: 20000,
          },
        ],
      },
    },
  });

  await prisma.promotion.create({
    data: {
      name: "Giảm 10.000đ + 1.000 điểm cho gas bindable",
      description: "Áp dụng cho sản phẩm gas có tag BINDABLE",
      startAt: promo2Start,
      endAt: promo2End,
      isActive: true,
      priority: 10,
      conditions: {
        create: [
          {
            type: PromotionConditionType.PRODUCT_TAG,
            value: "BINDABLE",
          },
        ],
      },
      actions: {
        create: [
          {
            type: PromotionActionType.DISCOUNT_AMOUNT,
            value: 10000,
          },
          {
            type: PromotionActionType.BONUS_POINT,
            value: 1000,
          },
        ],
      },
    },
  });

  console.log("✅ Seeded promotions");
}

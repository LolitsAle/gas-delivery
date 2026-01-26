import {
  PrismaClient,
  PromotionConditionType,
  PromotionActionType,
} from "@prisma/client";

export async function seedPromotions(prisma: PrismaClient) {
  const now = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);

  // 🎁 PROMO 1 — Gas order eligible for gift
  await prisma.promotion.create({
    data: {
      name: "Gas Order – Choose Free Gift",
      description: "Order gas and select 1 promotional gift",
      startAt: now,
      endAt: nextYear,
      priority: 10,
      conditions: {
        create: [
          { type: PromotionConditionType.PRODUCT_TAG, value: "BINDABLE" },
        ],
      },
    },
  });

  // 💰 PROMO 2 — Giảm 10k
  await prisma.promotion.create({
    data: {
      name: "Gas Discount 10K",
      startAt: now,
      endAt: nextYear,
      priority: 9,
      conditions: {
        create: [
          { type: PromotionConditionType.PRODUCT_TAG, value: "BINDABLE" },
        ],
      },
      actions: {
        create: [
          {
            type: PromotionActionType.DISCOUNT_AMOUNT,
            value: 10000,
          },
        ],
      },
    },
  });

  // ⭐ PROMO 3 — +1000 điểm
  await prisma.promotion.create({
    data: {
      name: "Gas Bonus Points",
      startAt: now,
      endAt: nextYear,
      priority: 8,
      conditions: {
        create: [
          { type: PromotionConditionType.PRODUCT_TAG, value: "BINDABLE" },
        ],
      },
      actions: {
        create: [
          {
            type: PromotionActionType.BONUS_POINT,
            value: 1000,
          },
        ],
      },
    },
  });

  // 🚚 PROMO 4 — Free ship khi có tag FREE_SHIP
  await prisma.promotion.create({
    data: {
      name: "Free Shipping Campaign",
      startAt: now,
      endAt: nextYear,
      priority: 7,
      conditions: {
        create: [
          { type: PromotionConditionType.PRODUCT_TAG, value: "FREE_SHIP" },
        ],
      },
      actions: {
        create: [{ type: PromotionActionType.FREE_SHIP }],
      },
    },
  });

  // 🛒 PROMO 5 — Mua phụ kiện > 50k giảm 5%
  await prisma.promotion.create({
    data: {
      name: "Accessory Discount 5%",
      startAt: now,
      endAt: nextYear,
      priority: 5,
      conditions: {
        create: [{ type: PromotionConditionType.MIN_SUBTOTAL, value: "50000" }],
      },
      actions: {
        create: [
          {
            type: PromotionActionType.DISCOUNT_PERCENT,
            value: 5,
            maxDiscount: 20000,
          },
        ],
      },
    },
  });

  console.log("✅ Seeded promotions");
}

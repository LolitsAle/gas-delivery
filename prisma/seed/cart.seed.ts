import { PrismaClient, CartItemType, CartType } from "@prisma/client";

export async function seedCarts(prisma: PrismaClient) {
  const users = await prisma.user.findMany({ include: { stoves: true } });

  const gasProducts = await prisma.product.findMany({
    where: { tags: { has: "BINDABLE" } },
  });

  const giftProducts = await prisma.product.findMany({
    where: { tags: { has: "POINT_EXCHANGABLE" } },
  });

  const normalProducts = await prisma.product.findMany({
    where: {
      tags: { has: "POINT_EARNABLE" },
      NOT: { tags: { has: "BINDABLE" } },
    },
  });

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const stove = user.stoves[0];
    if (!stove) continue;

    const gas = gasProducts[i % gasProducts.length];
    const gift = giftProducts[i % giftProducts.length];
    const extra = normalProducts[i % normalProducts.length];

    await prisma.cart.create({
      data: {
        userId: user.id,
        stoveId: stove.id,
        type: i % 5 === 0 ? CartType.EXCHANGE : CartType.NORMAL,
        items: {
          create: [
            // 🔥 GAS (luôn có)
            {
              productId: gas.id,
              quantity: (i % 3) + 1, // 1–3 bình
              type: CartItemType.GAS,
            },

            // 🎁 PROMO BONUS (một số cart có)
            ...(i % 2 === 0
              ? [
                  {
                    productId: gift.id,
                    quantity: 1,
                    type: CartItemType.PROMO_BONUS,
                    earnPoints: false,
                  },
                ]
              : []),

            // 🧴 Mua thêm phụ kiện
            ...(i % 3 === 0
              ? [
                  {
                    productId: extra.id,
                    quantity: 1,
                    type: CartItemType.NORMAL_PRODUCT,
                  },
                ]
              : []),

            // ⭐ Đổi điểm
            ...(i % 4 === 0
              ? [
                  {
                    productId: giftProducts[(i + 2) % giftProducts.length].id,
                    quantity: 1,
                    type: CartItemType.POINT_EXCHANGE,
                    payByPoints: true,
                    earnPoints: false,
                  },
                ]
              : []),
          ],
        },
      },
    });
  }

  console.log("✅ Seeded diverse carts");
}

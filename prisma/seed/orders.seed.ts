import {
  PrismaClient,
  OrderItemType,
  OrderStatus,
  OrderType,
} from "@prisma/client";

export async function seedOrders(prisma: PrismaClient) {
  console.log("📦 Seeding Orders...");

  const users = await prisma.user.findMany({ where: { role: "USER" } });
  const stoves = await prisma.stove.findMany();
  const gasProducts = await prisma.product.findMany({
    where: { tags: { has: "BINDABLE" } },
  });
  const normalProducts = await prisma.product.findMany({
    where: { tags: { has: "PROMO_ELIGIBLE" } },
  });
  const giftProducts = await prisma.product.findMany({
    where: { tags: { has: "POINT_EXCHANGABLE" } },
  });
  const promotions = await prisma.promotion.findMany();
  const shippers = await prisma.user.findMany({ where: { role: "ADMIN" } });

  const calcSubtotal = (items: { quantity: number; unitPrice: number }[]) =>
    items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const stove = stoves[i % stoves.length];
    const gas = gasProducts[i % gasProducts.length];
    const normal = normalProducts[i % normalProducts.length];
    const gift = giftProducts[i % giftProducts.length];
    const shipper = shippers[i % shippers.length];

    // =========================
    // 1. COMPLETED ORDER
    // =========================
    {
      const items = [
        { product: gas, quantity: 1, unitPrice: gas.currentPrice },
        { product: normal, quantity: 2, unitPrice: normal.currentPrice },
      ];

      const subtotal = calcSubtotal(items);
      const discount = 10000;
      const shipFee = 15000;
      const total = subtotal - discount + shipFee;

      const order = await prisma.order.create({
        data: {
          userId: user.id,
          stoveId: stove.id,
          type: OrderType.NORMAL,
          subtotal,
          discountAmount: discount,
          shipFee,
          totalPrice: total,
          shipperId: shipper.id,
          status: OrderStatus.COMPLETED,
          confirmedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
          deliveredAt: new Date(Date.now() - 1000 * 60 * 60),
        },
      });

      await prisma.orderItem.createMany({
        data: items.map((it) => ({
          orderId: order.id,
          productId: it.product.id,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          type: OrderItemType.GAS,
        })),
      });
    }

    // =========================
    // 2. PROMO GIFT (parent-child)
    // =========================
    {
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          stoveId: stove.id,
          subtotal: gas.currentPrice,
          totalPrice: gas.currentPrice,
          status: OrderStatus.READY,
        },
      });

      const gasItem = await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: gas.id,
          quantity: 1,
          unitPrice: gas.currentPrice,
          type: OrderItemType.GAS,
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          parentItemId: gasItem.id,
          productId: gift.id,
          quantity: 1,
          unitPrice: 0,
          type: OrderItemType.PROMO_BONUS,
          earnPoints: false,
        },
      });

      if (promotions[0]) {
        await prisma.orderPromotion.create({
          data: {
            orderId: order.id,
            promotionId: promotions[0].id,
          },
        });
      }
    }

    // =========================
    // 3. POINT EXCHANGE
    // =========================
    {
      await prisma.order.create({
        data: {
          userId: user.id,
          stoveId: stove.id,
          type: OrderType.EXCHANGE,
          subtotal: gift.currentPrice,
          totalPrice: 0,
          status: OrderStatus.CONFIRMED,
          items: {
            create: {
              productId: gift.id,
              quantity: 1,
              unitPrice: gift.currentPrice,
              type: OrderItemType.POINT_EXCHANGE,
              payByPoints: true,
              earnPoints: false,
            },
          },
        },
      });
    }

    // =========================
    // 4. CANCELLED
    // =========================
    {
      await prisma.order.create({
        data: {
          userId: user.id,
          stoveId: stove.id,
          subtotal: gas.currentPrice,
          totalPrice: gas.currentPrice,
          status: OrderStatus.CANCELLED,
          cancelledReason: "Customer not reachable",
          items: {
            create: {
              productId: gas.id,
              quantity: 1,
              unitPrice: gas.currentPrice,
              type: OrderItemType.GAS,
            },
          },
        },
      });
    }
  }

  console.log("✅ Orders seeded");
}

// app/api/cart/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/withAuth";

/* ======================================================
   GET CART (AUTO CREATE)
====================================================== */
export const GET = withAuth(["USER"], async (req, { user }) => {
  const userId = user.id;

  // 1️⃣ Find active cart
  let cart = await prisma.cart.findFirst({
    where: {
      userId,
      isActive: true,
      type: "NORMAL",
    },
    include: {
      items: {
        include: {
          product: {
            include: { category: true },
          },
        },
      },
    },
  });

  // 2️⃣ Create cart if not exists
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        type: "NORMAL",
      },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
    });
  }

  // 3️⃣ Auto add GAS 12KG category product if user has stove
  const stove = await prisma.stove.findFirst({
    where: { userId },
  });

  if (stove) {
    // Check if cart already has ANY gas 12kg product
    const hasGas12kg = cart.items.some(
      (item) => item.product.category.name === "gas 12kg"
    );

    if (!hasGas12kg) {
      // Find one default gas 12kg product
      const defaultGas12kg = await prisma.product.findFirst({
        where: {
          category: {
            name: "gas 12kg",
          },
        },
        orderBy: {
          createdAt: "asc", // predictable default
        },
      });

      if (defaultGas12kg) {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: defaultGas12kg.id,
            quantity: 1,
          },
        });

        // Reload cart
        cart = await prisma.cart.findUnique({
          where: { id: cart.id },
          include: {
            items: {
              include: {
                product: {
                  include: { category: true },
                },
              },
            },
          },
        });
      }
    }
  }

  return NextResponse.json({ cart });
});

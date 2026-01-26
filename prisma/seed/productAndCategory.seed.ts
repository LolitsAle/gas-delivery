import { PrismaClient, ProductTag } from "@prisma/client";

export async function seedCategoriesAndProducts(prisma: PrismaClient) {
  console.log("🌱 Seeding Categories & Products...");

  /* =========================
     CATEGORY
  ========================= */

  const categories = await prisma.category.createMany({
    data: [
      { name: "Gas Bình", tags: [ProductTag.BINDABLE] },
      { name: "Quà khuyến mãi", tags: [ProductTag.PROMO_ELIGIBLE] },
      { name: "Hàng gia dụng", tags: [ProductTag.POINT_EARNABLE] },
      { name: "Đổi điểm", tags: [ProductTag.POINT_EXCHANGABLE] },
      { name: "Dịch vụ", tags: [] },
    ],
    skipDuplicates: true,
  });

  const categoryMap = Object.fromEntries(
    (await prisma.category.findMany()).map((c) => [c.name, c.id]),
  );

  /* =========================
     PRODUCTS
  ========================= */

  const products = [
    // ===== GAS (BINDABLE) =====
    {
      productName: "Gas Petrolimex 12kg",
      price: 450000,
    },
    {
      productName: "Gas VT-Gas 12kg",
      price: 440000,
    },
    {
      productName: "Gas Shell 12kg",
      price: 460000,
    },

    // ===== QUÀ KHUYẾN MÃI (đi kèm gas) =====
    {
      productName: "Nước rửa chén 750ml",
      price: 0,
    },
    {
      productName: "Chai dầu ăn 1L",
      price: 0,
    },
    {
      productName: "Đường gói 500g",
      price: 0,
    },

    // ===== HÀNG GIA DỤNG MUA THÊM =====
    {
      productName: "Van gas an toàn",
      price: 120000,
    },
    {
      productName: "Dây gas chống cháy",
      price: 90000,
    },

    // ===== ĐỔI ĐIỂM =====
    {
      productName: "Ly sứ cao cấp",
      price: 0,
      pointValue: 800,
    },
    {
      productName: "Bộ chén 4 cái",
      price: 0,
      pointValue: 1500,
    },
    {
      productName: "Bình nước giữ nhiệt",
      price: 0,
      pointValue: 2000,
    },

    // ===== DỊCH VỤ =====
    {
      productName: "Kiểm tra rò rỉ gas tại nhà",
      price: 50000,
    },
  ];

  for (const p of products) {
    let categoryName = "";
    let tags: ProductTag[] = [];

    // GAS
    if (p.productName.includes("Gas")) {
      categoryName = "Gas Bình";
      tags = [
        ProductTag.BINDABLE,
        ProductTag.PROMO_ELIGIBLE,
        ProductTag.POINT_EARNABLE,
      ];
    }
    // QUÀ KHUYẾN MÃI
    else if (
      p.productName.includes("rửa chén") ||
      p.productName.includes("dầu ăn") ||
      p.productName.includes("Đường")
    ) {
      categoryName = "Quà khuyến mãi";
      tags = [ProductTag.PROMO_ELIGIBLE, ProductTag.FREE_SHIP];
    }
    // ĐỔI ĐIỂM
    else if (p.pointValue) {
      categoryName = "Đổi điểm";
      tags = [ProductTag.POINT_EXCHANGABLE, ProductTag.FREE_SHIP];
    }
    // DỊCH VỤ
    else if (p.productName.includes("Kiểm tra")) {
      categoryName = "Dịch vụ";
      tags = [];
    }
    // GIA DỤNG
    else {
      categoryName = "Hàng gia dụng";
      tags = [ProductTag.POINT_EARNABLE];
    }

    await prisma.product.create({
      data: {
        productName: p.productName,
        currentPrice: p.price,
        pointValue: p.pointValue ?? 0,
        previewImageUrl: "https://dummyimage.com/300x300/cccccc/000000",
        categoryId: categoryMap[categoryName],
        tags,
      },
    });
  }

  console.log("✅ Seeded Categories & Products");
}

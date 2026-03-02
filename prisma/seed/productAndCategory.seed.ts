import { PrismaClient, ProductTag } from "@prisma/client";

export async function seedCategoriesAndProducts(prisma: PrismaClient) {
  console.log("🌱 Seeding Categories & Products...");

  /* =========================
     CATEGORY
  ========================= */

  const categories: Array<{
    id: string;
    name: string;
    tags: ProductTag[];
  }> = [
    {
      id: "6181f0e0-c92a-4cba-9ccf-a481864c3c2a",
      name: "Hàng tiêu dùng",
      tags: [],
    },
    {
      id: "677577ad-b73a-4ce2-88e7-aeda9b52bc5d",
      name: "Gas Bình",
      tags: [ProductTag.BINDABLE],
    },
    {
      id: "aa52109a-4bf6-4198-bc08-6c688aa51248",
      name: "Quà tặng kèm",
      tags: [],
    },
    {
      id: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      name: "Linh kiện gas",
      tags: [],
    },
    {
      id: "e924053d-26d6-47c4-866b-179d5200becd",
      name: "Gas 12kg",
      tags: [],
    },
  ];

  for (const c of categories) {
    // ✅ Không set createdAt/updatedAt → Prisma tự set now
    await prisma.category.upsert({
      where: { id: c.id },
      update: {
        name: c.name,
        tags: c.tags,
      },
      create: {
        id: c.id,
        name: c.name,
        tags: c.tags,
      },
    });
  }

  console.log(`✅ Categories: upserted ${categories.length}`);

  /* =========================
     PRODUCTS
  ========================= */

  const products: Array<{
    id: string;
    productName: string;
    currentPrice: number;
    pointValue: number;
    categoryId: string;
    tags: ProductTag[];
    previewImageUrl: string;
    description: string | undefined;
  }> = [
    {
      id: "1e8ecd27-9bfa-499d-9952-e618a8f7764c",
      productName: "Gas mini chất lượng cao",
      currentPrice: 20000,
      pointValue: 2000,
      categoryId: "6181f0e0-c92a-4cba-9ccf-a481864c3c2a",
      tags: [ProductTag.POINT_EXCHANGABLE],
      previewImageUrl: "products/new/821553b4-3cfe-450b-bf1c-b2b8eb11ab70.jpeg",
      description:
        "Gas mini dùng cho bếp du lịch, hàng chất lượng. Nếu dùng để đổi với lon gas mini nhỏ đã qua sử dụng sẽ được giảm 5 nghìn đồng.",
    },
    {
      id: "2842e4a3-36ed-45de-aa67-a0624e5f58e8",
      productName: "COMBO Dây và Van cho bếp công nghiệp - tiết kiệm 10k",
      currentPrice: 180000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [],
      previewImageUrl: "products/new/56ae5699-134f-478f-9a30-83b9947ac734.jpeg",
      description:
        "Combo dây và van an toàn cho các bếp có công suất lớn, đảm bảo an toản sử dụng.",
    },
    {
      id: "46450eb9-1999-467c-bac5-f0df23b099f8",
      productName: "COMBO Dây và Van gas tự động Namilux - tiết kiệm 10k",
      currentPrice: 150000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [],
      previewImageUrl: "products/new/c0ef354d-17ad-40cd-9cca-04ea2c20c05f.jpeg",
      description:
        "Combo linh kiện Van gas tự động và dây dẫn, hỗ trợ chụp cùng bình gas có sẵn, tiện lợi và an toàn.",
    },
    {
      id: "5c9d7634-7d3b-4ac5-8569-6e1c4356aaa1",
      productName: "Gas H đỏ",
      currentPrice: 350000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTag.BINDABLE,
        ProductTag.POINT_EARNABLE,
        ProductTag.FREE_SHIP,
      ],
      previewImageUrl:
        "products/5c9d7634-7d3b-4ac5-8569-6e1c4356aaa1/26e81472-4898-4eda-a871-8a3ca3a0ab24.jpeg",
      description:
        "Sản phẩm loại 2 van chụp gas H từ cty Hồng mộc gas. giá gas rẻ hơn so với bình gas loại 1. Có giao hàng tận nơi.",
    },
    {
      id: "6d6e926e-4929-4401-920d-bb07e2e96adf",
      productName: "Gas Gia Đình",
      currentPrice: 350000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTag.BINDABLE,
        ProductTag.POINT_EARNABLE,
        ProductTag.FREE_SHIP,
      ],
      previewImageUrl: "products/new/b193478e-200f-4f38-b3d5-b2309cb11bc4.jpeg",
      description:
        "Sản phẩm gas Gia đình, với chất lượng ổn cùng cty gia đình. Giá rẻ hơn so với sản phẩm chính hãng.",
    },
    {
      id: "7d6f0d7c-2b2f-4a58-8a0f-1b58f0ccf2a3",
      productName: "Gas Total 12kg",
      currentPrice: 460000,
      pointValue: 0,
      categoryId: "677577ad-b73a-4ce2-88e7-aeda9b52bc5d",
      tags: [
        ProductTag.BINDABLE,
        ProductTag.PROMO_ELIGIBLE,
        ProductTag.POINT_EARNABLE,
      ],
      previewImageUrl: "products/new/total-12kg.jpeg",
      description: undefined,
    },
    {
      id: "8e7f8c3e-3c6a-45fd-9f64-5d5f3b0b8f34",
      productName: "Gas SaiGon Petrol 12kg",
      currentPrice: 440000,
      pointValue: 0,
      categoryId: "677577ad-b73a-4ce2-88e7-aeda9b52bc5d",
      tags: [
        ProductTag.BINDABLE,
        ProductTag.PROMO_ELIGIBLE,
        ProductTag.POINT_EARNABLE,
      ],
      previewImageUrl: "products/new/saigonpetrol-12kg.jpeg",
      description: undefined,
    },
    {
      id: "9d7d6f3a-0fd3-4e4a-99df-0f10b8b2b2b0",
      productName: "Gas H 12kg",
      currentPrice: 450000,
      pointValue: 0,
      categoryId: "677577ad-b73a-4ce2-88e7-aeda9b52bc5d",
      tags: [
        ProductTag.BINDABLE,
        ProductTag.PROMO_ELIGIBLE,
        ProductTag.POINT_EARNABLE,
      ],
      previewImageUrl: "products/new/gas-h-12kg.jpeg",
      description: undefined,
    },
    {
      id: "a1f2b3c4-d5e6-47a8-9b10-11c12d13e14f",
      productName: "Nước rửa chén 750ml",
      currentPrice: 0,
      pointValue: 1000,
      categoryId: "aa52109a-4bf6-4198-bc08-6c688aa51248",
      tags: [ProductTag.PROMO_ELIGIBLE, ProductTag.FREE_SHIP],
      previewImageUrl: "products/new/nuoc-rua-chen-750ml.jpeg",
      description: undefined,
    },
    {
      id: "b2c3d4e5-f607-48a9-9011-121314151617",
      productName: "Chai dầu ăn 1L",
      currentPrice: 0,
      pointValue: 1000,
      categoryId: "aa52109a-4bf6-4198-bc08-6c688aa51248",
      tags: [ProductTag.PROMO_ELIGIBLE, ProductTag.FREE_SHIP],
      previewImageUrl: "products/new/dau-an-1l.jpeg",
      description: undefined,
    },
    {
      id: "c3d4e5f6-0718-49ba-0121-131415161718",
      productName: "Đường gói 500g",
      currentPrice: 0,
      pointValue: 1000,
      categoryId: "aa52109a-4bf6-4198-bc08-6c688aa51248",
      tags: [ProductTag.PROMO_ELIGIBLE, ProductTag.FREE_SHIP],
      previewImageUrl: "products/new/duong-500g.jpeg",
      description: undefined,
    },
    {
      id: "d4e5f607-1829-4acb-1231-141516171819",
      productName: "Dây gas chống cháy",
      currentPrice: 90000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [ProductTag.POINT_EARNABLE],
      previewImageUrl: "products/new/day-gas-chong-chay.jpeg",
      description: undefined,
    },
    {
      id: "e5f60718-293a-4bdc-2341-151617181920",
      productName: "Van gas an toàn",
      currentPrice: 120000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [ProductTag.POINT_EARNABLE],
      previewImageUrl: "products/new/van-gas-an-toan.jpeg",
      description: undefined,
    },
    {
      id: "f01a2b3c-4d5e-4f60-8123-456789abcdef",
      productName: "Ly sứ cao cấp",
      currentPrice: 0,
      pointValue: 800,
      categoryId: "6181f0e0-c92a-4cba-9ccf-a481864c3c2a",
      tags: [ProductTag.POINT_EXCHANGABLE, ProductTag.FREE_SHIP],
      previewImageUrl: "products/new/ly-su-cao-cap.jpeg",
      description: undefined,
    },
    {
      id: "f834490c-e939-4ff0-b3c8-69f043c47e37",
      productName: "Van cao áp BlueStar dùng cho bếp công nghiệp",
      currentPrice: 125000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [],
      previewImageUrl: "products/new/b0b32d78-7ea4-458e-ba73-6c7177a22df6.jpeg",
      description:
        "Van bếp cao áp chịu áp suất lớn của Gas bò khi có nhu cầu nấu nướng lớn. sản phẩm rất bền, dùng tới 3 năm.",
    },
  ];

  for (const p of products) {
    // ✅ Không set createdAt/updatedAt → Prisma tự set now + updatedAt tự bump khi update
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        productName: p.productName,
        currentPrice: p.currentPrice,
        pointValue: p.pointValue,
        categoryId: p.categoryId,
        tags: p.tags,
        previewImageUrl: p.previewImageUrl,
        description: p.description,
      },
      create: {
        id: p.id,
        productName: p.productName,
        currentPrice: p.currentPrice,
        pointValue: p.pointValue,
        categoryId: p.categoryId,
        tags: p.tags,
        previewImageUrl: p.previewImageUrl,
        description: p.description,
      },
    });
  }

  console.log(`✅ Products: upserted ${products.length}`);
  console.log("✅ Seeded Categories & Products");
}

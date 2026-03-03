// src/prisma/seeds/productAndCategorySeed.ts
import { PrismaClient } from "@prisma/client";
import type { ProductTag } from "@prisma/client";

type SeedCategory = {
  id: string;
  name: string;
  tags: ProductTag[];
};

type SeedProduct = {
  id: string;
  productName: string;
  currentPrice: number;
  pointValue: number;
  categoryId: string;
  tags: ProductTag[];
  previewImageUrl: string;
  description?: string;
};

export const ProductTagEnum = {
  BINDABLE: "BINDABLE",
  POINT_EARNABLE: "POINT_EARNABLE",
  POINT_EXCHANGABLE: "POINT_EXCHANGABLE",
  PROMO_ELIGIBLE: "PROMO_ELIGIBLE",
  FREE_SHIP: "FREE_SHIP",
} as const;

export async function seedCategoriesAndProducts(prisma: PrismaClient) {
  console.log("🌱 Seeding Categories & Products (UPSERT MODE)...");

  /* =========================
     CATEGORY (from Category.csv)
  ========================= */

  const categories: SeedCategory[] = [
    {
      id: "6181f0e0-c92a-4cba-9ccf-a481864c3c2a",
      name: "Hàng tiêu dùng",
      tags: [],
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

  console.log(`✅ Categories upserted: ${categories.length}`);

  /* =========================
     PRODUCTS (from Product.csv)
  ========================= */

  const products: SeedProduct[] = [
    {
      id: "1e8ecd27-9bfa-499d-9952-e618a8f7764c",
      productName: "Gas mini chất lượng cao",
      currentPrice: 20000,
      pointValue: 2000,
      categoryId: "6181f0e0-c92a-4cba-9ccf-a481864c3c2a",
      tags: [ProductTagEnum.POINT_EXCHANGABLE],
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
      previewImageUrl: "products/new/c0ef354d-17ad-40cd-9cca-04ea2c20c5f9.jpeg",
      description:
        "Combo linh kiện Van gas tự động và dây dẫn, hỗ trợ lắp đặt, tiết kiệm 10 nghìn đồng.",
    },
    {
      id: "5c9d7634-7d3b-4ac5-8569-6e1c4356aaa1",
      productName: "Gas H đỏ",
      currentPrice: 350000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTagEnum.BINDABLE,
        ProductTagEnum.POINT_EARNABLE,
        ProductTagEnum.FREE_SHIP,
      ],
      previewImageUrl:
        "products/5c9d7634-7d3b-4ac5-8569-6e1c4356aaa1/7a9418bb-80f1-4350-ae72-2f0c1d0275d4.jpeg",
      description:
        "Sản phẩm loại 2 van chụp gas H từ cty Hồng mộc, chất lượng tốt, dùng trung bình 1 tháng 10 ngày",
    },
    {
      id: "6d6e926e-4929-4401-920d-bb07e2e96adf",
      productName: "Gas Gia Đình 12Kg",
      currentPrice: 350000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTagEnum.BINDABLE,
        ProductTagEnum.POINT_EARNABLE,
        ProductTagEnum.FREE_SHIP,
      ],
      previewImageUrl: "products/new/b193478e-200f-4f38-b3d5-b2309cb11f94.jpeg",
      description:
        "Sản phẩm gas Gia đình, với chất lượng ổn cùng giá cả phải chăng, là lựa chọn cho nhiều gia đình.",
    },
    {
      id: "74f45376-e4ed-4c18-b238-b36c567f2717",
      productName: "Gas Total 12Kg",
      currentPrice: 400000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTagEnum.BINDABLE,
        ProductTagEnum.POINT_EARNABLE,
        ProductTagEnum.FREE_SHIP,
      ],
      previewImageUrl: "products/new/59154112-0ffb-47a4-84f3-177f43c1b070.jpeg",
      description:
        "Sản phẩm gas thuộc cty Total gas dùng phương pháp sản xuất của Pháp, độ tinh khiết cao, sử dụng lâu. thời gian sử dụng trung bình 1 tháng 25 ngày.",
    },
    {
      id: "766c8740-4ec5-4020-8c8f-e34c88732cb0",
      productName: "Gas H 12Kg",
      currentPrice: 350000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTagEnum.BINDABLE,
        ProductTagEnum.POINT_EARNABLE,
        ProductTagEnum.FREE_SHIP,
      ],
      previewImageUrl:
        "products/766c8740-4ec5-4020-8c8f-e34c88732cb0/ee631688-3bd3-4001-90a9-bc5e25a13938.jpeg",
      description:
        "H-GAS xám 12kg là sản phẩn của công ty gas Hồng Mộc. chất lượng tốt và an toàn, thời gian sử dụng trung bình là 1 tháng 10 ngày.",
    },
    {
      id: "8668c383-0eb1-4464-ab91-044688043f85",
      productName: "Đèn khò gia dụng 1.8 Namilux Chất lượng cao",
      currentPrice: 120000,
      pointValue: 12000,
      categoryId: "6181f0e0-c92a-4cba-9ccf-a481864c3c2a",
      tags: [ProductTagEnum.POINT_EXCHANGABLE],
      previewImageUrl: "products/new/4e60c49c-6efe-4358-b3bd-78d5349648d3.jpeg",
      description:
        "Sản phẩm đèn khò chất lượng dùng kết hợp với lon Gas mini, giúp khò gà, lợn phục vụ nấu ăn.",
    },
    {
      id: "9d1a40db-3f64-4454-9e4f-f789a3d144f0",
      productName: "Dây dẫn gas 5 sao dùng cho bếp công nghiệp",
      currentPrice: 65000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [],
      previewImageUrl: "products/new/bd7dd714-3418-46ff-a6e6-c1860eaeca69.jpeg",
      description:
        "Dây dẫn được thiết kế có lõi kim loại giúp chịu áp suất lớn, dùng kèm van công nghiệp giúp hạn chế rủi ro cháy nổ.",
    },
    {
      id: "b0f3f9e4-fc72-4773-9d11-7935d9eec7e8",
      productName: "Dây dẫn gas bếp gia đình chất lượng cao",
      currentPrice: 55000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [],
      previewImageUrl: "products/new/598f0672-96d4-4578-a878-bb5acde3983a.jpeg",
      description:
        "Dây dẫn gas bếp chất lượng cao, thời gian sử dụng lên đến 5 năm.",
    },
    {
      id: "ba76bb41-3d6d-49dd-a9a3-48cca1fa9274",
      productName: "Van gas tự động Namilux siêu bền",
      currentPrice: 105000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [],
      previewImageUrl: "products/new/0bcf7cdb-39a2-4d55-9272-375e0e5168ce.jpeg",
      description:
        "Van gas tự động ngắt khi xảy ra sự cố rò rỉ, an toàn. Thời gian sử dụng lên đến 5 năm.",
    },
    {
      id: "baf92d5c-af3a-4cfa-bdc6-879afe53efa2",
      productName: "Nước rửa chén Clean 400ml",
      currentPrice: 10000,
      pointValue: 1000,
      categoryId: "aa52109a-4bf6-4198-bc08-6c688aa51248",
      tags: [ProductTagEnum.POINT_EXCHANGABLE, ProductTagEnum.PROMO_ELIGIBLE],
      previewImageUrl: "products/new/89762d5d-f8b9-4173-84b5-10c5a86d3c3d.jpeg",
      description:
        "Sản phẩm nước rửa chén Clean, mùi nhẹ không hắc, đánh tan vết ố dễ dàng trên chén đĩa.",
    },
    {
      id: "c778fac1-f178-4422-99e4-80dec2eb21ba",
      productName: "Gas SP 12kg",
      currentPrice: 370000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTagEnum.BINDABLE,
        ProductTagEnum.POINT_EARNABLE,
        ProductTagEnum.FREE_SHIP,
      ],
      previewImageUrl:
        "products/c778fac1-f178-4422-99e4-80dec2eb21ba/5aafd96d-2cc8-4342-9a50-7314c68f2766.jpeg",
      description: "Gas Saigon Petro (GAS SP)...",
    },
    {
      id: "cc27deb3-3974-487c-bce5-2b6928c5daa6",
      productName: "Gas L đỏ",
      currentPrice: 450000,
      pointValue: 0,
      categoryId: "e924053d-26d6-47c4-866b-179d5200becd",
      tags: [
        ProductTagEnum.BINDABLE,
        ProductTagEnum.POINT_EARNABLE,
        ProductTagEnum.FREE_SHIP,
      ],
      previewImageUrl: "products/new/d14514c9-9a23-4ee3-95c0-67f21723078c.jpeg",
      description: "Gas L là sản phẩm gas chất lượng tốt của Nhật Bản...",
    },
    {
      id: "f834490c-e939-4ff0-b3c8-69f043c47e37",
      productName: "Van cao áp BlueStar dùng cho bếp công nghiệp",
      currentPrice: 125000,
      pointValue: 0,
      categoryId: "d5669da1-0c58-4156-bfc3-bf2ede71a190",
      tags: [],
      previewImageUrl: "products/new/b0b32d78-7ea4-458e-ba73-6c7177a22df6.jpeg",
      description: "Van bếp cao áp chịu áp suất lớn...",
    },
  ];

  for (const p of products) {
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

  console.log(`✅ Products upserted: ${products.length}`);
  console.log("✅ Seed completed (UPSERT MODE)");
}

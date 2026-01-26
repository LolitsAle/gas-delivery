import { PrismaClient, PromoChoiceType, Role } from "@prisma/client";
import bcrypt from "bcrypt";

export async function seedUsersAndStoves(prisma: PrismaClient) {
  const password = await bcrypt.hash("123456", 10);

  const usersData = [
    {
      name: "Nguyễn Văn An",
      nickname: "an.nguyen",
      phoneNumber: "0348480033",
      role: Role.ADMIN,
      points: 1200,
      address: "12 Lê Lợi, Q1",
      addressNote: "Hẻm 3m",
      isVerified: true,
      stoves: [
        {
          name: "Bếp Chính",
          address: "12 Lê Lợi, Q1",
          defaultProductQuantity: 2,
          defaultPromoChoice: PromoChoiceType.GIFT_PRODUCT,
        },
      ],
    },
    {
      name: "Trần Thị Bình",
      nickname: "binh.tran",
      phoneNumber: "0348480002",
      points: 300,
      address: "Chung cư The Sun",
      addressNote: "Tầng 10",
      stoves: [
        {
          name: "Bếp Chung Cư",
          address: "Block A - The Sun",
          defaultProductQuantity: 1,
          defaultPromoChoice: PromoChoiceType.DISCOUNT_CASH,
        },
      ],
    },
    {
      name: "Lê Minh Cường",
      nickname: "cuong.le",
      phoneNumber: "0348480003",
      points: 5600,
      address: "Bình Thạnh",
      stoves: [
        {
          name: "Bếp Gia Đình",
          address: "45 Nguyễn Xí",
          defaultProductQuantity: 2,
          defaultPromoChoice: PromoChoiceType.BONUS_POINT,
        },
      ],
    },
    {
      name: "Phạm Thảo",
      nickname: "thao.pham",
      phoneNumber: "0348480004",
      points: 80,
      address: "Gò Vấp",
      stoves: [
        {
          name: "Bếp Mini",
          address: "Chung cư mini",
          defaultProductQuantity: 1,
          defaultPromoChoice: PromoChoiceType.GIFT_PRODUCT,
        },
      ],
    },
    {
      name: "Đỗ Khánh",
      nickname: "khanh.do",
      phoneNumber: "0348480005",
      points: 2300,
      address: "Thủ Đức",
      stoves: [
        {
          name: "Bếp Nhà Trọ",
          address: "KTX Khu A",
          defaultProductQuantity: 1,
          defaultPromoChoice: PromoChoiceType.DISCOUNT_CASH,
        },
      ],
    },
    {
      name: "Vũ Hồng",
      nickname: "hong.vu",
      phoneNumber: "0348480006",
      points: 910,
      address: "Quận 7",
      stoves: [
        {
          name: "Bếp Lầu 2",
          address: "Nhà phố Q7",
          defaultProductQuantity: 2,
          defaultPromoChoice: PromoChoiceType.GIFT_PRODUCT,
        },
      ],
    },
    {
      name: "Mai Linh",
      nickname: "linh.mai",
      phoneNumber: "0348480007",
      points: 0,
      address: "Tân Phú",
      stoves: [
        {
          name: "Bếp Sinh Viên",
          address: "Trọ gần ĐH",
          defaultProductQuantity: 1,
          defaultPromoChoice: PromoChoiceType.BONUS_POINT,
        },
      ],
    },
    {
      name: "Hoàng Nam",
      nickname: "nam.hoang",
      phoneNumber: "0348480008",
      points: 1500,
      address: "Nhà Bè",
      stoves: [
        {
          name: "Bếp Gia Đình",
          address: "Hẻm xe hơi",
          defaultProductQuantity: 2,
          defaultPromoChoice: PromoChoiceType.DISCOUNT_CASH,
        },
      ],
    },
    {
      name: "Tú Anh",
      nickname: "anh.tu",
      phoneNumber: "0348480009",
      points: 760,
      address: "Quận 3",
      stoves: [
        {
          name: "Bếp Studio",
          address: "Căn hộ dịch vụ",
          defaultProductQuantity: 1,
          defaultPromoChoice: PromoChoiceType.GIFT_PRODUCT,
        },
      ],
    },
    {
      name: "Admin",
      nickname: "admin",
      phoneNumber: "0348480010",
      points: 0,
      address: "Head Office",
      role: Role.ADMIN,
      stoves: [],
    },
  ];

  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        name: u.name,
        nickname: u.nickname,
        phoneNumber: u.phoneNumber,
        passwordHash: password,
        points: u.points,
        address: u.address,
        addressNote: u.addressNote,
        role: u.role ?? Role.USER,
        isVerified: true,
      },
    });

    for (const s of u.stoves) {
      await prisma.stove.create({
        data: {
          name: s.name,
          address: s.address,
          userId: user.id,
          houseImage: [],
          houseImageCount: 0,
          defaultProductQuantity: s.defaultProductQuantity,
          defaultPromoChoice: s.defaultPromoChoice,
        },
      });
    }
  }

  console.log("✅ Seeded Users & Stoves");
}

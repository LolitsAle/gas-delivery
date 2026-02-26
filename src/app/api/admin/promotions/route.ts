import { NextResponse } from "next/server";
import {
  PromotionActionType,
  PromotionConditionType,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";

const validConditionTypes = Object.values(PromotionConditionType);
const validActionTypes = Object.values(PromotionActionType);

const mapPromotionInput = (body: any) => {
  const conditions = Array.isArray(body?.conditions) ? body.conditions : [];
  const actions = Array.isArray(body?.actions) ? body.actions : [];

  return {
    name: String(body?.name || "").trim(),
    description:
      typeof body?.description === "string" && body.description.trim()
        ? body.description.trim()
        : null,
    startAt: new Date(body?.startAt),
    endAt: new Date(body?.endAt),
    isActive: body?.isActive !== false,
    priority:
      typeof body?.priority === "number" ? body.priority : Number(body?.priority || 0),
    conditions: conditions
      .map((item: any) => ({
        type: item?.type,
        value:
          item?.value === undefined || item?.value === null || item?.value === ""
            ? null
            : String(item.value),
      }))
      .filter((item: any) => validConditionTypes.includes(item.type)),
    actions: actions
      .map((item: any) => ({
        type: item?.type,
        value:
          item?.value === undefined || item?.value === null || item?.value === ""
            ? null
            : Number(item.value),
        maxDiscount:
          item?.maxDiscount === undefined ||
          item?.maxDiscount === null ||
          item?.maxDiscount === ""
            ? null
            : Number(item.maxDiscount),
      }))
      .filter((item: any) => validActionTypes.includes(item.type)),
  };
};

const validatePromotionInput = (input: ReturnType<typeof mapPromotionInput>) => {
  if (!input.name) return "Tên khuyến mãi là bắt buộc";
  if (Number.isNaN(input.startAt.getTime()) || Number.isNaN(input.endAt.getTime())) {
    return "Ngày bắt đầu/kết thúc không hợp lệ";
  }
  if (input.startAt >= input.endAt) return "Ngày bắt đầu phải nhỏ hơn ngày kết thúc";
  if (!Number.isFinite(input.priority)) return "Độ ưu tiên không hợp lệ";
  return null;
};

const promotionInclude = {
  conditions: true,
  actions: true,
} satisfies Prisma.PromotionInclude;

export const GET = withAuth(["ADMIN"], async () => {
  const promotions = await prisma.promotion.findMany({
    include: promotionInclude,
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ promotions });
});

export const POST = withAuth(["ADMIN"], async (req) => {
  try {
    const body = await req.json();
    const input = mapPromotionInput(body);
    const validationError = validatePromotionInput(input);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        name: input.name,
        description: input.description,
        startAt: input.startAt,
        endAt: input.endAt,
        isActive: input.isActive,
        priority: input.priority,
        conditions: {
          create: input.conditions,
        },
        actions: {
          create: input.actions,
        },
      },
      include: promotionInclude,
    });

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});

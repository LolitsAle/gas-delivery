import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import {
  isPromotionActionType,
  isPromotionConditionType,
} from "@/lib/types/promotion";

type PromotionRequestBody = {
  name?: unknown;
  description?: unknown;
  startAt?: unknown;
  endAt?: unknown;
  isActive?: unknown;
  priority?: unknown;
  conditions?: Array<{ type?: unknown; value?: unknown }>;
  actions?: Array<{ type?: unknown; value?: unknown; maxDiscount?: unknown }>;
};

const toNullableString = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
};

const toNullableNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapPromotionInput = (body: PromotionRequestBody) => {
  const conditions = Array.isArray(body.conditions) ? body.conditions : [];
  const actions = Array.isArray(body.actions) ? body.actions : [];

  return {
    name: String(body.name || "").trim(),
    description:
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null,
    startAt: new Date(body.startAt as string),
    endAt: new Date(body.endAt as string),
    isActive: body.isActive !== false,
    priority:
      typeof body.priority === "number"
        ? body.priority
        : Number(body.priority || 0),
    conditions: conditions
      .map((item) => ({
        type: item?.type,
        value: toNullableString(item?.value),
      }))
      .filter(
        (
          item,
        ): item is {
          type: Prisma.PromotionConditionCreateWithoutPromotionInput["type"];
          value: string | null;
        } => isPromotionConditionType(item.type),
      ),
    actions: actions
      .map((item) => ({
        type: item?.type,
        value: toNullableNumber(item?.value),
        maxDiscount: toNullableNumber(item?.maxDiscount),
      }))
      .filter(
        (
          item,
        ): item is {
          type: Prisma.PromotionActionCreateWithoutPromotionInput["type"];
          value: number | null;
          maxDiscount: number | null;
        } => isPromotionActionType(item.type),
      ),
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
    const body = (await req.json()) as PromotionRequestBody;
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

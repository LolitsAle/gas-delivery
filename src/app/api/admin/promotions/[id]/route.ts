import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth/withAuth";
import {
  isPromotionActionType,
  isPromotionConditionType,
} from "@/lib/types/promotion";

type Params = {
  params: { id: string };
};

type InputScalar = string | number | boolean | null | undefined;

type PromotionConditionInput = {
  type?: string | null;
  value?: InputScalar;
};

type PromotionActionInput = {
  type?: string | null;
  value?: InputScalar;
  maxDiscount?: InputScalar;
};

type PromotionRequestBody = {
  name?: InputScalar;
  description?: InputScalar;
  startAt?: InputScalar;
  endAt?: InputScalar;
  isActive?: boolean;
  priority?: InputScalar;
  conditions?: PromotionConditionInput[];
  actions?: PromotionActionInput[];
};

const toNullableString = (value: InputScalar) => {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
};

const toNullableNumber = (value: InputScalar) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toDateValue = (value: InputScalar) =>
  typeof value === "string" || value instanceof Date ? new Date(value) : new Date("");

const mapPromotionInput = (body: PromotionRequestBody) => {
  const conditions = Array.isArray(body.conditions) ? body.conditions : [];
  const actions = Array.isArray(body.actions) ? body.actions : [];

  return {
    name: String(body.name || "").trim(),
    description:
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : null,
    startAt: toDateValue(body.startAt),
    endAt: toDateValue(body.endAt),
    isActive: body.isActive !== false,
    priority: Number(body.priority || 0),
    conditions: conditions
      .map((item) => ({
        type: item.type,
        value: toNullableString(item.value),
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
        type: item.type,
        value: toNullableNumber(item.value),
        maxDiscount: toNullableNumber(item.maxDiscount),
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

export const GET = withAuth(["ADMIN"], async (req, { params }) => {
  const { id } = params as Params["params"];

  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: promotionInclude,
  });

  if (!promotion) {
    return NextResponse.json(
      { message: "Promotion not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ promotion });
});

export const PUT = withAuth(["ADMIN"], async (req, { params }) => {
  try {
    const { id } = params as Params["params"];

    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Promotion not found" },
        { status: 404 },
      );
    }

    const body = (await req.json()) as PromotionRequestBody;
    const input = mapPromotionInput(body);
    const validationError = validatePromotionInput(input);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        startAt: input.startAt,
        endAt: input.endAt,
        isActive: input.isActive,
        priority: input.priority,
        conditions: {
          deleteMany: {},
          create: input.conditions,
        },
        actions: {
          deleteMany: {},
          create: input.actions,
        },
      },
      include: promotionInclude,
    });

    return NextResponse.json({ promotion });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(["ADMIN"], async (req, { params }) => {
  try {
    const { id } = params as Params["params"];

    const existing = await prisma.promotion.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { message: "Promotion not found" },
        { status: 404 },
      );
    }

    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});

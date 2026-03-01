import { withAuth } from "@/lib/auth/withAuth";
import { prisma } from "@/lib/prisma";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export const PATCH = withAuth(["USER", "ADMIN", "STAFF"], async (req, ctx) => {
  const { phoneNumber } = await req.json();

  if (!phoneNumber || !PHONE_REGEX.test(phoneNumber)) {
    return Response.json({ message: "Số điện thoại không hợp lệ" }, { status: 400 });
  }

  const existed = await prisma.user.findFirst({
    where: {
      phoneNumber,
      id: { not: ctx.user.id },
    },
  });

  if (existed) {
    return Response.json({ message: "Số điện thoại đã được sử dụng" }, { status: 409 });
  }

  await prisma.user.update({
    where: { id: ctx.user.id },
    data: {
      phoneNumber,
      needsPhoneNumber: false,
    },
  });

  return Response.json({ message: "Cập nhật số điện thoại thành công" });
});

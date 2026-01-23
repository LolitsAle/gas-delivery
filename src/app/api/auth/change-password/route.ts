// app/api/auth/change-password/route.ts
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";
import { verifyPassword, hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Thiếu access token" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];
    let payload: any;
    try {
      payload = verifyJwt(accessToken);
    } catch {
      return Response.json(
        { message: "Access token không hợp lệ hoặc đã hết hạn" },
        { status: 401 },
      );
    }

    if (!payload?.sub) {
      return Response.json(
        { message: "Access token không hợp lệ" },
        { status: 401 },
      );
    }

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return Response.json(
        { message: "Thiếu mật khẩu cũ hoặc mới" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return Response.json(
        { message: "Người dùng không tồn tại" },
        { status: 404 },
      );
    }

    const valid = await verifyPassword(oldPassword, user.passwordHash);
    if (!valid) {
      return Response.json(
        { message: "Mật khẩu cũ không đúng" },
        { status: 401 },
      );
    }

    const hashedNewPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedNewPassword,
        sessionVersion: { increment: 1 },
      },
    });

    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    return Response.json(
      {
        message:
          "Đổi mật khẩu thành công. Vui lòng đăng nhập lại để lấy token mới.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Change password error:", error);

    return Response.json(
      { message: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 },
    );
  }
}

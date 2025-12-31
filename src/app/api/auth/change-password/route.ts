import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/auth/jwt-node";
import { verifyPassword, hashPassword } from "@/lib/password";
import { buildClearAuthCookies } from "@/lib/auth/cookies";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return Response.json({ message: "Thiếu access token" }, { status: 401 });
    }

    const accessToken = authHeader.split(" ")[1];
    const payload: any = verifyJwt(accessToken);

    if (!payload?.sub) {
      return Response.json(
        { message: "Access token không hợp lệ" },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return Response.json(
        { message: "Thiếu mật khẩu cũ hoặc mới" },
        { status: 400 }
      );
    }

    // 1️⃣ Lấy user
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return Response.json(
        { message: "Người dùng không tồn tại" },
        { status: 404 }
      );
    }

    // 2️⃣ Check mật khẩu cũ
    const valid = await verifyPassword(oldPassword, user.password);
    if (!valid) {
      return Response.json(
        { message: "Mật khẩu cũ không đúng" },
        { status: 401 }
      );
    }

    // 3️⃣ Update mật khẩu
    const hashedNewPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        sessionVersion: { increment: 1 },
      },
    });

    // 4️⃣ Revoke tất cả refresh token
    await prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        revoked: false,
      },
      data: {
        revoked: true,
      },
    });

    // 5️⃣ Clear cookie → bắt login lại
    const headers = buildClearAuthCookies();

    return new Response(
      JSON.stringify({
        message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    console.error("Change password error:", error);

    return Response.json(
      { message: "Có lỗi xảy ra khi đổi mật khẩu" },
      { status: 500 }
    );
  }
}

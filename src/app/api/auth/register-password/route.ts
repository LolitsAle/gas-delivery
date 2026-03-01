import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const { phoneNumber, password, name } = await req.json();

    if (!phoneNumber || !password || !name) {
      return Response.json(
        { message: "Thiếu tên, số điện thoại hoặc mật khẩu" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return Response.json(
        { message: "Mật khẩu cần ít nhất 6 ký tự" },
        { status: 400 },
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (existingUser) {
      return Response.json(
        { message: "Số điện thoại đã đăng ký" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        passwordHash,
        name,
        nickname: `User${phoneNumber.slice(-4)}`,
        authProvider: "PASSWORD",
        isVerified: false,
      },
    });

    return Response.json(
      {
        message:
          "Đăng ký thành công bằng mật khẩu. Số điện thoại hiện chưa xác minh.",
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          name: user.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Register password error:", error);
    return Response.json({ message: "Có lỗi xảy ra" }, { status: 500 });
  }
}

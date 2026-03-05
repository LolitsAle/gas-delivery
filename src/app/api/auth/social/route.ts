import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth/jwt-node";
import {
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} from "@/lib/auth/authConfig";
import { generateRefreshToken, hashToken } from "@/lib/auth/helpers";

type SocialProvider = "ZALO" | "FACEBOOK";

const PLACEHOLDER_PHONE_PREFIX = "missing-phone";

export async function POST(req: Request) {
  try {
    const {
      provider,
      providerUserId,
      name,
      phoneNumber,
    }: {
      provider: SocialProvider;
      providerUserId: string;
      name?: string;
      phoneNumber?: string;
    } = await req.json();

    if (!provider || !providerUserId) {
      return Response.json({ message: "Thiếu thông tin đăng nhập" }, { status: 400 });
    }

    let user = await prisma.user.findFirst({
      where: {
        authProvider: provider,
        providerUserId,
      },
    });

    const resolvedPhoneNumber =
      phoneNumber || `${PLACEHOLDER_PHONE_PREFIX}-${provider.toLowerCase()}-${providerUserId}`;

    const needsPhoneNumber = !phoneNumber;

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: resolvedPhoneNumber,
          passwordHash: "",
          name: name || `${provider} User`,
          nickname: `User${providerUserId.slice(-4)}`,
          authProvider: provider,
          providerUserId,
          needsPhoneNumber,
          isVerified: false,
        },
      });
    }

    if (provider === "ZALO" && phoneNumber && user.phoneNumber !== phoneNumber) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          phoneNumber,
          needsPhoneNumber: false,
        },
      });
    }

    const accessToken = signJwt(
      {
        userId: user.id,
        role: user.role,
        sessionVersion: user.sessionVersion,
      },
      ACCESS_TOKEN_EXPIRES,
    );

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000),
      },
    });

    return Response.json({
      user: {
        id: user.id,
        role: user.role,
        needsPhoneNumber: user.needsPhoneNumber,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: ACCESS_TOKEN_EXPIRES,
    });
  } catch (error) {
    console.error("Social auth error:", error);
    return Response.json({ message: "Đăng nhập mạng xã hội thất bại" }, { status: 500 });
  }
}

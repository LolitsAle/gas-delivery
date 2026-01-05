import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/speedSMS";
import type { SendSmsPayload } from "@/lib/speedSMS";

export async function sendOtpService(phone: string): Promise<void> {
  if (!phone) {
    throw new Error("Phone number is required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await prisma.phoneOtp.deleteMany({
    where: { phone },
  });

  await prisma.phoneOtp.create({
    data: {
      phone,
      code: otp,
      expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 phút
    },
  });

  const content = `Ma OTP cua ban la: ${otp}. Het han sau 3 phut.`;
  const smsType: SendSmsPayload["sms_type"] = 2; // OTP

  if (process.env.NODE_ENV === "production") {
    await sendSMS([phone], content, smsType);
  }

  console.log("OTP sent to", phone);
  console.log("OTP content: ", otp);
}

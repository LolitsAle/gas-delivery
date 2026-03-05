"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetchPublic } from "@/lib/api/apiClient";
import { tokenStorage } from "@/lib/auth/token";

type LoginMode = "otp" | "password";

type SocialProvider = "ZALO" | "FACEBOOK";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("otp");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validatePhone = () => {
    if (!phoneNumber) return "Vui lòng nhập số điện thoại";
    if (!PHONE_REGEX.test(phoneNumber)) return "Số điện thoại không hợp lệ";
    return "";
  };

  const handleLoginSuccess = (user: any) => {
    router.push(user.role === "ADMIN" ? "/admin" : "/");
  };

  const loginWithSocial = async (provider: SocialProvider) => {
    const providerUserId = window.prompt(
      `Nhập ${provider} user id (mock cho môi trường hiện tại):`,
      `${provider.toLowerCase()}-${Date.now()}`,
    );

    if (!providerUserId) return;

    const name =
      window.prompt("Tên hiển thị từ tài khoản mạng xã hội:", "Khách hàng") ||
      "Khách hàng";

    const phoneFromProvider =
      window.prompt(
        `Số điện thoại từ ${provider} (để trống nếu nhà cung cấp không trả về):`,
      ) || "";

    setLoading(true);
    setError("");

    try {
      const data = await apiFetchPublic<any>("/api/auth/social", {
        method: "POST",
        body: {
          provider,
          providerUserId,
          name,
          phoneNumber: phoneFromProvider || undefined,
        },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      handleLoginSuccess(data.user);
    } catch (e: any) {
      setError(e.message || "Đăng nhập mạng xã hội thất bại");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    const err = validatePhone();
    if (err) return setError(err);

    setLoading(true);
    setError("");

    try {
      await apiFetchPublic("/api/auth/login-otp", {
        method: "POST",
        body: { phone: phoneNumber },
      });
      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setError("Vui lòng nhập OTP");

    setLoading(true);
    setError("");

    try {
      const data = await apiFetchPublic<any>("/api/auth/verify-otp", {
        method: "POST",
        body: { phone: phoneNumber, otp, type: "LOGIN" },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      handleLoginSuccess(data.user);
    } catch (e: any) {
      setError(e.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async () => {
    const err = validatePhone();
    if (err) return setError(err);
    if (!password) return setError("Vui lòng nhập mật khẩu");

    setLoading(true);
    setError("");

    try {
      const data = await apiFetchPublic<any>("/api/auth/login-password", {
        method: "POST",
        body: { phoneNumber, password },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      handleLoginSuccess(data.user);
    } catch (e: any) {
      setError(e.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-gas-green-400 to-gas-green-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-center mb-4">
          <Image src="/images/logo-main.png" alt="Logo" width={96} height={96} priority />
        </div>

        <h1 className="text-2xl font-semibold text-center text-gas-green-600 mb-1">Đăng nhập</h1>

        <div className="space-y-3 mb-4">
          <button
            onClick={() => loginWithSocial("ZALO")}
            disabled={loading}
            className="w-full rounded-lg border border-blue-200 bg-blue-50 py-2.5 font-medium text-blue-700"
          >
            Tiếp tục với Zalo
          </button>
          <button
            onClick={() => loginWithSocial("FACEBOOK")}
            disabled={loading}
            className="w-full rounded-lg border border-indigo-200 bg-indigo-50 py-2.5 font-medium text-indigo-700"
          >
            Tiếp tục với Facebook
          </button>
        </div>

        <Tabs
          value={mode}
          onValueChange={(value) => {
            setMode(value as LoginMode);
            setError("");
            setStep("phone");
            setOtp("");
          }}
        >
          <TabsList className="grid grid-cols-2 w-full mb-3">
            <TabsTrigger value="otp">OTP</TabsTrigger>
            <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          </TabsList>

          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setError("");
            }}
            className="w-full rounded-lg border px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-gas-green-400"
          />

          <TabsContent value="otp" className="mt-0 space-y-3">
            {step === "phone" ? (
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
              >
                {loading ? "Đang gửi OTP..." : "Đăng nhập bằng OTP"}
              </button>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                    setError("");
                  }}
                  className="w-full rounded-lg border px-4 py-3 text-center tracking-widest"
                />
                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
                >
                  {loading ? "Đang xác thực..." : "Xác thực OTP"}
                </button>
              </>
            )}
          </TabsContent>

          <TabsContent value="password" className="mt-0 space-y-3">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border px-4 py-3"
            />

            <button
              onClick={loginWithPassword}
              disabled={loading}
              className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Chưa có tài khoản? </span>
          <Link href="/register" className="text-gas-green-600 font-medium hover:underline">
            Đăng ký ngay
          </Link>
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

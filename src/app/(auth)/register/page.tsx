"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiFetchPublic } from "@/lib/api/apiClient";
import { tokenStorage } from "@/lib/auth/token";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

type RegisterMode = "otp" | "password";
type SocialProvider = "ZALO" | "FACEBOOK";

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [mode, setMode] = useState<RegisterMode>("otp");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePhone(value: string) {
    if (!value) return "Vui lòng nhập số điện thoại";
    if (!PHONE_REGEX.test(value)) return "Số điện thoại không hợp lệ";
    return "";
  }

  function validateName(value: string) {
    if (!value) return "Vui lòng nhập tên gọi";
    if (value.length < 3) return "Tên gọi quá ngắn";
    return "";
  }

  const loginWithSocial = async (provider: SocialProvider) => {
    const providerUserId = window.prompt(
      `Nhập ${provider} user id (mock cho môi trường hiện tại):`,
      `${provider.toLowerCase()}-${Date.now()}`,
    );

    if (!providerUserId) return;

    const socialName =
      window.prompt("Tên hiển thị từ tài khoản mạng xã hội:", name || "Khách hàng") ||
      name ||
      "Khách hàng";

    const phoneFromProvider =
      window.prompt(
        `Số điện thoại từ ${provider} (để trống nếu nhà cung cấp không trả về):`,
        phone,
      ) || "";

    setLoading(true);
    setError("");

    try {
      const data = await apiFetchPublic<any>("/api/auth/social", {
        method: "POST",
        body: {
          provider,
          providerUserId,
          name: socialName,
          phoneNumber: phoneFromProvider || undefined,
        },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      router.replace("/");
    } catch (e: any) {
      setError(e.message || "Đăng ký mạng xã hội thất bại");
    } finally {
      setLoading(false);
    }
  };

  async function sendOtp() {
    const phoneError = validatePhone(phone);
    const nameError = validateName(name);

    if (phoneError || nameError) {
      setError(phoneError || nameError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetchPublic("/api/auth/register", {
        method: "POST",
        body: { phone, name },
      });

      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!otp) return setError("Vui lòng nhập OTP");

    setLoading(true);
    setError("");

    try {
      const data = await apiFetchPublic<any>("/api/auth/verify-otp", {
        method: "POST",
        body: { phone, otp, name, type: "REGISTER" },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      router.replace("/");
    } catch (e: any) {
      setError(e.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  }

  async function registerByPassword() {
    const phoneError = validatePhone(phone);
    const nameError = validateName(name);

    if (phoneError || nameError) {
      setError(phoneError || nameError);
      return;
    }

    if (!password || password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetchPublic("/api/auth/register-password", {
        method: "POST",
        body: {
          phoneNumber: phone,
          name,
          password,
        },
      });

      router.push("/login");
    } catch (e: any) {
      setError(e.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-gas-green-400 to-gas-green-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-center mb-4">
          <Image src="/images/logo-main.png" alt="Logo" width={96} height={96} priority />
        </div>

        <h1 className="text-2xl font-semibold text-center text-gas-green-600 mb-1">Đăng ký</h1>

        <div className="space-y-3 mb-4">
          <button
            onClick={() => loginWithSocial("ZALO")}
            disabled={loading}
            className="w-full rounded-lg border border-blue-200 bg-blue-50 py-2.5 font-medium text-blue-700"
          >
            Đăng ký với Zalo
          </button>
          <button
            onClick={() => loginWithSocial("FACEBOOK")}
            disabled={loading}
            className="w-full rounded-lg border border-indigo-200 bg-indigo-50 py-2.5 font-medium text-indigo-700"
          >
            Đăng ký với Facebook
          </button>
        </div>

        <input
          type="text"
          placeholder="Tên gọi"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          className="w-full rounded-lg border px-4 py-3 mb-3"
        />

        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setError("");
          }}
          className="w-full rounded-lg border px-4 py-3 mb-3"
        />

        <Tabs
          value={mode}
          onValueChange={(value) => {
            setMode(value as RegisterMode);
            setStep("phone");
            setOtp("");
            setError("");
          }}
        >
          <TabsList className="grid grid-cols-2 w-full mb-3">
            <TabsTrigger value="otp">OTP</TabsTrigger>
            <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          </TabsList>

          <TabsContent value="otp" className="mt-0 space-y-3">
            {step === "phone" ? (
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium"
              >
                {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
              </button>
            ) : (
              <>
                <p className="text-sm text-gray-600 text-center">
                  Mã OTP đã được gửi đến <b>{phone}</b>
                </p>
                <input
                  type="text"
                  inputMode="numeric"
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
                  className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium"
                >
                  {loading ? "Đang xác thực..." : "Xác thực & hoàn tất"}
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
              onClick={registerByPassword}
              disabled={loading}
              className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium"
            >
              {loading ? "Đang tạo tài khoản..." : "Đăng ký bằng mật khẩu"}
            </button>
            <p className="text-xs text-amber-700">
              Đăng ký bằng mật khẩu sẽ tạo tài khoản ở trạng thái <b>chưa xác minh</b>.
            </p>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Đã có tài khoản? </span>
          <Link href="/login" className="text-gas-green-600 font-medium hover:underline">
            Đăng nhập
          </Link>
        </div>

        {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}

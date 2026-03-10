"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiFetchPublic } from "@/lib/api/apiClient";
import { tokenStorage } from "@/lib/auth/token";

type RegisterMode = "otp" | "password";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState<RegisterMode>("otp");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
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

  function validatePassword(value: string) {
    if (!value) return "Vui lòng nhập mật khẩu";
    if (value.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
    return "";
  }

  async function registerWithOtp() {
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

  async function verifyRegisterOtp() {
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

  async function registerWithPassword() {
    const phoneError = validatePhone(phone);
    const nameError = validateName(name);
    const passwordError = validatePassword(password);

    if (phoneError || nameError || passwordError) {
      setError(phoneError || nameError || passwordError);
      return;
    }

    if (!confirmPassword) return setError("Vui lòng nhập xác nhận mật khẩu");
    if (password !== confirmPassword) return setError("Mật khẩu xác nhận không khớp");

    setLoading(true);
    setError("");

    try {
      const data = await apiFetchPublic<any>("/api/auth/register-password", {
        method: "POST",
        body: { phone, name, password },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      router.replace("/");
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
        <p className="text-sm text-center text-gray-500 mb-6">Tạo tài khoản mới chỉ trong vài bước ✨</p>

        {step === "form" && (
          <>
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-gas-green-400"
            />

            <input
              type="text"
              placeholder="Tên gọi"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-gas-green-400"
            />

            {mode === "password" && (
              <>
                <div className="relative mb-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full rounded-lg border px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gas-green-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative mb-3">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full rounded-lg border px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-gas-green-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 px-3 text-gray-500 hover:text-gray-700"
                    aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            )}

            <button
              onClick={mode === "otp" ? registerWithOtp : registerWithPassword}
              disabled={loading}
              className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
            >
              {mode === "otp"
                ? loading
                  ? "Đang gửi OTP..."
                  : "Đăng ký bằng OTP"
                : loading
                  ? "Đang đăng ký..."
                  : "Đăng ký bằng mật khẩu"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="mb-3 text-sm text-gray-600 text-center">
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
              className="w-full rounded-lg border px-4 py-3 mb-3 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-gas-green-400"
            />

            <button
              onClick={verifyRegisterOtp}
              disabled={loading}
              className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
            >
              {loading ? "Đang xác thực..." : "Xác thực OTP & hoàn tất"}
            </button>
          </>
        )}

        {step === "form" && (
          <div className="mt-4 text-center">
            {mode === "otp" ? (
              <button
                onClick={() => {
                  setMode("password");
                  setOtp("");
                }}
                className="text-sm text-gas-green-600 hover:underline"
              >
                Đăng ký bằng mật khẩu
              </button>
            ) : (
              <button
                onClick={() => {
                  setMode("otp");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-sm text-gas-green-600 hover:underline"
              >
                Đăng ký bằng OTP
              </button>
            )}
          </div>
        )}

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

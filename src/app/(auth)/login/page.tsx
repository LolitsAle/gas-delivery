"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetchPublic } from "@/lib/api/apiClient";
import { tokenStorage } from "@/lib/auth/token";

type LoginMode = "otp" | "password";

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

  /* ================= OTP LOGIN ================= */
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

  /* ================= PASSWORD LOGIN ================= */
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
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <Image
            src="/images/logo-main.png"
            alt="Logo"
            width={96}
            height={96}
            priority
          />
        </div>

        <h1 className="text-2xl font-semibold text-center text-gas-green-600 mb-1">
          Đăng nhập
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Chào mừng bạn quay lại 👋
        </p>

        {/* Phone */}
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

        {/* OTP MODE */}
        {mode === "otp" && step === "phone" && (
          <button
            onClick={sendOtp}
            disabled={loading}
            className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
          >
            {loading ? "Đang gửi OTP..." : "Đăng nhập bằng OTP"}
          </button>
        )}

        {mode === "otp" && step === "otp" && (
          <>
            <input
              type="text"
              placeholder="Nhập mã OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border px-4 py-3 mb-3 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-gas-green-400"
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

        {/* PASSWORD MODE */}
        {mode === "password" && (
          <>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-gas-green-400"
            />

            <button
              onClick={loginWithPassword}
              disabled={loading}
              className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </>
        )}

        {/* Switch mode */}
        <div className="mt-4 text-center">
          {mode === "otp" ? (
            <button
              onClick={() => {
                setMode("password");
                setStep("phone");
                setOtp("");
              }}
              className="text-sm text-gas-green-600 hover:underline"
            >
              Dùng mật khẩu thay thế
            </button>
          ) : (
            <button
              onClick={() => {
                setMode("otp");
                setPassword("");
              }}
              className="text-sm text-gas-green-600 hover:underline"
            >
              Quay lại đăng nhập bằng OTP
            </button>
          )}
        </div>

        {/* Register link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Chưa có tài khoản? </span>
          <Link
            href="/register"
            className="text-gas-green-600 font-medium hover:underline"
          >
            Đăng ký ngay
          </Link>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetchPublic } from "@/lib/api/apiClient";
import { tokenStorage } from "@/lib/auth/token";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePhone(value: string) {
    if (!value) return "Vui lòng nhập số điện thoại";
    if (!PHONE_REGEX.test(value)) return "Số điện thoại không hợp lệ";
    return "";
  }

  function validatename(value: string) {
    if (!value) return "Vui lòng nhập tên gọi";
    if (value.length < 5) return "Tên gọi quá ngắn";
    return "";
  }

  /* ================= SEND OTP ================= */
  async function sendOtp() {
    const phoneError = validatePhone(phone);
    const nameError = validatename(name);

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

  /* ================= VERIFY OTP ================= */
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
          Đăng ký
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Tạo tài khoản mới chỉ trong vài bước ✨
        </p>

        {step === "phone" && (
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
              placeholder="Biệt danh"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              className="w-full rounded-lg border px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-gas-green-400"
            />

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
            >
              {loading ? "Đang gửi OTP..." : "Gửi mã OTP"}
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
              onClick={verifyOtp}
              disabled={loading}
              className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium hover:bg-gas-green-600 transition"
            >
              {loading ? "Đang xác thực..." : "Xác thực & hoàn tất"}
            </button>
          </>
        )}

        {/* Back to login */}
        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Đã có tài khoản? </span>
          <Link
            href="/login"
            className="text-gas-green-600 font-medium hover:underline"
          >
            Đăng nhập
          </Link>
        </div>

        {error && (
          <p className="mt-4 text-center text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetchPublic } from "@/lib/api/apiClient";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [nickname, setNickname] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePhone(value: string) {
    if (!value) return "Vui lòng nhập số điện thoại";
    if (!PHONE_REGEX.test(value)) return "Số điện thoại không hợp lệ";
    return "";
  }

  function validateNickname(value: string) {
    if (value === "") return "";
    if (value.length < 2) return "Biệt danh quá ngắn";
    return "";
  }

  // ================= SEND OTP =================
  async function sendOtp() {
    const phoneError = validatePhone(phone);
    const nicknameError = validateNickname(nickname);

    if (phoneError || nicknameError) {
      setError(phoneError || nicknameError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetchPublic("/api/auth/register", {
        method: "POST",
        body: { phone, nickname },
      });

      setStep("otp");
    } catch (e: any) {
      setError(e.message || "Không thể gửi OTP");
    } finally {
      setLoading(false);
    }
  }

  // ================= VERIFY OTP =================
  async function verifyOtp() {
    if (!otp) {
      setError("Vui lòng nhập OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetchPublic("/api/auth/verify-otp", {
        method: "POST",
        body: {
          phone,
          otp,
          nickname,
          type: "REGISTER",
        },
      });

      router.replace("/");
    } catch (e: any) {
      setError(e.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  }

  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold">Đăng Ký</h1>

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
              className="mb-2 w-full rounded-lg border px-4 py-3"
            />

            <input
              type="text"
              placeholder="Biệt danh"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError("");
              }}
              className="mb-2 w-full rounded-lg border px-4 py-3"
            />

            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full rounded-lg bg-black py-3 text-white disabled:opacity-50"
            >
              {loading ? "Đang gửi OTP..." : "Gửi OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="mb-3 text-sm text-gray-600">
              OTP đã được gửi đến <b>{phone}</b>
            </p>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Nhập OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
              className="mb-2 w-full rounded-lg border px-4 py-3 text-center tracking-widest"
            />

            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full rounded-lg bg-black py-3 text-white disabled:opacity-50"
            >
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

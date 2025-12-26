"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export default function RegisterPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validatePhone(value: string) {
    if (!value) return "Phone number is required";
    if (!PHONE_REGEX.test(value)) return "Invalid phone number";
    return "";
  }

  // 1️⃣ GỬI OTP
  async function sendOtp() {
    const validationError = validatePhone(phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    if (!res.ok) {
      setError("Không thể gửi OTP");
      setLoading(false);
      return;
    }

    setStep("otp");
    setLoading(false);
  }

  // 2️⃣ VERIFY OTP → TẠO USER
  async function verifyOtp() {
    if (!otp) {
      setError("OTP is required");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "OTP không hợp lệ");
      setLoading(false);
      return;
    }

    // ✅ OTP đúng → user đã được tạo ở backend
    // 👉 accessToken có thể lưu state / context
    // localStorage.setItem("accessToken", data.accessToken); (nếu bạn muốn)

    router.replace("/"); // hoặc /dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-semibold">Đăng Ký</h1>

        {step === "phone" && (
          <>
            <input
              type="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              className="mb-1 w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-black focus:outline-none"
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
            <p className="mb-2 text-sm text-gray-600">
              OTP đã được gửi đến <span className="font-medium">{phone}</span>
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
              className="mb-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-black focus:outline-none"
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

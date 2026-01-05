"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetchPublic } from "@/lib/api/apiClient";

type LoginMode = "otp" | "password";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

const LoginPage = () => {
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

  // ================= OTP LOGIN =================

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
      const data = await apiFetchPublic<{ user: any }>("/api/auth/verify-otp", {
        method: "POST",
        body: {
          phone: phoneNumber,
          otp,
          type: "LOGIN",
        },
      });

      // ✅ token đã nằm trong HttpOnly cookie
      handleLoginSuccess(data.user);
    } catch (e: any) {
      setError(e.message || "OTP không hợp lệ");
    } finally {
      setLoading(false);
    }
  };

  // ================= PASSWORD LOGIN =================

  const loginWithPassword = async () => {
    const err = validatePhone();
    if (err) return setError(err);
    if (!password) return setError("Vui lòng nhập mật khẩu");

    setLoading(true);
    setError("");

    try {
      const data = await apiFetchPublic<{ user: any }>(
        "/api/auth/login-password",
        {
          method: "POST",
          body: {
            phoneNumber,
            password,
          },
        }
      );

      handleLoginSuccess(data.user);
    } catch (e: any) {
      setError(e.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4 text-center">Đăng nhập</h1>

      <input
        type="tel"
        placeholder="Số điện thoại"
        value={phoneNumber}
        onChange={(e) => {
          setPhoneNumber(e.target.value);
          setError("");
        }}
        className="p-2 border rounded w-full mb-2"
      />

      {/* OTP MODE */}
      {mode === "otp" && step === "phone" && (
        <button
          onClick={sendOtp}
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded w-full"
        >
          {loading ? "Đang gửi OTP..." : "Đăng nhập bằng OTP"}
        </button>
      )}

      {mode === "otp" && step === "otp" && (
        <>
          <input
            type="text"
            placeholder="Nhập OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            className="p-2 border rounded w-full mb-2 text-center tracking-widest"
          />

          <button
            onClick={verifyOtp}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded w-full"
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
            className="p-2 border rounded w-full mb-2"
          />

          <button
            onClick={loginWithPassword}
            disabled={loading}
            className="bg-blue-600 text-white p-2 rounded w-full"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập bằng mật khẩu"}
          </button>
        </>
      )}

      {/* SWITCH MODE */}
      <div className="mt-4 text-center">
        {mode === "otp" ? (
          <button
            className="text-sm text-blue-600 underline"
            onClick={() => {
              setMode("password");
              setStep("phone");
              setOtp("");
            }}
          >
            Dùng mật khẩu thay thế
          </button>
        ) : (
          <button
            className="text-sm text-blue-600 underline"
            onClick={() => {
              setMode("otp");
              setPassword("");
            }}
          >
            Quay lại đăng nhập bằng OTP
          </button>
        )}
      </div>

      {error && <p className="text-red-600 mt-3 text-sm">{error}</p>}
    </div>
  );
};

export default LoginPage;

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { apiFetchPublic } from "@/lib/api/apiClient";
import { tokenStorage } from "@/lib/auth/token";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InfoBanner from "@/components/common/InfoBanner";
import { FloatingLabelInput } from "@/components/auth/FloatingLabelInput";

type LoginMode = "otp" | "password";
type OtpStep = "phone" | "otp";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const OTP_REGEX = /^\d{4,5}$/;
const OTP_RESEND_COOLDOWN = 120;

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<LoginMode>("password");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<OtpStep>("phone");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState(false);
  const [otpFieldError, setOtpFieldError] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const clearGlobalError = () => {
    setError("");
  };

  const clearFieldErrors = () => {
    setPhoneFieldError(false);
    setPasswordFieldError(false);
    setOtpFieldError(false);
  };

  const clearAllErrors = () => {
    clearGlobalError();
    clearFieldErrors();
  };

  const validatePhone = () => {
    if (!phoneNumber.trim()) return "Vui lòng nhập số điện thoại";
    if (!PHONE_REGEX.test(phoneNumber.trim()))
      return "Số điện thoại không hợp lệ";
    return "";
  };

  const validatePassword = () => {
    if (!password) return "Vui lòng nhập mật khẩu";
    return "";
  };

  const validateOtp = () => {
    if (!otp.trim()) return "Vui lòng nhập OTP";
    if (!OTP_REGEX.test(otp.trim())) return "OTP phải gồm 4 hoặc 5 số";
    return "";
  };

  const handleLoginSuccess = (user: { role?: string }) => {
    router.push(user.role === "ADMIN" ? "/admin" : "/");
  };

  const startOtpCooldown = () => {
    setResendCooldown(OTP_RESEND_COOLDOWN);
  };

  const handleModeChange = (nextMode: string) => {
    setMode(nextMode as LoginMode);
    clearAllErrors();
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
    clearGlobalError();
    setPhoneFieldError(false);

    if (passwordFieldError) {
      setPasswordFieldError(false);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearGlobalError();
    setPasswordFieldError(false);

    if (phoneFieldError) {
      setPhoneFieldError(false);
    }
  };

  const handleOtpChange = (value: string) => {
    const next = value.replace(/\D/g, "").slice(0, 5);
    setOtp(next);
    clearGlobalError();
    setOtpFieldError(false);
  };

  const sendOtp = async () => {
    clearAllErrors();

    const phoneErr = validatePhone();
    if (phoneErr) {
      setPhoneFieldError(true);
      setError(phoneErr);
      return;
    }

    setIsSendingOtp(true);

    try {
      await apiFetchPublic("/api/auth/login-otp", {
        method: "POST",
        body: { phone: phoneNumber.trim() },
      });

      setStep("otp");
      startOtpCooldown();
    } catch (e: any) {
      setPhoneFieldError(true);
      setError(e?.message || "Không thể gửi OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (resendCooldown > 0 || isSendingOtp || isVerifyingOtp) return;
    await sendOtp();
  };

  const verifyOtp = async () => {
    clearAllErrors();

    const phoneErr = validatePhone();
    if (phoneErr) {
      setPhoneFieldError(true);
      setError(phoneErr);
      return;
    }

    const otpErr = validateOtp();
    if (otpErr) {
      setOtpFieldError(true);
      setError(otpErr);
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const data = await apiFetchPublic<{
        access_token: string;
        refresh_token: string;
        user: { role?: string };
      }>("/api/auth/verify-otp", {
        method: "POST",
        body: { phone: phoneNumber.trim(), otp: otp.trim(), type: "LOGIN" },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      handleLoginSuccess(data.user);
    } catch (e: any) {
      setPhoneFieldError(true);
      setOtpFieldError(true);
      setError(e?.message || "OTP không hợp lệ");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const loginWithPassword = async () => {
    clearAllErrors();

    const phoneErr = validatePhone();
    const passwordErr = validatePassword();

    if (phoneErr || passwordErr) {
      if (phoneErr) setPhoneFieldError(true);
      if (passwordErr) setPasswordFieldError(true);
      setError(phoneErr || passwordErr);
      return;
    }

    setIsLoggingIn(true);

    try {
      const data = await apiFetchPublic<{
        access_token: string;
        refresh_token: string;
        user: { role?: string };
      }>("/api/auth/login-password", {
        method: "POST",
        body: { phoneNumber: phoneNumber.trim(), password },
      });

      tokenStorage.setTokens(data.access_token, data.refresh_token);
      handleLoginSuccess(data.user);
    } catch (e: any) {
      setPhoneFieldError(true);
      setPasswordFieldError(true);
      setError(e?.message || "Đăng nhập thất bại");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await loginWithPassword();
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === "phone") {
      await sendOtp();
      return;
    }

    await verifyOtp();
  };

  const passwordBusy = isLoggingIn;
  const otpBusy = isSendingOtp || isVerifyingOtp;

  const phoneHasError = phoneFieldError;
  const passwordHasError = passwordFieldError;
  const otpHasError = otpFieldError;

  const errorInputClass =
    "border-red-500 text-red-600 focus:ring-red-400 focus:border-red-500";
  const errorLabelClass = "text-red-600";

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-gas-green-400 to-gas-green-600 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-4">
          <div className="shrink-0">
            <Image
              src="/images/logo-main.png"
              alt="Logo"
              width={84}
              height={84}
              priority
            />
          </div>

          <div>
            <h1 className="mb-1 text-2xl font-semibold text-gas-green-600">
              Đăng nhập
            </h1>
            <p className="text-sm text-gray-500">Chào mừng bạn quay lại 👋</p>
          </div>
        </div>

        <Tabs
          value={mode}
          onValueChange={handleModeChange}
          className="w-full gap-0"
        >
          <TabsList className="mb-4 grid w-full grid-cols-2 bg-gas-green-50">
            <TabsTrigger
              value="password"
              className="transition-all duration-100 data-[state=active]:bg-gas-green-600 data-[state=active]:text-white"
            >
              Mật khẩu
            </TabsTrigger>
            <TabsTrigger
              value="otp"
              className="transition-all duration-100 data-[state=active]:bg-gas-green-600 data-[state=active]:text-white"
            >
              OTP
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-0">
            <form onSubmit={handlePasswordSubmit}>
              <FloatingLabelInput
                type="tel"
                label="Số điện thoại"
                autoComplete="username"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={phoneHasError ? errorInputClass : ""}
                labelClassName={phoneHasError ? errorLabelClass : ""}
              />

              <FloatingLabelInput
                type={showPassword ? "text" : "password"}
                label="Mật khẩu"
                autoComplete="current-password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={passwordHasError ? errorInputClass : ""}
                labelClassName={passwordHasError ? errorLabelClass : ""}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={`${
                      passwordHasError
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={passwordBusy}
                className="w-full rounded-lg bg-gas-green-500 py-3 font-medium text-white transition hover:bg-gas-green-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </TabsContent>

          <TabsContent value="otp" className="mt-0 space-y-3">
            <InfoBanner className="mb-4">
              Gửi sms OTP hiện chưa khả dụng, vui lòng gọi tới số{" "}
              <a className="text-red-500" href="tel:+840348480033">
                📞0348480033
              </a>{" "}
              để được hỗ trợ.
            </InfoBanner>

            <form onSubmit={handleOtpSubmit}>
              <FloatingLabelInput
                type="tel"
                label="Số điện thoại"
                autoComplete="username"
                value={phoneNumber}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={phoneHasError ? errorInputClass : ""}
                labelClassName={phoneHasError ? errorLabelClass : ""}
              />

              <FloatingLabelInput
                type="text"
                label="Mã OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                className={`pr-24 text-center tracking-widest ${
                  otpHasError ? errorInputClass : ""
                }`}
                labelClassName={otpHasError ? errorLabelClass : ""}
                rightSlot={
                  step === "otp" ? (
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={otpBusy || resendCooldown > 0}
                      className="text-sm font-medium text-gas-green-600 hover:text-gas-green-700 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      {resendCooldown > 0
                        ? `Gửi lại ${resendCooldown}s`
                        : "Gửi lại"}
                    </button>
                  ) : null
                }
              />

              <button
                type="submit"
                disabled={otpBusy}
                className="w-full rounded-lg bg-gas-green-500 py-3 font-medium text-white transition hover:bg-gas-green-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {step === "phone"
                  ? isSendingOtp
                    ? "Đang gửi OTP..."
                    : "Gửi OTP"
                  : isVerifyingOtp
                    ? "Đang xác thực..."
                    : "Xác thực OTP"}
              </button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Chưa có tài khoản? </span>
          <Link
            href="/register"
            className="font-medium text-gas-green-600 hover:underline"
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

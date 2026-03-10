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

type RegisterMode = "password" | "otp";
type OtpStep = "phone" | "otp";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const OTP_REGEX = /^\d{4,5}$/;
const OTP_RESEND_COOLDOWN = 120;

export default function RegisterPage() {
  const router = useRouter();

  const [mode, setMode] = useState<RegisterMode>("password");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<OtpStep>("phone");

  const [error, setError] = useState("");
  const [phoneFieldError, setPhoneFieldError] = useState(false);
  const [passwordFieldError, setPasswordFieldError] = useState(false);
  const [confirmPasswordFieldError, setConfirmPasswordFieldError] =
    useState(false);
  const [otpFieldError, setOtpFieldError] = useState(false);

  const [isRegisteringPassword, setIsRegisteringPassword] = useState(false);
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
    setConfirmPasswordFieldError(false);
    setOtpFieldError(false);
  };

  const clearAllErrors = () => {
    clearGlobalError();
    clearFieldErrors();
  };

  const validatePhone = (value: string) => {
    if (!value.trim()) return "Vui lòng nhập số điện thoại";
    if (!PHONE_REGEX.test(value.trim())) return "Số điện thoại không hợp lệ";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Vui lòng nhập mật khẩu";
    if (value.length < 6) return "Mật khẩu tối thiểu 6 ký tự";
    return "";
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return "Vui lòng nhập lại mật khẩu";
    if (value !== password) return "Mật khẩu nhập lại không khớp";
    return "";
  };

  const validateOtp = (value: string) => {
    if (!value.trim()) return "Vui lòng nhập OTP";
    if (!OTP_REGEX.test(value.trim())) return "OTP phải gồm 4 hoặc 5 số";
    return "";
  };

  const handleRegisterSuccess = (data: {
    access_token: string;
    refresh_token: string;
  }) => {
    tokenStorage.setTokens(data.access_token, data.refresh_token);
    router.replace("/");
  };

  const startOtpCooldown = () => {
    setResendCooldown(OTP_RESEND_COOLDOWN);
  };

  const handleModeChange = (nextMode: string) => {
    setMode(nextMode as RegisterMode);
    clearAllErrors();
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    clearGlobalError();
    setPhoneFieldError(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearGlobalError();
    setPasswordFieldError(false);
    setConfirmPasswordFieldError(false);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    clearGlobalError();
    setConfirmPasswordFieldError(false);
    setPasswordFieldError(false);
  };

  const handleOtpChange = (value: string) => {
    const next = value.replace(/\D/g, "").slice(0, 5);
    setOtp(next);
    clearGlobalError();
    setOtpFieldError(false);
  };

  const registerWithPassword = async () => {
    clearAllErrors();

    const phoneErr = validatePhone(phone);
    const passwordErr = validatePassword(password);
    const confirmPasswordErr = validateConfirmPassword(confirmPassword);

    if (phoneErr || passwordErr || confirmPasswordErr) {
      if (phoneErr) setPhoneFieldError(true);
      if (passwordErr || confirmPasswordErr) {
        setPasswordFieldError(true);
        setConfirmPasswordFieldError(true);
      }
      setError(phoneErr || passwordErr || confirmPasswordErr);
      return;
    }

    setIsRegisteringPassword(true);

    try {
      const data = await apiFetchPublic<{
        access_token: string;
        refresh_token: string;
      }>("/api/auth/register-password", {
        method: "POST",
        body: {
          phone: phone.trim(),
          password,
        },
      });

      handleRegisterSuccess(data);
    } catch (e: any) {
      setPhoneFieldError(true);
      setPasswordFieldError(true);
      setConfirmPasswordFieldError(true);
      setError(e?.message || "Đăng ký thất bại");
    } finally {
      setIsRegisteringPassword(false);
    }
  };

  const sendOtp = async () => {
    clearAllErrors();

    const phoneErr = validatePhone(phone);

    if (phoneErr) {
      setPhoneFieldError(true);
      setError(phoneErr);
      return;
    }

    setIsSendingOtp(true);

    try {
      const data = await apiFetchPublic<any>("/api/auth/register-otp", {
        method: "POST",
        body: { phone: phone.trim() },
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

    const phoneErr = validatePhone(phone);
    const otpErr = validateOtp(otp);

    if (phoneErr || otpErr) {
      if (phoneErr) setPhoneFieldError(true);
      if (otpErr) setOtpFieldError(true);
      setError(phoneErr || otpErr);
      return;
    }

    setIsVerifyingOtp(true);

    try {
      const data = await apiFetchPublic<{
        access_token: string;
        refresh_token: string;
      }>("/api/auth/verify-otp", {
        method: "POST",
        body: {
          phone: phone.trim(),
          otp: otp.trim(),
          type: "REGISTER",
        },
      });

      handleRegisterSuccess(data);
    } catch (e: any) {
      setPhoneFieldError(true);
      setOtpFieldError(true);
      setError(e?.message || "OTP không hợp lệ");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await registerWithPassword();
  };

  const handleOtpSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (step === "phone") {
      await sendOtp();
      return;
    }

    await verifyOtp();
  };

  const passwordBusy = isRegisteringPassword;
  const otpBusy = isSendingOtp || isVerifyingOtp;

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
              Đăng ký
            </h1>
            <p className="text-sm text-gray-500">
              Tạo tài khoản mới chỉ trong vài bước ✨
            </p>
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
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={phoneFieldError ? errorInputClass : ""}
                labelClassName={phoneFieldError ? errorLabelClass : ""}
              />

              <FloatingLabelInput
                type={showPassword ? "text" : "password"}
                label="Mật khẩu"
                autoComplete="new-password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={passwordFieldError ? errorInputClass : ""}
                labelClassName={passwordFieldError ? errorLabelClass : ""}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className={
                      passwordFieldError
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-500 hover:text-gray-700"
                    }
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <FloatingLabelInput
                type={showConfirmPassword ? "text" : "password"}
                label="Nhập lại mật khẩu"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={confirmPasswordFieldError ? errorInputClass : ""}
                labelClassName={
                  confirmPasswordFieldError ? errorLabelClass : ""
                }
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className={
                      confirmPasswordFieldError
                        ? "text-red-500 hover:text-red-600"
                        : "text-gray-500 hover:text-gray-700"
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Ẩn mật khẩu nhập lại"
                        : "Hiện mật khẩu nhập lại"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={passwordBusy}
                className="w-full rounded-lg bg-gas-green-500 py-3 font-medium text-white transition hover:bg-gas-green-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isRegisteringPassword ? "Đang tạo tài khoản..." : "Đăng ký"}
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
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={phoneFieldError ? errorInputClass : ""}
                labelClassName={phoneFieldError ? errorLabelClass : ""}
              />

              <FloatingLabelInput
                type="text"
                label="Mã OTP"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => handleOtpChange(e.target.value)}
                className={`pr-24 text-center tracking-widest ${
                  otpFieldError ? errorInputClass : ""
                }`}
                labelClassName={otpFieldError ? errorLabelClass : ""}
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
                    : "Gửi mã OTP"
                  : isVerifyingOtp
                    ? "Đang xác thực..."
                    : "Xác thực & hoàn tất"}
              </button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-500">Đã có tài khoản? </span>
          <Link
            href="/login"
            className="font-medium text-gas-green-600 hover:underline"
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

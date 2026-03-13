"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  apiFetchAuth,
  apiFetchPublic,
  apiLogoutClient,
} from "@/lib/api/apiClient";
import { useCurrentUser } from "@/components/context/CurrentUserContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/lib/types/frontend";

type Props = {
  user: User;
};

type EditableFieldKey = "name" | "address" | "addressNote";

type UpdateMePayload = {
  name?: string | null;
  address?: string | null;
  addressNote?: string | null;
};

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;
const OTP_REGEX = /^\d{4,5}$/;
const OTP_RESEND_COOLDOWN = 120;

export default function UserBasicInfo({ user }: Props) {
  const router = useRouter();
  const { refreshUser } = useCurrentUser();

  const [editingField, setEditingField] = useState<EditableFieldKey | null>(
    null,
  );
  const [editingValue, setEditingValue] = useState("");
  const [savingField, setSavingField] = useState<EditableFieldKey | null>(null);

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otpValue, setOtpValue] = useState("");
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

  const logout = useCallback(async () => {
    try {
      await apiLogoutClient();
      router.replace("/login");
    } catch {}
  }, [router]);

  const startEdit = (field: EditableFieldKey, value?: string | null) => {
    setEditingField(field);
    setEditingValue(value ?? "");
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditingValue("");
  };

  const saveField = async (field: EditableFieldKey) => {
    if (savingField === field) return;

    const payload: UpdateMePayload = {
      [field]: editingValue.trim() || null,
    };

    setSavingField(field);

    try {
      await apiFetchAuth("/api/user/me", {
        method: "POST",
        body: payload,
      });

      await refreshUser();
      toast.success("Cập nhật thông tin thành công");
      cancelEdit();
    } catch (error: any) {
      toast.error(error?.message || "Không thể cập nhật thông tin");
    } finally {
      setSavingField(null);
    }
  };

  const phoneNumber = user.phoneNumber?.trim() || "";
  const canVerifyPhone = Boolean(phoneNumber) && !user.isVerified;

  const sendPhoneOtp = async () => {
    if (!phoneNumber) {
      toast.error("Chưa có số điện thoại để xác nhận");
      return;
    }

    if (!PHONE_REGEX.test(phoneNumber)) {
      toast.error("Số điện thoại hiện tại không hợp lệ");
      return;
    }

    setIsSendingOtp(true);

    try {
      await apiFetchAuth("/api/user/me/phone-verification", {
        method: "POST",
      });

      setShowOtpForm(true);
      setResendCooldown(OTP_RESEND_COOLDOWN);
      toast.success("OTP đã được gửi");
    } catch (error: any) {
      toast.error(error?.message || "Không thể gửi OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!otpValue.trim()) {
      toast.error("Vui lòng nhập OTP");
      return;
    }

    if (!OTP_REGEX.test(otpValue.trim())) {
      toast.error("OTP phải gồm 4 hoặc 5 số");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      await apiFetchPublic("/api/auth/verify-otp", {
        method: "POST",
        body: {
          phone: phoneNumber,
          otp: otpValue.trim(),
          type: "VERIFY_OTP_ONLY",
        },
      });

      await apiFetchAuth("/api/user/me/phone-verification", {
        method: "PATCH",
      });

      await refreshUser();
      setShowOtpForm(false);
      setOtpValue("");
      toast.success("Xác thực số điện thoại thành công");
    } catch (error: any) {
      toast.error(error?.message || "OTP không hợp lệ");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const isOtpBusy = isSendingOtp || isVerifyingOtp;

  const formattedTags = useMemo(
    () => (user.tags || []).map((tag) => tag.toLowerCase()),
    [user.tags],
  );

  const renderEditableRow = (
    label: string,
    field: EditableFieldKey,
    value?: string | null,
    placeholder = "Chưa cập nhật",
  ) => {
    const isEditing = editingField === field;
    const isSaving = savingField === field;

    return (
      <div className="rounded-xl border bg-white p-3">
        <div className="text-sm text-gray-500">{label}</div>

        {isEditing ? (
          <div className="mt-2 space-y-2 flex justify-between items-center gap-[2vw]">
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              placeholder={placeholder}
              disabled={isSaving}
              className="m-0"
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-gas-green-600 hover:bg-gas-green-700"
                disabled={isSaving}
                onClick={() => saveField(field)}
              >
                {isSaving ? "Đang lưu..." : "Lưu"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isSaving}
                onClick={cancelEdit}
                className="bg-red-500 text-white"
              >
                Hủy
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">{value?.trim() || placeholder}</div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startEdit(field, value)}
            >
              Sửa
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-3">
        {renderEditableRow("Tên", "name", user.name, "Nhập tên")}

        <div className="rounded-xl border bg-white p-3">
          <div className="text-sm text-gray-500">Số điện thoại</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="font-semibold">
              {phoneNumber || "Chưa cập nhật"}
            </div>
            {user.isVerified ? (
              <Badge className="bg-green-600 text-white">Đã xác thực</Badge>
            ) : (
              <Badge variant="secondary">Chưa xác thực</Badge>
            )}
          </div>

          {canVerifyPhone ? (
            <div className="mt-3 space-y-2">
              {!showOtpForm ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={sendPhoneOtp}
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? "Đang gửi OTP..." : "Xác thực"}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Nhập OTP"
                    value={otpValue}
                    onChange={(e) =>
                      setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 5))
                    }
                    disabled={isOtpBusy}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="bg-gas-green-600 hover:bg-gas-green-700"
                      onClick={verifyPhoneOtp}
                      disabled={isOtpBusy}
                    >
                      {isVerifyingOtp ? "Đang xác thực..." : "Xác nhận mã"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={sendPhoneOtp}
                      disabled={isOtpBusy || resendCooldown > 0}
                    >
                      {resendCooldown > 0
                        ? `Gửi lại sau ${resendCooldown}s`
                        : "Gửi lại OTP"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl border bg-white p-3">
          <div className="text-sm text-gray-500">Tags</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {formattedTags.length > 0 ? (
              formattedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="uppercase">
                  {tag}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">Không có tag</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-3">
          <div className="text-sm text-gray-500">Điểm thưởng</div>
          <div className="mt-2 font-semibold text-green-600">
            {user.points ?? 0}
          </div>
        </div>
      </div>

      <div
        onClick={logout}
        className="bottom-[2vw] flex justify-center items-center right-[2vw] bg-red-500 p-[2vw] rounded-md text-white"
      >
        Đăng xuất
      </div>
    </>
  );
}

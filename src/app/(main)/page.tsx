"use client";

import { Button } from "@/components/admin/Commons";
import InfoBanner from "@/components/common/InfoBanner";
import { useCurrentUser } from "@/components/context/CurrentUserContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageCarousel from "@/components/main/ImageCarousel";
import OrderSection from "@/components/main/OrderSection";
import PhoneCall from "@/components/main/PhoneCall";
import SplashScreen from "@/components/main/SplashScreen";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Pencil, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const PHONE_REGEX = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export default function Home() {
  const { currentUser, isFetchingUser, refreshUser, activeStove } =
    useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [phoneDialogError, setPhoneDialogError] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [submittingPhone, setSubmittingPhone] = useState(false);
  const router = useRouter();

  const renderUserData = useMemo(() => {
    if (isFetchingUser) {
      return <>Đang lấy thông tin khách hàng...</>;
    }

    if (currentUser) {
      return (
        <>
          <span className="flex justify-center items-center gap-[2vw]">
            <User size={"3vw"} />
            <strong>{currentUser.name || "khách hàng"}</strong>
          </span>

          <span className="flex justify-center text-gas-orange-800 items-center gap-[2vw] bg-gas-green-100 pl-[1vw] pr-[2vw] rounded-2xl">
            ⭐{currentUser.points}
          </span>
        </>
      );
    }

    router.push("/login");
  }, [currentUser, isFetchingUser, router]);

  const updatePhoneNumber = async () => {
    if (!phoneInput || !PHONE_REGEX.test(phoneInput)) {
      setPhoneDialogError("Vui lòng nhập số điện thoại hợp lệ");
      return;
    }

    setSubmittingPhone(true);
    setPhoneDialogError("");

    try {
      await apiFetchAuth("/api/user/me/phone-number", {
        method: "PATCH",
        body: {
          phoneNumber: phoneInput,
        },
      });

      setPhoneInput("");
      await refreshUser();
    } catch (e: any) {
      setPhoneDialogError(e.message || "Không thể cập nhật số điện thoại");
    } finally {
      setSubmittingPhone(false);
    }
  };

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  const forcePhoneDialog = Boolean(currentUser?.needsPhoneNumber);

  return (
    <div className="relative w-screen h-screen bg-linear-to-b from-gas-green-500 to-white text-[3vw] select-none text-white">
      <Dialog open={forcePhoneDialog}>
        <DialogContent
          showCloseButton={false}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Bổ sung số điện thoại</DialogTitle>
            <DialogDescription>
              Vui lòng cung cấp số điện thoại để tiếp tục sử dụng ứng dụng.
            </DialogDescription>
          </DialogHeader>

          <InfoBanner type="info">
            Số điện thoại là thông tin bắt buộc để nhân viên gọi xác nhận đơn hàng.
          </InfoBanner>

          <input
            type="tel"
            value={phoneInput}
            onChange={(e) => {
              setPhoneInput(e.target.value);
              setPhoneDialogError("");
            }}
            placeholder="Nhập số điện thoại"
            className="w-full rounded-lg border px-4 py-3 text-black"
          />

          <button
            onClick={updatePhoneNumber}
            disabled={submittingPhone}
            className="w-full rounded-lg bg-gas-green-500 text-white py-3 font-medium"
          >
            {submittingPhone ? "Đang cập nhật..." : "Hoàn tất"}
          </button>

          {phoneDialogError && (
            <p className="text-sm text-red-600">{phoneDialogError}</p>
          )}
        </DialogContent>
      </Dialog>

      <div className="w-full h-[22vh] absolute z-0 top-0 left-0">
        <div
          className="absolute w-full h-[25vh] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/wall-paper.png)" }}
        />

        <div
          onClick={refreshUser}
          style={{
            border: "6px solid transparent",
            borderImage:
              "repeating-linear-gradient(45deg, #c0844a 0 10px, #a16207 10px 20px) 8",
          }}
          className="absolute bottom-[7vw] left-[7vw] w-[40vw] h-[18vw] rounded-md border border-white bg-white text-black p-[1vw] flex flex-col justify-center items-baseline"
        >
          {renderUserData}
        </div>
      </div>

      <div className="w-full h-[78vh] rounded-2xl pt-[3vh] z-10 absolute top-[22vh] left-0 bg-gas-green-50 animate-gradient flex flex-col">
        <OrderSection />
        <div className="flex-1 overflow-auto pb-[30vw] no-scrollbar">
          {!activeStove?.product?.productName && (
            <InfoBanner type="success" className="mx-[5vw] mt-[2vw]">
              Cửa hàng chưa có thông tin về bếp của bạn, hãy bấm nút{" "}
              <span className="text-gas-orange-700">đặt ngay</span> hoặc nút{" "}
              <Button
                className="shadow rounded-lg bg-white p-[1.5vw]"
                size="icon"
                variant="ghost"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              để cập nhật thông tin.
              <p className="text-red-600">
                Không cập nhật được? Bấm vào số điện thoại bên dưới để được hỗ
                trợ bạn nhé!
              </p>
            </InfoBanner>
          )}
          <PhoneCall />
          <ImageCarousel
            images={[
              "/images/carousel-1.png",
              "/images/carousel-2.png",
              "/images/carousel-3.png",
            ]}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/admin/Commons";
import InfoBanner from "@/components/common/InfoBanner";
import { useCurrentUser } from "@/components/context/CurrentUserContext";
import ImageCarousel from "@/components/main/ImageCarousel";
import OrderSection from "@/components/main/OrderSection";
import PhoneCall from "@/components/main/PhoneCall";
import SplashScreen from "@/components/main/SplashScreen";
import { Pencil, Sun, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Home() {
  const { currentUser, isFetchingUser, refreshUser, activeStove } =
    useCurrentUser();
  const [loading, setLoading] = useState(false);
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

    return (
      <div
        onClick={() => router.push("/login")}
        className="cursor-pointer text-blue-600 underline"
      >
        Chưa đăng nhập
      </div>
    );
  }, [currentUser, isFetchingUser, router]);

  if (loading) {
    return <SplashScreen onFinish={() => setLoading(false)} />;
  }

  return (
    <div className="relative w-screen h-screen bg-linear-to-b from-gas-green-500 to-white text-[3vw] select-none text-white">
      {/* Header */}
      <div className="w-full h-[22vh] absolute z-0 top-0 left-0">
        <div
          className="absolute w-full h-[25vh] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/wall-paper.png)" }}
        />

        {/* User summary */}
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

      {/* Body */}
      <div className="w-full h-[78vh] rounded-2xl pt-[3vh] z-10 absolute top-[22vh] left-0 bg-gas-green-50 animate-gradient flex flex-col">
        <OrderSection />
        {!activeStove?.product?.productName && (
          <InfoBanner type="success" className="mx-[5vw] mt-[2vw]">
            Cửa hàng chưa có thông tin về bếp của bạn, hãy bấm nút{" "}
            <span className="text-gas-orange-700">đặt ngay</span> hoặc nút{" "}
            <Button
              className="shadow rounded-lg bg-white p-[1.5vw]"
              size="icon"
              variant="ghost"
              // onClick={() => setOpenStoveEdit(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            để cập nhật thông tin.
            <p className="text-red-600">
              Không cập nhật được? Bấm vào số điện thoại bên dưới để được hỗ trợ
              bạn nhé!
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
  );
}

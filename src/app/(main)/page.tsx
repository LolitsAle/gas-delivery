"use client";

import { useCurrentUser } from "@/components/context/CurrentUserContext";
import OrderSection from "@/components/main/OrderSection";
import PhoneCallPopup from "@/components/main/PhoneCallPopup";
import SplashScreen from "@/components/main/SplashScreen";
import { Sun, User, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function Home() {
  const { currentUser, isFetchingUser, refreshUser } = useCurrentUser();
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

          <span className="flex justify-center items-center gap-[2vw] bg-gas-green-300 pl-[1vw] pr-[2vw] rounded-2xl">
            <Sun size={"3vw"} /> {currentUser.points}
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
      <div className="w-full h-[78vh] rounded-2xl pt-[3vh] z-10 absolute top-[22vh] left-0 bg-linear-to-br from-white via-green-50 to-green-100 animate-gradient flex flex-col">
        <OrderSection user={currentUser} />
        {/* Scrollable section */}
        {/* <div className="flex-1 overflow-y-auto pb-[30vw] overscroll-contain">
          <div className="relative mx-[5vw] mt-[5vw] h-[8vw] font-bold text-[4vw] border-b-[1vw] border-blue-700">
            <div className="absolute h-[8vw] left-0 bg-blue-700 text-white px-[2vw] py-[1vw] rounded-md">
              Dịch vụ
            </div>
          </div>

          <div className="pt-[6vw] grid grid-cols-4 gap-[2vw] mx-[5vw]">
            <button className="flex flex-col items-center gap-[1.5vw] shadow-2xl py-[2vw] rounded-2xl active:bg-gas-gray-200">
              <Wrench className="w-[7vw] h-[7vw] text-blue-700" />
              <span className="text-[3.2vw] text-blue-800 text-center">
                Sửa Bếp
              </span>
            </button>
          </div>
        </div> */}
      </div>

      <PhoneCallPopup />
    </div>
  );
}

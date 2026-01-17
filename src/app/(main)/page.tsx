"use client";

import ImageCarousel from "@/components/main/ImageCarousel";
import OrderSection from "@/components/main/OrderSection";
import PhoneCallPopup from "@/components/main/PhoneCallPopup";
import SplashScreen from "@/components/main/SplashScreen";
import { USER_STORAGE_KEY } from "@/constants/constants";
import { apiFetchAuthNoRedirect } from "@/lib/api/apiClient";
import { Sun, User, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* Fetch user info */
  useEffect(() => {
    const cached = localStorage.getItem(USER_STORAGE_KEY);
    if (cached) {
      setUser(JSON.parse(cached));
      setIsFetchingUser(false);
    }

    (async () => {
      try {
        const data = await apiFetchAuthNoRedirect<{ user: any }>(
          "/api/auth/me"
        );
        if (!data?.user) return;
        setUser(data.user);
        setIsFetchingUser(false);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {
        setUser(null);
        setIsFetchingUser(false);
      }
    })();
  }, []);

  const renderUserData = useMemo(() => {
    if (isFetchingUser) {
      return <>đang lấy thông tin khách hàng.</>;
    }
    if (user) {
      return (
        <>
          <span className="flex justify-center items-center gap-[2vw]">
            <User size={"3vw"} />{" "}
            <strong>{user.name ? user.name : "khách hàng"}</strong>
          </span>
          <span className="flex justify-center items-center gap-[2vw] bg-gas-green-300 pl-[1vw] pr-[2vw] rounded-2xl">
            <Sun size={"3vw"} /> {user.points}
          </span>
          {/* <span>render tags</span> */}
        </>
      );
    } else {
      return <div onClick={() => router.push("/login")}>Chưa đăng nhập</div>;
    }
  }, [user, isFetchingUser]);

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
        ></div>
        {/* user summary */}
        <div
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
      {/* body */}
      <div className="w-full h-[78vh] rounded-2xl pt-[3vh] z-10 absolute top-[22vh] left-0 bg-linear-to-br from-white via-green-50 to-green-100 animate-gradient flex flex-col">
        {/*  */}
        <OrderSection />

        {/* scrollable section */}
        <div className="flex-1 overflow-y-auto pb-[30vw] overscroll-contain">
          {/* services section */}
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

          {/* <ImageCarousel
            images={[
              "/images/carousel-1.avif",
              "/images/carousel-2.avif",
              "/images/carousel-3.avif",
            ]}
          /> */}
        </div>
      </div>

      <PhoneCallPopup />
    </div>
  );
}

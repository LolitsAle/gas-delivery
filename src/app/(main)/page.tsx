"use client";

import ImageCarousel from "@/components/main/ImageCarousel";
import OrderSection from "@/components/main/OrderSection";
import PhoneCallPopup from "@/components/main/PhoneCallPopup";
import SplashScreen from "@/components/main/SplashScreen";
import { USER_STORAGE_KEY } from "@/constants/constants";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { Sun, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<any | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const [loading, setLoading] = useState(false);

  /* Fetch user info */
  useEffect(() => {
    const cached = localStorage.getItem(USER_STORAGE_KEY);
    if (cached) {
      setUser(JSON.parse(cached));
      setIsFetchingUser(false);
    }

    (async () => {
      try {
        const data = await apiFetchAuth<{ user: any }>("/api/auth/me");
        if (!data?.user) return;
        setUser(data.user);
        setIsFetchingUser(false);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      } catch {}
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
            <User size={"3vw"} /> <strong>{user.nickname}</strong>
          </span>
          <span className="flex justify-center items-center gap-[2vw] bg-gas-green-300 px-[1vw] rounded-2xl">
            <Sun size={"3vw"} /> {user.points}
          </span>
          {/* <span>render tags</span> */}
        </>
      );
    } else {
      return <>Chưa đăng nhập</>;
    }
  }, [user]);

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
      <div className="w-full h-[78vh] rounded-2xl pt-[3vh] z-10 absolute top-[22vh] left-0 bg-linear-to-br from-white via-green-50 to-green-100 animate-gradient">
        <OrderSection />

        <ImageCarousel
          images={[
            "/images/carousel-1.avif",
            "/images/carousel-2.avif",
            "/images/carousel-3.avif",
          ]}
        />
        {/* <div className="mt-[2vw] w-fill bg-gas-orange-800 mx-[5vw] h-[15vw] rounded-2xl shadow-md">
          Quà khuyến mãi
        </div> */}
        {/* advertisement section */}
        {/* services */}
        {/* <div className="">
          <h3>dịch vụ</h3>
          <div>Sửa bếp</div>
          <div>Sửa máy lọc nước</div>
          <div>phụ tùng bếp</div>
          <div>giao kèm</div>
        </div> */}
      </div>

      <PhoneCallPopup />
    </div>
  );
}

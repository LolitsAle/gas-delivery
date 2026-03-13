"use client";

import InfoBanner from "@/components/common/InfoBanner";
import {
  StoveWithProducts,
  useCurrentUser,
} from "@/components/context/CurrentUserContext";
import ImageCarousel from "@/components/main/ImageCarousel";
import OrderSection from "@/components/main/OrderSection";
import PhoneCall from "@/components/main/PhoneCall";
import UserStoveDrawer from "@/components/main/userInfo/StoveFormDrawer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const { currentUser, isFetchingUser, refreshUser, activeStove } =
    useCurrentUser();

  const [openUserStoveDrawer, setOpenUserStoveDrawer] = useState(false);
  const [openMissingProductDialog, setOpenMissingProductDialog] =
    useState(false);

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

  useEffect(() => {
    if (isFetchingUser) return;
    if (!currentUser) return;
    if (!activeStove) return;

    const hasProduct = !!activeStove.product?.productName;
    setOpenMissingProductDialog(!hasProduct);
  }, [isFetchingUser, currentUser, activeStove]);

  const handleOpenStoveDrawer = () => {
    setOpenMissingProductDialog(false);
    setOpenUserStoveDrawer(true);
  };

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
        <OrderSection
          openMissing={() => setOpenMissingProductDialog(true)}
          openEdit={handleOpenStoveDrawer}
        />

        <div className="flex-1 overflow-auto pb-[30vw] no-scrollbar">
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

      <UserStoveDrawer
        open={openUserStoveDrawer}
        onOpenChange={setOpenUserStoveDrawer}
        stove={activeStove as StoveWithProducts}
      />

      <Dialog
        open={openMissingProductDialog}
        onOpenChange={setOpenMissingProductDialog}
      >
        <DialogContent className="w-[90vw] max-w-md rounded-2xl">
          <DialogHeader className="border-b-2 border-gas-gray-200">
            <DialogTitle className="text-[5vw]">
              🛠️ Bạn chưa cập nhật thông tin
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div className="text-[4vw]">
            Cửa hàng chưa biết bạn xài gas gì và địa chỉ bạn ở đâu. vui lòng cập
            nhật thông tin
          </div>
          <InfoBanner className="text-sm p-[2vw]">
            <div className="flex flex-col gap-1 items-center">
              <p>Nếu chưa rõ cách làm, bạn vẫn có thể</p>
              <a
                href="tel:+81975494948"
                className="bg-red-400 text-white py-1 px-2 rounded-md w-fit"
              >
                Gọi hỗ trợ : 097 549 49 48
              </a>
            </div>
          </InfoBanner>

          <DialogFooter className="flex-col sm:flex-row gap-2 ">
            <Button
              className="bg-gas-green-500 "
              onClick={handleOpenStoveDrawer}
            >
              Cập nhật điểm giao ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

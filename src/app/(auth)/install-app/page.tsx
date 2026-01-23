"use client";

import { Smartphone, Share2, PlusSquare, CheckCircle } from "lucide-react";
import { useInstallPrompt } from "@/components/context/installPromptContext";

export default function InstallAppPage() {
  const { isStandalone, isIOS, canInstall, triggerInstall } =
    useInstallPrompt();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-2xl p-6 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-6">
          <div className="shrink-0 flex items-center justify-center w-14 h-14 rounded-xl bg-orange-100 text-orange-600">
            <Smartphone size={28} />
          </div>

          <div className="mt-4 md:mt-0">
            <h1 className="text-2xl font-bold">Cài đặt ứng dụng</h1>
            <p className="text-gray-600 mt-1 text-sm">
              Cài app để đặt gas nhanh hơn, hoạt động ngay cả khi mạng yếu.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mt-8">
          {isStandalone ? (
            <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-xl">
              <CheckCircle />
              <span className="font-medium">
                Ứng dụng đã được cài trên thiết bị này.
              </span>
            </div>
          ) : isIOS ? (
            <IOSInstallGuide />
          ) : (
            <AndroidInstall
              canInstall={canInstall}
              onInstall={triggerInstall}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ======================
   iOS Manual Install
====================== */
function IOSInstallGuide() {
  return (
    <div>
      <p className="text-sm text-gray-700 mb-4">
        iPhone không cho cài trực tiếp. Vui lòng làm theo hướng dẫn:
      </p>

      <ol className="space-y-4 text-sm">
        <li className="flex gap-3">
          <Share2 className="text-orange-500" />
          <span>
            Nhấn nút <strong>Chia sẻ</strong> trên trình duyệt Safari
          </span>
        </li>

        <li className="flex gap-3">
          <PlusSquare className="text-orange-500" />
          <span>
            Chọn <strong>Thêm vào Màn hình chính</strong>
          </span>
        </li>

        <li className="flex gap-3">
          <CheckCircle className="text-orange-500" />
          <span>Xác nhận để hoàn tất cài đặt</span>
        </li>
      </ol>

      {/* <div className="mt-6">
        <Image
          src="/ios-install-guide.png"
          alt="Hướng dẫn cài đặt trên iOS"
          width={320}
          height={220}
          className="mx-auto rounded-xl shadow"
        />
      </div> */}

      <p className="text-xs text-gray-500 mt-4 text-center">
        ⚠️ Chỉ hỗ trợ trên trình duyệt Safari
      </p>
    </div>
  );
}

/* ======================
   Android Install
====================== */
function AndroidInstall({
  canInstall,
  onInstall,
}: {
  canInstall: boolean;
  onInstall: () => void;
}) {
  return (
    <div className="text-center">
      <button
        onClick={onInstall}
        className={`w-full md:w-auto px-6 py-3 rounded-xl text-white font-medium transition
          ${
            canInstall
              ? "bg-orange-500 hover:bg-orange-400"
              : "bg-gray-300 cursor-not-allowed"
          }`}
      >
        Cài ứng dụng
      </button>

      {/* {!canInstall && (
        <p className="text-xs text-gray-500 mt-3">
          Trình duyệt chưa hỗ trợ cài đặt trực tiếp trên thiết bị này.
        </p>
      )} */}
    </div>
  );
}

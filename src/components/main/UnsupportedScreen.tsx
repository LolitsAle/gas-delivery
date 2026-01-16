"use client";

export function UnsupportedScreen() {
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-gas-green-700 text-white text-center px-6">
      <div className="text-2xl font-bold mb-4">
        Ứng dụng không hỗ trợ chế độ này
      </div>

      <p className="text-base opacity-90 mb-6">
        Vui lòng sử dụng <b>điện thoại</b> và xoay màn hình về{" "}
        <b>dọc (portrait)</b> để tiếp tục.
      </p>

      <div className="text-sm opacity-70">
        Ứng dụng được tối ưu cho trải nghiệm di động.
      </div>
    </div>
  );
}

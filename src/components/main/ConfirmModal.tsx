import React from "react";

export default function ConfirmModal({
  title = "Xác nhận",
  description,
  confirmText = "Xóa",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  loading = false,
}: {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-sm space-y-4">
        <div className="font-semibold text-lg">{title}</div>

        {description && (
          <div className="text-sm text-gray-600">{description}</div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary bg-red-500 hover:bg-red-500 p-[2vw] rounded-md"
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

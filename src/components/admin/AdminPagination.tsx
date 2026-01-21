import React from "react";

type AdminPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function AdminPagination({
  page,
  totalPages,
  onPageChange,
}: AdminPaginationProps) {
  return (
    <div className="flex items-center justify-between pt-4">
      <div className="text-sm text-gray-500">
        Trang {page} / {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          className="h-9 px-3 rounded-lg border text-sm disabled:opacity-50"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Trước
        </button>

        <button
          className="h-9 px-3 rounded-lg border text-sm disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}

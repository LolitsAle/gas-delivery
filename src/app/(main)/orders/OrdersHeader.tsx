"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { FilterIcon } from "lucide-react";

type OrdersHeaderProps = {
  currentUser: any;
  showFilter: boolean;
  setShowFilter: () => void;

  filters: {
    stoveId: string;
    status: string;
    timeRange: string;
    sort: string;
  };

  handleFilterChange: (key: string, value: string) => void;

  page: number;
  totalPages: number;
  setPage: (fn: (p: number) => number) => void;

  STATUS_STYLE_MAP: Record<string, { text: string; className: string }>;
};

export default function OrdersHeader({
  currentUser,
  showFilter,
  setShowFilter,
  filters,
  handleFilterChange,
  page,
  totalPages,
  setPage,
  STATUS_STYLE_MAP,
}: OrdersHeaderProps) {
  return (
    <div className="space-y-4 shrink-0 bg-gas-green-600 border border-gas-green-600 rounded-md p-2">
      {/* TITLE + FILTER BUTTON */}
      <div className="flex justify-between items-center px-[2vw] pb-2 border-b border-white">
        <h1 className="text-xl font-semibold text-white">Đơn hàng của bạn</h1>

        <button
          className="flex justify-center items-center px-[2vw] py-[1vw] bg-white text-gas-green-600 rounded-md gap-[2vw]"
          onClick={setShowFilter}
        >
          Bộ lọc <FilterIcon size={"4vw"} />
        </button>
      </div>

      {/* FILTER COLLAPSE */}
      <Collapsible open={showFilter}>
        <CollapsibleContent
          className="
            overflow-hidden
            data-[state=open]:animate-[slideDown_0.25s_ease-out]
            data-[state=closed]:animate-[slideUp_0.2s_ease-in]
          "
        >
          <Card className="rounded-md shadow-sm bg-gas-green-50">
            <CardContent className="text-sm grid grid-cols-2 p-2 gap-2">
              {/* Stove */}
              <Select
                value={filters.stoveId}
                onValueChange={(val) => handleFilterChange("stoveId", val)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Tất cả bếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả bếp</SelectItem>
                  {currentUser?.stoves?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status */}
              <Select
                value={filters.status}
                onValueChange={(val) => handleFilterChange("status", val)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  {Object.entries(STATUS_STYLE_MAP).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.text}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Time range */}
              <Select
                value={filters.timeRange}
                onValueChange={(val) => handleFilterChange("timeRange", val)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả thời gian</SelectItem>
                  <SelectItem value="TODAY">Hôm nay</SelectItem>
                  <SelectItem value="WEEK">Tuần này</SelectItem>
                  <SelectItem value="MONTH">Tháng này</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={filters.sort}
                onValueChange={(val) => handleFilterChange("sort", val)}
              >
                <SelectTrigger className="w-full bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Mới nhất trước</SelectItem>
                  <SelectItem value="asc">Cũ nhất trước</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* PAGINATION */}

      <div className="flex justify-between items-center text-sm">
        <button
          className="bg-gas-orange-600 text-white border px-[2vw] py-[1vw] rounded-md min-w-[15vw]"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Trước
        </button>

        <div className="text-white">
          Trang {page} / {totalPages}
        </div>

        <button
          className="bg-gas-orange-600 text-white border px-[2vw] py-[1vw] rounded-md min-w-[15vw]"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}

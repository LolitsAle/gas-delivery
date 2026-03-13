"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import { formatVND } from "@/lib/pricing/productPrice";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminLoadingSkeleton,
  AdminPageHeader,
  AdminPageShell,
  AdminStatsGrid,
} from "@/components/admin/foundation";

type DashboardRes = {
  stats: {
    dayOrders: number;
    monthOrders: number;
    quarterOrders: number;
    pendingOrders: number;
    totalUsers: number;
    unverifiedUsers: number;
  };
  recentOrders: { id: string; status: string; totalPrice: number; createdAt: string; user: { nickname: string; phoneNumber: string } }[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      setData(await apiFetchAuth<DashboardRes>("/api/admin/dashboard"));
    } catch (e: any) {
      setError(e.message || "Không tải được dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <AdminPageShell>
      <AdminPageHeader title="Admin Dashboard" description="Tổng quan vận hành" />
      {loading && <AdminLoadingSkeleton />}
      {error && <AdminErrorState message={error} />}
      {data && (
        <>
          <AdminStatsGrid
            items={[
              { label: "Đơn trong ngày", value: String(data.stats.dayOrders) },
              { label: "Đơn trong tháng", value: String(data.stats.monthOrders) },
              { label: "Đơn trong quý", value: String(data.stats.quarterOrders) },
              { label: "Đơn chưa hoàn thành", value: String(data.stats.pendingOrders) },
              { label: "Tổng users", value: String(data.stats.totalUsers) },
              { label: "Users chưa xác thực", value: String(data.stats.unverifiedUsers) },
            ]}
          />
          {data.recentOrders.length === 0 ? (
            <AdminEmptyState title="Chưa có đơn gần đây" />
          ) : (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Đơn mới gần đây</p>
              {data.recentOrders.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded border p-2 text-sm">
                  <div>{item.user.nickname} ({item.user.phoneNumber})</div>
                  <div>{formatVND(item.totalPrice)}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminPageShell>
  );
}

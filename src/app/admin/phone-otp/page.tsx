"use client";

import { useEffect, useState } from "react";
import { apiFetchAuth } from "@/lib/api/apiClient";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminRefreshButton,
  AdminSectionCard,
} from "@/components/admin/AdminPageKit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type PhoneOtp = {
  id: string;
  phone: string;
  code: string;
  expiresAt: string;
  createdAt: string;
};

export default function AdminPhoneOtpPage() {
  const [items, setItems] = useState<PhoneOtp[]>([]);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiFetchAuth<{ items: PhoneOtp[] }>("/api/admin/phone-otp");
      setItems(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cleanExpired = async () => {
    setCleaning(true);
    try {
      await apiFetchAuth("/api/admin/phone-otp", { method: "DELETE" });
      setConfirmOpen(false);
      load();
    } finally {
      setCleaning(false);
    }
  };

  const now = Date.now();

  return (
    <div className="space-y-4 p-[2vw] md:p-[4vw]">
      <AdminPageHeader
        title="Phone OTP"
        description="Theo dõi OTP điện thoại, làm mới dữ liệu và dọn OTP hết hạn."
        actions={
          <>
            <AdminRefreshButton onClick={load} loading={loading} />
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              Clean OTP
            </Button>
          </>
        }
      />

      <div className="hidden md:block">
        <AdminSectionCard className="overflow-hidden p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead>Phone</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Expires At</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const expired = new Date(item.expiresAt).getTime() < now;
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.phone}</TableCell>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{new Date(item.expiresAt).toLocaleString("vi-VN")}</TableCell>
                    <TableCell>{new Date(item.createdAt).toLocaleString("vi-VN")}</TableCell>
                    <TableCell className={expired ? "text-red-600" : "text-green-600"}>
                      {expired ? "Đã hết hạn" : "Còn hạn"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {!loading && items.length === 0 ? <AdminEmptyState title="Không có OTP" /> : null}
        </AdminSectionCard>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => {
          const expired = new Date(item.expiresAt).getTime() < now;
          return (
            <AdminSectionCard key={item.id} className="space-y-1">
              <p className="text-sm font-medium">{item.phone}</p>
              <p className="text-sm">Code: {item.code}</p>
              <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString("vi-VN")}</p>
              <p className={`text-xs ${expired ? "text-red-600" : "text-green-600"}`}>
                {expired ? "Đã hết hạn" : "Còn hạn"}
              </p>
            </AdminSectionCard>
          );
        })}
        {!loading && items.length === 0 ? <AdminEmptyState title="Không có OTP" /> : null}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa OTP hết hạn</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Bạn có chắc muốn xóa tất cả OTP đã hết hạn?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Hủy</Button>
            <Button variant="destructive" onClick={cleanExpired} disabled={cleaning}>
              {cleaning ? "Đang xử lý..." : "Clean OTP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

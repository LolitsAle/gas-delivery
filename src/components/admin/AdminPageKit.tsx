"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";

export function AdminSectionCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-white p-3 md:p-4", className)}>
      {children}
    </div>
  );
}

export function AdminActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <AdminSectionCard className={cn("space-y-2", className)}>
      {children}
    </AdminSectionCard>
  );
}

export function AdminMobileCard({
  header,
  children,
  footer,
}: {
  header: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
      <div className="border-b bg-gray-100 p-3">{header}</div>
      <div className="space-y-2 p-3">{children}</div>
      {footer ? <div className="border-t bg-gray-50 p-2">{footer}</div> : null}
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="mt-1">{description}</p> : null}
    </div>
  );
}

export function AdminRefreshButton({
  onClick,
  loading,
  className,
}: {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading}
      className={className}
    >
      <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
      Refresh
    </Button>
  );
}

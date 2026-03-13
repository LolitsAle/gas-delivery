"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminSectionCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border bg-white p-3 md:p-4", className)}>{children}</div>;
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
    <Button variant="outline" onClick={onClick} disabled={loading} className={className}>
      <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
      Refresh
    </Button>
  );
}

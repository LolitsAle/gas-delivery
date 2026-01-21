import { cn } from "@/lib/utils";
import { MoreVertical } from "lucide-react";
import { useRef, useState } from "react";

/* =========================
   BUTTON
========================= */
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: any) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition disabled:opacity-50";

  const variants: any = {
    primary: "bg-gas-green-500 text-white hover:bg-gas-green-600",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent hover:bg-gray-100",
  };

  const sizes: any = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

/* =========================
   CARD (Mobile-first)
========================= */
export function AdminCard({ title, children, actions }: any) {
  return (
    <div className="rounded-md bg-white shadow-md border p-[2vw]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-base">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

/* =========================
   STATUS BADGE
========================= */
export function StatusBadge({ status }: { status: string }) {
  const map: any = {
    ACTIVE: "bg-green-100 text-green-700",
    INACTIVE: "bg-gray-100 text-gray-600",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[status] ?? "bg-gray-100 text-gray-600",
      )}
    >
      {status}
    </span>
  );
}

/* =========================
   ACTION MENU
========================= */
export function ActionMenu({ children }: any) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  function openMenu() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();

    setPos({
      top: rect.bottom + 8,
      left: rect.right - 160, // 160 = menu width
    });

    setOpen(true);
  }

  return (
    <>
      <button
        ref={btnRef}
        className="p-2 rounded-lg hover:bg-gray-100"
        onClick={openMenu}
      >
        <MoreVertical size={18} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setOpen(false)}
          />

          {/* Popover */}
          <div
            className="fixed z-50 w-40 rounded-xl bg-white border shadow-lg"
            style={{ top: pos.top, left: pos.left }}
          >
            {children}
          </div>
        </>
      )}
    </>
  );
}

export function ActionMenuItem({ danger, ...props }: any) {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 text-sm hover:bg-gray-100",
        danger && "text-red-600",
      )}
      {...props}
    />
  );
}

/* =========================
   TABLE (Desktop)
========================= */
export function AdminTable({ headers, children }: any) {
  return (
    <div className="hidden md:block overflow-x-auto overflow-y-hidden rounded-2xl bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h: string) => (
              <th
                key={h}
                className="px-4 py-3 text-left font-medium text-gray-600"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminTableRow({ children }: any) {
  return <tr className="hover:bg-gray-50">{children}</tr>;
}

export function AdminTableCell({ children }: any) {
  return <td className="px-4 py-3">{children}</td>;
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative border rounded px-3 pt-4 pb-2">
      <span className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
        {label}
      </span>
      {children}
    </div>
  );
}

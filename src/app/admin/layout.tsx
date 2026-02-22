import AdminShell from "@/components/admin/AdminShell";
import { CurrentUserProvider } from "@/components/context/CurrentUserContext";
import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen bg-white text-gray-900 overflow-hidden">
      <CurrentUserProvider>
        <AdminShell>{children}</AdminShell>
      </CurrentUserProvider>
    </div>
  );
}

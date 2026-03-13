import { PropsWithChildren } from "react";
import { CurrentUserProvider } from "@/components/context/CurrentUserContext";
import { AdminLayout } from "@/components/admin/foundation";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <CurrentUserProvider>
      <AdminLayout>{children}</AdminLayout>
    </CurrentUserProvider>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/components/context/CurrentUserContext";
import UserBasicInfo from "@/components/main/userInfo/UserBasicInfo";
import UserStovesInfo from "@/components/main/userInfo/UserStovesInfo";

export default function UserPage() {
  const { currentUser, isFetchingUser } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isFetchingUser && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, isFetchingUser, router]);

  if (isFetchingUser || !currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 pb-[30vw] bg-gas-green-50">
      <Tabs defaultValue="stoves" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-[3vw] shadow">
          <TabsTrigger
            className="data-[state=active]:bg-gas-green-600 data-[state=active]:text-white transition-all duration-100"
            value="stoves"
          >
            Bếp của bạn
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:bg-gas-green-600 data-[state=active]:text-white transition-all"
            value="profile"
          >
            Thông tin
          </TabsTrigger>
        </TabsList>

        {/* TAB 1 — PROFILE */}
        <TabsContent value="profile" className="space-y-6">
          <UserBasicInfo user={currentUser} />
        </TabsContent>

        {/* TAB 2 — STOVES */}
        <TabsContent value="stoves" className="space-y-6">
          <UserStovesInfo
            stoves={(currentUser as any).stoves || []}
            onChange={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

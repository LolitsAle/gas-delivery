"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UserBasicInfo from "@/components/userInfo/UserBasicInfo";
import UserHouseImage from "@/components/userInfo/UserHouseImage";
import UserStove from "@/components/userInfo/UserStove";

export type Stove = {
  id: string;
  name: string;
  productId: string;
  address: string;
  note?: string | null;
};

export type User = {
  id: string;
  name?: string | null;
  nickname: string;
  points: number;
  address?: string | null;
  addressNote?: string | null;
  houseImage: string[];
  stoves: Stove[];
};

export default function UserPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(raw));
  }, []);

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  if (!user) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6 pb-[30vw]">
      <UserBasicInfo user={user} onChange={updateUser} />
      <UserHouseImage user={user} onChange={updateUser} />
      <UserStove user={user} onChange={updateUser} />
    </div>
  );
}

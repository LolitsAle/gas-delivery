"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { apiFetchAuthNoRedirect } from "@/lib/api/apiClient";
import { USER_STORAGE_KEY } from "@/constants/constants";
import { User } from "@prisma/client";

type UserContextType = {
  currentUser: User | null;
  isFetchingUser: boolean;
  refreshUser: () => Promise<void>;
  setCurrentUser: (u: User | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const refreshingRef = useRef(false);

  const refreshUser = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      const data = await apiFetchAuthNoRedirect<{ user: User }>("/api/auth/me");

      if (!data?.user) throw new Error();

      setCurrentUser(data.user);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    } catch {
      setCurrentUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    } finally {
      setIsFetchingUser(false);
      refreshingRef.current = false;
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem(USER_STORAGE_KEY);
    if (cached) {
      setCurrentUser(JSON.parse(cached));
      setIsFetchingUser(false);
    }
    refreshUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ currentUser, isFetchingUser, refreshUser, setCurrentUser }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be inside CurrentUserProvider");
  return ctx;
};

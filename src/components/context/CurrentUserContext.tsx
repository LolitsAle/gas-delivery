"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { apiFetchAuthNoRedirect } from "@/lib/api/apiClient";
import { USER_STORAGE_KEY } from "@/constants/constants";
import { Cart, CartItem, Product, Stove, User } from "@prisma/client";

type UserContextType = {
  currentUser: UserInfoFullContext | null;
  isFetchingUser: boolean;
  refreshUser: () => Promise<void>;
  setCurrentUser: (u: UserInfoFullContext | null) => void;
};

export interface StoveWithProducts extends Stove {
  product: Product | null;
  promoProduct: Product | null;
}

export interface CartItemsWithProduct extends CartItem {
  product: Product;
}

export interface CartWithItems extends Cart {
  items: CartItemsWithProduct[];
}

export interface UserInfoFullContext extends User {
  cart: CartWithItems | null;
  stoves: StoveWithProducts[];
}

const UserContext = createContext<UserContextType | null>(null);

export function CurrentUserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<UserInfoFullContext | null>(
    null,
  );
  const [isFetchingUser, setIsFetchingUser] = useState(true);
  const refreshingRef = useRef(false);

  const refreshUser = async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;

    try {
      const data = await apiFetchAuthNoRedirect<{ user: UserInfoFullContext }>(
        "/api/auth/me",
      );

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

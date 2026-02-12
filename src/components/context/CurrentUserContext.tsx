"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiFetchAuthNoRedirect } from "@/lib/api/apiClient";
import { ACTIVE_STOVE_KEY, USER_STORAGE_KEY } from "@/constants/constants";
import { Cart, CartItem, Product, Stove, User } from "@prisma/client";

type UserContextType = {
  currentUser: UserInfoFullContext | null;
  isFetchingUser: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  setCurrentUser: Dispatch<SetStateAction<UserInfoFullContext | null>>;
  activeStoveId: string | null;
  activeStove: StoveWithProducts | null;
  setActiveStoveId: (id: string) => void;
};

export interface StoveWithProducts extends Stove {
  product: Product | null;
  promoProduct: Product | null;
  cart: {
    id: string;
    isStoveActive: true;
    items: CartItemsWithProduct[];
  } | null;
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

  const [activeStoveId, setActiveStoveIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_STOVE_KEY);
  });

  const refreshingRef = useRef(false);

  const setActiveStoveId = (id: string) => {
    setActiveStoveIdState(id);
    localStorage.setItem(ACTIVE_STOVE_KEY, id);
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveStoveIdState(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_STOVE_KEY);
  };

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

      const savedStoveId = localStorage.getItem(ACTIVE_STOVE_KEY);

      const stoveExists = data.user.stoves.some((s) => s.id === savedStoveId);

      if (stoveExists && savedStoveId) {
        setActiveStoveIdState(savedStoveId);
      } else if (data.user.stoves.length) {
        const firstId = data.user.stoves[0].id;
        setActiveStoveId(firstId);
      } else {
        setActiveStoveIdState(null);
      }
    } catch {
      logout();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeStove =
    currentUser?.stoves.find((s) => s.id === activeStoveId) ?? null;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isFetchingUser,
        refreshUser,
        logout,
        activeStoveId,
        activeStove,
        setActiveStoveId,
        setCurrentUser,
      }}
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

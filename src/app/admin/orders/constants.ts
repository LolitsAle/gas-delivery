export interface User {
  id: string;
  nickname?: string;
  phoneNumber: string;
  address?: string;
}

export interface Stove {
  id: string;
  address: string;
}

export interface Product {
  id: string;
  productName: string;
  currentPrice: number;
}

export type OrderDraftItem = {
  product: Product;
  quantity: number;
  unitPrice: number;
};

export interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  isFree: boolean;
  product: Product;
}

export interface Order {
  id: string;
  totalPrice: number;
  status: OrderStatus;
  type: string;
  createdAt: string;
  user: User;
  stove?: Stove | null;
  items: OrderItem[];
}

export interface SelectUser {
  id: string;
  nickname?: string;
  phoneNumber: string;
  address?: string;
}

export interface SelectStove {
  id: string;
  address: string;
}

export interface SelectProduct {
  id: string;
  productName: string;
  currentPrice: number;
}

/* =========================
   ORDER STATUS
========================= */

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  DELIVERING = "DELIVERING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

/* =========================
   UI HELPERS
========================= */

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  DELIVERING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  DELIVERING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

/* =========================
   BUSINESS RULES
========================= */

export const ORDER_EDITABLE_STATUS: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
];

export const ORDER_FINAL_STATUS: OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

export const isOrderEditable = (status: OrderStatus) =>
  ORDER_EDITABLE_STATUS.includes(status);

export const isOrderFinal = (status: OrderStatus) =>
  ORDER_FINAL_STATUS.includes(status);

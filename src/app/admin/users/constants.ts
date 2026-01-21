export interface User {
  id: string;
  nickname: string;
  phoneNumber: string;
  role: "USER" | "ADMIN" | "STAFF";
  createdAt: string;
  address?: string;
  addressNote?: string;
  isActive?: boolean;
}

export const ROLE_COLOR: Record<User["role"], string> = {
  USER: "bg-gray-100 text-gray-700",
  STAFF: "bg-blue-100 text-blue-700",
  ADMIN: "bg-red-100 text-red-700",
};

export const ROLE_LABEL: Record<User["role"], string> = {
  USER: "Người dùng",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị viên",
};

import { ROLE_COLOR, ROLE_LABEL, User } from "../constants";

interface Props {
  users: User[];
  onEdit: (u: User) => void;
  onDelete: (u: User) => void;
}

export default function UsersTable({ users, onEdit, onDelete }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Tên hiển thị</th>
            <th className="p-2 text-left">Số điện thoại</th>
            <th className="p-2 text-left">Vai trò</th>
            <th className="p-2 text-left">Ngày tạo</th>
            <th className="p-2 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.nickname}</td>
              <td className="p-2">{u.phoneNumber}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${ROLE_COLOR[u.role]}`}
                >
                  {ROLE_LABEL[u.role]}
                </span>
              </td>
              <td className="p-2">
                {new Date(u.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td className="p-2 text-right space-x-2">
                <button onClick={() => onEdit(u)} className="text-blue-600">
                  Sửa
                </button>
                <button onClick={() => onDelete(u)} className="text-red-600">
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { ChevronDown } from "lucide-react";
import { ROLE_COLOR, ROLE_LABEL, User } from "../constants";

interface Props {
  users: User[];
  onAction: (u: User) => void;
}

export default function UsersMobileList({ users, onAction }: Props) {
  return (
    <div className="md:hidden space-y-3">
      {users.map((u) => (
        <div key={u.id} className="border rounded-lg p-3 flex justify-between">
          <div>
            <div className="font-medium">{u.nickname}</div>
            <div className="text-sm text-gray-500">{u.phoneNumber}</div>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                ROLE_COLOR[u.role]
              }`}
            >
              {ROLE_LABEL[u.role]}
            </span>
          </div>
          <button onClick={() => onAction(u)}>
            <ChevronDown />
          </button>
        </div>
      ))}
    </div>
  );
}

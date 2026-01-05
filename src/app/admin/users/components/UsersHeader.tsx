import { Plus } from "lucide-react";

interface Props {
  query: string;
  onQueryChange: (v: string) => void;
  onCreate: () => void;
}

export default function UsersHeader({ query, onQueryChange, onCreate }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <input
        placeholder="Tìm theo số điện thoại hoặc tên"
        className="flex-1 border px-3 py-2 rounded"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <button
        onClick={onCreate}
        className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 rounded"
      >
        <Plus size={16} />
        Tạo mới
      </button>
    </div>
  );
}

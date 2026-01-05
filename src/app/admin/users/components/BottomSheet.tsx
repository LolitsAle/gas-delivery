interface Props {
  children: React.ReactNode;
  onClose: () => void;
}

export default function BottomSheet({ children, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/40">
      <div className="bg-white w-full rounded-t-2xl p-4 space-y-3">
        {children}
        <button onClick={onClose} className="w-full text-center text-gray-500">
          Đóng
        </button>
      </div>
    </div>
  );
}

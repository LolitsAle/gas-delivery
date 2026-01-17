"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetchAuth, apiFetchAuthNoRedirect } from "@/lib/api/apiClient";

type Stove = {
  id: string;
  name: string;
  productId: string;
  address: string;
  note?: string | null;
};

type User = {
  id: string;
  name?: string | null;
  nickname: string;
  points: number;
  address?: string | null;
  addressNote?: string | null;
  houseImage: string[];
  stoves: Stove[];
};

export default function UserInfoPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ===== House images (like UserForm) ===== */
  const [newHouseImages, setNewHouseImages] = useState<File[]>([]);
  const MAX_IMAGES = 5;

  /* ===== Stove modal ===== */
  const [showStoveModal, setShowStoveModal] = useState(false);
  const [products, setProducts] = useState<
    { id: string; productName: string }[]
  >([]);
  const [newStove, setNewStove] = useState({
    name: "",
    productId: "",
    address: "",
    note: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (!raw) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(raw));
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  if (!user) return <div className="p-4">Loading...</div>;

  /* ================= HELPERS ================= */

  const updateUser = (partial: Partial<User>) => {
    const updated = { ...user, ...partial };
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  /* ================= IMAGE ================= */

  const triggerPickImage = () => {
    const total = user.houseImage.length + newHouseImages.length;

    if (total >= MAX_IMAGES) {
      alert(`Tối đa ${MAX_IMAGES} ảnh`);
      return;
    }
    fileInputRef.current?.click();
  };

  const onSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const total = user.houseImage.length + newHouseImages.length + files.length;

    if (total > MAX_IMAGES) {
      alert(`Tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    setNewHouseImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removeOldImage = (index: number) => {
    updateUser({
      houseImage: user.houseImage.filter((_, i) => i !== index),
    });
  };

  const removeNewImage = (index: number) => {
    setNewHouseImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload/house-image", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Upload failed");

    const data = await res.json();
    return data.path as string;
  };

  /* ================= SAVE ================= */

  const saveToApi = async () => {
    try {
      setLoading(true);

      let uploadedImages: string[] = [];

      if (newHouseImages.length) {
        uploadedImages = await Promise.all(newHouseImages.map(uploadImage));
      }

      const payload: User = {
        ...user,
        houseImage: [...user.houseImage, ...uploadedImages],
      };

      const res = await apiFetchAuthNoRedirect("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setUser(data);
      setNewHouseImages([]);
      localStorage.setItem("user", JSON.stringify(data));

      alert("Saved successfully");
    } catch {
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STOVES ================= */

  const confirmAddStove = () => {
    if (!newStove.name || !newStove.productId) return;

    updateUser({
      stoves: [
        ...user.stoves,
        {
          id: crypto.randomUUID(),
          name: newStove.name,
          productId: newStove.productId,
          note: newStove.note,
          address: newStove.address,
        },
      ],
    });

    setNewStove({ name: "", productId: "", address: "", note: "" });
    setShowStoveModal(false);
  };

  const removeStove = (id: string) => {
    updateUser({
      stoves: user.stoves.filter((s) => s.id !== id),
    });
  };

  const saveBasicInfoToApi = async () => {
    try {
      setLoading(true);

      const payload = {
        name: user.name ?? null,
        address: user.address ?? null,
        addressNote: user.addressNote ?? null,
      };

      const res = await apiFetchAuth("/api/user/me", {
        method: "POST",
        body: payload,
      });

      setUser((prev) => ({
        ...prev,
        ...res,
      }));
    } catch (err) {
      console.error("err", err);
      // alert("Save failed sss");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-6 pb-[30vw]">
      {/* Nickname / Points */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="text-sm text-gray-500">Nickname</div>
        <div className="font-semibold">{user.nickname}</div>

        <div className="mt-2 text-sm text-gray-500">Points</div>
        <div className="font-semibold text-green-600">{user.points}</div>
      </div>

      {/* Editable info */}
      <div className="bg-white rounded-2xl p-4 shadow space-y-4">
        <input
          className="w-full border rounded-xl p-2"
          placeholder="Name"
          value={user.name ?? ""}
          onChange={(e) => updateUser({ name: e.target.value })}
        />

        <input
          className="w-full border rounded-xl p-2"
          placeholder="Address"
          value={user.address ?? ""}
          onChange={(e) => updateUser({ address: e.target.value })}
        />

        <textarea
          className="w-full border rounded-xl p-2"
          placeholder="Address note"
          value={user.addressNote ?? ""}
          onChange={(e) => updateUser({ addressNote: e.target.value })}
        />
      </div>

      {/* Save basic info */}
      <button
        onClick={saveBasicInfoToApi}
        disabled={loading}
        className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save Basic Info"}
      </button>

      {/* House Images */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="flex justify-between mb-3">
          <div className="font-semibold">
            House Images ({user.houseImage.length + newHouseImages.length}/
            {MAX_IMAGES})
          </div>
          <button onClick={triggerPickImage} className="text-green-600">
            <Plus />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={onSelectImages}
        />

        <div className="grid grid-cols-3 gap-2">
          {/* old */}
          {user.houseImage.map((img, i) => (
            <div key={img} className="relative">
              <img src={img} className="h-24 w-full rounded-xl object-cover" />
              <button
                onClick={() => removeOldImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* new */}
          {newHouseImages.map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                className="h-24 w-full rounded-xl object-cover"
              />
              <button
                onClick={() => removeNewImage(i)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stoves */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="flex justify-between mb-3">
          <div className="font-semibold">Stoves</div>
          <button
            onClick={() => setShowStoveModal(true)}
            className="text-green-600"
          >
            <Plus />
          </button>
        </div>

        {user.stoves.map((s) => (
          <div
            key={s.id}
            className="flex justify-between items-center border rounded-xl p-3 mb-2"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">{s.address}</div>
            </div>
            <button onClick={() => removeStove(s.id)}>
              <Trash2 className="text-red-500" size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Stove Modal */}
      {showStoveModal && (
        <div className="fixed inset-0 z-200 bg-black/40 flex items-center justify-center px-[5vw]">
          <div className="bg-white w-full rounded-2xl p-4 space-y-4">
            <div className="font-semibold text-lg">Thêm bếp mới</div>

            <input
              className="w-full border rounded-xl p-2"
              placeholder="Tên bếp"
              value={newStove.name}
              onChange={(e) =>
                setNewStove({ ...newStove, name: e.target.value })
              }
            />

            <input
              className="w-full border rounded-xl p-2"
              placeholder="Địa chỉ bếp"
              value={newStove.address}
              onChange={(e) =>
                setNewStove({ ...newStove, address: e.target.value })
              }
            />

            <input
              className="w-full border rounded-xl p-2"
              placeholder="Ghi chú"
              value={newStove.note}
              onChange={(e) =>
                setNewStove({ ...newStove, note: e.target.value })
              }
            />

            <select
              className="w-full border rounded-xl p-2"
              value={newStove.productId}
              onChange={(e) =>
                setNewStove({ ...newStove, productId: e.target.value })
              }
            >
              <option value="">Select gas type</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.productName}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                className="flex-1 border rounded-xl py-2"
                onClick={() => setShowStoveModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-green-600 text-white rounded-xl py-2"
                onClick={confirmAddStove}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

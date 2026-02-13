import { Stove } from "@prisma/client";
import { FieldCustomed } from "@/components/common/FieldCustom";

export default function TabInfo({
  form,
  setForm,
}: {
  form: Partial<Stove>;
  setForm: any;
}) {
  return (
    <div className="space-y-4">
      <FieldCustomed
        id="name"
        label="Tên bếp"
        value={form.name ?? ""}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <FieldCustomed
        id="address"
        label="Địa chỉ"
        value={form.address ?? ""}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
      />

      <FieldCustomed
        as="textarea"
        id="note"
        label="Ghi chú"
        value={form.note ?? ""}
        onChange={(e) => setForm({ ...form, note: e.target.value })}
      />
    </div>
  );
}

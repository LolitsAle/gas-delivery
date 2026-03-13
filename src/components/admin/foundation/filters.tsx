import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AdminFilterBar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">{children}</div>;
}

export function AdminSearchInput(props: React.ComponentProps<typeof Input>) {
  return <Input placeholder="Search..." className="w-full sm:w-72" {...props} />;
}

export function AdminFilterActions({ onReset, onRefresh }: { onReset: () => void; onRefresh: () => void }) {
  return (
    <>
      <Button variant="outline" onClick={onReset}>Reset</Button>
      <Button variant="outline" onClick={onRefresh}>Refresh</Button>
    </>
  );
}

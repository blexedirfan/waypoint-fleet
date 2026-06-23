import { Search } from "lucide-react";
import { C } from "@/constants/tokens";

export function EmptyState({ message }) {
  return (
    <div
      className="rounded-2xl border border-dashed flex flex-col items-center justify-center py-16 text-center"
      style={{ borderColor: C.line }}
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full mb-3"
        style={{ backgroundColor: C.paper, color: C.muted }}
      >
        <Search size={20} />
      </div>
      <p className="text-sm" style={{ color: C.muted }}>
        {message}
      </p>
    </div>
  );
}

import { Bluetooth } from "lucide-react";

export default function RelayBadge({ relayCount }: { relayCount: number }) {
  if (relayCount === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-info/15 text-info border border-info/30 rounded px-1.5 py-0.5">
      <Bluetooth className="w-2.5 h-2.5" />
      {relayCount} {relayCount === 1 ? "hop" : "hops"}
    </span>
  );
}

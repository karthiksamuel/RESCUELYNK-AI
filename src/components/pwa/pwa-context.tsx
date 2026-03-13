import * as React from "react";

export type NetworkMode = "online" | "offline";
export type SyncMode = "idle" | "syncing" | "error";

export type PwaStatus = {
  network: NetworkMode;
  sync: SyncMode;
  queuedSOS: number;
  syncNow: () => Promise<void>;
};

const PwaContext = React.createContext<PwaStatus | null>(null);

export function PwaProvider({ value, children }: { value: PwaStatus; children: React.ReactNode }) {
  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwaStatus() {
  const ctx = React.useContext(PwaContext);
  if (!ctx) throw new Error("usePwaStatus must be used within PwaProvider");
  return ctx;
}


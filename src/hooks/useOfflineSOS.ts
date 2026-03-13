import * as React from "react";
import { sendAlert } from "@/lib/alertStore";
import { clearStoredSOS, getStoredSOS, type OfflineSOSAlert } from "@/utils/offlineSOS";

export type OfflineSyncState = "idle" | "syncing" | "error";

type SyncResult = {
  delivered: number;
  failed: number;
};

export function useOfflineSOS() {
  const [queue, setQueue] = React.useState<OfflineSOSAlert[]>(() => getStoredSOS());
  const [syncState, setSyncState] = React.useState<OfflineSyncState>("idle");

  const refreshQueue = React.useCallback(() => {
    setQueue(getStoredSOS());
  }, []);

  const syncOfflineSOS = React.useCallback(async (): Promise<SyncResult> => {
    const stored = getStoredSOS();
    if (stored.length === 0) return { delivered: 0, failed: 0 };

    console.log(`[PWA] Sync starting: ${stored.length} offline SOS alert(s) queued`);
    setSyncState("syncing");

    const stillQueued: OfflineSOSAlert[] = [];
    let delivered = 0;

    for (const item of stored) {
      try {
        const res = await sendAlert({
          name: item.name,
          latitude: item.latitude,
          longitude: item.longitude,
          message: item.message,
        });
        if (!res) throw new Error("sendAlert returned null");
        delivered += 1;
        console.log(`[PWA] Offline SOS delivered: ${item.id}`);
      } catch (err) {
        stillQueued.push(item);
        console.warn(`[PWA] Offline SOS delivery failed (will retry): ${item.id}`, err);
      }
    }

    if (stillQueued.length === 0) {
      clearStoredSOS();
    } else {
      localStorage.setItem("rescuelink_offline_sos_queue_v1", JSON.stringify(stillQueued));
    }

    setQueue(stillQueued);
    setSyncState(stillQueued.length === 0 ? "idle" : "error");

    console.log(
      `[PWA] Sync finished: delivered=${delivered}, failed=${stillQueued.length}`,
    );
    return { delivered, failed: stillQueued.length };
  }, []);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "rescuelink_offline_sos_queue_v1") refreshQueue();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refreshQueue]);

  return {
    queue,
    queuedCount: queue.length,
    syncState,
    refreshQueue,
    syncOfflineSOS,
  };
}


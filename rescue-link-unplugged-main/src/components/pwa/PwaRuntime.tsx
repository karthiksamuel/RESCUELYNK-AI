import * as React from "react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useOfflineSOS } from "@/hooks/useOfflineSOS";
import { PwaProvider } from "@/components/pwa/pwa-context";

/**
 * Centralized PWA runtime state:
 * - network online/offline
 * - offline SOS queue length
 * - background sync when connectivity returns
 *
 * Keep this component mounted at the app root so status indicators can subscribe.
 */
export function PwaRuntime({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();
  const { queuedCount, syncState, syncOfflineSOS } = useOfflineSOS();

  const syncNow = React.useCallback(async () => {
    if (!navigator.onLine) return;
    if (queuedCount === 0) return;
    await syncOfflineSOS();
  }, [queuedCount, syncOfflineSOS]);

  React.useEffect(() => {
    if (!isOnline) return;
    if (queuedCount === 0) return;
    syncNow();
  }, [isOnline, queuedCount, syncNow]);

  React.useEffect(() => {
    const onOnline = () => {
      if (queuedCount > 0) {
        console.log("[PWA] online event → attempting offline SOS sync");
        syncNow();
      }
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [queuedCount, syncNow]);

  return (
    <PwaProvider
      value={{
        network: isOnline ? "online" : "offline",
        sync: syncState,
        queuedSOS: queuedCount,
        syncNow,
      }}
    >
      {children}
    </PwaProvider>
  );
}


export type OfflineSOSAlert = {
  id: string;
  createdAt: number;
  name: string;
  latitude: number;
  longitude: number;
  message: string;
};

const STORAGE_KEY = "rescuelink_offline_sos_queue_v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function getStoredSOS(): OfflineSOSAlert[] {
  const parsed = safeParse<OfflineSOSAlert[]>(localStorage.getItem(STORAGE_KEY));
  return Array.isArray(parsed) ? parsed : [];
}

export function storeOfflineSOS(alertData: Omit<OfflineSOSAlert, "id" | "createdAt">): OfflineSOSAlert {
  const next: OfflineSOSAlert = {
    ...alertData,
    id: `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
  };
  const queue = getStoredSOS();
  const updated = [next, ...queue].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return next;
}

export function clearStoredSOS() {
  localStorage.removeItem(STORAGE_KEY);
}


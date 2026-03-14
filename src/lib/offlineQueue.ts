/**
 * Offline SOS Queue — stores alerts locally when offline, syncs when back online.
 */
import { useState, useEffect, useCallback } from "react";
import { sendAlert } from "./alertStore";

export interface OfflineSOSPacket {
  id: string;
  deviceId: string;
  name: string;
  latitude: number;
  longitude: number;
  message: string;
  severity?: string;
  timestamp: number;
  ttl: number;
  delivered: boolean;
}

const QUEUE_KEY = "rescuelink_offline_sos_queue";
const DEVICE_ID_KEY = "rescuelink_device_id";

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `device-${crypto.randomUUID().slice(0, 8)}`;
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function loadQueue(): OfflineSOSPacket[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineSOSPacket[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
}

let queue = loadQueue();
let listeners: (() => void)[] = [];

function notify() {
  saveQueue(queue);
  listeners.forEach((l) => l());
}

export function getOfflineQueue(): OfflineSOSPacket[] {
  return [...queue];
}

export function enqueueOfflineSOS(data: {
  name: string;
  latitude: number;
  longitude: number;
  message: string;
  severity?: string;
}): OfflineSOSPacket {
  const packet: OfflineSOSPacket = {
    id: `SOS-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    deviceId: getDeviceId(),
    name: data.name,
    latitude: data.latitude,
    longitude: data.longitude,
    message: data.message,
    severity: data.severity,
    timestamp: Date.now(),
    ttl: 6,
    delivered: false,
  };
  queue = [packet, ...queue];
  notify();
  return packet;
}

export function markDelivered(id: string) {
  queue = queue.map((p) => (p.id === id ? { ...p, delivered: true } : p));
  notify();
}

export function removeFromQueue(id: string) {
  queue = queue.filter((p) => p.id !== id);
  notify();
}

export function clearDelivered() {
  queue = queue.filter((p) => !p.delivered);
  notify();
}

/**
 * Attempt to sync all undelivered offline SOS alerts to the backend.
 * Returns the number of successfully synced alerts.
 */
export async function syncOfflineQueue(): Promise<number> {
  const undelivered = queue.filter((p) => !p.delivered);
  let synced = 0;

  for (const packet of undelivered) {
    try {
      const result = await sendAlert({
        name: packet.name,
        latitude: packet.latitude,
        longitude: packet.longitude,
        message: `[OFFLINE] ${packet.message}`,
      });
      if (result) {
        markDelivered(packet.id);
        synced++;
      }
    } catch {
      // Stop on first failure — network may be spotty
      break;
    }
  }

  // Clean up delivered items
  if (synced > 0) clearDelivered();
  return synced;
}

// --- React hooks ---

export function useOfflineQueue() {
  const [state, setState] = useState(getOfflineQueue);
  useEffect(() => {
    const l = () => setState(getOfflineQueue());
    listeners.push(l);
    return () => {
      listeners = listeners.filter((x) => x !== l);
    };
  }, []);
  return state;
}

/**
 * Hook that auto-syncs the offline queue when the device comes back online.
 */
export function useAutoSync(onSync?: (count: number) => void) {
  useEffect(() => {
    const handleOnline = async () => {
      const pending = getOfflineQueue().filter((p) => !p.delivered);
      if (pending.length === 0) return;
      const synced = await syncOfflineQueue();
      onSync?.(synced);
    };

    window.addEventListener("online", handleOnline);
    // Also try on mount if we're online and have pending items
    if (navigator.onLine) {
      handleOnline();
    }
    return () => window.removeEventListener("online", handleOnline);
  }, [onSync]);
}

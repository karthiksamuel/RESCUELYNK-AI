import { useState, useEffect, useCallback } from "react";
import type { SOSAlert } from "./alertStore";

export interface MeshNode {
  id: string;
  name: string;
  distance: number;
  lastSeen: number;
}

export interface RelayEvent {
  alertId: string;
  alertName: string;
  fromNode: string;
  toNode: string;
  hop: number;
  timestamp: number;
  ttl: number;
  delivered: boolean;
}

const MESH_NODES_KEY = "rescuelink_mesh_nodes";
const RELAY_LOG_KEY = "rescuelink_relay_log";
const PROCESSED_KEY = "rescuelink_processed_msgs";

const DEVICE_NAMES = [
  "Device-Alpha", "Device-Bravo", "Device-Charlie", "Device-Delta",
  "Device-Echo", "Device-Foxtrot", "Device-Golf", "Device-Hotel",
];

function generateNodes(): MeshNode[] {
  const count = 3 + Math.floor(Math.random() * 4);
  const shuffled = [...DEVICE_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((name) => ({
    id: crypto.randomUUID(),
    name,
    distance: Math.floor(50 + Math.random() * 200),
    lastSeen: Date.now(),
  }));
}

let meshNodes: MeshNode[] = (() => {
  try {
    const raw = localStorage.getItem(MESH_NODES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return generateNodes();
})();

let relayLog: RelayEvent[] = (() => {
  try {
    const raw = localStorage.getItem(RELAY_LOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
})();

// ── Duplicate message detection ──
let processedMessages: Set<string> = (() => {
  try {
    const raw = localStorage.getItem(PROCESSED_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {}
  return new Set<string>();
})();

function persistMesh() {
  try {
    localStorage.setItem(MESH_NODES_KEY, JSON.stringify(meshNodes));
    localStorage.setItem(RELAY_LOG_KEY, JSON.stringify(relayLog));
    localStorage.setItem(PROCESSED_KEY, JSON.stringify([...processedMessages]));
  } catch {}
}

let meshListeners: (() => void)[] = [];

function notifyMesh() {
  persistMesh();
  meshListeners.forEach((l) => l());
}

export function subscribeMesh(listener: () => void) {
  meshListeners.push(listener);
  return () => {
    meshListeners = meshListeners.filter((l) => l !== listener);
  };
}

export function getMeshNodes(): MeshNode[] {
  return [...meshNodes];
}

export function getRelayLog(): RelayEvent[] {
  return [...relayLog];
}

export function getRelayCountForAlert(alertId: string): number {
  return relayLog.filter((r) => r.alertId === alertId).length;
}

export function isMessageProcessed(messageId: string): boolean {
  return processedMessages.has(messageId);
}

export interface RelayStep {
  event: RelayEvent;
  label: string;
  status: "received" | "forwarded" | "delivered" | "duplicate" | "ttl_expired";
}

/**
 * Simulate relaying an alert through the mesh network.
 * Implements TTL control, duplicate detection, and delivery acknowledgement.
 */
export function simulateRelay(
  alert: SOSAlert,
  onStep?: (step: RelayStep) => void
): Promise<RelayEvent[]> {
  return new Promise((resolve) => {
    // ── Duplicate check ──
    if (processedMessages.has(alert.id)) {
      onStep?.({
        event: { alertId: alert.id, alertName: alert.name, fromNode: "This Device", toNode: "-", hop: 0, timestamp: Date.now(), ttl: 0, delivered: false },
        label: `Duplicate SOS detected — already relayed`,
        status: "duplicate",
      });
      resolve([]);
      return;
    }
    processedMessages.add(alert.id);
    notifyMesh();

    const events: RelayEvent[] = [];
    const maxHops = 3 + Math.floor(Math.random() * 3); // 3-5 hops
    const nodes = [...meshNodes].sort(() => Math.random() - 0.5);
    let currentTTL = 6;

    let i = 0;
    const step = () => {
      // ── TTL check ──
      if (currentTTL <= 0) {
        onStep?.({
          event: { alertId: alert.id, alertName: alert.name, fromNode: nodes[i - 1]?.name ?? "Device", toNode: "-", hop: i, timestamp: Date.now(), ttl: 0, delivered: false },
          label: `TTL expired — propagation stopped`,
          status: "ttl_expired",
        });
        resolve(events);
        return;
      }

      if (i >= maxHops || i >= nodes.length - 1) {
        // Final step: delivered to rescue center
        currentTTL--;
        const finalEvent: RelayEvent = {
          alertId: alert.id,
          alertName: alert.name,
          fromNode: nodes[Math.min(i - 1, nodes.length - 1)]?.name ?? "Device",
          toNode: "Rescue Node",
          hop: i + 1,
          timestamp: Date.now(),
          ttl: currentTTL,
          delivered: true,
        };
        events.push(finalEvent);
        relayLog = [finalEvent, ...relayLog].slice(0, 50);
        notifyMesh();
        onStep?.({
          event: finalEvent,
          label: `✓ Alert delivered to rescue center (TTL: ${currentTTL})`,
          status: "delivered",
        });
        resolve(events);
        return;
      }

      currentTTL--;
      const fromNode = i === 0 ? "This Device" : nodes[i - 1].name;
      const toNode = nodes[i].name;
      const event: RelayEvent = {
        alertId: alert.id,
        alertName: alert.name,
        fromNode,
        toNode,
        hop: i + 1,
        timestamp: Date.now(),
        ttl: currentTTL,
        delivered: false,
      };
      events.push(event);
      relayLog = [event, ...relayLog].slice(0, 50);
      notifyMesh();

      const isFirst = i === 0;
      onStep?.({
        event,
        label: isFirst
          ? `${toNode} received alert (TTL: ${currentTTL})`
          : `${fromNode} → ${toNode} (TTL: ${currentTTL})`,
        status: isFirst ? "received" : "forwarded",
      });

      i++;
      setTimeout(step, 1000 + Math.random() * 1000);
    };
    setTimeout(step, 500);
  });
}

/** Refresh simulated nearby nodes */
export function refreshNodes() {
  meshNodes = generateNodes();
  notifyMesh();
}

/** Clear processed messages cache */
export function clearProcessedMessages() {
  processedMessages.clear();
  notifyMesh();
}

// --- React hooks ---

export function useMeshNodes() {
  const [state, setState] = useState(getMeshNodes);
  useEffect(() => subscribeMesh(() => setState(getMeshNodes())), []);
  return state;
}

export function useRelayLog() {
  const [state, setState] = useState(getRelayLog);
  useEffect(() => subscribeMesh(() => setState(getRelayLog())), []);
  return state;
}

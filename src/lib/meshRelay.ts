import { useState, useEffect, useCallback } from "react";
import type { SOSAlert } from "./alertStore";
import { getLoRaNodes } from "./loraRelay";
import { getDroneNodes } from "./droneRelay";

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
  hopType: "device-hop" | "drone-hop" | "lora-hop";
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
        event: { alertId: alert.id, alertName: alert.name, fromNode: "This Device", toNode: "-", hop: 0, hopType: "device-hop", timestamp: Date.now(), ttl: 0, delivered: false },
        label: `Duplicate SOS detected — already relayed`,
        status: "duplicate",
      });
      resolve([]);
      return;
    }
    processedMessages.add(alert.id);
    notifyMesh();

    const events: RelayEvent[] = [];
    const deviceHops = 1 + Math.floor(Math.random() * 2); // 1-2 device hops
    const nodes = [...meshNodes].sort(() => Math.random() - 0.5);
    const droneNodes = getDroneNodes().filter(n => n.relayStatus === "active");
    const loraNodes = getLoRaNodes()
      .filter(n => n.relayStatus === "active")
      .sort((a, b) => {
        // Priority 1: Distance to alarm
        const distA = Math.sqrt(Math.pow(a.latitude - alert.latitude, 2) + Math.pow(a.longitude - alert.longitude, 2));
        const distB = Math.sqrt(Math.pow(b.latitude - alert.latitude, 2) + Math.pow(b.longitude - alert.longitude, 2));
        if (Math.abs(distA - distB) > 0.1) return distA - distB;
        // Priority 2: Signal Strength
        return b.signalStrength - a.signalStrength;
      });
    let currentTTL = 10;

    let i = 0;
    let relayPhase: "mesh" | "drone" | "lora" | "final" = "mesh";
    let loraIdx = 0;
    let droneIdx = 0;

    const step = () => {
      if (currentTTL <= 0) {
        onStep?.({
          event: { 
            alertId: alert.id, alertName: alert.name, fromNode: "System", toNode: "-", 
            hop: i, hopType: relayPhase === "lora" || relayPhase === "final" ? "lora-hop" : relayPhase === "drone" ? "drone-hop" : "device-hop", 
            timestamp: Date.now(), ttl: 0, delivered: false 
          },
          label: `TTL expired — propagation stopped`,
          status: "ttl_expired",
        });
        resolve(events);
        return;
      }

      // Phase 1: Bluetooth Mesh Hops
      if (relayPhase === "mesh") {
        if (i < deviceHops && i < nodes.length) {
          currentTTL--;
          const fromNode = i === 0 ? "This Device" : nodes[i - 1].name;
          const toNode = nodes[i].name;
          const event: RelayEvent = {
            alertId: alert.id,
            alertName: alert.name,
            fromNode,
            toNode,
            hop: i + 1,
            hopType: "device-hop",
            timestamp: Date.now(),
            ttl: currentTTL,
            delivered: false,
          };
          events.push(event);
          relayLog = [event, ...relayLog].slice(0, 50);
          notifyMesh();

          onStep?.({
            event,
            label: i === 0 
              ? `Mesh: ${toNode} received alert (Short Range)` 
              : `Mesh: ${fromNode} → ${toNode}`,
            status: i === 0 ? "received" : "forwarded",
          });

          i++;
          setTimeout(step, 800);
          return;
        } else {
          relayPhase = droneNodes.length > 0 ? "drone" : "lora";
          onStep?.({
            event: { 
              alertId: alert.id, alertName: alert.name, fromNode: "Local Mesh", toNode: relayPhase === "drone" ? "Drone Relay" : "LoRa Gateway", 
              hop: i, hopType: relayPhase === "drone" ? "drone-hop" : "lora-hop", timestamp: Date.now(), ttl: currentTTL, delivered: false 
            },
            label: relayPhase === "drone" ? `⤧ Escalating to Aerial Drone Relay...` : `⤧ Escalating to LoRa Long-Range Relay...`,
            status: "forwarded",
          });
          setTimeout(step, 1000);
          return;
        }
      }

      // Phase 2: Drone Relay Hops
      if (relayPhase === "drone") {
        if (droneIdx < droneNodes.length) {
          currentTTL--;
          const targetDrone = droneNodes[droneIdx];
          const fromLabel = droneIdx === 0 ? "Mesh Gateway" : droneNodes[droneIdx - 1].droneId;

          const event: RelayEvent = {
            alertId: alert.id,
            alertName: alert.name,
            fromNode: fromLabel,
            toNode: targetDrone.droneId,
            hop: i + 1,
            hopType: "drone-hop",
            timestamp: Date.now(),
            ttl: currentTTL,
            delivered: false,
          };
          events.push(event);
          relayLog = [event, ...relayLog].slice(0, 50);
          notifyMesh();

          onStep?.({
            event,
            label: `Drone: ${targetDrone.droneId} (Alt: ${targetDrone.altitude}m)`,
            status: "forwarded",
          });

          i++;
          droneIdx++;
          setTimeout(step, 1200);
          return;
        } else {
          relayPhase = "lora";
          onStep?.({
            event: { 
              alertId: alert.id, alertName: alert.name, fromNode: "Drone Network", toNode: "LoRa Gateway", 
              hop: i, hopType: "lora-hop", timestamp: Date.now(), ttl: currentTTL, delivered: false 
            },
            label: `⤧ Transitioning to LoRa Backbone...`,
            status: "forwarded",
          });
          setTimeout(step, 1000);
          return;
        }
      }

      // Phase 3: LoRa Relay Hops
      if (relayPhase === "lora") {
        if (loraIdx < loraNodes.length) {
          currentTTL--;
          const targetLoRa = loraNodes[loraIdx];
          const fromLabel = loraIdx === 0 ? (droneNodes.length > 0 ? "Drone Gateway" : "Mesh Gateway") : loraNodes[loraIdx - 1].nodeId;
          
          const event: RelayEvent = {
            alertId: alert.id,
            alertName: alert.name,
            fromNode: fromLabel,
            toNode: targetLoRa.nodeId,
            hop: i + 1,
            hopType: "lora-hop",
            timestamp: Date.now(),
            ttl: currentTTL,
            delivered: false,
          };
          events.push(event);
          relayLog = [event, ...relayLog].slice(0, 50);
          notifyMesh();

          onStep?.({
            event,
            label: `LoRa: ${targetLoRa.nodeId} (Range: ${targetLoRa.coverageRadius}km)`,
            status: "forwarded",
          });

          i++;
          loraIdx++;
          setTimeout(step, 1500); // LoRa takes longer
          return;
        } else {
          relayPhase = "final";
        }
      }

      // Final Delivery
      if (relayPhase === "final") {
        currentTTL--;
        const finalEvent: RelayEvent = {
          alertId: alert.id,
          alertName: alert.name,
          fromNode: loraNodes[loraNodes.length - 1]?.nodeId ?? (droneNodes[droneNodes.length - 1]?.droneId ?? "Relay Node"),
          toNode: "Command Center",
          hop: i + 1,
          hopType: "lora-hop",
          timestamp: Date.now(),
          ttl: currentTTL,
          delivered: true,
        };
        events.push(finalEvent);
        relayLog = [finalEvent, ...relayLog].slice(0, 50);
        notifyMesh();

        onStep?.({
          event: finalEvent,
          label: `✓ SOS delivered to Command Center via Hybrid Network`,
          status: "delivered",
        });
        resolve(events);
      }
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

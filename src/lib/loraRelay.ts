import { useState, useEffect } from "react";

export interface LoRaNode {
  nodeId: string;
  latitude: number;
  longitude: number;
  batteryLevel: number;
  signalStrength: number;
  relayStatus: "active" | "offline";
  coverageRadius: number; // in km
}

const LORA_NODES_KEY = "rescuelink_lora_nodes";

// Initial mock nodes spread across a wide area (simulating 100-200km range)
// Centered around a hypothetical disaster zone (using Manila area coordinates from SOSScreen)
const INITIAL_LORA_NODES: LoRaNode[] = [
  {
    nodeId: "LORA-01",
    latitude: 14.5995,
    longitude: 121.05, // ~6km East
    batteryLevel: 98,
    signalStrength: 85,
    relayStatus: "active",
    coverageRadius: 15,
  },
  {
    nodeId: "LORA-02",
    latitude: 14.65,
    longitude: 121.10, // ~12km NE
    batteryLevel: 92,
    signalStrength: 78,
    relayStatus: "active",
    coverageRadius: 12,
  },
  {
    nodeId: "LORA-03",
    latitude: 14.50,
    longitude: 121.00, // ~10km South
    batteryLevel: 45,
    signalStrength: 62,
    relayStatus: "active",
    coverageRadius: 10,
  },
  {
    nodeId: "LORA-04",
    latitude: 14.40,
    longitude: 121.15, // ~25km SE
    batteryLevel: 12,
    signalStrength: 45,
    relayStatus: "offline",
    coverageRadius: 15,
  },
  {
    nodeId: "LORA-05",
    latitude: 14.80,
    longitude: 121.30, // ~40km North
    batteryLevel: 88,
    signalStrength: 92,
    relayStatus: "active",
    coverageRadius: 15,
  }
];

let loraNodes: LoRaNode[] = (() => {
  try {
    const raw = localStorage.getItem(LORA_NODES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_LORA_NODES;
})();

function persistLoRa() {
  try {
    localStorage.setItem(LORA_NODES_KEY, JSON.stringify(loraNodes));
  } catch {}
}

let listeners: (() => void)[] = [];

function notify() {
  persistLoRa();
  listeners.forEach(l => l());
}

export function getLoRaNodes(): LoRaNode[] {
  return [...loraNodes];
}

export function updateLoRaNodeStatus(nodeId: string, status: "active" | "offline") {
  const node = loraNodes.find(n => n.nodeId === nodeId);
  if (node) {
    node.relayStatus = status;
    notify();
  }
}

export function useLoRaNodes() {
  const [nodes, setNodes] = useState(getLoRaNodes());
  useEffect(() => {
    const l = () => setNodes(getLoRaNodes());
    listeners.push(l);
    return () => {
      listeners = listeners.filter(x => x !== l);
    };
  }, []);
  return nodes;
}

import { useState, useEffect } from "react";

export interface DroneNode {
  droneId: string;
  latitude: number;
  longitude: number;
  altitude: number; // in meters
  batteryLevel: number;
  signalStrength: number;
  relayStatus: "active" | "offline" | "deploying";
  coverageRadius: number; // in km
}

const DRONE_NODES_KEY = "rescuelink_drone_nodes";
const DRONE_DEPLOYED_KEY = "rescuelink_drones_deployed";

// Initial mock drones positioned as mid-tier relays
const INITIAL_DRONE_NODES: DroneNode[] = [
  {
    droneId: "DRONE-ALPHA",
    latitude: 14.62,
    longitude: 121.02,
    altitude: 150,
    batteryLevel: 88,
    signalStrength: 95,
    relayStatus: "active",
    coverageRadius: 20,
  },
  {
    droneId: "DRONE-BRAVO",
    latitude: 14.55,
    longitude: 121.08,
    altitude: 120,
    batteryLevel: 72,
    signalStrength: 82,
    relayStatus: "active",
    coverageRadius: 18,
  },
  {
    droneId: "DRONE-CHARLIE",
    latitude: 14.68,
    longitude: 121.05,
    altitude: 140,
    batteryLevel: 45,
    signalStrength: 75,
    relayStatus: "active",
    coverageRadius: 20,
  }
];

let dronesDeployed: boolean = (() => {
  try {
    const raw = localStorage.getItem(DRONE_DEPLOYED_KEY);
    return raw === "true";
  } catch {
    return false;
  }
})();

let droneNodes: DroneNode[] = (() => {
  try {
    const raw = localStorage.getItem(DRONE_NODES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_DRONE_NODES;
})();

function persistDrones() {
  try {
    localStorage.setItem(DRONE_NODES_KEY, JSON.stringify(droneNodes));
    localStorage.setItem(DRONE_DEPLOYED_KEY, dronesDeployed.toString());
  } catch {}
}

let listeners: (() => void)[] = [];

function notify() {
  persistDrones();
  listeners.forEach(l => l());
}

export function getDroneNodes(): DroneNode[] {
  return dronesDeployed ? [...droneNodes] : [];
}

export function areDronesDeployed(): boolean {
  return dronesDeployed;
}

export function toggleDroneDeployment() {
  dronesDeployed = !dronesDeployed;
  notify();
}

export function useDroneNodes() {
  const [nodes, setNodes] = useState(getDroneNodes());
  const [deployed, setDeployed] = useState(areDronesDeployed());

  useEffect(() => {
    const l = () => {
      setNodes(getDroneNodes());
      setDeployed(areDronesDeployed());
    };
    listeners.push(l);
    return () => {
      listeners = listeners.filter(x => x !== l);
    };
  }, []);

  return { nodes, deployed, toggleDroneDeployment };
}

import { useState, useEffect, useRef } from "react";
import { getAlerts, getActiveAlerts, subscribe as subscribeAlerts, type SOSAlert } from "./alertStore";

export type TeamType = "Medical" | "Fire Rescue" | "Search & Rescue";
export type TeamStatus = "Available" | "En Route" | "Responding";

export interface RescueTeam {
  id: string;
  name: string;
  type: TeamType;
  latitude: number;
  longitude: number;
  status: TeamStatus;
  assignedAlertId: string | null;
  eta: number | null; // minutes
}

export interface DangerZone {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  type: string;
}

const INITIAL_TEAMS: RescueTeam[] = [
  { id: "team-alpha", name: "Team Alpha", type: "Medical", latitude: 14.6150, longitude: 120.9750, status: "Responding", assignedAlertId: "demo-1", eta: 6 },
  { id: "team-bravo", name: "Team Bravo", type: "Fire Rescue", latitude: 14.5300, longitude: 121.0500, status: "En Route", assignedAlertId: "demo-2", eta: 12 },
  { id: "team-delta", name: "Team Delta", type: "Search & Rescue", latitude: 14.5800, longitude: 121.0000, status: "Available", assignedAlertId: null, eta: null },
];

export const DANGER_ZONES: DangerZone[] = [
  { id: "dz-1", label: "Flood Zone A", latitude: 14.5700, longitude: 121.0100, radius: 500, type: "flood" },
  { id: "dz-2", label: "Fire Zone B", latitude: 14.6050, longitude: 120.9900, radius: 350, type: "fire" },
];

let teams = [...INITIAL_TEAMS];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

function subscribeTeams(listener: () => void) {
  listeners.push(listener);
  return () => { listeners = listeners.filter((l) => l !== listener); };
}

export function getTeams(): RescueTeam[] {
  return [...teams];
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getTeamDistance(team: RescueTeam, alert: SOSAlert): number {
  return distanceKm(team.latitude, team.longitude, alert.latitude, alert.longitude);
}

export function assignNearestTeam(alert: SOSAlert): RescueTeam | null {
  const available = teams.filter((t) => t.status === "Available");
  if (available.length === 0) return null;
  let nearest = available[0];
  let minDist = getTeamDistance(nearest, alert);
  for (const t of available.slice(1)) {
    const d = getTeamDistance(t, alert);
    if (d < minDist) { nearest = t; minDist = d; }
  }
  teams = teams.map((t) =>
    t.id === nearest.id ? { ...t, status: "En Route" as TeamStatus, assignedAlertId: alert.id, eta: Math.round((minDist / 30) * 60) } : t
  );
  notify();
  return nearest;
}

// Simulate movement toward assigned SOS
function tick() {
  const alerts = getActiveAlerts();
  let changed = false;
  teams = teams.map((t) => {
    if (!t.assignedAlertId) return t;
    const alert = alerts.find((a) => a.id === t.assignedAlertId);
    if (!alert) {
      // Alert was resolved — free the team
      changed = true;
      return { ...t, status: "Available" as TeamStatus, assignedAlertId: null, eta: null };
    }
    const dist = getTeamDistance(t, alert);
    if (dist < 0.05) {
      changed = true;
      return { ...t, status: "Responding" as TeamStatus, eta: 0, latitude: alert.latitude, longitude: alert.longitude };
    }
    const step = 0.002;
    const dLat = alert.latitude - t.latitude;
    const dLng = alert.longitude - t.longitude;
    const mag = Math.sqrt(dLat ** 2 + dLng ** 2);
    changed = true;
    const newLat = t.latitude + (dLat / mag) * step;
    const newLng = t.longitude + (dLng / mag) * step;
    const newDist = distanceKm(newLat, newLng, alert.latitude, alert.longitude);
    return { ...t, latitude: newLat, longitude: newLng, eta: Math.max(1, Math.round((newDist / 30) * 60)), status: "En Route" as TeamStatus };
  });
  if (changed) notify();
}

let intervalId: ReturnType<typeof setInterval> | null = null;

function ensureSimulation() {
  if (intervalId) return;
  intervalId = setInterval(tick, 3000);
}

export function useRescueTeams(): RescueTeam[] {
  const [state, setState] = useState(getTeams());
  useEffect(() => {
    ensureSimulation();
    return subscribeTeams(() => setState(getTeams()));
  }, []);
  return state;
}

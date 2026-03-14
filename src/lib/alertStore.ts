/**
 * Supabase-backed SOS Alert Store with real-time subscriptions
 */
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AlertStatus = "active" | "responding" | "resolved";

export interface SOSAlert {
  id: string;
  user_id: string | null;
  name: string;
  latitude: number;
  longitude: number;
  message: string;
  status: AlertStatus;
  relay_count: number;
  severity: string | null;
  priorityLevel?: string;
  priorityColor?: string;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  // Legacy compat aliases
  timestamp: string;
  relayCount: number;
  resolvedAt?: string;
  resolvedBy?: string;
}

function mapRow(row: any): SOSAlert {
  return {
    ...row,
    // Legacy aliases for existing UI components
    timestamp: row.created_at,
    relayCount: row.relay_count,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    priorityLevel: row.severity, // Map severity to priorityLevel for UI
  };
}

// ── Queries ──

export async function fetchAlerts(): Promise<SOSAlert[]> {
  const { data, error } = await supabase
    .from("sos_alerts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchAlerts:", error); return []; }
  return (data || []).map(mapRow);
}

export async function fetchActiveAlerts(): Promise<SOSAlert[]> {
  const { data, error } = await supabase
    .from("sos_alerts")
    .select("*")
    .neq("status", "resolved")
    .order("created_at", { ascending: false });
  if (error) { console.error("fetchActiveAlerts:", error); return []; }
  return (data || []).map(mapRow);
}

export async function fetchResolvedAlerts(): Promise<SOSAlert[]> {
  const { data, error } = await supabase
    .from("sos_alerts")
    .select("*")
    .eq("status", "resolved")
    .order("resolved_at", { ascending: false });
  if (error) { console.error("fetchResolvedAlerts:", error); return []; }
  return (data || []).map(mapRow);
}

// ── Mutations ──

export async function sendAlert(data: {
  name: string;
  latitude: number;
  longitude: number;
  message: string;
  userId?: string;
}): Promise<SOSAlert | null> {
  // Get authenticated user id for RLS compliance
  let userId = data.userId || null;
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  }

  const { classifyEmergency } = await import("@/utils/emergencyAI");
  const classification = classifyEmergency(data.message);

  const { data: row, error } = await supabase
    .from("sos_alerts")
    .insert({
      name: data.name,
      latitude: data.latitude,
      longitude: data.longitude,
      message: data.message,
      user_id: userId,
      status: "active",
      severity: classification.severity,
    })
    .select()
    .single();
  if (error) { console.error("sendAlert:", error); return null; }

  // Log activity
  await supabase.from("activity_logs").insert({
    alert_id: row.id,
    action: "sos_created",
    description: `SOS alert created by ${data.name}`,
  });

  return mapRow(row);
}

export async function updateAlertRelayCount(id: string, relayCount: number) {
  await supabase.from("sos_alerts").update({ relay_count: relayCount }).eq("id", id);
}

export async function setAlertStatus(id: string, status: AlertStatus) {
  await supabase.from("sos_alerts").update({ status }).eq("id", id);
}

export async function resolveAlert(id: string, resolvedBy?: string) {
  const { data: alert } = await supabase.from("sos_alerts").select("name").eq("id", id).single();

  await supabase.from("sos_alerts").update({
    status: "resolved",
    resolved_at: new Date().toISOString(),
    resolved_by: resolvedBy || "Command Center",
  }).eq("id", id);

  // Free assigned rescue team
  await supabase.from("rescue_teams").update({
    status: "available",
    assigned_alert_id: null,
  }).eq("assigned_alert_id", id);

  // Log activity
  await supabase.from("activity_logs").insert({
    alert_id: id,
    action: "rescue_completed",
    description: `${alert?.name || "Victim"} rescued by ${resolvedBy || "Command Center"}`,
  });
}

// ── Hooks with real-time ──

export function useAlerts() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);

  useEffect(() => {
    fetchAlerts().then(setAlerts);

    const channel = supabase
      .channel("sos_alerts_all")
      .on("postgres_changes", { event: "*", schema: "public", table: "sos_alerts" }, () => {
        fetchAlerts().then(setAlerts);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return alerts;
}

export function useActiveAlerts() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);

  useEffect(() => {
    fetchActiveAlerts().then(setAlerts);

    const channel = supabase
      .channel("sos_alerts_active")
      .on("postgres_changes", { event: "*", schema: "public", table: "sos_alerts" }, () => {
        fetchActiveAlerts().then(setAlerts);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return alerts;
}

export function useResolvedAlerts() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);

  useEffect(() => {
    fetchResolvedAlerts().then(setAlerts);

    const channel = supabase
      .channel("sos_alerts_resolved")
      .on("postgres_changes", { event: "*", schema: "public", table: "sos_alerts" }, () => {
        fetchResolvedAlerts().then(setAlerts);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return alerts;
}

// ── Activity Logs ──

export function useActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      setLogs(data || []);
    }
    load();

    const channel = supabase
      .channel("activity_logs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_logs" }, () => {
        load();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return logs;
}

// ── Legacy exports for backward compat ──
export { subscribe, getAlerts, getActiveAlerts, getResolvedAlerts } from "./alertStoreLegacy";

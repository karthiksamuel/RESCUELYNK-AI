/**
 * Legacy alert store functions for components that still use the subscribe pattern.
 * These are no-ops — the real data comes from Supabase hooks.
 */
import React from "react";
import type { SOSAlert, AlertStatus } from "./alertStore";

export type { SOSAlert, AlertStatus };

export function subscribe(_listener: () => void) {
  return () => {};
}

export function getAlerts(): SOSAlert[] { return []; }
export function getActiveAlerts(): SOSAlert[] { return []; }
export function getResolvedAlerts(): SOSAlert[] { return []; }

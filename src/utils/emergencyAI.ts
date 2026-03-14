
export type EmergencySeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface EmergencyClassification {
  severity: EmergencySeverity;
  color: "RED" | "ORANGE" | "YELLOW" | "GREEN";
}

const CRITICAL_KEYWORDS = [
  "collapse", "trapped", "severe injury", "unconscious", "not breathing",
  "major bleeding", "crushed", "buried", "suffocating", "building down"
];

const HIGH_KEYWORDS = [
  "flood danger", "fire spread", "missing persons", "burning", "rising water",
  "stuck on roof", "wildfire", "smoke", "chemical leak", "explosion"
];

const MEDIUM_KEYWORDS = [
  "injured", "stable", "broken bone", "burns", "chest pain", "bleeding",
  "fever", "diabetic", "medicine needed"
];

export function classifyEmergency(message: string): EmergencyClassification {
  const msg = message.toLowerCase();

  if (CRITICAL_KEYWORDS.some(k => msg.includes(k))) {
    return { severity: "CRITICAL", color: "RED" };
  }

  if (HIGH_KEYWORDS.some(k => msg.includes(k))) {
    return { severity: "HIGH", color: "ORANGE" };
  }

  if (MEDIUM_KEYWORDS.some(k => msg.includes(k))) {
    return { severity: "MEDIUM", color: "YELLOW" };
  }

  return { severity: "LOW", color: "GREEN" };
}

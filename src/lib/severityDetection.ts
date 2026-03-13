/**
 * Emergency Severity Detection Engine
 * Analyzes user messages and classifies emergency level.
 */

export type SeverityLevel = 1 | 2 | 3;

export interface SeverityResult {
  level: SeverityLevel;
  label: string;
  color: string;        // HSL CSS variable name
  matchedKeywords: string[];
  autoSOS: boolean;
  rescueMessage?: string;
}

const CRITICAL_KEYWORDS = [
  "trapped", "bleeding heavily", "building collapse", "drowning",
  "fire spreading", "cannot breathe", "can't breathe", "suffocating",
  "crushed", "buried alive", "dying", "heart attack", "cardiac arrest",
  "unconscious", "not breathing", "severe bleeding", "stabbed",
  "building collapsed", "collapse", "rubble", "pinned", "choking",
  "electrocuted", "explosion", "tsunami", "flash flood",
];

const MEDIUM_KEYWORDS = [
  "injured", "flood water rising", "lost in forest", "severe pain",
  "broken bone", "fracture", "concussion", "bleeding", "burn",
  "dislocated", "sprain", "lost", "stranded", "hypothermia",
  "dehydrated", "heatstroke", "snake bite", "bitten",
  "water rising", "stuck", "help", "hurt", "wound",
  "smoke inhalation", "aftershock",
];

const LOW_KEYWORDS = [
  "safety advice", "emergency tips", "survival guidance",
  "prepare", "prevention", "kit", "plan", "training",
  "first aid", "supply", "shelter", "purify", "signal",
  "how to", "what should", "guide",
];

const RESCUE_TEAMS = [
  "Medical Team Alpha",
  "Fire Rescue Bravo",
  "Search & Rescue Charlie",
  "Hazmat Response Delta",
  "Swift Water Echo",
];

function findMatches(text: string, keywords: string[]): string[] {
  const lower = text.toLowerCase();
  return keywords.filter(kw => lower.includes(kw));
}

export function detectSeverity(message: string): SeverityResult {
  const criticalMatches = findMatches(message, CRITICAL_KEYWORDS);
  const mediumMatches = findMatches(message, MEDIUM_KEYWORDS);
  const lowMatches = findMatches(message, LOW_KEYWORDS);

  if (criticalMatches.length > 0) {
    const team = RESCUE_TEAMS[Math.floor(Math.random() * RESCUE_TEAMS.length)];
    return {
      level: 3,
      label: "CRITICAL EMERGENCY",
      color: "emergency",
      matchedKeywords: criticalMatches,
      autoSOS: true,
      rescueMessage: `High priority rescue activated — ${team} dispatched`,
    };
  }

  if (mediumMatches.length > 0) {
    return {
      level: 2,
      label: "MEDIUM RISK",
      color: "warning",
      matchedKeywords: mediumMatches,
      autoSOS: false,
    };
  }

  return {
    level: 1,
    label: "LOW RISK",
    color: "safe",
    matchedKeywords: lowMatches,
    autoSOS: false,
  };
}

/**
 * RescueLink RAG Survival AI Engine
 * 
 * Simulates a Retrieval-Augmented Generation pipeline:
 * 1. Tokenize & expand user query
 * 2. Score documents using TF-IDF-like keyword matching
 * 3. Retrieve top-K relevant documents
 * 4. Generate a contextual natural-language response
 * 5. Support conversation memory for follow-up questions
 */

// ── Knowledge Documents ──────────────────────────────────────────────

export interface SurvivalDocument {
  id: string;
  topic: string;
  subtopic: string;
  keywords: string[];
  content: string;
  steps: string[];
  severity: "critical" | "high" | "moderate" | "info";
}

const KNOWLEDGE_BASE: SurvivalDocument[] = [
  {
    id: "eq-during",
    topic: "earthquake",
    subtopic: "during earthquake",
    keywords: ["earthquake", "quake", "shaking", "tremor", "seismic", "ground", "building", "collapse", "rubble", "trapped"],
    content: "During an earthquake, the most important action is DROP, COVER, and HOLD ON. Get under sturdy furniture like a desk or table. Protect your head and neck. Stay away from windows, exterior walls, and heavy objects that could fall.",
    steps: [
      "DROP to your hands and knees immediately",
      "Take COVER under sturdy furniture or against an interior wall",
      "HOLD ON to your shelter and protect your head and neck",
      "Stay away from windows, mirrors, and heavy objects",
      "If outdoors, move to an open area away from buildings and power lines",
      "If driving, pull over safely and stay inside the vehicle",
    ],
    severity: "critical",
  },
  {
    id: "eq-after",
    topic: "earthquake",
    subtopic: "after earthquake",
    keywords: ["aftershock", "after", "earthquake", "damage", "check", "inspect", "safe"],
    content: "After an earthquake, check yourself and others for injuries. Be prepared for aftershocks. If trapped, tap on pipes or walls to signal rescuers — do not shout to conserve energy and avoid inhaling dust.",
    steps: [
      "Check yourself and others for injuries",
      "Be prepared for aftershocks — they can be strong",
      "If trapped, tap on pipes or walls — don't shout (conserve energy)",
      "Use a flashlight, not matches or lighters (gas leak risk)",
      "Check for gas leaks, damaged wiring, and structural damage",
      "Move to higher ground if near the coast (tsunami risk)",
      "Listen to emergency broadcasts for instructions",
    ],
    severity: "high",
  },
  {
    id: "eq-trapped",
    topic: "earthquake",
    subtopic: "trapped under rubble",
    keywords: ["trapped", "rubble", "stuck", "collapsed", "building", "debris", "buried", "rescue", "help"],
    content: "If trapped under rubble after an earthquake, stay calm and conserve your energy. Cover your mouth and nose with cloth to filter dust. Signal for help by tapping on pipes or walls.",
    steps: [
      "Stay as calm as possible — panic wastes energy and oxygen",
      "Cover your mouth and nose with cloth to filter dust",
      "Do NOT light matches — there may be gas leaks",
      "Tap on pipes or walls at regular intervals to signal rescuers",
      "Use a whistle if available — sound carries further than voice",
      "Conserve your energy — avoid unnecessary movement",
      "If possible, move toward light or fresh air sources",
    ],
    severity: "critical",
  },
  {
    id: "flood-during",
    topic: "flood",
    subtopic: "during flood",
    keywords: ["flood", "flooding", "water", "rising", "submerged", "drown", "current", "flow", "rain", "heavy"],
    content: "During a flood, move to higher ground immediately. Never walk or drive through floodwater — just 6 inches of moving water can knock you down, and 2 feet can carry away a vehicle.",
    steps: [
      "Move to higher ground immediately — do NOT wait",
      "Never walk through moving floodwater — 6 inches can knock you down",
      "Never drive through flooded roads — 2 feet can float a car",
      "Climb to the highest point of your building if trapped",
      "Signal for help from rooftop or windows using bright cloth",
      "Avoid contact with floodwater — it may be contaminated or electrified",
      "Stay away from downed power lines in flooded areas",
    ],
    severity: "critical",
  },
  {
    id: "flood-after",
    topic: "flood",
    subtopic: "after flood",
    keywords: ["flood", "after", "cleanup", "contaminated", "return", "damage", "mold"],
    content: "After a flood, do not return home until authorities declare it safe. Floodwater may be contaminated with sewage, chemicals, and debris. Boil all water before drinking.",
    steps: [
      "Don't return home until authorities say it's safe",
      "Boil all water before drinking — floodwater contaminates supply",
      "Wear protective gear when cleaning flood-damaged areas",
      "Watch for weakened structures, downed power lines",
      "Document damage with photos for insurance claims",
      "Dry out buildings within 24-48 hours to prevent mold",
      "Discard food that contacted floodwater",
    ],
    severity: "high",
  },
  {
    id: "fire-escape",
    topic: "fire",
    subtopic: "fire escape",
    keywords: ["fire", "smoke", "burn", "flame", "escape", "exit", "building", "house", "room"],
    content: "In a fire, stay low to avoid smoke inhalation — smoke rises so cleaner air is near the floor. Feel doors before opening. If hot, find another route. If clothes catch fire: STOP, DROP, ROLL.",
    steps: [
      "Stay LOW — smoke rises, cleaner air is near the floor",
      "Cover your nose and mouth with a wet cloth if possible",
      "Feel doors before opening — if hot, find another exit",
      "Close doors behind you to slow fire spread",
      "If clothes catch fire: STOP, DROP, and ROLL",
      "Meet at a predetermined safe location outside",
      "Call emergency services once safely outside",
      "Never go back inside a burning building",
    ],
    severity: "critical",
  },
  {
    id: "fire-wildfire",
    topic: "fire",
    subtopic: "wildfire",
    keywords: ["wildfire", "forest", "fire", "smoke", "evacuate", "brush"],
    content: "During a wildfire, evacuate immediately when told to do so. Wear protective clothing and an N95 mask. Drive with headlights on and windows closed.",
    steps: [
      "Evacuate immediately when ordered — don't delay",
      "Wear long sleeves, pants, and N95 mask for smoke",
      "Close all windows, doors, and vents in your home before leaving",
      "Drive with headlights on, windows closed",
      "If trapped, go to a cleared area or body of water",
      "Stay low if caught in smoke — air quality is better near ground",
    ],
    severity: "critical",
  },
  {
    id: "hurricane-prep",
    topic: "hurricane",
    subtopic: "hurricane preparation and survival",
    keywords: ["hurricane", "cyclone", "typhoon", "storm", "wind", "surge", "category", "evacuation"],
    content: "During a hurricane, move to an interior room away from windows. Board up windows and secure outdoor objects. Have 72 hours of supplies ready.",
    steps: [
      "Board up windows and secure outdoor furniture and objects",
      "Move to an interior room away from windows",
      "Fill bathtubs with water for sanitation and hygiene",
      "Keep emergency supplies: water, food, medications for 72+ hours",
      "Charge all devices and have battery-powered radio ready",
      "After the storm, avoid downed power lines and standing water",
      "Don't return to evacuated areas until authorities clear them",
    ],
    severity: "critical",
  },
  {
    id: "tornado-safety",
    topic: "tornado",
    subtopic: "tornado safety",
    keywords: ["tornado", "twister", "funnel", "wind", "shelter", "basement", "storm"],
    content: "If a tornado is approaching, seek shelter immediately in a basement or interior room on the lowest floor. Stay away from windows, doors, and outside walls.",
    steps: [
      "Go to a basement or interior room on the lowest floor",
      "Stay away from windows, doors, and outside walls",
      "Get under sturdy furniture and cover yourself with a mattress or blankets",
      "If in a vehicle, get out and lie flat in a low-lying area",
      "Never try to outrun a tornado in a vehicle",
      "Cover your head and neck with your arms",
    ],
    severity: "critical",
  },
  {
    id: "firstaid-bleeding",
    topic: "first aid",
    subtopic: "bleeding and wounds",
    keywords: ["bleed", "bleeding", "wound", "cut", "stab", "stabbed", "laceration", "blood", "bandage", "pressure", "injury", "injured", "hurt"],
    content: "For bleeding wounds, apply direct firm pressure using a clean cloth or bandage. Keep the injured area elevated above the heart if possible. Do not remove objects embedded in wounds.",
    steps: [
      "Apply firm direct pressure to the wound with clean cloth",
      "Keep applying pressure — do NOT remove the cloth to check",
      "If blood soaks through, add more cloth on top",
      "Elevate the injured area above heart level if possible",
      "Do NOT remove objects embedded in the wound",
      "Apply a tourniquet above the wound for severe limb bleeding",
      "Keep the person warm and still — watch for shock",
      "Seek emergency medical help as soon as possible",
    ],
    severity: "critical",
  },
  {
    id: "firstaid-burns",
    topic: "first aid",
    subtopic: "burns treatment",
    keywords: ["burn", "burns", "scald", "blister", "heat", "hot", "boiling"],
    content: "For burns, cool the affected area with clean running water for at least 10 minutes. Do not use ice, butter, or toothpaste. Cover with a sterile non-stick bandage.",
    steps: [
      "Cool the burn with clean running water for 10-20 minutes",
      "Do NOT use ice, butter, toothpaste, or home remedies",
      "Remove jewelry and clothing near the burn before swelling",
      "Cover with a sterile, non-stick bandage or cling wrap",
      "Take over-the-counter pain relief if available",
      "Do NOT pop blisters — they protect against infection",
      "Seek medical help for burns larger than your palm",
    ],
    severity: "high",
  },
  {
    id: "firstaid-cpr",
    topic: "first aid",
    subtopic: "CPR and resuscitation",
    keywords: ["cpr", "resuscitation", "breathing", "unconscious", "pulse", "heartbeat", "chest", "compressions", "heart", "cardiac", "arrest"],
    content: "If someone is unresponsive and not breathing normally, start CPR. Push hard and fast in the center of the chest — 30 compressions followed by 2 rescue breaths.",
    steps: [
      "Check responsiveness — tap shoulders and shout",
      "Call emergency services or ask someone to call",
      "Place the person on their back on a firm surface",
      "Push HARD and FAST in center of chest — 30 compressions",
      "Compress at least 2 inches deep at 100-120 per minute",
      "Give 2 rescue breaths — tilt head, lift chin, seal mouth",
      "Continue 30:2 ratio until help arrives or person responds",
      "Use an AED (defibrillator) if available — follow voice prompts",
    ],
    severity: "critical",
  },
  {
    id: "firstaid-fracture",
    topic: "first aid",
    subtopic: "fractures and broken bones",
    keywords: ["fracture", "broken", "bone", "break", "sprain", "splint", "immobilize", "leg", "arm", "ankle"],
    content: "For suspected fractures, immobilize the area and do not attempt to realign the bone. Use a splint if available. Apply ice wrapped in cloth to reduce swelling.",
    steps: [
      "Do NOT attempt to straighten or realign the bone",
      "Immobilize the injured area in the position found",
      "Use a splint — rigid material padded with cloth",
      "Apply ice wrapped in cloth to reduce swelling (20 min on, 20 off)",
      "Check circulation below the injury (pulse, color, sensation)",
      "Treat for shock — keep the person warm and lying down",
      "Seek emergency medical attention",
    ],
    severity: "high",
  },
  {
    id: "firstaid-choking",
    topic: "first aid",
    subtopic: "choking response",
    keywords: ["choke", "choking", "airway", "throat", "swallow", "obstruction", "heimlich"],
    content: "For a choking person, deliver 5 back blows between the shoulder blades, then 5 abdominal thrusts (Heimlich maneuver). Repeat until the object is dislodged.",
    steps: [
      "Ask the person if they can cough — encourage strong coughing",
      "If they cannot speak or cough, stand behind them",
      "Give 5 sharp back blows between the shoulder blades",
      "Then give 5 abdominal thrusts (Heimlich maneuver)",
      "Alternate between back blows and abdominal thrusts",
      "If the person becomes unconscious, begin CPR",
      "Check the mouth before giving rescue breaths",
    ],
    severity: "critical",
  },
  {
    id: "water-purify",
    topic: "water",
    subtopic: "water purification",
    keywords: ["water", "drink", "drinking", "purify", "purification", "boil", "filter", "clean", "safe", "thirst", "dehydration", "dehydrated"],
    content: "In an emergency, boiling is the most reliable way to make water safe. Bring water to a rolling boil for at least 1 minute. If you cannot boil, use purification tablets or filter through cloth.",
    steps: [
      "BOILING: Bring water to a rolling boil for 1 minute (3 min above 6500ft)",
      "CHEMICAL: Use purification tablets or 8 drops of bleach per gallon",
      "FILTER: Use a commercial filter or improvise with sand, gravel, cloth",
      "SOLAR: Fill clear bottles and place in direct sun for 6+ hours",
      "Collect rainwater using tarps, containers, or clean surfaces",
      "Collect morning dew by dragging cloth through grass",
      "Signs of dehydration: dark urine, dizziness, dry mouth, fatigue",
      "Avoid drinking seawater or urine — they worsen dehydration",
    ],
    severity: "high",
  },
  {
    id: "shelter-build",
    topic: "shelter",
    subtopic: "emergency shelter",
    keywords: ["shelter", "tent", "cover", "cold", "exposure", "hypothermia", "warmth", "sleep", "night", "camp"],
    content: "In a survival situation, shelter is your top priority. Hypothermia can kill in hours. Find or build shelter to protect against wind, rain, and cold. Insulate from the ground using leaves or branches.",
    steps: [
      "Find natural shelter: caves, overhangs, dense trees",
      "If building, keep it small — body heat warms smaller spaces",
      "Insulate from the ground using leaves, branches, cardboard",
      "Block wind exposure — face entrance away from prevailing wind",
      "Use a tarp, plastic sheet, or emergency blanket as roof",
      "In cold weather, share body heat with others",
      "Stay dry — wet clothing drastically increases heat loss",
    ],
    severity: "high",
  },
  {
    id: "signal-rescue",
    topic: "rescue",
    subtopic: "signaling for rescue",
    keywords: ["signal", "rescue", "help", "sos", "found", "search", "helicopter", "whistle", "mirror", "visible"],
    content: "To signal for rescue, make yourself as visible as possible. Use three of anything (fires, whistles, flashes) — the universal distress signal. Use bright colors, mirrors, and open areas.",
    steps: [
      "Use the universal distress signal: THREE of anything (fires, whistles, shots)",
      "Use a mirror or reflective surface to flash at aircraft",
      "Create ground signals visible from air: SOS in rocks or cloth",
      "Wear bright or contrasting colors to stand out",
      "Use a whistle — sound carries much further than shouting",
      "Stay in open areas where rescuers can see you",
      "At night, use fire or flashlight signals",
    ],
    severity: "high",
  },
  {
    id: "food-forage",
    topic: "food",
    subtopic: "finding food in emergencies",
    keywords: ["food", "eat", "eating", "hunger", "hungry", "starving", "forage", "edible", "nutrition"],
    content: "In a survival scenario, water is more urgent than food. A healthy person can survive weeks without food but only days without water. If foraging, avoid plants you cannot positively identify.",
    steps: [
      "Prioritize water over food — you can survive weeks without food",
      "Ration any food supplies you have carefully",
      "Insects like crickets and grubs are high in protein and safe to eat",
      "Never eat mushrooms or berries you can't 100% identify",
      "Cook all wild meat and fish thoroughly",
      "Look for familiar edible plants: dandelions, cattails, clover",
      "Conserve energy — rest reduces calorie needs significantly",
    ],
    severity: "moderate",
  },
  {
    id: "mental-health",
    topic: "mental health",
    subtopic: "psychological survival",
    keywords: ["panic", "anxiety", "scared", "fear", "calm", "stress", "mental", "psychological", "cope", "hope", "morale"],
    content: "Mental strength is crucial for survival. Panic is your greatest enemy. Use breathing techniques to stay calm. Focus on immediate tasks — small accomplishments build confidence and hope.",
    steps: [
      "BREATHE: Slow, deep breaths — 4 seconds in, 4 hold, 4 out",
      "Focus on what you CAN control, not what you can't",
      "Break survival into small, manageable tasks",
      "Maintain routine — structure provides psychological stability",
      "Talk to others — social connection reduces panic",
      "Stay positive — visualize rescue and recovery",
      "Conserve emotional energy — avoid arguments and blame",
    ],
    severity: "moderate",
  },
  {
    id: "power-outage",
    topic: "power outage",
    subtopic: "surviving power outages",
    keywords: ["power", "outage", "electricity", "blackout", "dark", "generator", "battery", "charge", "light"],
    content: "During a power outage, use flashlights instead of candles (fire risk). Keep refrigerator closed to preserve food temperature. Use generators outdoors only — carbon monoxide kills.",
    steps: [
      "Use flashlights, not candles — fire risk is too high",
      "Keep refrigerator and freezer doors closed — food stays cold 4-48 hours",
      "Use generators OUTDOORS ONLY — carbon monoxide is deadly",
      "Turn off major appliances to prevent power surge when restored",
      "Conserve phone battery — lower brightness, close apps",
      "Fill bathtub with water while available for flushing",
      "Dress in layers for warmth if heating is affected",
    ],
    severity: "moderate",
  },
];

// ── Synonym & Query Expansion ────────────────────────────────────────

const SYNONYMS: Record<string, string[]> = {
  earthquake: ["quake", "tremor", "seismic", "shaking"],
  flood: ["flooding", "floodwater", "inundation", "deluge"],
  fire: ["flame", "burn", "burning", "blaze", "inferno"],
  hurricane: ["cyclone", "typhoon", "storm", "tropical"],
  tornado: ["twister", "funnel", "cyclone"],
  bleeding: ["bleed", "blood", "hemorrhage", "wound", "cut", "stab", "stabbed", "laceration"],
  fracture: ["broken", "break", "bone", "sprain"],
  choking: ["choke", "airway", "throat", "heimlich"],
  cpr: ["resuscitation", "breathing", "cardiac", "chest", "compressions", "unconscious"],
  burn: ["scald", "blister", "heat"],
  water: ["drink", "drinking", "thirst", "dehydration", "dehydrated", "purify"],
  shelter: ["tent", "cover", "cold", "hypothermia", "exposure"],
  rescue: ["signal", "help", "sos", "found", "visible"],
  food: ["eat", "hunger", "hungry", "starving", "forage"],
  panic: ["anxiety", "scared", "fear", "calm", "stress", "mental"],
  power: ["electricity", "blackout", "outage", "dark", "generator"],
  injury: ["hurt", "injured", "wound", "pain"],
};

function expandQuery(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const expanded = new Set(words);

  // Add synonyms
  for (const word of words) {
    for (const [canonical, syns] of Object.entries(SYNONYMS)) {
      if (word === canonical || syns.includes(word)) {
        expanded.add(canonical);
        syns.forEach((s) => expanded.add(s));
      }
    }
  }

  return [...expanded];
}

// ── TF-IDF-Like Scoring ──────────────────────────────────────────────

interface ScoredDocument {
  doc: SurvivalDocument;
  score: number;
  matchedKeywords: string[];
}

function scoreDocuments(queryTerms: string[]): ScoredDocument[] {
  const docCount = KNOWLEDGE_BASE.length;

  return KNOWLEDGE_BASE.map((doc) => {
    const allDocTerms = [
      ...doc.keywords,
      doc.topic,
      doc.subtopic,
      ...doc.content.toLowerCase().split(/\s+/),
    ];

    let score = 0;
    const matchedKeywords: string[] = [];

    for (const term of queryTerms) {
      // Term frequency in document
      const tf = allDocTerms.filter((t) => t.includes(term) || term.includes(t)).length;
      if (tf === 0) continue;

      // Inverse document frequency (how rare is this term across docs)
      const docsWithTerm = KNOWLEDGE_BASE.filter((d) =>
        [...d.keywords, d.topic, d.subtopic].some((k) => k.includes(term) || term.includes(k))
      ).length;
      const idf = Math.log(docCount / (1 + docsWithTerm));

      // Keyword match bonus (exact keyword match is worth more)
      const keywordBonus = doc.keywords.includes(term) ? 2 : 0;
      const topicBonus = doc.topic.includes(term) ? 3 : 0;

      score += tf * idf + keywordBonus + topicBonus;
      matchedKeywords.push(term);
    }

    return { doc, score, matchedKeywords };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
}

// ── Response Generation ──────────────────────────────────────────────

function generateResponse(
  query: string,
  results: ScoredDocument[],
  conversationContext: string[]
): string {
  if (results.length === 0) {
    // Check conversation context for topic hints
    const contextTerms = conversationContext.flatMap((c) => expandQuery(c));
    const contextResults = scoreDocuments(contextTerms);
    if (contextResults.length > 0) {
      return generateFromDocs(query, contextResults.slice(0, 2));
    }

    return `## 🆘 Emergency Survival Tips

I couldn't find specific guidance for your question, but here are key survival principles:

1. **Stay calm** — panic leads to poor decisions
2. **Assess your situation** — check for injuries and immediate hazards
3. **Signal for help** — use a whistle, mirror, or bright clothing
4. **Conserve energy** — ration food and water carefully
5. **Stay informed** — use battery-powered radio if available

Try asking about: **earthquake**, **flood**, **fire**, **hurricane**, **first aid**, **water purification**, **shelter**, or **rescue signals**.`;
  }

  return generateFromDocs(query, results.slice(0, 3));
}

function generateFromDocs(query: string, results: ScoredDocument[]): string {
  const primary = results[0];
  const severityEmoji =
    primary.doc.severity === "critical"
      ? "🚨"
      : primary.doc.severity === "high"
      ? "⚠️"
      : "ℹ️";

  const severityLabel =
    primary.doc.severity === "critical"
      ? "CRITICAL"
      : primary.doc.severity === "high"
      ? "HIGH PRIORITY"
      : "GUIDANCE";

  let response = `## ${severityEmoji} ${severityLabel}: ${primary.doc.subtopic.charAt(0).toUpperCase() + primary.doc.subtopic.slice(1)}\n\n`;
  response += `${primary.doc.content}\n\n`;
  response += `### Step-by-step actions:\n\n`;

  primary.doc.steps.forEach((step, i) => {
    response += `${i + 1}. ${step}\n`;
  });

  // Add supplementary info from secondary results
  if (results.length > 1) {
    const secondary = results[1];
    if (secondary.doc.id !== primary.doc.id) {
      response += `\n---\n\n**Related: ${secondary.doc.subtopic}**\n`;
      response += `${secondary.doc.content}\n`;
    }
  }

  response += `\n> 💡 *This guidance is from RescueLink's offline survival database. Always follow official emergency instructions when available.*`;

  return response;
}

// ── Conversation Memory ──────────────────────────────────────────────

let conversationHistory: string[] = [];

export function clearConversation() {
  conversationHistory = [];
}

// ── Main RAG Pipeline ────────────────────────────────────────────────

export function getSurvivalResponse(question: string): string {
  // Step 1: Add to conversation memory
  conversationHistory.push(question);
  if (conversationHistory.length > 6) {
    conversationHistory = conversationHistory.slice(-6);
  }

  // Step 2: Expand query with synonyms
  const queryTerms = expandQuery(question);

  // Step 3: Also consider conversation context for follow-ups
  const contextTerms =
    conversationHistory.length > 1
      ? conversationHistory.slice(-3).flatMap((q) => expandQuery(q))
      : queryTerms;

  const allTerms = [...new Set([...queryTerms, ...contextTerms])];

  // Step 4: Score & retrieve documents
  const results = scoreDocuments(allTerms);

  // Step 5: Generate response
  return generateResponse(question, results, conversationHistory.slice(0, -1));
}

export { KNOWLEDGE_BASE };

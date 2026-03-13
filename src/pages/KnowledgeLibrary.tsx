import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame, Droplets, Mountain, Wind, Heart, Radio, ChevronDown, ChevronUp, BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { staggerContainer, staggerItem } from "@/lib/motion";

const GUIDES = [
  {
    id: "fire", icon: Flame, title: "Fire Emergency", color: "emergency",
    steps: [
      "Stay LOW — smoke rises, cleaner air is near the floor",
      "Cover nose and mouth with a wet cloth if possible",
      "Feel doors before opening — if hot, use another exit",
      "Close doors behind you to slow fire spread",
      "If clothes catch fire: STOP, DROP, and ROLL",
      "Meet at a safe location outside the building",
      "Call emergency services once safely outside",
      "Never go back inside a burning building",
    ],
  },
  {
    id: "flood", icon: Droplets, title: "Flood Survival", color: "info",
    steps: [
      "Move to higher ground immediately",
      "Never walk through moving floodwater — 6 inches can knock you down",
      "Never drive through flooded roads",
      "Climb to the highest point of your building if trapped",
      "Signal for help from rooftop using bright cloth",
      "Avoid contact with floodwater — it may be contaminated",
      "After flooding, boil all water before drinking",
    ],
  },
  {
    id: "earthquake", icon: Mountain, title: "Earthquake Safety", color: "warning",
    steps: [
      "DROP to your hands and knees immediately",
      "Take COVER under sturdy furniture",
      "HOLD ON and protect your head and neck",
      "Stay away from windows and heavy objects",
      "If outdoors, move to an open area away from buildings",
      "Be prepared for aftershocks",
      "Check for gas leaks and structural damage after",
    ],
  },
  {
    id: "storm", icon: Wind, title: "Storm Safety", color: "info",
    steps: [
      "Move to an interior room away from windows",
      "Board up windows and secure outdoor objects",
      "Keep 72+ hours of emergency supplies ready",
      "Fill bathtubs with water for sanitation",
      "Use flashlights, not candles during outages",
      "Avoid downed power lines after the storm",
      "Listen to emergency broadcasts",
    ],
  },
  {
    id: "firstaid", icon: Heart, title: "First Aid", color: "safe",
    steps: [
      "For bleeding: apply firm direct pressure with clean cloth",
      "For burns: cool with running water for 10-20 minutes",
      "For CPR: 30 chest compressions then 2 rescue breaths",
      "For fractures: immobilize and do NOT realign bones",
      "For choking: 5 back blows then 5 abdominal thrusts",
      "Keep injured person warm and still to prevent shock",
      "Seek emergency medical help as soon as possible",
    ],
  },
  {
    id: "rescue", icon: Radio, title: "Rescue Signaling", color: "warning",
    steps: [
      "Use 3 of anything — universal distress signal",
      "Use a mirror to flash at aircraft",
      "Create ground signals: SOS in rocks or cloth",
      "Wear bright colors to stand out",
      "Use a whistle — sound carries further than shouting",
      "Stay in open areas where rescuers can see you",
      "At night, use fire or flashlight signals",
    ],
  },
];

export default function KnowledgeLibrary() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-[1rem] bg-accent/10 border border-accent/20 flex items-center justify-center shadow-[inset_0_0_15px_theme(colors.accent.DEFAULT/0.2),0_0_15px_theme(colors.accent.DEFAULT/0.2)]">
          <BookOpen className="w-6 h-6 text-accent drop-shadow-[0_0_8px_theme(colors.accent.DEFAULT/0.8)]" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">KNOWLEDGE LIBRARY</h1>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">Survival guides available offline</p>
        </div>
      </motion.div>

      <motion.div
        variants={staggerContainer(0.08, 0.15)}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        {GUIDES.map((guide) => {
          const isOpen = expanded === guide.id;
          const Icon = guide.icon;
          return (
            <motion.div
              key={guide.id}
              variants={staggerItem}
              whileHover={!isOpen ? {
                scale: 1.02,
                boxShadow: `0 0 30px hsl(var(--${guide.color})/0.15)`,
                transition: { type: "spring", stiffness: 400, damping: 25 },
              } : undefined}
              className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] overflow-hidden relative group"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
              <motion.button
                onClick={() => setExpanded(isOpen ? null : guide.id)}
                whileTap={{ scale: 0.98 }}
                className="w-full px-5 py-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  className={`w-12 h-12 rounded-[1rem] bg-${guide.color}/10 border border-${guide.color}/20 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_15px_theme(colors.${guide.color}.DEFAULT/0.2)]`}
                >
                  <Icon className={`w-6 h-6 text-${guide.color} drop-shadow-[0_0_8px_theme(colors.${guide.color}.DEFAULT/0.8)]`} />
                </motion.div>
                <span className="text-sm font-bold text-foreground flex-1 text-left drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{guide.title}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {guide.steps.map((step, si) => (
                        <motion.div
                          key={si}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: si * 0.04, duration: 0.3 }}
                          className="flex items-start gap-2"
                        >
                          <span className={`text-[10px] font-mono text-${guide.color} mt-0.5 w-4 flex-shrink-0`}>{si + 1}.</span>
                          <p className="text-xs text-muted-foreground">{step}</p>
                        </motion.div>
                      ))}
                      <motion.button
                        onClick={() => navigate(`/assistant?topic=${guide.id}`)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full mt-2 bg-${guide.color}/10 border border-${guide.color}/20 rounded-xl py-2 text-[11px] font-medium text-${guide.color} hover:bg-${guide.color}/20 transition-colors`}
                      >
                        Ask AI for more details
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

import { motion } from "framer-motion";
import { ShieldAlert, Mountain, Droplets, Flame, CloudLightning } from "lucide-react";

export interface RiskLevels {
  earthquake: "Low" | "Moderate" | "High";
  flood: "Low" | "Moderate" | "High";
  fire: "Low" | "Moderate" | "High";
  storm: "Low" | "Moderate" | "High";
}

const RISK_CONFIG = [
  { key: "earthquake" as const, label: "Earthquake", icon: Mountain },
  { key: "flood" as const, label: "Flood", icon: Droplets },
  { key: "fire" as const, label: "Fire", icon: Flame },
  { key: "storm" as const, label: "Storm", icon: CloudLightning },
];

const LEVEL_STYLE: Record<string, { color: string; bg: string; bar: string }> = {
  Low: { color: "text-safe", bg: "bg-safe/15", bar: "w-1/3 bg-safe" },
  Moderate: { color: "text-warning", bg: "bg-warning/15", bar: "w-2/3 bg-warning" },
  High: { color: "text-emergency", bg: "bg-emergency/15", bar: "w-full bg-emergency" },
};

export default function DisasterRiskPanel({ risks }: { risks: RiskLevels }) {
  return (
    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 space-y-5 border border-white/[0.02] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <ShieldAlert className="w-5 h-5 text-warning drop-shadow-[0_0_8px_theme(colors.warning.DEFAULT/0.8)]" />
        <span className="text-sm font-bold text-foreground tracking-wide">Disaster Risk Monitor</span>
      </div>
      <div className="space-y-4">
        {RISK_CONFIG.map(({ key, label, icon: Icon }, i) => {
          const level = risks[key];
          const style = LEVEL_STYLE[level];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_theme(colors.${style.color.replace('text-', '')}.DEFAULT/0.2)]`}>
                <Icon className={`w-4 h-4 ${style.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-foreground tracking-wide">{label}</span>
                  <span className={`text-[10px] font-bold ${style.color} drop-shadow-sm uppercase tracking-wider`}>{level}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden shadow-inner border border-white/5">
                  <motion.div
                    className={`h-full rounded-full ${style.bar.split(" ").slice(1).join(" ")} shadow-[0_0_8px_currentcolor]`}
                    initial={{ width: 0 }}
                    animate={{ width: level === "Low" ? "33%" : level === "Moderate" ? "66%" : "100%" }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

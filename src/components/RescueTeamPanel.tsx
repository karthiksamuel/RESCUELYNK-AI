import { motion } from "framer-motion";
import { Shield, Truck, Flame, Heart } from "lucide-react";
import type { RescueTeam } from "@/lib/rescueTeams";
import { getAlerts } from "@/lib/alertStore";
import { getTeamDistance } from "@/lib/rescueTeams";

const typeIcon: Record<string, typeof Shield> = {
  "Medical": Heart,
  "Fire Rescue": Flame,
  "Search & Rescue": Shield,
};

const statusStyle: Record<string, { bg: string; text: string }> = {
  "Available": { bg: "bg-safe/15", text: "text-safe" },
  "En Route": { bg: "bg-warning/15", text: "text-warning" },
  "Responding": { bg: "bg-emergency/15", text: "text-emergency" },
};

export default function RescueTeamPanel({ teams }: { teams: RescueTeam[] }) {
  const alerts = getAlerts();

  return (
    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 space-y-5 border border-white/[0.02] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] card-glow">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Truck className="w-5 h-5 text-info drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.8)]" />
        <span className="text-sm font-bold text-foreground tracking-wide">Active Rescue Teams</span>
        <span className="ml-auto text-[11px] font-bold text-info bg-info/10 px-3 py-1.5 rounded-full shadow-[inset_0_0_10px_theme(colors.info.DEFAULT/0.2)]">{teams.length} teams</span>
      </div>
      <div className="space-y-3 max-h-[220px] overflow-auto custom-scrollbar pr-2">
        {teams.map((team, i) => {
          const Icon = typeIcon[team.type] || Shield;
          const style = statusStyle[team.status] || statusStyle["Available"];
          const assignedAlert = alerts.find((a) => a.id === team.assignedAlertId);
          const dist = assignedAlert ? getTeamDistance(team, assignedAlert) : null;

          return (
            <motion.div key={team.id} initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.06 }}
              className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 flex items-center gap-4 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] hover:bg-white/[0.02] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-info/15 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_theme(colors.info.DEFAULT/0.2)]">
                <Icon className="w-5 h-5 text-info drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.8)]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground tracking-wide truncate">{team.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{team.type}{dist != null ? ` • ${dist.toFixed(1)} km` : ""}</p>
              </div>
              <span className={`text-[10px] font-bold rounded-full px-3 py-1.5 border ${style.bg} ${style.text} border-current/20 shadow-[inset_0_0_10px_currentcolor]`}>
                {team.status.toUpperCase()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

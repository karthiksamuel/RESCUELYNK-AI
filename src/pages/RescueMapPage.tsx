import { MapPin, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useActiveAlerts } from "@/lib/alertStore";
import { useRescueTeams, DANGER_ZONES } from "@/lib/rescueTeams";
import EmergencyMap from "@/components/EmergencyMap";
import RescueTeamPanel from "@/components/RescueTeamPanel";
import ResolvedIncidentsPanel from "@/components/ResolvedIncidentsPanel";

export default function RescueMapPage() {
  const alerts = useActiveAlerts();
  const teams = useRescueTeams();

  return (
    <div className="p-4 md:p-6 space-y-4 h-[calc(100vh-3rem)] panel-arc">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" as const }}
          className="w-12 h-12 rounded-[1rem] bg-emergency/10 border border-emergency/20 flex items-center justify-center shadow-[inset_0_0_15px_theme(colors.emergency.DEFAULT/0.2),0_0_15px_theme(colors.emergency.DEFAULT/0.2)]"
        >
          <MapPin className="w-6 h-6 text-emergency drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.8)]" />
        </motion.div>
        <div>
          <h1 className="text-xl font-black tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">RESCUE MAP</h1>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">{alerts.length} SOS • {teams.length} teams • {DANGER_ZONES.length} zones</p>
        </div>
      </motion.div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]" style={{ height: 'calc(100% - 70px)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="lg:col-span-3 bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_40px_rgba(255,255,255,0.02),0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden relative group card-glow"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />
          <EmergencyMap alerts={alerts} teams={teams} dangerZones={DANGER_ZONES} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-1 space-y-4"
        >
          <RescueTeamPanel teams={teams} />
          <ResolvedIncidentsPanel />
        </motion.div>
      </div>
    </div>
  );
}

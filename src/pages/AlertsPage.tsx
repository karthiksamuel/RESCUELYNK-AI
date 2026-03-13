import { motion } from "framer-motion";
import { AlertTriangle, Clock, Signal, MapPin, Radio } from "lucide-react";
import { useAlerts } from "@/lib/alertStore";
import RelayBadge from "@/components/RelayBadge";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function AlertsPage() {
  const alerts = useAlerts();

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" as const }}
            className="w-12 h-12 rounded-[1rem] bg-emergency/10 border border-emergency/20 flex items-center justify-center shadow-[inset_0_0_15px_theme(colors.emergency.DEFAULT/0.2),0_0_15px_theme(colors.emergency.DEFAULT/0.2)]"
          >
            <AlertTriangle className="w-6 h-6 text-emergency drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.8)]" />
          </motion.div>
          <div>
            <h1 className="text-xl font-black tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">ACTIVE ALERTS</h1>
            <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">{alerts.length} SOS broadcasts detected</p>
          </div>
        </div>
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
          className="text-[10px] font-mono font-bold bg-emergency/10 text-emergency border border-emergency/30 px-2.5 py-1 rounded flex items-center gap-1.5"
        >
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-emergency" />
          LIVE
        </motion.span>
      </motion.div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[2rem] p-12 text-center space-y-4 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" as const }}
          >
            <Radio className="w-12 h-12 text-muted-foreground mx-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          </motion.div>
          <p className="text-sm font-bold text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">No active alerts</p>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">System is monitoring for emergency broadcasts</p>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer(0.08, 0.15)}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              variants={staggerItem}
              whileHover={{
                scale: 1.01,
                boxShadow: "0 0 30px theme(colors.emergency.DEFAULT/0.15)",
                transition: { type: "spring", stiffness: 400, damping: 25 },
              }}
              className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-5 space-y-4 cursor-pointer group hover:border-emergency/30 transition-colors relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[1rem] bg-emergency/10 border border-emergency/20 flex items-center justify-center flex-shrink-0 group-hover:bg-emergency/20 transition-colors shadow-[inset_0_0_15px_theme(colors.emergency.DEFAULT/0.2)]">
                    <Signal className="w-6 h-6 text-emergency drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.8)]" />
                  </div>
                  <div>
                    <span className="font-black text-sm text-foreground uppercase tracking-widest block drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{alert.name}</span>
                    <p className="text-[10px] font-bold text-muted-foreground mt-0.5 flex items-center gap-1.5 uppercase tracking-wider">
                      <MapPin className="w-3 h-3 text-secondary" /> {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <RelayBadge relayCount={alert.relayCount} />
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground bg-black/40 px-2 py-1 rounded border border-border/50">
                    <Clock className="w-2.5 h-2.5 text-secondary" />
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false })}
                  </div>
                </div>
              </div>
              <div className="pl-14">
                <p className="text-xs text-muted-foreground border-l-2 border-emergency/30 pl-3 py-0.5 font-mono bg-gradient-to-r from-emergency/5 to-transparent">
                  {alert.message}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

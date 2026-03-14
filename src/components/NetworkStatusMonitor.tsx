import { motion } from "framer-motion";
import { Activity, Radio, Plane, Zap, Signal, Map } from "lucide-react";

interface NetworkMetrics {
  meshNodes: number;
  droneRelays: number;
  loraNodes: number;
  avgHops: number;
  coverageArea: number;
}

export default function NetworkStatusMonitor({ metrics }: { metrics: NetworkMetrics }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-black/40 backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]"
    >
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-info drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.8)]" />
          <h3 className="text-base font-bold text-foreground">Network Status Monitor</h3>
        </div>
        <span className="text-[10px] font-black text-safe bg-safe/10 px-3 py-1 rounded-full border border-safe/20 tracking-widest uppercase">
          Live Status
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Mesh Nodes", value: metrics.meshNodes, icon: Zap, color: "safe" },
          { label: "Drone Relays", value: metrics.droneRelays, icon: Plane, color: "secondary" },
          { label: "LoRa Nodes", value: metrics.loraNodes, icon: Radio, color: "info" },
          { label: "Avg Hops", value: metrics.avgHops.toFixed(1), icon: Signal, color: "warning" },
          { label: "Coverage Area", value: `${metrics.coverageArea} km²`, icon: Map, color: "safe" },
        ].map((m) => (
          <div key={m.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-all hover:bg-white/10 group">
            <div className={`w-8 h-8 rounded-lg bg-${m.color}/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <m.icon className={`w-4 h-4 text-${m.color}`} />
            </div>
            <p className="text-xl font-black text-foreground mb-1">{m.value}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Hybrid Mesh Active</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-safe" />
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Stability: 98%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-info" />
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Latency: 45ms</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

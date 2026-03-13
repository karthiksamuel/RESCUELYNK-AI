import { motion } from "framer-motion";
import { CheckCircle, Clock, Shield, MapPin } from "lucide-react";
import { useResolvedAlerts } from "@/lib/alertStore";

export default function ResolvedIncidentsPanel() {
  const resolved = useResolvedAlerts();

  if (resolved.length === 0) return null;

  return (
    <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 space-y-5 border border-white/[0.02] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] card-glow">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <CheckCircle className="w-5 h-5 text-safe drop-shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.8)]" />
        <span className="text-sm font-bold text-foreground tracking-wide">Resolved Incidents</span>
        <span className="ml-auto text-[11px] font-bold text-safe bg-safe/10 px-3 py-1.5 rounded-full shadow-[inset_0_0_10px_theme(colors.safe.DEFAULT/0.2)]">{resolved.length} rescued</span>
      </div>
      <div className="space-y-3 max-h-[220px] overflow-auto custom-scrollbar pr-2">
        {resolved.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-black/20 border border-white/[0.03] rounded-2xl p-4 flex items-center gap-4 shadow-[inset_0_0_15px_rgba(0,0,0,0.3)] hover:bg-white/[0.02] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-safe/15 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_theme(colors.safe.DEFAULT/0.2)]">
              <Shield className="w-5 h-5 text-safe drop-shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.8)]" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-foreground tracking-wide truncate">{alert.name}</p>
                <span className="text-[10px] font-bold bg-safe/15 text-safe rounded-full px-2.5 py-1 border border-safe/20 flex-shrink-0 shadow-[inset_0_0_10px_theme(colors.safe.DEFAULT/0.3)] tracking-wider">
                  RESCUED
                </span>
              </div>
              {alert.message && (
                <p className="text-[11px] text-muted-foreground truncate">{alert.message}</p>
              )}
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                </span>
                {alert.resolvedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/60">
                Rescued by {alert.resolvedBy || "Command Center"}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

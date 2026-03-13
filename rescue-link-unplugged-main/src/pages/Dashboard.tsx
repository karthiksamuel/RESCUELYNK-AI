import { useAlerts } from "@/lib/alertStore";
import { useMeshNodes, useRelayLog } from "@/lib/meshRelay";
import { useOnlineStatus } from "@/hooks/use-online-status";
import {
  AlertTriangle, Radio, Clock, ArrowLeft, Bluetooth, MapPin,
  Signal, Users, Activity, ChevronRight, ArrowRight, WifiOff, Wifi
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EmergencyMap from "@/components/EmergencyMap";
import RelayBadge from "@/components/RelayBadge";
import SignalStrengthChart from "@/components/SignalStrengthChart";
import RelayNetworkGraph from "@/components/RelayNetworkGraph";
import ThreatLevelGauge from "@/components/ThreatLevelGauge";
import { staggerContainer, staggerItem } from "@/lib/motion";

const Dashboard = () => {
  const alerts = useAlerts();
  const nodes = useMeshNodes();
  const relayLog = useRelayLog();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const recentRelays = relayLog.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative">

      {/* Header */}
      <header className="relative z-10 glass-panel-strong border-b border-border/50 px-6 py-4 flex items-center gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => navigate("/")} className="w-8 h-8 rounded bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-8 h-8 rounded bg-emergency/15 flex items-center justify-center border border-emergency/30 shadow-glow-emergency emergency-pulse">
          <AlertTriangle className="w-4 h-4 text-emergency" />
        </div>
        <h1 className="font-black text-lg tracking-[0.2em] text-foreground uppercase">Rescue<span className="text-emergency">Dashboard</span></h1>
        <div className="ml-auto flex items-center gap-3 bg-secondary/10 border border-secondary/30 px-3 py-1.5 rounded">
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-safe" /> : <WifiOff className="w-3.5 h-3.5 text-warning" />}
          <Radio className="w-3.5 h-3.5 text-safe animate-pulse" />
          <span className="text-[11px] font-bold text-safe font-mono tracking-widest text-shadow-sm">LIVE UPLINK</span>
        </div>
      </header>

      <div className="flex-1 relative z-10 overflow-auto p-4 space-y-4 max-w-2xl mx-auto w-full panel-arc">
        {/* Metric cards */}
        <motion.div variants={staggerContainer(0.1, 0.15)} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, value: alerts.length, label: "Active SOS", color: "emergency" },
            { icon: Users, value: nodes.length, label: "Mesh Nodes", color: "info" },
            { icon: Activity, value: relayLog.length, label: "Signal Relays", color: "safe" },
          ].map((m) => (
            <motion.div key={m.label} variants={staggerItem}
              whileHover={{ y: -4, scale: 1.03, boxShadow: `0 8px 30px hsl(var(--${m.color})/0.2)`, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              className={`glass-card card-glow p-5 text-center flex flex-col items-center group cursor-default hover:border-${m.color}/50`}>
              <div className={`w-12 h-12 rounded-xl bg-${m.color}/10 border border-${m.color}/20 flex items-center justify-center mb-3 group-hover:bg-${m.color}/20 transition-colors`}>
                <m.icon className={`w-6 h-6 text-${m.color} group-hover:animate-pulse`} />
              </div>
              <p className={`text-3xl font-black text-${m.color} drop-shadow-[0_0_10px_hsl(var(--${m.color})/0.5)]`}>{m.value}</p>
              <p className="text-[11px] font-mono tracking-widest text-muted-foreground mt-1 uppercase">{m.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Data Visualizations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SignalStrengthChart />
          <ThreatLevelGauge />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <RelayNetworkGraph />
        </motion.div>

        {/* Network status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="glass-card card-glow p-5 cyber-border">
          <div className="flex items-center gap-3 mb-4">
            <Bluetooth className="w-5 h-5 text-secondary" />
            <span className="text-sm font-black uppercase tracking-widest text-foreground">Mesh Network</span>
            <span className="ml-auto text-[10px] font-mono font-bold bg-secondary/20 text-secondary border border-secondary/30 rounded px-2.5 py-1 flex items-center gap-1.5 shadow-[inset_0_0_8px_theme(colors.secondary.DEFAULT/0.2)]">
              <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 rounded-full bg-secondary" />
              ACTIVE
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {nodes.map((node, i) => (
              <motion.span key={node.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--secondary)/0.15)" }}
                className="text-[10px] bg-black/40 border border-sidebar-border rounded px-3 py-1.5 text-muted-foreground font-mono">
                {node.name} <span className="text-secondary ml-1">{node.distance}m</span>
              </motion.span>
            ))}
          </div>
          {recentRelays.length > 0 && (
            <div className="border-t border-sidebar-border/50 pt-3 space-y-1.5 bg-black/20 p-2 rounded">
              {recentRelays.map((r) => (
                <div key={`${r.alertId}-${r.hop}-${r.timestamp}`} className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                  <span className="text-secondary opacity-70">[{r.hop}]</span>
                  <span className="truncate max-w-[100px]">{r.fromNode}</span>
                  <ArrowRight className="w-3 h-3 text-accent flex-shrink-0" />
                  <span className="truncate max-w-[100px]">{r.toNode}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Map */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.6 }} className="glass-card card-glow overflow-hidden cyber-border">
          <div className="px-5 py-3 border-b border-sidebar-border/80 bg-black/40 flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-emergency/20 border border-emergency/40 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-emergency" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-foreground">Emergency Map</span>
            <span className="ml-auto text-[10px] font-mono text-muted-foreground bg-secondary/10 px-2 py-1 rounded border border-secondary/20">{alerts.length} MARKERS</span>
          </div>
          <div className="h-64 md:h-80 relative">
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] z-10" />
            <EmergencyMap alerts={alerts} />
          </div>
        </motion.div>

        {/* Alert List */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Radio className="w-4 h-4 text-emergency animate-pulse" /> Live Incidents
            </h2>
            <span className="text-[10px] font-mono font-bold bg-emergency/10 text-emergency border border-emergency/30 px-2 py-1 rounded">{alerts.length} ACTIVE</span>
          </div>
          <AnimatePresence>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ x: -30, opacity: 0, filter: "blur(2px)" }}
                  animate={{ x: 0, opacity: 1, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -2, boxShadow: "0 8px 30px hsl(var(--emergency)/0.15)", transition: { type: "spring", stiffness: 400, damping: 25 } }}
                  className="glass-card p-4 space-y-3 hover:border-emergency/50 transition-colors cursor-pointer group cyber-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-emergency/15 border border-emergency/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emergency/25 transition-colors shadow-glow-emergency">
                        <Signal className="w-5 h-5 text-emergency" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-foreground uppercase tracking-wider block">{alert.name}</span>
                        <p className="text-[10px] font-mono text-secondary mt-1 tracking-widest leading-none">
                          LAT:{alert.latitude.toFixed(4)} LON:{alert.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <RelayBadge relayCount={alert.relayCount} />
                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-muted-foreground bg-black/40 px-2 py-1 rounded border border-border/50">
                        <Clock className="w-2.5 h-2.5 text-secondary" />
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour12: false })} UTC
                      </div>
                    </div>
                  </div>
                  <div className="pl-14">
                    <p className="text-xs text-muted-foreground border-l-2 border-emergency/30 pl-3 py-0.5 font-mono bg-gradient-to-r from-emergency/5 to-transparent">{alert.message}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Radio, MapPin, Signal, Users, Activity, Bluetooth,
  ArrowRight, Shield, Navigation, ChevronRight, Bot, Send, Zap,
  Eye, Crosshair, Clock, Flame, Droplets, Mountain, Heart, Wifi, WifiOff, Truck, CheckCircle, TriangleAlert, Trash2,
} from "lucide-react";
import DisasterSimulationModal from "@/components/DisasterSimulationModal";
import DisasterRiskPanel, { type RiskLevels } from "@/components/DisasterRiskPanel";
import { useNavigate } from "react-router-dom";
import { useActiveAlerts, useResolvedAlerts, useActivityLogs } from "@/lib/alertStore";
import { useMeshNodes, useRelayLog } from "@/lib/meshRelay";
import { useOnlineStatus } from "@/hooks/use-online-status";
import EmergencyMap from "@/components/EmergencyMap";
import { toast } from "sonner";
import RescueTeamPanel from "@/components/RescueTeamPanel";
import ResolveAlertDialog from "@/components/ResolveAlertDialog";
import ResolvedIncidentsPanel from "@/components/ResolvedIncidentsPanel";
import { getSurvivalResponse } from "@/lib/survivalAI";
import { useRescueTeams, DANGER_ZONES } from "@/lib/rescueTeams";
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function feedType(action: string): string {
  if (action.includes("sos") || action.includes("alert")) return "alert";
  if (action.includes("dispatch") || action.includes("assign")) return "dispatch";
  if (action.includes("rescue") || action.includes("complet")) return "medical";
  return "info";
}

const SIGNALS = [
  { id: "BKN-882", distance: "120m", strength: 4 },
  { id: "BKN-447", distance: "340m", strength: 3 },
  { id: "BKN-219", distance: "580m", strength: 2 },
  { id: "BKN-651", distance: "1.2km", strength: 1 },
];

export default function CommandCenter() {
  const alerts = useActiveAlerts();
  const resolvedAlerts = useResolvedAlerts();
  const nodes = useMeshNodes();
  const rescueTeams = useRescueTeams();
  const relayLog = useRelayLog();
  const isOnline = useOnlineStatus();
  const navigate = useNavigate();
  const activityLogs = useActivityLogs();
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("Current threat level: **moderate**. Seek higher ground if flood siren is heard. Monitor emergency broadcasts.");
  const [aiLoading, setAiLoading] = useState(false);
  const [lat] = useState(14.5995);
  const [lng] = useState(120.9842);
  const [simOpen, setSimOpen] = useState(false);
  const [risks, setRisks] = useState<RiskLevels>({ earthquake: "Low", flood: "Low", fire: "Low", storm: "Low" });

  const handleSimulated = useCallback((riskKey: string) => {
    setRisks(prev => ({ ...prev, [riskKey]: "High" }));
  }, []);

  const clearSimulation = useCallback(async () => {
    // Reset risk levels
    setRisks({ earthquake: "Low", flood: "Low", fire: "Low", storm: "Low" });
    toast.success("Simulation cleared — risk indicators reset");
  }, []);

  const sendAiQuery = () => {
    if (!aiInput.trim() || aiLoading) return;
    setAiLoading(true);
    const q = aiInput;
    setAiInput("");
    setTimeout(() => {
      setAiResponse(getSurvivalResponse(q));
      setAiLoading(false);
    }, 800);
  };

  return (
    <div className="p-3 md:p-4 lg:p-5 space-y-4 animate-fade-in">
      {/* Simulation Modal */}
      <DisasterSimulationModal open={simOpen} onOpenChange={setSimOpen} onSimulated={handleSimulated} />

      {/* Seamless Floating Metrics */}
      <div className="flex flex-col xl:flex-row gap-6 mb-10 relative z-10 px-2 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
          {[
            { label: "Active SOS Alerts", value: alerts.length, icon: AlertTriangle, color: "emergency", desc: "Unsecured signals" },
            { label: "Rescue Teams Deployed", value: rescueTeams.length, icon: Truck, color: "info", desc: "Active units" },
            { label: "System Connectivity", value: isOnline ? "Online" : "Offline", icon: isOnline ? Wifi : WifiOff, color: isOnline ? "safe" : "warning", desc: `${nodes.length} Mesh Nodes` },
          ].map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full bg-${m.color}/10 flex items-center justify-center shrink-0 shadow-[0_0_20px_theme(colors.${m.color}.DEFAULT/0.2)]`}>
                <m.icon className={`w-7 h-7 text-${m.color} group-hover:drop-shadow-[0_0_10px_theme(colors.${m.color}.DEFAULT/0.8)] transition-all`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-3xl font-bold text-foreground tracking-tight`}>{m.value}</p>
                  <span className={`text-[10px] font-semibold text-${m.color} uppercase tracking-wider bg-${m.color}/10 px-2 py-0.5 rounded-full border border-${m.color}/20 hidden sm:inline-block`}>
                    {m.desc}
                  </span>
                </div>
                <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sim Controls */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="flex gap-4 justify-center shrink-0 items-center border-l border-white/[0.03] pl-6 ml-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSimOpen(true)}
            className="h-12 px-6 rounded-full bg-warning/10 hover:bg-warning/20 flex items-center gap-2 shadow-[0_0_15px_theme(colors.warning.DEFAULT/0.15)] transition-colors group z-10">
            <TriangleAlert className="w-5 h-5 text-warning group-hover:animate-pulse group-hover:drop-shadow-[0_0_8px_theme(colors.warning.DEFAULT/0.8)]" />
            <span className="text-xs font-semibold text-warning">Simulate</span>
          </motion.button>
          <AnimatePresence>
            {Object.values(risks).some(r => r !== "Low") && (
              <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearSimulation}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-emergency/10 flex items-center justify-center transition-colors z-10 group">
                <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-emergency" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Seamless Hero Map Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 relative h-[450px] lg:h-[600px] flex flex-col z-10 w-full group overflow-hidden rounded-[2rem]">

        {/* Seamless Vignette overlay rendering the map back into the deep background */}
        <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_0_60px_60px_hsl(var(--background)),inset_0_0_150px_100px_hsl(var(--background))] rounded-[2rem]" />

        {/* Deep colored glow under vignette */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,hsl(var(--secondary)/0.1)_100%)] rounded-[2rem]" />

        <div className="absolute top-0 inset-x-0 px-8 py-6 z-30 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-black/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_15px_theme(colors.secondary.DEFAULT/0.1)]">
              <MapPin className="w-5 h-5 text-secondary drop-shadow-[0_0_8px_theme(colors.secondary.DEFAULT/0.8)]" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight drop-shadow-lg">Operations Map</span>
          </div>
          <div className="flex items-center gap-4 pointer-events-auto">
            <span className="text-xs font-semibold text-secondary px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-full tracking-wider hidden sm:block shadow-[0_0_15px_theme(colors.secondary.DEFAULT/0.1)]">{alerts.length} Active Targets</span>
            <button onClick={() => navigate("/map")} className="text-xs bg-secondary/15 hover:bg-secondary/25 text-secondary backdrop-blur-xl rounded-full px-5 py-2 transition-colors font-semibold flex items-center gap-2 shadow-[0_0_15px_theme(colors.secondary.DEFAULT/0.15)] group">
              Expand <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 z-0">
          <EmergencyMap alerts={alerts} teams={rescueTeams} dangerZones={DANGER_ZONES} />
        </div>
      </motion.div>

      {/* Control Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 relative z-10">

        {/* Alerts Column */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 flex items-center justify-between border border-white/[0.02] hover:bg-white/[0.04] transition-all shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] cursor-pointer group hover:shadow-[inset_0_0_30px_theme(colors.emergency.DEFAULT/0.1),0_0_20px_theme(colors.emergency.DEFAULT/0.1)]"
            onClick={() => navigate("/sos")}>
            <div>
              <h3 className="text-lg font-bold text-emergency tracking-tight group-hover:drop-shadow-[0_0_10px_theme(colors.emergency.DEFAULT/0.5)] transition-all">Emergency Signal</h3>
              <p className="text-[11px] text-muted-foreground mt-1 tracking-wide">Tap to open SOS beacon menu</p>
            </div>
            <div className="w-14 h-14 rounded-full border border-emergency/20 flex items-center justify-center bg-emergency/10 group-hover:bg-emergency/20 transition-all group-hover:scale-110 shadow-[0_0_15px_theme(colors.emergency.DEFAULT/0.2)]">
              <Radio className="w-6 h-6 text-emergency group-hover:drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.8)]" />
            </div>
          </motion.div>

          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 flex flex-col overflow-hidden max-h-[400px] border border-white/[0.02] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-emergency drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.8)]" />
                <span className="text-base font-bold text-foreground tracking-wide">Emergency Alerts</span>
              </div>
              <span className="text-[11px] text-emergency font-bold bg-emergency/10 px-3 py-1.5 rounded-full shadow-[inset_0_0_10px_theme(colors.emergency.DEFAULT/0.2)]">{alerts.length} Active</span>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {alerts.map((alert, i) => {
                  const statusColor = alert.status === "responding" ? "warning" : "emergency";
                  return (
                    <motion.div key={alert.id} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 10, opacity: 0, height: 0 }}
                      className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-start gap-3 hover:bg-white/10 transition-colors group">
                      <div className={`w-8 h-8 rounded-lg bg-${statusColor}/10 flex items-center justify-center shrink-0 border border-${statusColor}/20 shadow-soft`}>
                        <Signal className={`w-4 h-4 text-${statusColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground truncate">{alert.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-medium rounded-full bg-${statusColor}/10 text-${statusColor} px-2 py-0.5 border border-${statusColor}/20`}>
                              {alert.status === "responding" ? "Responding" : "Active"}
                            </span>
                            <ResolveAlertDialog alert={alert} />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
                        <p className="text-[10px] text-info mt-1 opacity-80">📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              {alerts.length === 0 && (
                <div className="flex flex-col items-center justify-center p-6 opacity-50 text-center">
                  <CheckCircle className="w-8 h-8 text-safe mb-2" />
                  <p className="text-sm text-safe font-semibold tracking-wide">All Clear</p>
                  <p className="text-xs text-muted-foreground mt-1">No active SOS signals</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column */}
        <div className="space-y-6">
          <DisasterRiskPanel risks={risks} />
          <RescueTeamPanel teams={rescueTeams} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] p-6 space-y-5 border border-white/[0.02] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center shadow-[0_0_15px_theme(colors.info.DEFAULT/0.2)]">
                  <Bot className="w-5 h-5 text-info drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.8)]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground tracking-wide">ASTRA AI Core</h3>
                  <p className="text-[11px] text-info tracking-wider">Local RAG Engine</p>
                </div>
              </div>
              <span className="text-[11px] bg-safe/10 text-safe rounded-full px-3 py-1.5 font-bold flex items-center gap-2 shadow-[inset_0_0_10px_theme(colors.safe.DEFAULT/0.2)]">
                <Zap className="w-3 h-3 drop-shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.8)]" /> Online
              </span>
            </div>

            <div className="bg-black/20 border border-white/[0.03] rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed h-[130px] overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              {aiLoading ? (
                <div className="flex items-center gap-3 h-full justify-center">
                  <div className="flex gap-1.5">
                    {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-info rounded-full animate-bounce shadow-[0_0_10px_theme(colors.info.DEFAULT/0.8)]" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                  <span className="text-[12px] text-info font-medium tracking-wide">Processing Query...</span>
                </div>
              ) : (
                <span className="text-foreground/90">{aiResponse}</span>
              )}
            </div>

            <form onSubmit={e => { e.preventDefault(); sendAiQuery(); }} className="flex gap-3 relative">
              <input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Query ASTRA database..."
                className="flex-1 bg-black/20 border border-white/[0.03] rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-info/30 focus:bg-white/[0.02] transition-colors shadow-[inset_0_0_15px_rgba(0,0,0,0.3)]" />
              <button type="submit" disabled={!aiInput.trim() || aiLoading}
                className="w-12 h-12 rounded-2xl bg-info/15 hover:bg-info/25 flex items-center justify-center text-info disabled:opacity-30 transition-all shadow-[0_0_15px_theme(colors.info.DEFAULT/0.15)] group shrink-0">
                <Send className="w-4 h-4 group-hover:drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.8)] transition-all" />
              </button>
            </form>
          </motion.div>

          <ResolvedIncidentsPanel />
        </div>
      </div>
    </div>
  );
}

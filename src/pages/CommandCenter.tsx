import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Radio, MapPin, Signal, Users, Activity, Bluetooth,
  ArrowRight, Shield, Navigation, ChevronRight, Bot, Send, Zap,
  Eye, Crosshair, Clock, Flame, Droplets, Mountain, Heart, Wifi, WifiOff, Truck, CheckCircle, TriangleAlert, Trash2, Plane,
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
import NetworkStatusMonitor from "@/components/NetworkStatusMonitor";
import { getSurvivalResponse } from "@/lib/survivalAI";
import { useRescueTeams, DANGER_ZONES } from "@/lib/rescueTeams";
import { useLoRaNodes } from "@/lib/loraRelay";
import { useDroneNodes } from "@/lib/droneRelay";
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
  const loraNodes = useLoRaNodes();
  const { nodes: droneNodes, deployed: dronesDeployed, toggleDroneDeployment } = useDroneNodes();

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1">
          {[
            { label: "Active SOS Alerts", value: alerts.length, icon: AlertTriangle, color: "emergency", desc: "Unsecured signals" },
            { label: "Critical Priority", value: alerts.filter(a => a.severity === "CRITICAL").length, icon: Shield, color: "emergency", desc: "Life Threatening" },
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
          <AnimatePresence>
            {Object.values(risks).some(r => r !== "Low") && (
              <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={clearSimulation}
                className="w-12 h-12 rounded-full bg-white/5 hover:bg-emergency/10 flex items-center justify-center transition-colors z-10 group">
                <Trash2 className="w-5 h-5 text-muted-foreground group-hover:text-emergency" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Drone Deployment Toggle */}
          <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleDroneDeployment}
            className={`h-12 px-6 rounded-full flex items-center gap-2 transition-all group z-10 ${dronesDeployed ? "bg-info/20 text-info border border-info/30" : "bg-white/5 text-muted-foreground border border-white/5 hover:bg-white/10"}`}>
            <Plane className={`w-5 h-5 ${dronesDeployed ? "animate-bounce" : ""}`} />
            <span className="text-xs font-bold uppercase tracking-widest">{dronesDeployed ? "Drones Active" : "Deploy Drones"}</span>
          </motion.button>
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
          <EmergencyMap alerts={alerts} teams={rescueTeams} dangerZones={DANGER_ZONES} loraNodes={loraNodes} droneNodes={droneNodes} />
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
                  const priorityColor = 
                    alert.severity === "CRITICAL" ? "emergency" : 
                    alert.severity === "HIGH" ? "warning" : 
                    alert.severity === "MEDIUM" ? "info" : "safe";
                  
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
                            {alert.severity && (
                              <span className={`text-[10px] font-bold rounded-full bg-${priorityColor}/10 text-${priorityColor} px-2 py-0.5 border border-${priorityColor}/20 uppercase tracking-tighter`}>
                                {alert.severity}
                              </span>
                            )}
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

          {/* Aerial Relay Network Monitoring Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-7 flex flex-col border border-white/[0.05] shadow-[inset_0_0_40px_rgba(255,255,255,0.02),0_15px_50px_rgba(0,0,0,0.4)] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-secondary/10 flex items-center justify-center border border-secondary/20 shadow-[0_0_20px_theme(colors.secondary.DEFAULT/0.2)]">
                  <Plane className={`w-6 h-6 text-secondary ${dronesDeployed ? "animate-pulse" : "opacity-30"}`} />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground uppercase tracking-widest">Aerial Relay</h3>
                  <p className="text-[10px] text-secondary font-mono font-bold">DRONE MESH {dronesDeployed ? "ACTIVE" : "STANDBY"}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black px-4 py-2 rounded-full border tracking-widest ${dronesDeployed ? "bg-secondary/20 text-secondary border-secondary/30" : "bg-white/5 text-muted-foreground border-white/10"}`}>
                {dronesDeployed ? `${droneNodes.length} UNITS` : "OFFLINE"}
              </span>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar min-h-[150px]">
              {!dronesDeployed ? (
                <div className="flex flex-col items-center justify-center h-full opacity-40 text-center py-8">
                  <Plane className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-xs font-bold uppercase tracking-widest">No Active Drones</p>
                  <p className="text-[10px] mt-2">Deploy aerial relays to extend network range</p>
                </div>
              ) : (
                droneNodes.map((drone) => (
                  <div key={drone.droneId} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 transition-all hover:bg-white/[0.06] group cursor-default">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-secondary animate-pulse`} />
                        <span className="text-xs font-bold text-foreground tracking-wide">{drone.droneId}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{drone.altitude}m ALT</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                          <span>Battery</span>
                          <span className={drone.batteryLevel < 20 ? "text-emergency" : "text-safe"}>{drone.batteryLevel}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${drone.batteryLevel}%` }} className={`h-full ${drone.batteryLevel < 20 ? "bg-emergency" : "bg-safe"}`} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                          <span>Range</span>
                          <span className="text-secondary">{drone.coverageRadius}km</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${(drone.coverageRadius/20)*100}%` }} className="h-full bg-secondary" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          <ResolvedIncidentsPanel />

          {/* LoRa Network Monitoring Panel */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-7 flex flex-col border border-white/[0.05] shadow-[inset_0_0_40px_rgba(255,255,255,0.02),0_15px_50px_rgba(0,0,0,0.4)] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-info/30 to-transparent pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-[1.25rem] bg-info/10 flex items-center justify-center border border-info/20 shadow-[0_0_20px_theme(colors.info.DEFAULT/0.2)]">
                  <Radio className="w-6 h-6 text-info animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground uppercase tracking-widest">Long-Range Comms</h3>
                  <p className="text-[10px] text-info font-mono font-bold">LORA RELAY NETWORK ACTIVE</p>
                </div>
              </div>
              <span className="text-[10px] font-black bg-info/20 text-info px-4 py-2 rounded-full border border-info/30 tracking-widest">{loraNodes.filter(n => n.relayStatus === "active").length} ACTIVE</span>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1 custom-scrollbar">
              {loraNodes.map((node) => {
                const connectedTeams = rescueTeams.filter(t => {
                  const dist = Math.sqrt(Math.pow(t.latitude - node.latitude, 2) + Math.pow(t.longitude - node.longitude, 2)) * 111; // Approx km
                  return dist <= node.coverageRadius;
                });

                return (
                  <div key={node.nodeId} className="bg-white/[0.03] border border-white/[0.05] rounded-2xl p-4 transition-all hover:bg-white/[0.06] group cursor-default">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${node.relayStatus === "active" ? "bg-safe animate-pulse" : "bg-muted"}`} />
                        <span className="text-xs font-bold text-foreground tracking-wide">{node.nodeId}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{node.coverageRadius}km RANGE</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                          <span>Power</span>
                          <span className={node.batteryLevel < 20 ? "text-emergency" : "text-safe"}>{node.batteryLevel}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${node.batteryLevel}%` }} className={`h-full ${node.batteryLevel < 20 ? "bg-emergency" : "bg-safe"}`} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-muted-foreground uppercase font-bold tracking-tighter">
                          <span>Signal</span>
                          <span className="text-info">{node.signalStrength}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${node.signalStrength}%` }} className="h-full bg-info" />
                        </div>
                      </div>
                    </div>

                    {connectedTeams.length > 0 && (
                      <div className="pt-2 border-t border-white/5">
                        <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest mb-1.5">Connected Units</p>
                        <div className="flex flex-wrap gap-1.5">
                          {connectedTeams.map(team => (
                            <div key={team.id} className="flex items-center gap-1.5 bg-info/5 border border-info/10 rounded-full px-2 py-0.5">
                              <Truck className="w-2.5 h-2.5 text-info" />
                              <span className="text-[9px] font-bold text-info/80 tracking-tight">{team.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-info" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Network Health</span>
              </div>
              <span className="text-[10px] font-black text-safe uppercase tracking-widest">Optimal</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* DISASTER CONTROL PANEL & NETWORK MONITOR */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="xl:col-span-1 bg-black/40 backdrop-blur-3xl border border-white/[0.05] rounded-[2rem] p-6 shadow-[inset_0_0_30px_rgba(255,255,255,0.02)]">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emergency drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.8)]" />
              <h3 className="text-base font-black text-foreground uppercase tracking-widest">Disaster Control</h3>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: "Active SOS Alerts", value: alerts.length, status: alerts.length > 5 ? "Critical" : "Stable", color: alerts.length > 5 ? "emergency" : "safe" },
              { label: "Critical Priority", value: alerts.filter(a => a.severity === "CRITICAL").length, status: alerts.filter(a => a.severity === "CRITICAL").length > 0 ? "Urgent" : "None", color: alerts.filter(a => a.severity === "CRITICAL").length > 0 ? "emergency" : "safe" },
              { label: "Rescue Units", value: `${rescueTeams.filter(t => t.status === "Available").length} / ${rescueTeams.length}`, status: "Units Online", color: "info" },
              { label: "Deployable Drones", value: droneNodes.length, status: dronesDeployed ? "In Flight" : "Standby", color: "secondary" },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-xl font-black text-foreground">{stat.value}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-${stat.color}/10 text-${stat.color} border border-${stat.color}/20`}>
                    {stat.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="xl:col-span-2">
          <NetworkStatusMonitor metrics={{
            meshNodes: nodes.length,
            droneRelays: droneNodes.length,
            loraNodes: loraNodes.length,
            avgHops: relayLog.length > 0 ? relayLog.reduce((acc, log) => acc + (log.hop || 0), 0) / relayLog.length : 1.2,
            coverageArea: 450 + (droneNodes.length * 120) + (loraNodes.length * 80)
          }} />
        </div>
      </div>
    </div>
  );
}

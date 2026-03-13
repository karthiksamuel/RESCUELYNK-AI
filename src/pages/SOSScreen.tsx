import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio, MapPin, User, MessageSquare, CheckCircle, AlertTriangle,
  Bluetooth, ArrowRight, Shield, Flame, Droplets, Mountain, Heart,
  Signal, Navigation, WifiOff, Wifi, Clock,
} from "lucide-react";
import { sendAlert, updateAlertRelayCount, useAlerts } from "@/lib/alertStore";
import { simulateRelay, useMeshNodes, type RelayStep } from "@/lib/meshRelay";
import { enqueueOfflineSOS, useOfflineQueue, useAutoSync } from "@/lib/offlineQueue";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { playSOSSound, playCountdownTick, playRelayHop, playSuccessSound, vibrateSOSPattern, vibrateShort, vibrateSuccess, vibrateStrong } from "@/lib/haptics";
import { toast } from "sonner";

const EMERGENCY_CARDS = [
  { icon: Flame, label: "Fire", color: "emergency", query: "fire" },
  { icon: Droplets, label: "Flood", color: "info", query: "flood" },
  { icon: Mountain, label: "Earthquake", color: "warning", query: "earthquake" },
  { icon: Heart, label: "First Aid", color: "safe", query: "first aid" },
];

const STATUS_MESSAGES = {
  searching: "Searching for nearby devices to relay SOS…",
  offline_stored: "Offline mode — SOS stored locally for relay",
  delivered: "SOS successfully sent to rescue network",
  syncing: "Internet restored — syncing emergency alerts",
};

const SOSScreen = () => {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"idle" | "confirm" | "countdown" | "sending" | "relaying" | "done">("idle");
  const [countdown, setCountdown] = useState(3);
  const [relaySteps, setRelaySteps] = useState<RelayStep[]>([]);
  const [relayHops, setRelayHops] = useState(0);
  const [locating, setLocating] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const meshNodes = useMeshNodes();
  const alerts = useAlerts();
  const offlineQueue = useOfflineQueue();
  const { userRole } = useAuth();

  // Auto-sync offline queue when internet returns
  useAutoSync(useCallback((count: number) => {
    if (count > 0) {
      toast.success(`Internet restored — synced ${count} emergency alert${count > 1 ? "s" : ""}`);
    }
  }, []));

  const getLocation = useCallback(() => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude.toFixed(6));
          setLongitude(pos.coords.longitude.toFixed(6));
          setLocating(false);
        },
        () => {
          setLatitude("14.5995");
          setLongitude("120.9842");
          setLocating(false);
        }
      );
    }
  }, []);

  useEffect(() => { getLocation(); }, [getLocation]);

  const handleSOSPress = () => {
    if (!name.trim()) return;
    vibrateStrong();
    playSOSSound();
    setPhase("confirm");
  };

  const handleConfirm = () => {
    vibrateShort();
    setPhase("countdown");
    setCountdown(3);
  };

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) { fireSOS(); return; }
    playCountdownTick();
    vibrateShort();
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  const fireSOS = async () => {
    setPhase("sending");
    vibrateSOSPattern();
    setStatusMsg(STATUS_MESSAGES.searching);

    const alertData = {
      name: name.trim(),
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      message: message.trim() || "Emergency SOS - Need immediate assistance",
    };

    if (!isOnline) {
      // ── Offline path: store locally and relay via mesh ──
      const packet = enqueueOfflineSOS(alertData);
      setStatusMsg(STATUS_MESSAGES.offline_stored);

      // Create a mock alert for mesh relay simulation
      const mockAlert = {
        id: packet.id,
        user_id: null,
        name: packet.name,
        latitude: packet.latitude,
        longitude: packet.longitude,
        message: packet.message,
        status: "active" as const,
        relay_count: 0,
        severity: null,
        resolved_at: null,
        resolved_by: null,
        created_at: new Date(packet.timestamp).toISOString(),
        updated_at: new Date(packet.timestamp).toISOString(),
        timestamp: new Date(packet.timestamp).toISOString(),
        relayCount: 0,
      };

      setTimeout(() => setPhase("relaying"), 800);
      setRelaySteps([]);
      setRelayHops(0);
      await simulateRelay(mockAlert, (step) => {
        setRelaySteps((prev) => [...prev, step]);
        setRelayHops((prev) => prev + 1);
        playRelayHop();
        vibrateShort();
      });
      playSuccessSound();
      vibrateSuccess();
      setStatusMsg(STATUS_MESSAGES.delivered);
      setPhase("done");
      return;
    }

    // ── Online path: send to backend ──
    const alert = await sendAlert(alertData);
    if (!alert) { setPhase("idle"); return; }
    setTimeout(() => setPhase("relaying"), 800);
    setRelaySteps([]);
    setRelayHops(0);
    const events = await simulateRelay(alert, (step) => {
      setRelaySteps((prev) => [...prev, step]);
      setRelayHops((prev) => prev + 1);
      playRelayHop();
      vibrateShort();
    });
    updateAlertRelayCount(alert.id, events.length);
    playSuccessSound();
    vibrateSuccess();
    setStatusMsg(STATUS_MESSAGES.delivered);
    setPhase("done");
  };

  const reset = () => {
    setPhase("idle");
    setRelaySteps([]);
    setRelayHops(0);
    setStatusMsg("");
    setName("");
    setMessage("");
  };

  return (
    <div className="flex-1 overflow-auto animate-fade-in panel-arc">
      <AnimatePresence mode="wait">
        {(phase === "confirm" || phase === "countdown") && (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-black/40 backdrop-blur-3xl border border-emergency/20 shadow-[0_0_50px_theme(colors.emergency.DEFAULT/0.2),inset_0_0_20px_theme(colors.emergency.DEFAULT/0.05)] rounded-[2rem] p-8 max-w-sm w-full text-center space-y-5 relative overflow-hidden card-glow">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emergency/30 to-transparent pointer-events-none" />
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-emergency/30 animate-[ping_2s_ease-out_infinite]" />
                <div className="absolute inset-x-2 inset-y-2 rounded-full border border-emergency/50 animate-[ping_2s_ease-out_infinite_delay-1s]" />
                <div className="w-20 h-20 rounded-full bg-emergency/20 flex items-center justify-center mx-auto shadow-glow-emergency relative z-10">
                  <AlertTriangle className="w-10 h-10 text-emergency animate-pulse" />
                </div>
              </div>
              {phase === "confirm" ? (
                <>
                  <h2 className="text-xl font-black tracking-widest text-foreground uppercase">Confirm Critical Alert</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">This action broadcasts a global emergency signal to the mesh network.</p>
                  {!isOnline && (
                    <div className="flex items-center gap-2 bg-warning/10 border border-warning/50 rounded-lg px-3 py-2 shadow-glow-info">
                      <WifiOff className="w-4 h-4 text-warning flex-shrink-0 animate-pulse" />
                      <p className="text-[11px] font-mono text-warning">OFFLINE RELAY PROTOCOL ACTIVE</p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button onClick={() => setPhase("idle")}
                      className="flex-1 glass-panel border border-border rounded-xl py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">ABORT</button>
                    <button onClick={handleConfirm}
                      className="flex-1 bg-emergency rounded-xl py-3 text-sm font-black text-primary-foreground shadow-[0_0_20px_hsl(var(--emergency)/0.5)] hover:bg-emergency-glow transition-all tracking-widest">TRANSMIT</button>
                  </div>
                </>
              ) : (
                <>
                  <motion.div key={countdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-emergency to-emergency-glow filter drop-shadow-[0_0_20px_hsl(var(--emergency))]">{countdown}</motion.div>
                  <p className="text-sm font-mono tracking-[0.2em] text-emergency animate-pulse">TRANSMITTING IN {countdown}...</p>
                  <button onClick={() => setPhase("idle")}
                    className="mt-4 glass-panel border-border/50 rounded-xl px-8 py-2.5 text-xs font-bold tracking-widest text-muted-foreground hover:text-white transition-all uppercase">Abort Transfer</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}

        {(phase === "sending" || phase === "relaying" || phase === "done") ? (
          <motion.div key="status" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-4 space-y-4 max-w-md mx-auto pt-8">
            <div className="text-center space-y-4">
              <motion.div
                animate={phase === "done" ? { scale: [1, 1.05, 1] } : { rotate: 360 }}
                transition={phase === "done" ? { repeat: Infinity, duration: 2 } : { repeat: Infinity, duration: 2, ease: "linear" }}
                className="w-20 h-20 mx-auto">
                {phase === "done" ? (
                  <div className="w-full h-full rounded-full bg-safe/20 flex items-center justify-center shadow-glow-safe">
                    <CheckCircle className="w-10 h-10 text-safe" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-emergency/20 flex items-center justify-center emergency-glow">
                    <Signal className="w-10 h-10 text-emergency" />
                  </div>
                )}
              </motion.div>
              <h2 className={`text-xl font-bold ${phase === "done" ? "text-safe" : "text-emergency"}`}>
                {phase === "sending" ? "SOS Alert Sent" : phase === "relaying" ? "Broadcasting Signal..." : "Rescue Teams Notified"}
              </h2>
              {/* Status message */}
              {statusMsg && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                  {!isOnline && <WifiOff className="w-3.5 h-3.5 text-warning" />}
                  {statusMsg}
                </motion.p>
              )}
            </div>

            {/* Offline queue indicator */}
            {offlineQueue.filter(p => !p.delivered).length > 0 && (
              <div className="bg-warning/10 border border-warning/20 rounded-[1rem] px-4 py-3 flex items-center justify-center gap-2 shadow-[inset_0_0_15px_theme(colors.warning.DEFAULT/0.1)]">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-[11px] text-warning font-bold tracking-widest uppercase">
                  {offlineQueue.filter(p => !p.delivered).length} alert{offlineQueue.filter(p => !p.delivered).length > 1 ? "s" : ""} queued offline
                </span>
              </div>
            )}

            <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] rounded-[1.5rem] p-5 space-y-4 card-glow">
              {[
                { label: "SOS alert created", done: true },
                { label: isOnline ? "Broadcasting to mesh network" : "Relaying via Bluetooth mesh", done: phase !== "sending" },
                { label: isOnline ? "Rescue teams notified" : "Queued for sync when online", done: phase === "done" },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.3 }}
                  className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${s.done ? "bg-safe/20" : "bg-muted"}`}>
                    {s.done ? <CheckCircle className="w-3.5 h-3.5 text-safe" /> : (
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground" />
                    )}
                  </div>
                  <span className={`text-sm ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                </motion.div>
              ))}
            </div>

            {relaySteps.length > 0 && (
              <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] rounded-[1.5rem] p-5 space-y-4 card-glow">
                <div className="flex items-center gap-2">
                  <Bluetooth className="w-4 h-4 text-info" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Mesh Relay</span>
                  {phase === "relaying" && (
                    <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}
                      className="ml-auto text-[10px] font-mono text-info">ACTIVE</motion.span>
                  )}
                </div>
                <div className="space-y-0 relative">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
                  {relaySteps.map((step) => (
                    <motion.div key={`${step.event.alertId}-${step.event.hop}`}
                      initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-3 py-1.5 relative">
                      <div className={`w-[15px] h-[15px] rounded-full flex-shrink-0 flex items-center justify-center z-10 ${step.status === "delivered" ? "bg-safe" :
                        step.status === "duplicate" ? "bg-warning" :
                          step.status === "ttl_expired" ? "bg-muted-foreground" :
                            step.status === "received" ? "bg-info" : "bg-accent"
                        }`}>
                        {step.status === "delivered" ? <Shield className="w-2.5 h-2.5 text-background" /> :
                          <ArrowRight className="w-2.5 h-2.5 text-background" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium ${step.status === "delivered" ? "text-safe" :
                          step.status === "duplicate" ? "text-warning" :
                            step.status === "ttl_expired" ? "text-muted-foreground" :
                              "text-foreground"
                          }`}>{step.label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Hop {step.event.hop} · TTL {step.event.ttl}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {phase === "done" && relayHops > 0 && (
                  <p className="text-xs text-info font-mono text-center pt-2 border-t border-border">
                    Alert relayed through {relayHops} devices
                  </p>
                )}
              </div>
            )}

            {phase === "done" && (
              <div className="flex gap-3 pt-4">
                <button onClick={reset}
                  className="flex-1 bg-white/[0.05] border border-white/[0.05] rounded-[1rem] py-3.5 text-sm font-bold tracking-widest text-muted-foreground hover:text-foreground transition-all shadow-[inset_0_0_15px_rgba(255,255,255,0.02)] uppercase">NEW ALERT</button>
                <button onClick={() => {
                  if (userRole === "rescue_team") navigate("/rescuer-dashboard");
                  else if (userRole === "command_operator") navigate("/operator-dashboard");
                  else navigate("/dashboard");
                }}
                  className="flex-1 bg-info/20 border border-info/30 rounded-[1rem] py-3.5 text-sm font-black tracking-widest text-info hover:bg-info/30 transition-all shadow-[inset_0_0_15px_theme(colors.info.DEFAULT/0.1),0_0_15px_theme(colors.info.DEFAULT/0.2)] uppercase">DASHBOARD</button>
              </div>
            )}
          </motion.div>
        ) : phase === "idle" && (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-4 space-y-5 max-w-lg mx-auto">

            {/* Offline banner */}
            {!isOnline && (
              <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="bg-warning/10 border border-warning/20 rounded-[1rem] px-4 py-3 flex items-center gap-3 shadow-[inset_0_0_15px_theme(colors.warning.DEFAULT/0.1)]">
                <WifiOff className="w-5 h-5 text-warning flex-shrink-0" />
                <span className="text-[10px] text-warning font-bold tracking-widest uppercase">Offline mode active — SOS will be stored locally</span>
                {offlineQueue.filter(p => !p.delivered).length > 0 && (
                  <span className="ml-auto text-[10px] font-black text-background bg-warning px-2.5 py-1 rounded">
                    {offlineQueue.filter(p => !p.delivered).length} QUEUED
                  </span>
                )}
              </motion.div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] rounded-[1rem] p-4 text-center">
                <Navigation className="w-5 h-5 text-info mx-auto mb-2 drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.8)]" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                <p className="text-xs font-black tracking-widest text-foreground truncate mt-1">
                  {latitude ? `${parseFloat(latitude).toFixed(2)}°` : "—"}
                </p>
              </div>
              <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] rounded-[1rem] p-4 text-center">
                <Signal className="w-5 h-5 text-safe mx-auto mb-2 drop-shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.8)]" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Nearby</p>
                <p className="text-xs font-black tracking-widest text-foreground mt-1">{meshNodes.length} devices</p>
              </div>
              <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] rounded-[1rem] p-4 text-center">
                {isOnline ? <Wifi className="w-5 h-5 text-safe mx-auto mb-2 drop-shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.8)]" /> : <WifiOff className="w-5 h-5 text-warning mx-auto mb-2 drop-shadow-[0_0_8px_theme(colors.warning.DEFAULT/0.8)]" />}
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Network</p>
                <p className={`text-xs font-black tracking-widest mt-1 ${isOnline ? "text-safe" : "text-warning"}`}>{isOnline ? "ONLINE" : "OFFLINE"}</p>
              </div>
            </div>

            <div className="flex flex-col items-center py-8">
              <motion.button onClick={handleSOSPress} disabled={!name.trim()}
                whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
                className="relative w-48 h-48 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-opacity group">
                <div className="absolute inset-0 rounded-full border border-emergency/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <div className="absolute -inset-4 rounded-full border border-emergency/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_delay-1s]" />
                <div className="absolute -inset-8 rounded-full border border-emergency/10 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_delay-2s] group-hover:border-emergency/30 transition-colors" />
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--emergency))_0%,hsl(var(--emergency-glow))_50%,transparent_100%)] emergency-pulse shadow-[0_0_80px_hsl(var(--emergency)/0.6)] flex items-center justify-center">
                  <span className="text-white font-black text-4xl tracking-[0.2em] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter">SOS</span>
                </div>
              </motion.button>
              <p className="text-[10px] font-mono tracking-widest text-muted-foreground mt-12 uppercase">
                {name.trim() ? "SYSTEM READY FOR BROADCAST" : "AUTHENTICATION REQUIRED"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emergency transition-colors drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.3)]" />
                <input value={name} onChange={e => setName(e.target.value)} placeholder="ENTER YOUR NAME *"
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[1rem] pl-11 pr-4 py-3.5 text-sm font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emergency/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] uppercase" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emergency transition-colors drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.3)]" />
                  <input value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="LATITUDE" type="number" step="any"
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[1rem] pl-11 pr-3 py-3.5 text-sm font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emergency/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] uppercase" />
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emergency transition-colors drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.3)]" />
                  <input value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="LONGITUDE" type="number" step="any"
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[1rem] pl-11 pr-3 py-3.5 text-sm font-bold tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emergency/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] uppercase" />
                </div>
              </div>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-muted-foreground group-focus-within:text-emergency transition-colors drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.3)]" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="DESCRIBE YOUR EMERGENCY..."
                  rows={2}
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-[1rem] pl-11 pr-4 py-3.5 text-sm font-bold tracking-wide text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emergency/50 focus:bg-white/[0.05] resize-none transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-3">Emergency Guides</p>
              <div className="grid grid-cols-4 gap-3">
                {EMERGENCY_CARDS.map(({ icon: Icon, label, color }) => (
                  <button key={label} onClick={() => navigate(`/assistant?topic=${label.toLowerCase()}`)}
                    className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1rem] p-4 flex flex-col items-center gap-2 hover:bg-white/[0.05] hover:border-white/[0.08] transition-all group overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={`w-10 h-10 rounded-[0.8rem] bg-${color}/10 border border-${color}/20 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[inset_0_0_10px_theme(colors.${color}.DEFAULT/0.2)]`}>
                      <Icon className={`w-5 h-5 text-${color} drop-shadow-[0_0_6px_theme(colors.${color}.DEFAULT/0.8)]`} />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors mt-1 text-center">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOSScreen;

import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import {
  Radio, Bot, MapPin, BookOpen, ArrowRight, Shield,
  Signal, Users, Zap, ChevronRight, Play, AlertTriangle
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { BackgroundPaths } from "@/components/ui/background-paths";
import EmergencyMap from "@/components/EmergencyMap";
import { staggerContainer, staggerItem, cardHover, floatingAnimation } from "@/lib/motion";
import type { SOSAlert } from "@/lib/alertStore";
import type { RescueTeam, DangerZone } from "@/lib/rescueTeams";

const DEMO_ALERTS: SOSAlert[] = [
  { id: "demo-1", user_id: null, name: "Maria Santos", latitude: 14.5995, longitude: 120.9842, message: "Trapped in collapsed building", status: "active", relay_count: 3, severity: "critical", resolved_at: null, resolved_by: null, created_at: new Date(Date.now() - 300000).toISOString(), updated_at: new Date().toISOString(), timestamp: new Date(Date.now() - 300000).toISOString(), relayCount: 3 },
  { id: "demo-2", user_id: null, name: "James Cruz", latitude: 14.5547, longitude: 121.0244, message: "Flood waters rising fast", status: "active", relay_count: 1, severity: "warning", resolved_at: null, resolved_by: null, created_at: new Date(Date.now() - 120000).toISOString(), updated_at: new Date().toISOString(), timestamp: new Date(Date.now() - 120000).toISOString(), relayCount: 1 },
  { id: "demo-3", user_id: null, name: "Ana Reyes", latitude: 14.6210, longitude: 121.0050, message: "Family stranded on rooftop", status: "active", relay_count: 2, severity: "critical", resolved_at: null, resolved_by: null, created_at: new Date(Date.now() - 60000).toISOString(), updated_at: new Date().toISOString(), timestamp: new Date(Date.now() - 60000).toISOString(), relayCount: 2 },
];

const DEMO_TEAMS: RescueTeam[] = [
  { id: "team-1", name: "Alpha Medics", type: "Medical", status: "En Route", latitude: 14.5800, longitude: 120.9750, assignedAlertId: "demo-1", eta: 8 },
  { id: "team-2", name: "Bravo SAR", type: "Search & Rescue", status: "Available", latitude: 14.5650, longitude: 121.0100, assignedAlertId: null, eta: null },
];

const DEMO_DANGER_ZONES: DangerZone[] = [
  { id: "dz-1", label: "Flood Zone", latitude: 14.5547, longitude: 121.0244, radius: 800, type: "flood" },
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const FEATURES = [
  {
    icon: Radio,
    title: "Offline SOS Alerts",
    desc: "Send emergency signals even without internet using mesh relay technology.",
    color: "emergency",
    glowColor: "hsla(0, 100%, 55%, 0.25)",
  },
  {
    icon: Bot,
    title: "AI Survival Assistant",
    desc: "Get life-saving guidance during disasters with RAG-powered intelligence.",
    color: "info",
    glowColor: "hsla(190, 100%, 55%, 0.25)",
  },
  {
    icon: MapPin,
    title: "Rescue Team Coordination",
    desc: "Locate nearby rescue teams and coordinate real-time emergency response.",
    color: "warning",
    glowColor: "hsla(35, 100%, 50%, 0.25)",
  },
  {
    icon: BookOpen,
    title: "Emergency Knowledge Library",
    desc: "Access survival guides for earthquakes, floods, fires and more — offline.",
    color: "safe",
    glowColor: "hsla(150, 100%, 40%, 0.25)",
  },
];

const STEPS = [
  { num: "01", title: "Send SOS Alert", desc: "Press the emergency button to broadcast your location to nearby devices." },
  { num: "02", title: "Locate Rescue Team", desc: "The system automatically finds and dispatches the nearest available team." },
  { num: "03", title: "AI Survival Guidance", desc: "Receive real-time survival instructions while help is on the way." },
];

const PORTALS = [
  { label: "Emergency SOS", sub: "BROADCAST SIGNAL", color: "emergency", icon: AlertTriangle, route: "/sos", demo: true },
  { label: "Citizen Portal", sub: "PERSONAL DASHBOARD", color: "safe", icon: Users, route: "/login", demo: false },
  { label: "Rescue Team", sub: "TACTICAL MAPS", color: "secondary", icon: Zap, route: "/rescuer-login", demo: false },
  { label: "Command Center", sub: "GLOBAL UPLINK", color: "accent", icon: Radio, route: "/operator-login", demo: false },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { startDemo } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleDemo = () => {
    startDemo();
    navigate("/operator-dashboard");
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground overflow-x-hidden relative">
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
        {/* The global AppBackground handles the visual atmosphere. Slight dark gradient to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background/80 pointer-events-none z-[1]" />
        {/* Cinematic halo / light arc behind hero */}
        <div className="hero-halo" />

        {/* Nav bar */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full"
        >
          <motion.div className="flex items-center gap-2.5" whileHover={{ scale: 1.05 }}>
            <div className="w-9 h-9 rounded-xl bg-emergency/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emergency" />
            </div>
            <span className="font-black text-sm tracking-wider text-gradient-emergency">RESCUELINK</span>
          </motion.div>
          <motion.div
            variants={staggerContainer(0.08, 0.3)}
            initial="hidden"
            animate="visible"
            className="hidden md:flex items-center gap-6 text-xs text-muted-foreground"
          >
            {["Features", "How It Works", "Preview"].map((label) => (
              <motion.a
                key={label}
                variants={staggerItem}
                href={`#${label.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-foreground transition-colors relative group"
              >
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-info group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
          </motion.div>
        </motion.nav>

        {/* Hero content with parallax */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center max-w-3xl mx-auto space-y-6 px-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
            className="w-24 h-24 rounded-[2rem] bg-emergency/10 border border-emergency/20 flex items-center justify-center mx-auto shadow-[inset_0_0_30px_theme(colors.emergency.DEFAULT/0.2),0_0_40px_theme(colors.emergency.DEFAULT/0.3)] mb-4"
          >
            <motion.div {...floatingAnimation}>
              <Shield className="w-12 h-12 text-emergency drop-shadow-[0_0_15px_theme(colors.emergency.DEFAULT/0.8)]" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight"
          >
            <span className="text-gradient-emergency">RescueLink</span>{" "}
            <span className="text-foreground">– Offline Disaster SOS &</span>{" "}
            <span className="text-info">AI Survival Assistant</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            A smart emergency response platform that connects victims and rescue teams even without internet.
          </motion.p>

          {/* Primary hero actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4"
          >
            <motion.button
              onClick={handleDemo}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="btn-gradient-primary px-10 py-4 text-xs sm:text-sm"
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Command Center Demo
            </motion.button>
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-xs sm:text-sm font-semibold text-muted-foreground bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] shadow-[inset_0_0_20px_rgba(255,255,255,0.03)] backdrop-blur-2xl transition-colors"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Sign in to RescueLink
            </motion.button>
          </motion.div>

          {/* Portal cards with stagger */}
          <motion.div
            variants={staggerContainer(0.1, 0.8)}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 w-full max-w-6xl mx-auto px-4"
          >
            {PORTALS.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.label}
                  variants={staggerItem}
                  whileHover={{
                    scale: 1.05,
                    y: -8,
                    boxShadow: `inset 0 0 30px hsla(var(--${p.color})/0.1), 0 20px 40px hsla(var(--${p.color})/0.2)`,
                    transition: { type: "spring", stiffness: 400, damping: 25 },
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { if (p.demo) { startDemo(); navigate(p.route); } else navigate(p.route); }}
                  className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.02] shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] rounded-[2rem] flex flex-col items-center justify-center p-8 gap-5 cursor-pointer group hover:bg-white/[0.04] transition-all relative overflow-hidden"
                >
                  <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-${p.color}/30 to-transparent`} />
                  <motion.div
                    className={`w-16 h-16 rounded-[1.5rem] bg-${p.color}/10 flex items-center justify-center group-hover:bg-${p.color}/20 transition-all shadow-[0_0_20px_theme(colors.${p.color}.DEFAULT/0.1)]`}
                    whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.5 } }}
                  >
                    <Icon className={`w-8 h-8 text-${p.color} group-hover:drop-shadow-[0_0_10px_theme(colors.${p.color}.DEFAULT/0.8)] transition-all`} />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-foreground tracking-wide">{p.label}</h3>
                    <p className={`text-[11px] font-bold text-${p.color} tracking-widest uppercase mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity`}>{p.sub}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Floating stat badges */}
          <motion.div
            variants={staggerContainer(0.1, 1.2)}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-center gap-5 pt-8 flex-wrap"
          >
            {[
              { icon: Signal, label: "Mesh Relay", val: "Active" },
              { icon: Users, label: "Rescue Teams", val: "24/7" },
              { icon: Zap, label: "AI Engine", val: "Offline" },
            ].map(({ icon: Icon, label, val }) => (
              <motion.div
                key={label}
                variants={staggerItem}
                whileHover={{ scale: 1.08, y: -2 }}
                className="bg-white/[0.02] backdrop-blur-2xl border border-white/[0.03] rounded-2xl px-5 py-3 flex items-center gap-3 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]"
              >
                <Icon className="w-4 h-4 text-info drop-shadow-[0_0_5px_theme(colors.info.DEFAULT/0.8)]" />
                <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
                <span className="text-[11px] font-bold text-safe tracking-wider">{val}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute bottom-8 z-10"
        >
          <div className="w-5 h-8 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-1.5">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], height: [4, 8, 4] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1 rounded-full bg-muted-foreground/50"
            />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <Section className="py-24 px-4">
        <div id="features" className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-mono text-info uppercase tracking-widest mb-2"
            >
              Core Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-black text-foreground"
            >
              Built for the Worst Moments
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto"
            >
              Everything you need when infrastructure fails and every second counts.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{
                  y: -6,
                  scale: 1.03,
                  boxShadow: `inset 0 0 30px hsla(var(--${f.color})/0.05), 0 20px 40px hsla(var(--${f.color})/0.15)`,
                  transition: { type: "spring", stiffness: 400, damping: 25 },
                }}
                className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.02] rounded-[2rem] p-8 space-y-5 group cursor-default shadow-[inset_0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${f.color}/10 blur-3xl rounded-full pointer-events-none`} />
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-${f.color}/10 flex items-center justify-center shadow-[0_0_15px_theme(colors.${f.color}.DEFAULT/0.15)] group-hover:bg-${f.color}/20 transition-colors`}
                  whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <f.icon className={`w-7 h-7 text-${f.color} group-hover:drop-shadow-[0_0_8px_theme(colors.${f.color}.DEFAULT/0.8)]`} />
                </motion.div>
                <div>
                  <h3 className="font-bold text-base text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── HOW IT WORKS ── */}
      <Section className="py-24 px-4 relative">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at center, hsl(217,91%,60%,0.03) 0%, transparent 70%)" }} />
        <div id="how-it-works" className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-14">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] font-mono text-warning uppercase tracking-widest mb-2"
            >
              How It Works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl font-black text-foreground"
            >
              Three Steps to Safety
            </motion.h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

            <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative text-center group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 rounded-[1.5rem] bg-info/10 border border-info/20 flex items-center justify-center mx-auto mb-6 shadow-[inset_0_0_20px_theme(colors.info.DEFAULT/0.2),0_0_15px_theme(colors.info.DEFAULT/0.1)] group-hover:bg-info/20 transition-colors"
                  >
                    <span className="text-xl font-black text-info drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.8)]">{step.num}</span>
                  </motion.div>
                  <h3 className="font-bold text-base text-foreground mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">{step.desc}</p>
                  {i < 2 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.2 }}
                    >
                      <ChevronRight className="hidden md:block absolute -right-4 top-5 w-6 h-6 text-white/10" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── COMMAND CENTER PREVIEW ── */}
      <Section className="py-24 px-4">
        <div id="preview" className="max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[11px] font-mono text-safe uppercase tracking-widest mb-2"
          >
            Dashboard Preview
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-black text-foreground mb-4"
          >
            Real-Time Disaster Response
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground mb-10 max-w-lg mx-auto"
          >
            Monitor active SOS alerts, coordinate rescue teams, and manage emergency operations from a unified command center.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-[2rem] overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Ambient glow behind preview */}
            <div className="absolute -inset-10 bg-[radial-gradient(circle_at_center,theme(colors.info.DEFAULT/0.15),transparent_60%)] pointer-events-none" />

            <div className="relative bg-black/40 backdrop-blur-3xl border border-white/[0.03] rounded-[2rem] p-8 space-y-6 shadow-[inset_0_0_40px_rgba(255,255,255,0.02)] z-10">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-3 h-3 rounded-full bg-emergency shadow-[0_0_10px_theme(colors.emergency.DEFAULT/0.8)]" />
                <div className="w-3 h-3 rounded-full bg-warning shadow-[0_0_8px_theme(colors.warning.DEFAULT/0.5)]" />
                <div className="w-3 h-3 rounded-full bg-safe shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.5)]" />
                <span className="ml-3 text-[11px] font-bold text-muted-foreground tracking-widest uppercase">RescueLink Command Center</span>
              </div>

              <motion.div
                variants={staggerContainer(0.08, 0.2)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-4 gap-4"
              >
                {[
                  { label: "Active SOS", value: "12", color: "emergency" },
                  { label: "Teams Active", value: "8", color: "info" },
                  { label: "Mesh Nodes", value: "24", color: "safe" },
                  { label: "Resolved", value: "47", color: "warning" },
                ].map((m) => (
                  <motion.div key={m.label} variants={staggerItem} className="bg-white/[0.02] border border-white/[0.02] shadow-[inset_0_0_15px_rgba(255,255,255,0.01)] rounded-2xl p-4 text-center">
                    <p className={`text-2xl font-black text-${m.color} drop-shadow-[0_0_8px_theme(colors.${m.color}.DEFAULT/0.5)]`}>{m.value}</p>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mt-1 opacity-80">{m.label}</p>
                  </motion.div>
                ))}
              </motion.div>

              <div className="h-64 sm:h-80 rounded-2xl overflow-hidden relative shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] border border-white/[0.02]">
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_60px_40px_rgba(0,0,0,0.9)] z-10 rounded-2xl" />
                <EmergencyMap alerts={DEMO_ALERTS} teams={DEMO_TEAMS} dangerZones={DEMO_DANGER_ZONES} />
              </div>
            </div>

            <motion.div
              className="absolute inset-0 rounded-[2rem] pointer-events-none z-20 border border-white/[0.05]"
              animate={{
                boxShadow: [
                  "inset 0 0 20px rgba(0,200,255,0.05)",
                  "inset 0 0 40px rgba(200,0,255,0.05)",
                  "inset 0 0 20px rgba(0,200,255,0.05)",
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <motion.h2
            className="text-2xl sm:text-4xl font-black leading-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Be Prepared. Stay Connected.{" "}
            <span className="text-gradient-emergency">Save Lives.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-muted-foreground max-w-md mx-auto"
          >
            Join the next generation of emergency response. Every second counts when disaster strikes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            <motion.button
              onClick={handleDemo}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px hsl(var(--emergency)/0.5)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-emergency text-primary-foreground font-bold text-sm px-8 py-4 rounded-xl shadow-[0_0_20px_theme(colors.emergency.DEFAULT/0.3)] hover:brightness-110 transition-all flex items-center gap-2"
            >
              <Play className="w-4 h-4" /> Try Demo
            </motion.button>
            <motion.button
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] text-foreground font-bold text-sm px-8 py-4 rounded-xl transition-colors"
            >
              Login to Command Center
            </motion.button>
          </motion.div>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="border-t border-white/5 py-12 px-4 relative z-10"
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="text-center md:text-left max-w-sm">
            <div className="flex items-center gap-2.5 justify-center md:justify-start mb-3">
              <div className="w-8 h-8 rounded-lg bg-emergency/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-emergency" />
              </div>
              <span className="font-black text-sm tracking-wider text-gradient-emergency">RESCUELINK</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              RescueLink is a disaster response platform designed to help victims and rescue teams coordinate during emergencies — even without internet connectivity.
            </p>
          </div>
          <div className="flex gap-8 text-xs text-muted-foreground">
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Platform</p>
              <a href="#features" className="block hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="block hover:text-foreground transition-colors">How It Works</a>
              <a href="#preview" className="block hover:text-foreground transition-colors">Preview</a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Company</p>
              <span className="block">About</span>
              <span className="block">Contact</span>
              <span className="block">Privacy</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-muted-foreground font-mono">© 2026 RescueLink. All rights reserved.</p>
        </div>
      </motion.footer>
    </div>
  );
}

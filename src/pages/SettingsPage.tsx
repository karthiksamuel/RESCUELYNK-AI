import { Settings, User, Bell, Shield, Radio, Lock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, floatingAnimation } from "@/lib/motion";

const settingsCards = [
  { icon: User, label: "Profile", desc: "Commander identity and callsign", route: "/settings/profile" },
  { icon: Bell, label: "Notifications", desc: "Alert sounds and vibration", route: "/settings/notifications" },
  { icon: Radio, label: "Mesh Network", desc: "Device discovery and relay settings", route: "/settings/mesh" },
  { icon: Shield, label: "Security", desc: "Encryption and data protection", route: "/settings/security" },
];

export default function SettingsPage() {
  const { isLoggedIn, demoMode } = useAuth();
  const navigate = useNavigate();
  const isRestricted = demoMode && !isLoggedIn;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-[1rem] bg-white/[0.05] border border-white/[0.05] flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_0_15px_rgba(0,0,0,0.5)]">
          <Settings className="w-6 h-6 text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">SETTINGS</h1>
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">Configure your rescue system</p>
        </div>
      </motion.div>

      {/* Demo mode restriction banner */}
      {isRestricted && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-warning/10 backdrop-blur-3xl border border-warning/20 shadow-[inset_0_0_30px_rgba(255,165,0,0.05),0_0_30px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-5 space-y-3 relative overflow-hidden"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-warning/30 to-transparent" />
          <div className="flex items-center gap-3 relative z-10">
            <motion.div {...floatingAnimation} className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center border border-warning/30 shadow-[inset_0_0_10px_rgba(255,165,0,0.2)]">
              <Lock className="w-5 h-5 text-warning drop-shadow-[0_0_8px_theme(colors.warning.DEFAULT/0.8)]" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-foreground">SETTINGS REQUIRE LOGIN</p>
              <p className="text-xs text-muted-foreground">Login to access full configuration.</p>
            </div>
          </div>
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.02, boxShadow: "0 0 20px theme(colors.warning.DEFAULT/0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-warning text-accent-foreground font-black text-sm px-6 py-3 rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 border border-warning/50 relative z-10"
          >
            <User className="w-4 h-4" />
            Login to access settings
          </motion.button>
        </motion.div>
      )}

      <motion.div
        variants={staggerContainer(0.08, 0.15)}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {settingsCards.map(({ icon: Icon, label, desc, route }) => (
          <motion.div
            key={label}
            variants={staggerItem}
            onClick={() => { if (!isRestricted) navigate(route); }}
            whileHover={!isRestricted ? {
              scale: 1.01,
              boxShadow: "0 0 30px rgba(255,255,255,0.05)",
              transition: { type: "spring", stiffness: 400, damping: 25 },
            } : undefined}
            whileTap={!isRestricted ? { scale: 0.99 } : undefined}
            className={`bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-4 flex items-center gap-4 transition-all overflow-hidden relative group ${isRestricted
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:bg-white/[0.02] hover:border-white/[0.08]"
              }`}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white-[0.05] to-transparent pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
            <motion.div
              whileHover={!isRestricted ? { scale: 1.1, rotate: [0, -5, 5, 0] } : undefined}
              className="w-12 h-12 rounded-[1rem] bg-white/[0.05] border border-white/[0.05] flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
            >
              <Icon className="w-5 h-5 text-foreground drop-shadow-[0_0_5px_rgba(255,255,255,0.3)] transition-colors group-hover:text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{label}</p>
              <p className="text-[11px] font-medium text-muted-foreground">{desc}</p>
            </div>
            {!isRestricted && <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 group-hover:text-foreground transition-colors group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

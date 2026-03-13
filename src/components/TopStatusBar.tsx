import { useEffect, useState } from "react";
import { WifiOff, User, Beaker, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/authContext";

const ROLE_LABELS: Record<string, string> = {
  citizen: "Citizen",
  rescue_team: "Rescue Team",
  command_operator: "Command Operator",
};

export default function TopStatusBar() {
  const isOnline = useOnlineStatus();
  const { demoMode, userName, userRole } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="h-14 flex items-center gap-3 px-6 bg-black/10 backdrop-blur-3xl relative z-20"
    >
      <SidebarTrigger className="text-secondary hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_theme(colors.primary.DEFAULT/0.8)]" />

      <div className="flex items-center gap-3 ml-2">
        {isOnline ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-safe/[0.05] rounded-full shadow-[inset_0_0_15px_theme(colors.safe.DEFAULT/0.15)]"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 rounded-full bg-safe shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.8)]"
            />
            <span className="text-[10px] font-semibold text-safe uppercase tracking-wider">Uplink Active</span>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 25 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-warning/[0.05] rounded-full shadow-[inset_0_0_15px_theme(colors.warning.DEFAULT/0.15)]"
          >
            <WifiOff className="w-3 h-3 text-warning" />
            <span className="text-[10px] font-semibold text-warning uppercase tracking-wider">Mesh Relay</span>
          </motion.div>
        )}

        {demoMode && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/[0.05] rounded-full shadow-[inset_0_0_15px_theme(colors.primary.DEFAULT/0.15)]"
          >
            <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" as const }}>
              <Beaker className="w-3 h-3 text-primary" />
            </motion.div>
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Simulation</span>
          </motion.div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="hidden sm:flex flex-col items-end justify-center"
        >
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">
            Time
          </span>
          <span className="text-xs font-semibold text-foreground/90 mt-0.5 tracking-wider">
            {time.toUTCString().slice(17, 25)} UTC
          </span>
        </motion.div>

        <div className="w-px h-6 bg-white/[0.05] mx-2 hidden sm:block" />

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="text-right hidden sm:block">
            <span className="text-sm font-semibold text-foreground/90 block tracking-wide">
              {userName || "Commander"}
            </span>
            {userRole && (
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                {ROLE_LABELS[userRole] || userRole}
              </span>
            )}
          </div>
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-9 h-9 rounded-full bg-secondary/[0.05] flex items-center justify-center relative overflow-hidden group shadow-[0_0_15px_theme(colors.secondary.DEFAULT/0.2)] border border-secondary/10"
          >
            <div className="absolute inset-0 bg-secondary/10 group-hover:bg-primary/20 transition-colors" />
            <User className="w-4 h-4 text-secondary group-hover:text-primary relative z-10 transition-colors group-hover:drop-shadow-[0_0_8px_theme(colors.primary.DEFAULT/0.8)]" />
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}

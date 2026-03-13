import { WifiOff, Bluetooth } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useMeshNodes } from "@/lib/meshRelay";
import { motion, AnimatePresence } from "framer-motion";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const nodes = useMeshNodes();
  if (isOnline) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        className="glass-panel-strong px-4 py-2.5 flex items-center gap-3 text-xs relative z-50"
      >
        <div className="w-6 h-6 rounded-lg bg-warning/15 flex items-center justify-center flex-shrink-0">
          <WifiOff className="w-3.5 h-3.5 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-medium text-warning">Offline Mode Active</span>
          <span className="text-muted-foreground ml-1.5">– Mesh relay enabled</span>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-info font-mono flex-shrink-0">
          <Bluetooth className="w-3 h-3" />
          {nodes.length} nodes
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
